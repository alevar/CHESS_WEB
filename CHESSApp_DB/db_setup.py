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

        cmd = [gffread,"-T","-F","--cluster-only",
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

def normalize_gtf(infname:str,outfname:str,gffread:str,log:str):
    run_gffread(infname,outfname,gffread,log)
    return

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
                    continue
                if attributes[k]["over_max_capacity"]:
                    attributes[k]["over_max_capacity"] = True
                    attributes[k]["values"] = set()
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
    res = copy.deepcopy(attributes)
    for k,v in attributes_to_merge.items():
        if k not in res:
            res[k] = v
        else:
            if res[k]["over_max_capacity"]:
                res[k]["over_max_capacity"] = True
                res[k]["values"] = set()
                continue
            else:
                res[k]["values"].update(v["values"])
                if len(res[k]["values"])>max_value:
                    res[k]["over_max_capacity"] = True
                    res[k]["values"] = set()

    return res

def addSources(api_connection,config,args):
    # deal with transcript type and gene type resolution
    # when preparing sources for insert - add mandated attributes such as transcript_type and gene_type
    # this is required to ensure the same set of kvids can be referenced by each source
    # instead of one source linking to a set of kvids for gb_key
    if not os.path.exists(args.temp):
        os.makedirs(args.temp)

    logFP = open(args.log, 'w') if args.log else None

    # prepare sources before dealing with attributes by running gffread
    # and asserting that transcript_type and gene_type are added correctly to each normalized transcript
    si = 0
    for source,data in config.items():
        transcript_type_key = data["transcript_type_key"]
        gene_type_key = data["gene_type_key"]
        gene_name_key = data["gene_name_key"]
        source_gtf_fname = data["file"]

        source_format = "gff" if is_gff(source_gtf_fname) else "gtf"

        # run gffread to standardize the transcript set before importing into the database
        norm_gtf = os.path.abspath(args.temp)+"/"+str(si)+".gtf" # stores temporary file with the normalized input gtf to be added to the database
        normalize_gtf(source_gtf_fname,norm_gtf,args.gffread,args.log)

        # correct attributes by ensuring all required attributes exist, and if not - inserting them
        corrected_gtf = os.path.abspath(args.temp)+"/"+str(si)+".corrected.gtf"
        with open(norm_gtf, 'r') as inFP, open(corrected_gtf, 'w') as outFP:
            for line in inFP:
                if line[0] == "#":
                    continue
                lcs = line.rstrip().split("\t")
                if not len(lcs) == 9:
                    continue

                if lcs[2] =="transcript":
                    attrs = extract_attributes(lcs[8],False)
                    transcript_type_value = attrs.get(transcript_type_key,"NA")
                    gene_type_value = attrs.get(gene_type_key,"NA")
                    gene_name_value = attrs.get(gene_name_key,"NA")

                    if "transcript_type" not in attrs:
                        attrs["transcript_type"] = transcript_type_value
                    if "gene_type" not in attrs:
                        attrs["gene_type"] = gene_type_value
                    if "gene_name" not in attrs:
                        attrs["gene_name"] = gene_name_value

                    attrs_str = to_attribute_string(attrs,False,"transcript")
                    outFP.write("\t".join(lcs[:8])+"\t"+attrs_str+"\n")
                else:
                    outFP.write(line)

        # remove the normalized file if it already exists
        if os.path.exists(norm_gtf):
            os.remove(norm_gtf)
            
        data["norm_file"] = corrected_gtf
        data["source_format"] = source_format
        si+=1


    # before all else, process types from all sources
    # this way if the user input is required - it can be handled before the main bulk of the data is processed
    all_attributes = dict()
    for source,data in config.items():
        # process attributes
        attrs = load_attributes_from_gtf(data["norm_file"],args.max_values)
        all_attributes = merge_attributes(all_attributes,attrs,args.max_values)
    
    # check that everything is compatible with the database - if there are any conflicts exit, prompting user to add those entries manually via json configuration through addAttributes
    # eventually to be superceeded by a proper admin panel
    # verify attributes in the sources and prompt user to resolve conflicts if exist

    ams = AttributeManagementSystem(api_connection)
    verification = dict()
    for k,v in all_attributes.items():
        ams_key = ams.check_key(k)
        if ams_key is None:
            verification[k] = v["values"]
            continue

        for value in v["values"]:
            ams_value = ams.check_value(ams_key,value)
            if ams_value is None:
                verification.setdefault(k,set()).add(value)

    if len(verification)>0:
        print("Some attributes are not present in the database or have values that are not present in the database:")  
        for k,v in verification.items():
            print(k+": "+",".join(v))      
        res = input("Would you like to launch a prompt to resolve these conflicts now? You can also resolve conflicts via addAttributes module later (y/n): ")
        if res.lower() == "y":
            # add missing attributes to the AMS to prompt resolution
            for k,v in all_attributes.items():
                ams_key = ams.check_key(k)
                if ams_key is None:
                    ams_key = ams.add_key(k,int(v["over_max_capacity"]),"")
                for value in v["values"]:
                    ams_value = ams.check_value(ams_key,value)
                    if ams_value is None:
                        ams_value = ams.add_value(ams_key,value)
            ams.prompt()
        else:
            print("Skipping attribute verification")

    for source,data in config.items():
        sourceName = data["name"].replace("'","\\'")
        assemblyName = data["assemblyName"].replace("'","\\'")
        filename = data["norm_file"]

        # get mapping information from the database for the inputs
        assemblyID = api_connection.get_assemblyID(assemblyName)
        # load sequence identifiers from the current file first (just a set of all values in column 1)
        input_seqid_set = set()
        with open(filename,"r") as inFP:
            for line in inFP:
                if line[0]!="#" and len(line.split("\t"))==9:
                    input_seqid_set.add(line.split("\t")[0])
        sequenceIDMap = api_connection.get_seqidMap(assemblyID,input_seqid_set)

        # extract current GTF for the database
        db_gtf_fname = os.path.abspath(args.temp)+"/db.before_"+sourceName+".gtf"
        print("Extracting gtf from the current database before adding "+sourceName)
        api_connection.to_gtf(assemblyID,sequenceIDMap,db_gtf_fname)
        tid2lid = api_connection.tid2lid_map(assemblyID)

        # gffread/gffcompare/etc
        source_format = data["source_format"]
        
        # run gffcompare between the database GTF and the normalized input file
        gffcmp_gtf_fname = os.path.abspath(args.temp)+"/input.gffread.gffcmp"
        run_gffcompare(filename,db_gtf_fname,gffcmp_gtf_fname,args.gffcompare,args.log)

        # insert source data into Sources table
        working_sourceID = api_connection.insert_source(data,source_format)

        tracking = load_tracking(gffcmp_gtf_fname+".tracking")

        # iterate over the contents of the file and add them to the database
        for transcript_lines in read_gffread_gtf(filename):
            transcript = TX(transcript_lines,sequenceIDMap)
            
            working_tid = tracking.get(transcript.tid,None) # tid PK of the transcript being worked on as it appears in the Transcripts table
            working_lid = tid2lid.get(working_tid,None)

            if working_tid is None:
                working_tid = api_connection.insert_transcript(transcript,assemblyID)

            if working_lid is None:
                working_lid = api_connection.insert_locus(transcript,working_tid,assemblyID)

            # add transcript source pairing to the TxDBXREF table
            api_connection.insert_dbxref(transcript,working_tid,working_sourceID)

            # deal with the attributes
            for attribute_key,attribute_value in transcript.attributes.items():
                if ams.check_key(attribute_key) is None:
                    if args.skipUnknownAttributes:
                        continue
                    else:
                        print("Attribute "+attribute_key+" is not present in the database. Please verify that all attributes have been correctly added \
                              to the database and all conflicts where resolved via the addSources module. \
                              If you want to ignore novel attributes you can run this module with skipUnknownAttributes flag \
                              enabled forcing the software to skip any unknown entries.")
                        exit(1)

                ams.insert_txattribute(working_tid,working_sourceID,transcript.tid,attribute_key,attribute_value)

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
        sids = api_connection.get_seqidMap(aid,None,data["from"])
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
    # col2 : Expression

    res = dict()
    with open(fname, 'r') as inFP:
        for line in inFP:
            lcs = line.strip().split("\t")
            assert len(lcs)==4,"Invalid line in the evidence file: "+line
            assert lcs[0] not in res,"Duplicate transcript id in the evidence file: "+lcs[0]
            res[lcs[0]] =  float(lcs[2])

    return res

def addDatasets(api_connection,config, args):
    if not os.path.exists(args.temp):
        os.makedirs(args.temp)
        
    api_connection.check_table("Sources")
    api_connection.check_table("Gene")
    api_connection.check_table("TranscriptToGene")
    api_connection.check_table("TxDBXREF")
    api_connection.check_table("Attribute")
    api_connection.check_table("Transcript")

    logFP = open(args.log, 'w') if args.log else None

    for dataset,data in config.items():
        assemblyName = data["assemblyName"].replace("'","\\'")
        datasetName = data["name"].replace("'","\\'")
        quant_data_file = data["data_file"]

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
    api_connection.check_table("Gene")
    api_connection.check_table("TranscriptToGene")
    api_connection.check_table("TxDBXREF")
    api_connection.check_table("TXAttribute")
    api_connection.check_table("Transcript")
    api_connection.check_table("SequenceID")
    api_connection.check_table("SequenceIDMap")
    api_connection.check_table("Organism")
    
    # build summary table
    api_connection.build_dbTxSummaryTable()

    # build gene summary table
    api_connection.build_dbGeneSummaryTable()

    # extract transcript counts across sources and assemblies into a separate table
    api_connection.build_AllCountSummaryTable()
    summary = api_connection.get_AllCountSummaryTable()

    attribute_summary = api_connection.build_attributeSummaryTable()
    transcript_type_summary = api_connection.build_TranscriptTypeSummaryTable()
    gene_type_summary = api_connection.build_GeneTypeSummaryTable()

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
    parser_addSources.add_argument("--skipUnknownAttributes",
                                required=False,
                                action="store_true",
                                help="If enabled this flag will ensure any attributes not already in the database are skipped without raising an error.")
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