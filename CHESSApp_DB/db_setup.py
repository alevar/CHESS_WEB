#!/usr/bin/env python3

# this script is used to create and modify the database from the gtf/gff files

import os
import sys
import copy
import json
import argparse
import subprocess

import mysql.connector

from itertools import chain, combinations

from definitions import *
import api
from AttributeManagementSystem import *
from TX import *

##############################
########   ATTRIBUTES  #######
##############################
# This module allows adding pre-determined maps of attributes
# This is not necessary, but can expedite the process of adding attributes to the database
# Alternatively attributes will be parsed during source addition and users will be requested to resolve any conflicts and ambiguities.
def addAttributes(api_connection,config,args):
    # load existing attribute info from the database
    ams = AttributeManagementSystem(api_connection)
    
    for key,data in config.items():
        ams_key = ams.add_key(key,data["variable"],data["description"])
        for synonym in data["synonyms"]:
            ams_key = ams.add_key_synonym(ams_key,synonym)
        for value,value_synonyms in data["values"].items():
            ams_value = ams.add_value(ams_key,value)
            for value_synonym in value_synonyms:
                ams.add_value_synonym(ams_key,ams_value,value_synonym)
  
    ams.prompt()


##############################
########   ORGANISM   ########
##############################
def addOrganisms(api_connection,config, args):
    for organism,data in config.items():
        api_connection.insert_organism(data)

    api_connection.commit(True)


##############################
########   ASSEMBLY   ########
##############################
def parse_fai(fai_fname:str) -> dict:
    assert os.path.exists(fai_fname),"fai file does not exist: "+fai_fname

    fai_dict = {}
    with open(fai_fname, 'r') as fai_fp:
        for line in fai_fp:
            line = line.strip().split('\t')
            fai_dict[line[0]] = int(line[1])
    
    return fai_dict

def addAssemblies(api_connection,config,args):
    for assembly,data in config.items():
        row = api_connection.insert_assembly(data)

        # get assembly ID for the assembly name
        aid = api_connection.get_assemblyID(data["name"])

        # now also write contig information from the index file into SequenceIDs table
        for contig,length in parse_fai(data["fastaIndex"]).items():
            api_connection.insert_contig(aid,contig,data["nomenclature"],length)

    api_connection.commit(True)


##############################
#########   SOURCE   #########
##############################
# reads GTF file (assumes gffreat -T output) and combines all records into transcript structures (one per transcript)
# storing associated exons and cds records
# yields transcripts one by one
def read_gffread_gtf(infname:str):
    assert os.path.exists(infname),"input file does not exist: "+infname
    transcript_lines = [] # lines associated with a transcript
    current_tid = None
    prev_tid = None
    
    with open(infname) as inFP:
        for line in inFP:
            if line[0] == "#":
                continue
            lcs = line.rstrip().split("\t")
            if not len(lcs) == 9:
                continue

            tid = lcs[8].split("transcript_id \"", 1)[1].split("\"", 1)[0]

            if lcs[2]=="transcript":
                to_yield = current_tid is not None
                prev_tid = current_tid
                current_tid = tid
                old_transcript_lines = copy.deepcopy(transcript_lines)
                transcript_lines = [line.rstrip()]
                if to_yield:
                    assert not len(old_transcript_lines)==0,"empty transcript lines for: "+prev_tid
                    yield old_transcript_lines
            else:
                assert tid==current_tid,"records out of order: "+current_tid+" > "+tid
                transcript_lines.append(line.rstrip())

    if current_tid is not None:
        assert not len(transcript_lines)==0,"empty transcript lines for: "+current_tid
        yield transcript_lines 

def run_gffread(infname:str,outfname:str,gffread:str,log:str):
        assert os.path.exists(infname),"input file does not exist: "+infname

        cmd = [gffread,"-T","-F",
               "-o",outfname,
               infname]

        print("Executing gffread to normalize the input annotation file")
        print(" ".join(cmd))
        logFP = open(log, 'a') if log else None
        logFP.write(" ".join(cmd)+"\n") if logFP else None

        proc = subprocess.Popen(cmd,stderr=subprocess.PIPE)

        for line in proc.stderr:
            logFP.write(str(line)) if logFP else sys.stderr.write(str(line))
        proc.wait()

        logFP.close() if logFP else None

def run_gffcompare(query:str,reference:str,outfname:str,gffcompare:str,log:str):
    assert os.path.exists(query),"query file does not exist: "+query
    assert os.path.exists(reference),"reference file does not exist: "+reference

    cmd = [gffcompare,"-F",
           "-r",reference,
           "-o",outfname,
           query]

    print("Executing gffcompare to build transcript map")
    print(" ".join(cmd))
    logFP = open(log, 'a') if log else None
    logFP.write(" ".join(cmd)+"\n") if logFP else None

    proc = subprocess.Popen(cmd,stderr=subprocess.PIPE)

    for line in proc.stderr:
        logFP.write(str(line)) if logFP else sys.stderr.write(str(line))
    proc.wait()

    logFP.close() if logFP else None

# parses the .tracking file generated by gffcompare and builds a map of reference to query transcripts
# this is used inplace of simply parsing the annotated.gtf and relying on the class_code field, since gffcompare removes all non-essential attributes
def load_tracking(tracking_fname:str) -> dict:
    assert os.path.exists(tracking_fname),"tracking file does not exist: "+tracking_fname
    res = dict()
    with open(tracking_fname, 'r') as trackingFP:
        for line in trackingFP:
            lcs = line.strip().split("\t")
            assert len(lcs)==5,"Invalid line in the tracking file: "+line
            if lcs[3] == "=":
                ref_tid = lcs[2].split("|")[1]
                qry_tid = lcs[4].split("|")[1]
                res[qry_tid] = ref_tid
    return res

def load_attributes_from_gtf(gtf_fname:str, max_values:int) -> dict:
    # if the number of observed values for the attribute is over the max_value - it is treated as variable and values are not stored

    # determine the type of file (GTF or GFF)
    fname_is_gff = is_gff(gtf_fname)
    
    # iterate and extract attributes from all lines (irrespective of the feature type, except exon and CDS).
    # The unnecessary ones will be dealt with after gffread conversion
    # build a giant map of all attributes and their values across all entries in the file

    attributes = dict()

    with open(gtf_fname, 'r') as inFP:
        for line in inFP:
            if line[0] == "#":
                continue
            lcs = line.rstrip().split("\t")
            if not len(lcs) == 9:
                continue

            if lcs[2] in ["exon","CDS"]:
                continue

            attrs = extract_attributes(lcs[8],fname_is_gff)
            # join attrs into the main attributes dictionary
            for k,v in attrs.items():
                attributes.setdefault(k,{"values":set(),"over_max_capacity":False})
                if len(attributes[k]["values"])>max_values:
                    attributes[k]["over_max_capacity"] = True
                    attributes[k]["values"] = set()
                if attributes[k]["over_max_capacity"]:
                    continue
                attributes[k]["values"].add(v)

    return attributes

def replace_chars(s:str,chars:str,replace_with:str) -> str:
    for c in chars:
        s = s.replace(c,replace_with)
    return s

def merge_attributes(attributes:dict,attributes_to_merge:dict,max_value:int) -> dict:
    # merge attributes_to_merge into attributes
    # if an attribute is already present in attributes - then merge the values
    # if an attribute is not present in attributes - then add it
    # if an attribute is present in attributes and is over max_values - then do not add it
    # if an attribute is present in attributes and is not over max_values - then add it
    for k,v in attributes_to_merge.items():
        # replace "_-. " with "_"
        v["values"] = {replace_chars(x,"_-. ","_") for x in v["values"]}
        k = k.lower()
        if k not in attributes:
            attributes[k] = v
        else:
            if attributes[k]["over_max_capacity"]:
                continue
            else:
                attributes[k]["values"].update(v["values"])
                if len(attributes[k]["values"])>max_value:
                    attributes[k]["over_max_capacity"] = True
                    attributes[k]["values"] = set()

    return attributes

def addSources(api_connection,config,args):
    if not os.path.exists(args.temp):
        os.makedirs(args.temp)

    logFP = open(args.log, 'w') if args.log else None

    # before all else, process types from all sources
    # this way if the user input is required - it can be handled before the main bulk of the data is processed
    all_attributes = dict()
    for source,data in config.items():
        # process attributes
        attrs = load_attributes_from_gtf(data["file"],args.max_values)
        all_attributes = merge_attributes(all_attributes,attrs,args.max_values)
    # add attributes to the database to prepare for source insertion
    ams = AttributeManagementSystem(api_connection)
    for k,v in all_attributes.items():
        ams_key = ams.add_key(k,int(v["over_max_capacity"]),"")
        for value in v["values"]:
            ams.add_value(ams_key,value)

    # have the AMS load a separate loop

    for source,data in config.items():
        sourceName = data["name"].replace("'","\\'")
        assemblyName = data["assemblyName"].replace("'","\\'")
        genome = data["assemblyFasta"]
        filename = data["file"]
        link = data["link"]
        information = data["information"].replace("'","\\'")

        # extract current GTF for the database
        db_gtf_fname = os.path.abspath(args.temp)+"/db.before_"+sourceName+".gtf"
        print("Extracting gtf from the current database before adding "+sourceName)
        api_connection.to_gtf(assemblyName,db_gtf_fname)

        # gffread/gffcompare/etc
        source_format = "gff" if is_gff(filename) else "gtf"

        # run gffread to standardize the transcript set before importing into the database
        norm_input_gtf = os.path.abspath(args.temp)+"/input.gffread.gtf" # stores temporary file with the normalized input gtf to be added to the database
        run_gffread(filename,norm_input_gtf,args.gffread,args.log)

        # run gffcompare between the database GTF and the normalized input file
        gffcmp_gtf_fname = os.path.abspath(args.temp)+"/input.gffread.gffcmp"
        run_gffcompare(norm_input_gtf,db_gtf_fname,gffcmp_gtf_fname,args.gffcompare,args.log)

        # insert source data into Sources table
        working_sourceID = api_connection.insert_source(data,source_format)

        tracking = load_tracking(gffcmp_gtf_fname+".tracking")

        # iterate over the contents of the file and add them to the database
        for transcript_lines in read_gffread_gtf(norm_input_gtf):
            transcript = TX(transcript_lines)
            working_tid = None # tid PK of the transcript being worked on as it appears in the Transcripts table
            working_tid = tracking.get(transcript.tid,None)
            if working_tid is None:
                working_tid = api_connection.insert_transcript(transcript,data)

            # add transcript source pairing to the TxDBXREF table
            api_connection.insert_dbxref(transcript,working_tid,working_sourceID)

            for attribute_key,attribute_value in transcript.attributes.items():
                api_connection.insert_attribute(working_tid,working_sourceID,transcript.tid,attribute_key,attribute_value)


    api_connection.commit(True)
    logFP.close()

def establish_connection(args,main_fn):
    if hasattr(args, 'configuration'): # check if configuration in args
        assert os.path.exists(args.configuration),"configuration file does not exist"
    assert os.path.exists(args.db_configuration),"database configuration file does not exist"
    
    db_config = None
    with open(args.db_configuration, 'r') as db_configFP:
        db_config = json.load(db_configFP)
    
    try:
        db_host = db_config["CHESSDB_HOST"]
        db_port = db_config["CHESSDB_PORT"]
        db_user = db_config["CHESSDB_USER"]
        db_password = db_config["CHESSDB_PASSWORD"]
        db_name = db_config["CHESSDB_NAME"]
    except KeyError as err:
        print(f"Key {err} not found in database configuration file.")
        exit(1)

    chessApi = None
    try:
        chessApi = api.CHESS_DB_API(db_host, db_user, db_password, db_name, db_port)
        chessApi.connect()
        
        if hasattr(args, 'configuration'):
            config = None
            with open(args.configuration, 'r') as configFP:
                config = json.load(configFP)

            main_fn(chessApi,config,args)
        else:
            main_fn(chessApi,args)

    except mysql.connector.Error as error:
        print("Failed to connect to the database.")
        print(error)
        exit(1)
    finally:
        if chessApi is not None and chessApi.is_connected():
            chessApi.disconnect()
            print("Connection to the database closed.")

    return

##############################
#######  NOMENCLATURE  #######
##############################
def addNomeclatures(api_connection,config, args):
    for nomecnclature,data in config.items():
        # get assembly ID for the assembly name
        aid = api_connection.get_assemblyID(data["assemblyName"])

        # check if data["to"] already exists in the sequenceIDMap
        # if it does - then we can skip it
        query = "SELECT count(*) FROM SequenceIDMap WHERE assemblyID = %s AND nomenclature = %s"
        res = api_connection.execute_query(query,(aid,data["to"]))
        if res[0][0]>0:
            print("Skipping nomenclature: "+data["to"]+" for assembly: "+data["assemblyName"]+" as it already exists in the database")
            continue

        # assert that all sequenceIDs for the assembly exist in the provided map
        sids = api_connection.get_seqidMap(aid,data["from"])
        assert len(sids)>0,"No sequenceIDs found for assembly: "+data["assemblyName"]

        # load the map
        map = dict()
        with open(data["file"], 'r') as inFP:
            for line in inFP:
                lcs = line.strip().split("\t")
                assert len(lcs)==2,"Invalid line in the nomenclature file: "+line

                if lcs[0] in sids:
                    sid = sids[lcs[0]]
                    assert sid not in map,"Duplicate sequenceID in the nomenclature file: "+lcs[0]
                    map[sid] = lcs[1]

        assert len(map)==len(sids),"Not all sequenceIDs have been mapped to the nomenclature: "+data["file"]

        # insert the nomenclature
        for sequenceID,altID in map.items():
            api_connection.insert_nomenclature(aid,sequenceID,altID,data["to"])

    api_connection.commit(True)

##############################
#########   DATASET   ########
##############################
def load_quant_data(fname:str) -> dict:
    # parse evidence file and load a dictionary with transcript id map to the evidence
    # assumes the following format
    # col1 : transcript id - must be in the corresponding annotation file provided in the configuration alongside this evidence file
    # col2 : sampleCount
    # col3 : expressionMean
    # col4 : expressionStdDev

    res = dict()
    with open(fname, 'r') as inFP:
        for line in inFP:
            lcs = line.strip().split("\t")
            assert len(lcs)==4,"Invalid line in the evidence file: "+line
            assert lcs[0] not in res,"Duplicate transcript id in the evidence file: "+lcs[0]
            res[lcs[0]] = {
                            "sampleCount": int(lcs[1]),
                            "expressionMean": float(lcs[2]),
                            "expressionStd": float(lcs[3])
                            }

    return res

def addDatasets(api_connection,config, args):
    if not os.path.exists(args.temp):
        os.makedirs(args.temp)
        
    api_connection.check_table("Sources")
    api_connection.check_table("Genes")
    api_connection.check_table("TranscriptToGene")
    api_connection.check_table("TxDBXREF")
    api_connection.check_table("Attributes")
    api_connection.check_table("Transcripts")

    logFP = open(args.log, 'w') if args.log else None

    for dataset,data in config.items():
        assemblyName = data["assemblyName"].replace("'","\\'")
        datasetName = data["name"].replace("'","\\'")
        sampleCount = int(data["sampleCount"])
        gtf_fname = data["gtf_file"]
        quant_data_file = data["data_file"]

        assert os.path.exists(gtf_fname),"gtf file does not exist: "+gtf_fname
        assert os.path.exists(quant_data_file),"data file does not exist: "+quant_data_file

        # load the data file
        quant_data = load_quant_data(quant_data_file)

        # run gffread followed by gffcompare against the current database to establish transcript compatibility
        
        # extract current GTF for the database
        db_gtf_fname = os.path.abspath(args.temp)+"/db.before_"+datasetName+".gtf"
        print("Extracting gtf from the current database before adding "+datasetName)
        api_connection.to_gtf(assemblyName,db_gtf_fname)

        # gffread/gffcompare/etc
        source_format = "gff" if is_gff(gtf_fname) else "gtf"

        # run gffread to standardize the transcript set before importing into the database
        norm_input_gtf = os.path.abspath(args.temp)+"/input.gffread.gtf" # stores temporary file with the normalized input gtf to be added to the database
        run_gffread(gtf_fname,norm_input_gtf,args.gffread,args.log)

        # run gffcompare between the database GTF and the normalized input file
        gffcmp_gtf_fname = os.path.abspath(args.temp)+"/input.gffread.gffcmp" 
        run_gffcompare(norm_input_gtf,db_gtf_fname,gffcmp_gtf_fname,args.gffcompare,args.log)

        # insert dataset data into Datasets table
        working_datasetID = api_connection.insert_dataset(data)

        # iterate over the contents of the file and add them to the database
        seen_transcripts = set() # working_tids already matched in this dataset. Currently used to bypass duplicates. TODO: need a better solution
        for transcript_lines in read_gffread_gtf(gffcmp_gtf_fname+".annotated.gtf"):
            transcript = TX(transcript_lines)
            working_tid = transcript.attributes["cmp_ref"] if transcript.attributes["class_code"] == "=" else None # tid PK of the transcript being worked on as it appears in the Transcripts table
            if working_tid in seen_transcripts:
                logFP.write("Duplicate transcript in the dataset: "+working_tid+"\n")
                continue
            if working_tid is None: # skip transcripts that are not compatible with the current database
                continue

            seen_transcripts.add(working_tid)

            # add dataset
            api_connection.insert_transcriptEvidence(working_tid,working_datasetID,quant_data[transcript.tid])

    api_connection.commit(True)
    logFP.close()

##############################
##########  COMPILE  #########
##############################
def compile(api_connection,args):
    # this module comiles all auxillary tables from the main tables
    # tables are used to quickly obtain information about the database
    # and summary of the various data included in the database

    # this module will remove any previous versions of the auxillary tables and recompile them from scratch
    api_connection.check_table("Sources")
    api_connection.check_table("Genes")
    api_connection.check_table("TranscriptToGene")
    api_connection.check_table("TxDBXREF")
    api_connection.check_table("Attributes")
    api_connection.check_table("Transcripts")
    api_connection.check_table("SequenceIDs")
    api_connection.check_table("SequenceIDMap")
    api_connection.check_table("Organisms")

    # extract transcript counts across sources and assemblies into a separate table
    api_connection.build_AllCountSummaryTable()
    summary = api_connection.get_AllCountSummaryTable()

    # get sources table (map of sourceID to sourceName)
    all_sources = api_connection.get_sources()
    source_id2name = {k:v["name"] for k,v in all_sources.items()}
    source_name2id = {v["name"]:k for k,v in all_sources.items()}

    # now build upset data for each assembly
    upset_data = list() # holds results as rows which can then be inserted as a table into the database
    for organism,odata in summary["speciesName"].items():
        for assembly,adata in odata["assemblyName"].items():
            # get sources for this assembly
            assembly_sources = list(adata["sourceName"].keys())
            
            source_combinations = chain.from_iterable(combinations(assembly_sources, r) for r in range(len(assembly_sources)+1))

            for combo in source_combinations:
                if len(combo)==0:
                    continue
                source_combo_counts = api_connection.get_source_combination_count(combo)
                upset_data.append([organism,assembly,",".join(assembly_sources),",".join(list(combo)),source_combo_counts[0][0]])

    api_connection.build_upsetDataTable(upset_data)

    api_connection.commit(True)
    return

def main(args):
    parser = argparse.ArgumentParser(description='''Help Page''')
    subparsers = parser.add_subparsers(help='sub-command help')

    ##############################
    ########  ATTRIBUTES  ########
    ##############################
    parser_addAttributes=subparsers.add_parser('addAttributes',
                                        help='addAttributes help')
    parser_addAttributes.add_argument('--configuration',
                                required=True,
                                type=str,
                                help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/attributes.json')
    parser_addAttributes.add_argument('--db_configuration',
                                required=True,
                                type=str,
                                help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addAttributes.set_defaults(func=establish_connection,main_fn=addAttributes)

    ##############################
    ########   ORGANISM   ########
    ##############################
    parser_addOrganisms=subparsers.add_parser('addOrganisms',
                                        help='addOrganisms help')
    parser_addOrganisms.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/organisms.json')
    parser_addOrganisms.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addOrganisms.set_defaults(func=establish_connection,main_fn=addOrganisms)

    ##############################
    ########   ASSEMBLY   ########
    ##############################
    parser_addAssemblies=subparsers.add_parser('addAssemblies',
                                        help='addAssemblies help')
    parser_addAssemblies.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/assemblies.json')
    parser_addAssemblies.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addAssemblies.set_defaults(func=establish_connection,main_fn=addAssemblies)

    ##############################
    #########   SOURCE   #########
    ##############################
    parser_addSources=subparsers.add_parser('addSources',
                                        help='addSources help')
    parser_addSources.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/sources.json')
    parser_addSources.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addSources.add_argument("--max_values",
                              required=False,
                              default=100,
                              type=int,
                              help="Maximum number of values to store for each attribute. If the number of observed values for the attribute is over the max_value - it is treated as variable attribute.")
    parser_addSources.add_argument("--temp",
                              required=True,
                              type=str,
                              help="Path to a temporary directory to store intermediate files")
    parser_addSources.add_argument("--log",
                              required=False,
                              type=str,
                              help="Path to the file where to write log information")
    parser_addSources.add_argument("--gffread",
                              required=False,
                              default="gffread",
                              type=str,
                              help="Path to gffread executable")
    parser_addSources.add_argument("--gffcompare",
                               required=False,
                               default="gffcompare",
                               type=str,
                               help="Path to the gffcompare executable")
    parser_addSources.add_argument("--keep_temp",
                              required=False,
                              action="store_true",
                              help="Keep temporary files after the database is built")
    parser_addSources.set_defaults(func=establish_connection,main_fn=addSources)

    ##############################
    #######  NOMENCLATURE  #######
    ##############################
    parser_addNomeclatures=subparsers.add_parser('addNomenclatures',
                                        help='addNomenclatures help')
    parser_addNomeclatures.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/assemblies.json')
    parser_addNomeclatures.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addNomeclatures.set_defaults(func=establish_connection,main_fn=addNomeclatures)

    ##############################
    #########   DATASET   ########
    ##############################
    parser_addDatasets=subparsers.add_parser('addDatasets',
                                        help='addDatasets help')
    parser_addDatasets.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/assemblies.json')
    parser_addDatasets.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addDatasets.add_argument("--temp",
                              required=True,
                              type=str,
                              help="Path to a temporary directory to store intermediate files")
    parser_addDatasets.add_argument("--log",
                              required=False,
                              type=str,
                              help="Path to the file where to write log information")
    parser_addDatasets.add_argument("--gffread",
                              required=False,
                              default="gffread",
                              type=str,
                              help="Path to gffread executable")
    parser_addDatasets.add_argument("--gffcompare",
                               required=False,
                               default="gffcompare",
                               type=str,
                               help="Path to the gffcompare executable")
    parser_addDatasets.add_argument("--keep_temp",
                              required=False,
                              action="store_true",
                              help="Keep temporary files after the database is built")
    parser_addDatasets.set_defaults(func=establish_connection,main_fn=addDatasets)

    ##############################
    ##########  COMPILE  #########
    ##############################
    parser_compile=subparsers.add_parser('compile',
                                        help='compile help')
    parser_compile.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_compile.set_defaults(func=establish_connection,main_fn=compile)

    args=parser.parse_args()
    args.func(args,args.main_fn)


if __name__ == "__main__":
    main(sys.argv[1:])



# on init return setup data
# includes
#  - table of gene and transcript counts across assemblies and sources
#  - for each sorce links to the default downloads

# when assembly selected return additional data:
# upset plot data