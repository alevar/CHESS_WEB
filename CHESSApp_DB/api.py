import mysql.connector

from definitions import *

# API for working with the CHESSApp database

class CHESS_DB_API:
    def __init__(self, host, username, password, database, port):
        self.host = host
        self.username = username
        self.password = password
        self.database = database
        self.port = port
        self.connection = None

        self.commit_interval = 1000
        self.commit_counter = 0

    # commits after every n invocations or immediately if requested
    def commit(self,force=False):
        if force or self.commit_counter % self.commit_interval == 0:
            self.connection.commit()
            self.commit_counter = 0
        else:
            self.commit_counter += 1


    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.username,
                password=self.password,
                database=self.database,
                port = self.port
            )
            print("Connected to MySQL database")
        except mysql.connector.Error as err:
            print(f"Error: {err}")

    def disconnect(self):
        if self.connection.is_connected():
            self.connection.close()
            print("Disconnected from MySQL database")
    
    def is_connected(self):
        return self.connection.is_connected()

    # return raw connection handle to the user to allow for custom queries
    def get_conection(self):
        return self.connection

    # returns result of the select query or the lastrowid of the insert query
    def execute_query(self, query, data=None):
        result = False
        try:
            cursor = self.connection.cursor()
            if data:
                cursor.execute(query, data)
            else:
                cursor.execute(query)
            if query.lower().startswith('select'):
                result = cursor.fetchall()
            elif query.lower().startswith('insert'):
                result = cursor.lastrowid
            else:
                assert False,"Invalid query type. Only select and insert queries are currently supported."
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            print(query)
            exit(-1)
        
        self.commit()
        cursor.close()
        return result
    
    ##############################
    ########   ORGANISM   ########
    ##############################
    def insert_organism(self, data:dict):
        scienceName = data["scienceName"]
        commonName = data["commonName"].replace("'","\\'")
        information = data["information"].replace("'","\\'")

        # no need to check scienceName, it is a primary key
        query = f"INSERT INTO Organisms (scientificName, commonName, information) VALUES ('{scienceName}', '{commonName}', '{information}')"
        return self.execute_query(query)
    

    ##############################
    ########   ASSEMBLY   ########
    ##############################
    def insert_assembly(self, data:dict):
        assemblyName = data["name"].replace("'","\\'")
        scienceName = data["organismScienceName"]
        link = data["link"]
        information = data["information"].replace("'","\\'")

        # no need to check assemblyName, it is a primary key
        query = f"INSERT INTO Assemblies (assemblyName, organismName, link, information) VALUES ('{assemblyName}', '{scienceName}', '{link}', '{information}')"
        return self.execute_query(query)
    
    def insert_contig(self,contig,length,data:dict):
        assemblyName = data["name"].replace("'","\\'")
        nomenclature = data["nomenclature"].replace("'","\\'")

        query = f"INSERT INTO SequenceIDs (assemblyName, sequenceID, length, nomenclature) VALUES ('{assemblyName}', '{contig}', {length}, '{nomenclature}')"
        return self.execute_query(query)

    ##############################
    ##########  SOURCE  ##########
    ##############################
    def insert_source(self, data:dict, source_format:str):
        sourceName = data["name"].replace("'","\\'")
        link = data["link"]
        information = data["information"].replace("'","\\'")

        query = f"INSERT INTO Sources (name,link,information,originalFormat) VALUES ('{sourceName}','{link}','{information}','{source_format}')"
        return self.execute_query(query)

    def insert_transcript(self, transcript:TX, data:dict):
        assemblyName = data["assemblyName"].replace("'","\\'")

        query = f"INSERT INTO Transcripts (assemblyName,sequenceID,strand,start,end,exons) VALUES ('{assemblyName}','{transcript.seqid}',{transcript.strand},'{transcript.start}','{transcript.end}','{transcript.exons}')"
        return self.execute_query(query)
    
    def insert_attribute(self, tid:int, sourceID:int, transcriptID:str, attribute_key:str, attribute_value:str):
        query = f"INSERT INTO Attributes (tid,sourceID,transcript_id,name,value) VALUES ('{tid}','{sourceID}','{transcriptID}','{attribute_key}','{attribute_value}')"
        return self.execute_query(query)
    
    def insert_dbxref(self, transcript:TX, tid:int, sourceID:int):
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

        return self.execute_query(query, values)
    

    ##############################
    #######  NOMENCLATURE  #######
    ##############################
    def insert_nomenclature(self, sequenceID:str, altID:str, data:dict):
        assemblyName = data["assemblyName"]
        nomecnclature = data["nomenclature"]

        # no need to check assemblyName and sequenceID, they are primary keys
        query = f"INSERT INTO SequenceIDMap (assemblyName, sequenceID, alternativeID, nomenclature) VALUES ('{assemblyName}', '{sequenceID}', '{altID}', '{nomecnclature}')"
        return self.execute_query(query)
        

    ###############################
    ##########  GENERAL  ##########
    ###############################
    def get_sequenceIDs(self, assemblyName:str):
        query = f"SELECT sequenceID FROM SequenceIDs WHERE assemblyName='{assemblyName}'"
        return self.execute_query(query)
    
    def check_table(self, table_name:str):
        cursor = self.connection.cursor()
        cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
        if cursor.fetchone() is None:
            cursor.close()
            print(f"{table_name} table does not exist.")
            exit(1)
        else:
            cursor.close()
            return

    def to_gtf(self,assembly:str,outfname:str):
        # retrieve transcripts for a given assembly and outputs them as a GTF file
        query = f"SELECT * FROM Transcripts WHERE assemblyName='{assembly}'"
        select_res = self.execute_query(query)

        with open(outfname,"w") as outFP:
            if select_res is None or not select_res:
                print(f"No transcripts found for assembly {assembly}.")
                # write a dummy transcript to avoid errors downstream
                outFP.write("		transcript	0	0	.	+	.	transcript_id \"nan\";\n")
                outFP.write("		exon	0	0	.	+	.	transcript_id \"nan\";\n")
            else:
                for row in select_res:
                    gtf_str = ""
                    # construct transcript line
                    strand = "+" if row[3] == 1 else "-"
                    gtf_str += row[2]+"\t"+"DB"+"\ttranscript\t"+str(row[4])+"\t"+str(row[5])+"\t.\t"+strand+"\t.\ttranscript_id \""+str(row[0])+"\";\n"
                    # construct exon lines
                    for exon in row[6].split(","):
                        exon_start, exon_end = [str(int(v)) for v in exon.split("-")]
                        gtf_str += row[2]+"\t"+"DB"+"\texon\t"+exon_start+"\t"+exon_end+"\t.\t"+strand+"\t.\ttranscript_id \""+str(row[0])+"\";\n"
                    outFP.write(gtf_str)
        
        return