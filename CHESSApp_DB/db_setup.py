#!/usr/bin/env python3

# this script is used to create and modify the database from the gtf/gff files

import os
import sys
import copy
import json
import argparse
import subprocess

import mysql.connector

from definitions import *
import api

##############################
########   ORGANISM   ########
##############################
def addOrganisms(api_connection,config, args):
    for organism,data in config.items():
        api_connection.insert_organism(data)


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
        api_connection.insert_assembly(data)

        # now also write contig information from the index file into SequenceIDs table
        for contig,length in parse_fai(data["fastaIndex"]).items():
            api_connection.insert_contig(contig,length,data)


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

def run_gffread(infname:str,outfname:str,gffread:str,genome:str,log:str):
        assert os.path.exists(infname),"input file does not exist: "+infname
        assert os.path.exists(genome),"genome file does not exist: "+genome

        cmd = [gffread,"--adj-stop","-T","-F",
               "-g",genome,
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

    cmd = [gffcompare,
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

def addSources(api_connection,config,args):
    if not os.path.exists(args.temp):
        os.makedirs(args.temp)
        
    api_connection.check_table("Sources")
    api_connection.check_table("Genes")
    api_connection.check_table("TranscriptToGene")
    api_connection.check_table("TxDBXREF")
    api_connection.check_table("Attributes")
    api_connection.check_table("Transcripts")

    logFP = open(args.log, 'w') if args.log else None
    logFP.close()

    for source,data in config.items():
        print(source,data)
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
        run_gffread(filename,norm_input_gtf,args.gffread,genome,args.log)

        # run gffcompare between the database GTF and the normalized input file
        gffcmp_gtf_fname = os.path.abspath(args.temp)+"/input.gffread.gffcmp"
        run_gffcompare(norm_input_gtf,db_gtf_fname,gffcmp_gtf_fname,args.gffcompare,args.log)

        # insert source data into Sources table
        working_sourceID = api_connection.insert_source(data,source_format)

        # iterate over the contents of the file and add them to the database
        for transcript_lines in read_gffread_gtf(gffcmp_gtf_fname+".annotated.gtf"):
            transcript = TX(transcript_lines)
            working_tid = None # tid PK of the transcript being worked on as it appears in the Transcripts table
            if transcript.class_code == "=":
                working_tid = transcript.cmp_ref
            else:
                working_tid = api_connection.insert_transcript(transcript,data)

            # add transcript source pairing to the TxDBXREF table
            api_connection.insert_dbxref(transcript,working_tid,working_sourceID)

            for attribute_key,attribute_value in transcript.attributes.items():
                api_connection.insert_attribute(working_tid,working_sourceID,transcript.tid,attribute_key,attribute_value)

def establish_connection(args,main_fn):
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
        
        config = None
        with open(args.configuration, 'r') as configFP:
            config = json.load(configFP)

        main_fn(chessApi,config,args)

    except mysql.connector.Error as error:
        print("Failed to connect to the database.")
        print(error)
        exit(1)
    finally:
        if chessApi is not None and chessApi.is_connected():
            chessApi.disconnect()
            print("Connection to the database closed.")

    return

def main(args):
    parser = argparse.ArgumentParser(description='''Help Page''')
    subparsers = parser.add_subparsers(help='sub-command help')

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

    args=parser.parse_args()
    args.func(args,args.main_fn)


if __name__ == "__main__":
    main(sys.argv[1:])