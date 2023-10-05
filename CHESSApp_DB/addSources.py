#!/usr/bin/env python3

import os
import sys
import copy
import json
import argparse
import subprocess
import definitions

import mysql.connector

class TX:
    def __init__(self,transcript_lines:list):
        self.seqid = None
        self.strand = None
        self.start = None
        self.end = None
        self.tid = None
        self.gid = None
        self.exons = None
        self.cds = None
        self.attributes = None
        self.class_code = None
        self.gene_name = None
        self.gene_type = None
        self.transcript_type = None
        self.cmp_ref = None
        self.score = None

        self.from_strlist(transcript_lines)

    def check_valid_transcript_attributes(self,attributes:dict):
        assert "transcript_id" in attributes,"transcript_id attribute not found"
        assert "gene_id" in attributes,"gene_id attribute not found"
        assert "class_code" in attributes,"class_code attribute not found"

    def from_strlist(self,transcript_lines:list):
        tx_lcs = transcript_lines[0].rstrip().split("\t")
        assert tx_lcs[2]=="transcript","wrong record type found when parsing normalized input GTF. Expected type transcript, found type "+tx_lcs[2]+" for record: "+"\n".join(transcript)
        
        self.attributes = definitions.extract_attributes(tx_lcs[8],gff=False)
        self.check_valid_transcript_attributes(self.attributes)

        self.seqid = tx_lcs[0]
        self.strand = 1 if tx_lcs[6]=="+" else 0
        self.start = tx_lcs[3]
        self.end = tx_lcs[4]
        self.score = 0 if tx_lcs[5]=="." else tx_lcs[5]

        self.tid = self.attributes["transcript_id"]
        self.gid = self.attributes["gene_id"]

        self.class_code = self.attributes["class_code"]
        self.cmp_ref = self.attributes.get("cmp_ref",None)

        self.gene_name = self.attributes.get("gene_name",None)
        self.gene_type = self.attributes.get("gene_type",None)
        self.transcript_type = self.attributes.get("transcript_type",None)

        # get exon chain (and cds if available)
        self.exons = ""
        self.cds = ""
        for line in transcript_lines:
            lcs = line.split("\t")
            if lcs[2]=="exon":
                self.exons += lcs[3]+"-"+lcs[4]+","
            elif lcs[2]=="CDS":
                self.cds += lcs[3]+"-"+lcs[4]+","
            else:
                continue
        # remove trailing comma
        self.exons = self.exons.rstrip(",")
        self.cds = self.cds.rstrip(",")
        

def check_table(table_name:str,connection):
    cursor = connection.cursor()
    cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
    if cursor.fetchone() is None:
        print(f"{table_name} table does not exist.")
        exit(1)
    else:
        return

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

# extract all transcripts stored in the database into a GTF file
def db_to_gtf(connection,assembly:str,outfname:str):
    # retrieve transcripts for a given assembly and outputs them as a GTF file
    cursor = connection.cursor()

    cursor.execute(f"SELECT * FROM Transcripts WHERE assemblyName='{assembly}'")

    with open(outfname,"w") as outFP:
        if cursor.fetchone() is None:
            print(f"No transcripts found for assembly {assembly}.")
            # write a dummy transcript to avoid errors downstream
            outFP.write("		transcript	0	0	.	+	.	transcript_id \"nan\";\n")
            outFP.write("		exon	0	0	.	+	.	transcript_id \"nan\";\n")
        else:
            for row in cursor:
                outFP.write(row[1]+"\n")
    
    return

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

# returns the tid of the inserted record in the Transcripts table
def insert_transcript(connection,transcript:TX,sourceID:int,assemblyName:str):
    cursor = connection.cursor()

    # make sure the combination of that tid and current source does not exist in the database
    query = f"SELECT COUNT(*) FROM TxDBXREF WHERE transcript_id='{transcript.tid}' AND sourceID='{sourceID}'"
    cursor.execute(query)
    if cursor.fetchone()[0] > 0:
        assert False,"Transcript/Source pair already exists in the database. Skipping."

    # insert transcript into the database
    query = f"INSERT INTO Transcripts (assemblyName,sequenceID,strand,start,end,exons) VALUES ('{assemblyName}','{transcript.seqid}',{transcript.strand},'{transcript.start}','{transcript.end}','{transcript.exons}')"
    cursor.execute(query)
    connection.commit()

    # return the tid of the last auto-incremented id which corresponds to the last inserted transcript
    return cursor.lastrowid

# returns the tid of the updated record in the Transcripts table
def update_transcript(connection,transcript:TX,sourceName:str) -> int:
    cursor = connection.cursor()

    assert transcript.cmp_ref is not None,"cmp_ref attribute not found for transcript: "+transcript.tid

    # find Transcripts.tid of the cmp_ref transcript
    query = f"SELECT UNIQUE(tid) FROM TxDBXREF WHERE transcript_id='{transcript.cmp_ref}'"
    cursor.execute(query)
    # make sure it is unique
    assert cursor.rowcount == 1,"cmp_ref transcript not found or not unique for transcript: "+transcript.tid
    cmp_ref_tid = cursor.fetchone()[0]

    # make sure the combination of that tid and current source does not exist in the database
    query = f"SELECT COUNT(*) FROM TxDBXREF WHERE transcript_id='{cmp_ref_tid}' AND sourceID='{sourceName}'"
    cursor.execute(query)
    if cursor.fetchone()[0] > 0:
        assert False,"Transcript/Source pair already exists in the database. Skipping."

    # TODO: update transcript

    # return the tid of the updated transcript
    return cmp_ref_tid

# return the sourceID of the source being added to the database
def insert_source(connection,sourceName:str,link:str,information:str,source_format:str) -> int:
    cursor = connection.cursor()

    # make sure the source does not exist in the database
    query = f"SELECT COUNT(*) FROM Sources WHERE name='{sourceName}'"
    cursor.execute(query)
    if cursor.fetchone()[0] > 0:
        assert False,"Source already exists in the database. Skipping."

    # insert source into the database
    query = f"INSERT INTO Sources (name,link,information,originalFormat) VALUES ('{sourceName}','{link}','{information}','{source_format}')"
    cursor.execute(query)
    connection.commit()

    return cursor.lastrowid

def add_txdbxref(connection,tid:int,sourceID:int,transcript:TX,assemblyName:str):
    cursor = connection.cursor()

    # make sure the combination of that tid and current source does not exist in the database
    query = f"SELECT COUNT(*) FROM TxDBXREF WHERE transcript_id='{transcript.tid}' AND sourceID='{sourceID}'"
    cursor.execute(query)
    if cursor.fetchone()[0] > 0:
        assert False,"Transcript already exists in the database. Skipping."

    # insert entry into the TxDBXREF table
    query = f"INSERT INTO TxDBXREF (tid, sourceID, transcript_id, start, end" 
    if transcript.cds is not None and transcript.cds != "":
        query += ", cds"
    if transcript.score is not None:
        query += ", score"
    if transcript.transcript_type is not None:
        query += ", type"
    query += ") VALUES (%s, %s, %s, %s, %s"
    if transcript.cds is not None and transcript.cds != "":
        query += ", %s"
    if transcript.score is not None:
        query += ", %s"
    if transcript.transcript_type is not None:
        query += ", %s"
    query += ")"

    values = (tid, sourceID, transcript.tid, transcript.start, transcript.end)
    if transcript.cds is not None and transcript.cds != "":
        values += (transcript.cds,)
    if transcript.score is not None:
        values += (transcript.score,)
    if transcript.transcript_type is not None:
        values += (transcript.transcript_type,)

    cursor.execute(query, values)
    connection.commit()

    # add atributes to the Attributes table
    for k,v in transcript.attributes.items():
        query = f"INSERT INTO Attributes (tid,sourceID,name,value) VALUES ('{tid}','{sourceID}','{k}','{v}')"
        cursor.execute(query)
        connection.commit()


def _addSources(connection, configuration,args):
    if not os.path.exists(args.temp):
        os.makedirs(args.temp)
        
    check_table("Sources",connection)
    check_table("Genes",connection)
    check_table("TranscriptToGene",connection)
    check_table("TxDBXREF",connection)
    check_table("Attributes",connection)
    check_table("Transcripts",connection)

    logFP = open(args.log, 'w') if args.log else None
    logFP.close()

    config = None
    with open(configuration, 'r') as configFP:
        config = json.load(configFP)

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
        db_to_gtf(connection,assemblyName,db_gtf_fname)     

        # gffread/gffcompare/etc
        source_format = "gff" if definitions.is_gff(filename) else "gtf"

        # run gffread to standardize the transcript set before importing into the database
        norm_input_gtf = os.path.abspath(args.temp)+"/input.gffread.gtf" # stores temporary file with the normalized input gtf to be added to the database
        run_gffread(filename,norm_input_gtf,args.gffread,genome,args.log)

        # run gffcompare between the database GTF and the normalized input file
        gffcmp_gtf_fname = os.path.abspath(args.temp)+"/input.gffread.gffcmp"
        run_gffcompare(norm_input_gtf,db_gtf_fname,gffcmp_gtf_fname,args.gffcompare,args.log)

        # insert source data into Sources table
        working_sourceID = insert_source(connection,sourceName,link,information,source_format)

        # iterate over the contents of the file and add them to the database
        for transcript_lines in read_gffread_gtf(gffcmp_gtf_fname+".annotated.gtf"):
            transcript = TX(transcript_lines)
            working_tid = None # tid PK of the transcript being worked on as it appears in the Transcripts table
            if transcript.class_code == "=":
                working_tid = update_transcript(connection,transcript,working_sourceID)
            else:
                working_tid = insert_transcript(connection,transcript,working_sourceID,assemblyName)

            # add transcript source pairing to the TxDBXREF table
            add_txdbxref(connection,working_tid,working_sourceID,transcript,assemblyName)

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

    try:
        connection = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )

        if connection.is_connected():
            print("Connected to the database.")

            main_fn(connection, args.configuration,args)

        else:
            print("Failed to connect to the database.")
            exit(1)
    except mysql.connector.Error as error:
        print("Failed to connect to the database.")
        print(error)
        exit(1)
    finally:
        if connection.is_connected():
            connection.close()
            print("Connection to the database closed.")

    return

def main(args):
    parser = argparse.ArgumentParser(description='''Help Page''')
    subparsers = parser.add_subparsers(help='sub-command help')

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
    parser_addSources.set_defaults(func=establish_connection,main_fn=_addSources)
    args=parser.parse_args()
    args.func(args,args.main_fn)


if __name__ == "__main__":
    main(sys.argv[1:])