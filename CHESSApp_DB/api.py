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

        self.commit_interval = 10000
        self.commit_counter = 1

    # commits after every n invocations or immediately if requested
    def commit(self,force=False):
        if force or self.commit_counter % self.commit_interval == 0:
            print("committing")
            self.connection.commit()
            self.commit_counter = 1
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
            elif query.lower().startswith('drop'):
                result = True
            elif query.lower().startswith('create'):
                result = True
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

        query = f"INSERT INTO SequenceIDs (assemblyName, sequenceID, length) VALUES ('{assemblyName}', '{contig}', {length})"
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
        values = (tid, sourceID, transcript.tid, transcript.start, transcript.end)
        if transcript.cds is not None and transcript.cds != "":
            query += ", cds"
            values += (transcript.cds,)
        if transcript.score is not None:
            query += ", score"
            values += (transcript.score,)
        if transcript.transcript_type is not None:
            query += ", type"
            values += (transcript.transcript_type,)
        query += ") VALUES (%s, %s, %s, %s, %s"
        if transcript.cds is not None and transcript.cds != "":
            query += ", %s"
        if transcript.score is not None:
            query += ", %s"
        if transcript.transcript_type is not None:
            query += ", %s"
        query += ")"

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
    

    ##############################
    #########   DATASET   ########
    ##############################
    def insert_dataset(self, data:dict):
        datasetName = data["name"].replace("'","\\'")
        sampleCount = int(data["sampleCount"])
        information = data["information"].replace("'","\\'")

        query = f"INSERT INTO Datasets (name,sampleCOunt,information) VALUES ('{datasetName}','{sampleCount}','{information}')"
        return self.execute_query(query)
    
    def insert_transcriptEvidence(self, tid:int, datasetID:int, evidence:dict):
        query = f"INSERT INTO TranscriptToDataset (tid, datasetID, sampleCount, expressionMean, expressionStd) VALUES (%s, %s, %s, %s, %s)"

        values = (tid, datasetID, evidence["sampleCount"], evidence["expressionMean"], evidence["expressionStd"])
        return self.execute_query(query, values)
        

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
    
    def drop_table(self,table_name:str):
        query = f"DROP TABLE IF EXISTS {table_name} "
        return self.execute_query(query)
    
    def build_AllCountSummaryTable(self):
        self.drop_table("AllCountSummary")
        query = """CREATE TABLE AllCountSummary 
                        SELECT
                            O.scientificName AS OrganismName,
                            A.assemblyName AS AssemblyName,
                            COALESCE(S.name, 'Total') AS SourceName,
                            MAX(DISTINCT S.lastUpdated) as lastupdated,
                            COUNT(DISTINCT T.tid) AS TotalTranscripts,
                            COUNT(DISTINCT G.gid) AS TotalGenes
                        FROM
                            Organisms O
                        LEFT JOIN
                            Assemblies A ON O.scientificName = A.organismName
                        LEFT JOIN
                            SequenceIDs SI ON A.assemblyName = SI.assemblyName
                        LEFT JOIN
                            Transcripts T ON SI.sequenceID = T.sequenceID AND SI.assemblyName = T.assemblyName
                        LEFT JOIN
                            TxDBXREF TX ON T.tid = TX.tid
                        LEFT JOIN
                            Sources S ON TX.sourceID = S.sourceID
                        LEFT JOIN
                            TranscriptToGene TG ON T.tid = TG.tid
                        LEFT JOIN
                            Genes G ON TG.gid = G.gid
                        GROUP BY
                            O.scientificName, A.assemblyName, S.name WITH ROLLUP
                        HAVING
                            (O.scientificName IS NOT NULL AND A.assemblyName IS NOT NULL AND S.name IS NOT NULL)
                        ORDER BY
                            O.scientificName, A.assemblyName, S.name;"""
        return self.execute_query(query)

    def get_source_combination_count(self,sources:list):
        query = """SELECT COUNT(tidCount) 
                    FROM (
                        SELECT COUNT(DISTINCT tid) AS tidCount
                        FROM TxDBXREF AS t1
                        LEFT JOIN Sources s1 on t1.sourceID = s1.sourceID
                        WHERE s1.name IN (%s)
                        AND NOT EXISTS (
                            SELECT 1
                            FROM TxDBXREF AS t2
                            LEFT JOIN Sources s2 on t2.sourceID = s2.sourceID
                            WHERE t2.tid = t1.tid
                            AND s2.name NOT IN (%s)
                        )
                        GROUP BY t1.tid
                        HAVING COUNT(DISTINCT s1.name) = %s
                    ) AS C1;"""
        
        combo_str = ", ".join([str(s) for s in sources])
        values = tuple([combo_str,combo_str,len(sources)])
        return self.execute_query(query,values)
    
    def build_upsetDataTable(self,upset_data):
        self.drop_table("UpsetData")

        query = """CREATE TABLE UpsetData (organism TEXT, assembly TEXT, sourcesAll TEXT, sourcesSub TEXT, transcriptCount INT)"""
        self.execute_query(query)

        for row in upset_data:
            query = "INSERT INTO UpsetData (organism, assembly, sourcesAll, sourcesSub, transcriptCount) VALUES (%s,%s,%s,%s,%s)"
            self.execute_query(query,row)


    def custom_transcript_set(self,settings):
        return
        

    ######################
    ######   GETS   ######
    ######################

    # get summary table
    def get_AllCountSummaryTable(self) -> dict:
        query = "SELECT * FROM AllCountSummary"
        res = self.execute_query(query)

        # parse the summary list into a dictionary
        summary = {"speciesName":dict()}
        for row in res:
            summary["speciesName"].setdefault(row[0],{"assemblyName":dict()})
            summary["speciesName"][row[0]]["assemblyName"].setdefault(row[1],{"sourceName":dict()})
            assert row[2] not in summary["speciesName"][row[0]]["assemblyName"][row[1]]["sourceName"],"Duplicate source name found in AllCountSummary table: "+row[2]
            summary["speciesName"][row[0]]["assemblyName"][row[1]]["sourceName"][row[2]] = {
                "lastUpdated":row[3],
                "totalTranscripts":row[4],
                "totalGenes":row[5]
                }

        return summary
    
    # get full source information
    def get_sources(self):
        query = "SELECT * FROM Sources"
        res = self.execute_query(query)

        # parse list into a dictionary
        sources = dict()
        for row in res:
            sources[row[0]] = {
                "name":row[1],
                "link":row[2],
                "information":row[3],
                "originalFormat":row[4],
                "lastUpdated":row[5]
            }
        return sources
    
    def get_upsetData(self):
        query = "SELECT * FROM UpsetData"
        res = self.execute_query(query)

        # parse list into a dictionary
        upsetData = dict()
        for row in res:
            upsetData["speciesName"].setdefault(row[0],{"assemblyName":dict()})
            upsetData["speciesName"][row[0]]["assemblyName"].setdefault(row[1],{"sources":dict()})
            sub_sources = tuple(row[3].split(","))
            assert sub_sources not in upsetData["speciesName"][row[0]]["assemblyName"][row[1]]["sources"],"Duplicate source name found in upsetData table: "+sub_sources
            upsetData["speciesName"][row[0]]["assemblyName"][row[1]]["sources"][sub_sources] = int(row[4])
        
        return upsetData

    def get_Datasets(self):
        query = "SELECT * FROM Datasets"
        res = self.execute_query(query)

        res = [x[1:] for x in res] # this is simple data - just output the list instead of the dict
        return res
    
    def get_sequeceData(self):
        return