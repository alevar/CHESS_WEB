#!/usr/bin/env python3

# this script is used to create and modify the database from the gtf/gff files

import os
import sys
import copy
import argparse
import subprocess

def load_assembly_config(assembly_config_fname:str) -> dict:
    config = dict()

# reads GTF file (assumes gffreat -T output) and combines all records into transcript structures (one per transcript)
# storing associated exons and cds records
# yields transcripts one by one
def read_gffread_gtf(infname:str):
    transcript_lines = [] # lines associated with a transcript
    current_tid = None
    
    with open(infname) as inFP:
        for line in inFP:
            if line[0] == "#":
                continue
            lcs = line.rstrip().split("\t")
            if not len(lcs) == 9:
                continue

            tid = lcs[8].split("transcript_id \"", 1)[1].split("\"", 1)[0]

            if lcs[2]=="transcript":
                if current_tid is not None:
                    assert not len(transcript_lines)==0,"empty transcript lines for: "+current_tid
                    old_transcript_lines = copy.deepcopy(transcript_lines)
                    transcript_lines = [line.rstrip()]
                    yield transcript_lines
            else:
                assert tid==current_tid,"records out of order: "+current_tid+" > "+tid
                transcript_lines.append(line.rstrip())

    if not current_tid is None:
        assert not len(transcript_lines)==0,"empty transcript lines for: "+current_tid
        yield transcript_lines 

# extract all transcripts stored in the database into a GTF file
def db_to_gtf(db_connection:mysql,assembly:str,outfname:str):
    with open(outfname,"w") as outFP:
        for transcript in db[db["assembly"]==assembly].Transcripts: # use PK_tid as the transcript_id for unique identification in the output
            transcript_str = ""
            
            outFP.write(transcript_str)

def insert_transcript(db:mysql,transcript:list,assembly:str):
    unimplemented()

def update_transcript(db:mysql,transcript:list):
    unimplemented()

def add_gtf(args):
    assert os.path.exists(args.db)==False, "Database already exists. Please remove it manually before proceeding. This is done to prevent accidental overwriting of existing databases."
    assert os.path.exists(args.input), "Input file does not exist. Please check the path and try again."

    # create database connection
    db = None
    try:
        db = mysql.connect(args.db)
    except e:
        print("Exception occured when trying to connect to the database: "+e)
        exit(1)

    # TODO: get source information:
    # All information should be provided by the user instead of parsing it out of GTF files
    # This avoids uncertainty over the order of the comment lines, etc
    # creation/modification timestamp is autoupdated

    # create or update the database information (sorce, assembly, etc tables)

    # prep parameters
    logFP = open(args.log, 'w') if args.log else None
    logFP.close()

    # run gffread to standardize the transcript set before importing into the database
    norm_input_gtf = args.temp_dir+"/input.gffread.gtf" # stores temporary file with the normalized input gtf to be added to the database
    cmd = [args.gffread,"--adj-stop","-T","-F",
           "-o",norm_input_gtf,
           args.input]

    print("Executing gffread to normalize the input annotation file")
    print(" ".join(cmd))
    logFP = open(args.log, 'a') if args.log else None
    logFP.write(" ".join(cmd)+"\n") if logFP

    proc = subprocess.Popen(cmd,stderr=subprocess.PIPE)

    for line in proc.stderr:
        logFP.write(line) if logFP else sys.stderr.write(line)
    proc.wait()

    logFP.close() if logFP else None

    # extract the current database GTF for the provided genome assembly
    db_gtf_fname = args.temp_dir+"db.gtf"
    print("Extracting gtf from the current database")
    db_to_gtf(db_connection,args.assembly,db_gtf_fname)

    # run gffcompare between the database GTF and the normalized input file
    gffcmp_gtf_fname = args.temp_dir+"input.gffread.gffcmp.gtf"
    cmd = [args.gffcompare,
    "-r",db_gtf_fname,
    "-o",gffcmp_gtf_fname,
    norm_input_gtf]

    print("Executing gffread to normalize the input annotation file")
    print(" ".join(cmd))
    logFP = open(args.log, 'a') if args.log else None
    logFP.write(" ".join(cmd)+"\n") if logFP

    proc = subprocess.Popen(cmd,stderr=subprocess.PIPE)

    for line in proc.stderr:
        logFP.write(line) if logFP else sys.stderr.write(line)
    proc.wait()
    
    logFP.close() if logFP else None

    # iterate over the contents of the file and add them to the database
    for transcript in read_gffread_gtf(gffcmp_gtf_fname):
        tx_lcs = lcs[0].split("\t")
        assert tx_lcs[2]=="transcript","wrong record type found when parsing normalized input GTF. Expected type transcript, found type "+tx_lcs[2]+" for record: "+"\n".join(transcript)

        attributes = definitions.extract_attributes(tx_lcs[8],gff=False)
        
        if attributes["cmp"] == "=":
            update_transcript(db,transcript)
        else:
            insert_transcript(db,transcript,assembly)


def update(args):
    # run gffread to standardize the transcript set before importing into the database
    # run gffcompare to find duplicate transcripts
    # add transcripts to the database
    print(test)

def main(args):
    parser = argparse.ArgumentParser(description='''Help Page''')
    subparsers = parser.add_subparsers(help='sub-command help')

    # should we be adding assembly, organism, etc separately not part of this script or create submodules here for everythin?
    # 1. easier to have separate in sql
    # 2. is more consistend


    ##############################
    #######   EXPRESSION   #######
    ##############################
    parser_update=subparsers.add_parser('assembly',
                                        help='assembly help')
    parser_update.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in ')
    parser_update.add_argument('--db',
                              required=True,
                              type=str,
                              help='Name of the database to be created')
    parser_update.add_argument("--temp",
                              required=True,
                              type=str,
                              help="Path to a temporary directory to store intermediate files")
    parser_update.add_argument("--gffread",
                              required=False,
                              default="gffread",
                              type=str,
                              help="Path to gffread binary")
    parser_update.add_argument("--keep_temp",
                              required=False,
                              action="store_true",
                              help="Keep temporary files after the database is built")
    parser_update.set_defaults(func=update)
    args=parser.parse_args()
    args.func(args)


    ##############################
    #######     ADDGTF     #######
    # adds a gtf to the database #
    ##############################
    parser_addgtf=subparsers.add_parser('addgtf',
                                        help='addgtf help')
    parser_addgtf.add_argument('--gtf',
                              required=True,
                              type=str,
                              help='GTF/GFF file to initiate the database')
    parser_addgtf.add_argument('--db',
                              required=True,
                              type=str,
                              help='Name of the database to be modified. The database must exist and be created with the latest SQL schema file.')
    parser_addgtf.add_argument("--temp",
                              required=True,
                              type=str,
                              help="Path to a temporary directory to store intermediate files")
    parser_addgtf.add_argument("--log",
                              rquired=False,
                              type=str,
                              help="Path to the file where to write log information")
    parser_addgtf.add_argument("--gffread",
                              required=False,
                              default="gffread",
                              type=str,
                              help="Path to gffread executable")
    parser_addgtf.add_argument("--gffcompare",
                               required=False,
                               default="gffcompare",
                               type=str,
                               help="Path to the gffcompare executable")
    parser_addgtf.add_argument("--keep_temp",
                              required=False,
                              action="store_true",
                              help="Keep temporary files after the database is built")
    parser_addgtf.set_defaults(func=build)



    ##############################
    #######     DELETE     #######
    # Deletes a source from the  #
    # database                   #
    ##############################
    parser_update=subparsers.add_parser('update',
                                        help='update help')
    parser_update.add_argument('--input',
                              required=True,
                              type=str,
                              help='GTF/GFF file to initiate the database')
    parser_update.add_argument('--db',
                              required=True,
                              type=str,
                              help='Name of the database to be created')
    parser_update.add_argument("--temp",
                              required=True,
                              type=str,
                              help="Path to a temporary directory to store intermediate files")
    parser_update.add_argument("--gffread",
                              required=False,
                              default="gffread",
                              type=str,
                              help="Path to gffread binary")
    parser_update.add_argument("--keep_temp",
                              required=False,
                              action="store_true",
                              help="Keep temporary files after the database is built")
    parser_update.set_defaults(func=update)
    args=parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main(sys.argv[1:])