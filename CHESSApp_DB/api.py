import mysql.connector
from definitions import *
from TX import *

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
            self.connection = mysql.connector.MySQLConnection(
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
            cursor.execute(query, data)
            query_type = query.strip().split(" ")[0].lower()
            if query_type.startswith('select'):
                result = cursor.fetchall()
            elif query_type.startswith('insert'):
                result = cursor.lastrowid
            elif query_type.startswith('drop'):
                result = True
            elif query_type.startswith('create'):
                result = True
            elif query_type.startswith('update'):
                result = cursor.lastrowid
            elif query_type.startswith('delete'):
                result = True
            else:
                assert False,"Invalid query type."
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            print(query)
            exit(-1)
        
        self.commit()
        cursor.close()
        return result
    
    def lastrowid(self):
        return self.connection.lastrowid
    
    ##############################
    ########   ORGANISM   ########
    ##############################
    def insert_organism(self, data:dict):
        scienceName = data["scienceName"]
        commonName = data["commonName"].replace("'","\\'")
        information = data["information"].replace("'","\\'")

        # no need to check scienceName, it is a primary key
        query = f"INSERT INTO Organism (scientificName, commonName, information) VALUES ('{scienceName}', '{commonName}', '{information}')"
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
        query = f"INSERT INTO Assembly (assemblyName, organismName, link, information) VALUES ('{assemblyName}', '{scienceName}', '{link}', '{information}')"
        return self.execute_query(query)
    
    def insert_contig(self,assemblyID,contig,nomenclature,length):
        # create a new entry for the contig
        # count the number of entries in the SequenceID table for the current assembly
        query = f"SELECT COUNT(*) FROM SequenceID WHERE assemblyID = {assemblyID}"
        seqid = self.execute_query(query)[0][0] + 1
        query = f"INSERT INTO SequenceID (assemblyID, sequenceID, length) SELECT \
                                                    {assemblyID}, {seqid}, {length};"
        self.execute_query(query)

        query = f"INSERT INTO SequenceIDMap (assemblyID, sequenceID, nomenclature, sequenceName) VALUES ('{assemblyID}', '{seqid}', '{nomenclature}', '{contig}')"
        return self.execute_query(query)

    ##############################
    ##########  SOURCE  ##########
    ##############################
    def insert_source(self, data:dict, source_format:str):
        sourceName = data["name"].replace("'","\\'")
        assemblyName = data["assemblyName"].replace("'","\\'")
        link = data["link"]
        information = data["information"].replace("'","\\'")
        citation = data["citation"]

        query = """ INSERT INTO Sources (assemblyID, name, link, information, originalFormat, citation)
                    SELECT a.assemblyID, %s, %s, %s, %s, %s
                    FROM Assembly a
                    WHERE a.assemblyName = %s
                """
        return self.execute_query(query,(sourceName, link, information, source_format, citation, assemblyName))
    
    def insert_intron(self, assemblyID:int,sequenceID:int,strand:str,start:int,end:int):
        query = f"INSERT IGNORE INTO Intron (assemblyID, sequenceID, strand, start, end) VALUES ({assemblyID},{sequenceID},'{strand}','{start}','{end}')"
        return self.execute_query(query)

    def insert_transcript(self, transcript:TX, assemblyID:int):
        query = f"INSERT INTO Transcript (assemblyID,sequenceID,strand,start,end) VALUES ('{assemblyID}','{transcript.seqid}',{transcript.strand},'{transcript.start}','{transcript.end}')"
        tx_res = self.execute_query(query)
    
        # deal with introns here since they are part of transcript
        for intron in transcript.introns:
            i_res = self.insert_intron(assemblyID, transcript.seqid, transcript.strand, intron[0], intron[1])
            
            # insert transcript to intron mapping
            query = f"INSERT INTO TranscriptToIntron (tid, iid) SELECT {tx_res}, i.iid FROM Intron i WHERE \
                                                                                            i.assemblyID = {assemblyID} AND \
                                                                                            i.sequenceID = {transcript.seqid} AND \
                                                                                            i.strand = {transcript.strand} AND \
                                                                                            i.start = {intron[0]} AND \
                                                                                            i.end = {intron[1]}"
            txi_res = self.execute_query(query)
        
        return tx_res
    
    def insert_dbxref(self, transcript:TX, tid:int, sourceID:int):
        query = f"INSERT INTO TxDBXREF (tid, sourceID, transcript_id, start, end"
        values = (tid, sourceID, transcript.tid, transcript.start, transcript.end)
        if transcript.cds_start is not None and transcript.cds_end is not None:
            query += ", cds_start"
            values += (transcript.cds_start,)
            query += ", cds_end"
            values += (transcript.cds_end,)
        if transcript.score is not None:
            query += ", score"
            values += (transcript.score,)
        if transcript.transcript_type_value is not None:
            query += ", type_key"
            values += (transcript.transcript_type_key,)
            query += ", type_value"
            values += (transcript.transcript_type_value,)
        query += ") VALUES (%s, %s, %s, %s, %s"
        if transcript.cds_start is not None and transcript.cds_end is not None:
            query += ", %s, %s"
        if transcript.score is not None:
            query += ", %s"
        if transcript.transcript_type_value is not None:
            query += ", %s, %s"
        query += ")"

        return self.execute_query(query, values)
    

    ##############################
    #######  NOMENCLATURE  #######
    ##############################
    def insert_nomenclature(self, assemblyID:int, sequenceID:int, altID:str, nomenclature:str):
        # no need to check assemblyID and sequenceID, they are primary keys
        query = f"INSERT INTO SequenceIDMap (assemblyID, sequenceID, sequenceName, nomenclature) VALUES ('{assemblyID}', '{sequenceID}', '{altID}', '{nomenclature}')"
        return self.execute_query(query)


    ##############################
    #########   DATASET   ########
    ##############################
    def insert_dataset(self, data:dict):
        datasetName = data["name"].replace("'","\\'")
        sampleCount = int(data["sampleCount"])
        information = data["information"].replace("'","\\'")

        query = f"INSERT INTO Dataset (name,sampleCOunt,information) VALUES ('{datasetName}','{sampleCount}','{information}')"
        return self.execute_query(query)
    
    def insert_transcriptEvidence(self, tid:int, datasetID:int, evidence:dict):
        query = f"INSERT INTO TranscriptToDataset (tid, datasetID, sampleCount, expressionMean, expressionStd) VALUES (%s, %s, %s, %s, %s)"

        values = (tid, datasetID, evidence["sampleCount"], evidence["expressionMean"], evidence["expressionStd"])
        return self.execute_query(query, values)
        

    ###############################
    ##########  GENERAL  ##########
    ###############################
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
        
    def group_rows(self,rows:list,seqid_map:dict):
        tx = TX()
        for row in rows:
            tid = row[0]
            if tx.tid != tid:
                if tx.tid is not None:
                    tx.exons_from_introns()
                    yield tx
                    tx = TX()
            tx.tid = tid
            tx.strand = "+" if row[3] == 1 else "-"
            tx.seqid = seqid_map[row[2]]
            tx.start = int(row[4])
            tx.end = int(row[5])
            tx.introns.append((int(row[13]),int(row[14])))

    def to_gtf(self,assemblyID:int,seqid_map:dict,outfname:str):
        # reverse seqid_map
        seqid_map_rev = {v:k for k,v in seqid_map.items()}

        # retrieve transcripts for a given assembly and outputs them as a GTF file
        query = f"SELECT * FROM Transcript t JOIN TranscriptToIntron ti ON t.tid = ti.tid \
                                             JOIN Intron i ON ti.iid = i.iid WHERE \
                                                                t.assemblyID = {assemblyID} AND \
                                                                i.assemblyID = {assemblyID} ORDER BY t.tid;"
        select_res = self.execute_query(query)

        with open(outfname,"w") as outFP:
            if select_res is None or not select_res:
                print(f"No transcripts found for assembly {assemblyID}.")
                # write a dummy transcript to avoid errors downstream
                outFP.write("		transcript	0	0	.	+	.	transcript_id \"nan\";\n")
                outFP.write("		exon	0	0	.	+	.	transcript_id \"nan\";\n")
            else:
                for tx in self.group_rows(select_res,seqid_map_rev):
                    outFP.write(tx.to_gtf()+"\n")
        
        return
    
    def drop_table(self,table_name:str):
        query = f"DROP TABLE IF EXISTS {table_name} "
        return self.execute_query(query)
    
    def build_dbTxSummaryTable(self):
        # a single table of all transcripts in the database with all relevant information included. No need too store any positions, etc
        # this table is a lot faster to query since no joins are necessary and all information is as condensed as possible
        # 1. tid (pk) - no need to store any additional transcript identifiers - those are only needed for extracting gtf, etc
        # 2. assemblyID (pk)
        # 3. source (pk)
        # 4. one field for each fixed attribute

        # that's it for now but can be supplemented with additional fields later

        # get list of assemblies
        query = "SELECT assemblyID FROM Assembly"
        assemblies = [x[0] for x in self.execute_query(query)]

        for assemblyID in assemblies:
            table_name = f"dbTxSummary_{assemblyID}"
            # drop existing table
            self.drop_table(table_name)

            # get source IDs
            query = "SELECT sourceID FROM Sources where assemblyID = "+str(assemblyID)
            source_ids = [x[0] for x in self.execute_query(query)]
            # get attribute keys
            query = "SELECT key_name FROM AttributeKey WHERE variable = 0"
            attribute_keys = [x[0] for x in self.execute_query(query)]

            # create table
            query = f"""
                    CREATE TABLE {table_name} (
                        `tid` INT,
                        {", ".join([f"`{source_id}` INT" for source_id in source_ids])},
                        {", ".join([f"`{key}` VARCHAR(50)" for key in attribute_keys])},
                        PRIMARY KEY (tid),
                        UNIQUE INDEX ({", ".join([f'`{source_id}` ASC' for source_id in source_ids] + [f'`{key}` ASC' for key in attribute_keys])})
                    );
                    """
            res = self.execute_query(query)

            # populate table
            source_cases = "\n".join([f"MAX(CASE WHEN s.sourceID = {source_id} THEN 1 ELSE 0 END) AS \"{source_id}\"," for source_id in source_ids])
            attribute_cases = "\n".join([f"MAX(CASE WHEN ak.key_name = '{key}' THEN avm.std_value ELSE NULL END) AS \"{key}\"," for key in attribute_keys])
            if len(attribute_cases) > 0:
                attribute_cases = attribute_cases[:-1] # remove the last comma

            query = f"""
                    INSERT INTO {table_name}
                    SELECT
                            tid,
                            {source_cases}
                            {attribute_cases}
                        FROM
                            TxDBXREF
                        JOIN Sources s USING (sourceID)
                        JOIN TXAttribute txa USING (tid, sourceID, transcript_id)
                        JOIN AttributeValueMap avm ON txa.name = avm.key_name AND txa.value = avm.std_value
                        JOIN AttributeKey ak USING (key_name)
                        WHERE
                            s.assemblyID = {assemblyID}
                            AND
                            ak.variable = 0
                        GROUP BY
                            tid;
                    """
            print(query)
            
            res = self.execute_query(query)
        
        return True
    
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
                            Organism O
                        LEFT JOIN
                            Assembly A ON O.scientificName = A.organismName
                        LEFT JOIN
                            SequenceID SI ON A.assemblyID = SI.assemblyID
                        LEFT JOIN
                            Transcript T ON SI.sequenceID = T.sequenceID AND SI.assemblyID = T.assemblyID
                        LEFT JOIN
                            TxDBXREF TX ON T.tid = TX.tid
                        LEFT JOIN
                            Sources S ON TX.sourceID = S.sourceID
                        LEFT JOIN
                            TranscriptToGene TG ON T.tid = TG.tid
                        LEFT JOIN
                            Gene G ON TG.gid = G.gid
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
        
        combo_str = ", ".join(["\'"+str(s)+"\'" for s in sources])
        values = tuple([combo_str,combo_str,len(sources)])
        query = query % values
        return self.execute_query(query)
    
    def build_upsetDataTable(self,upset_data):
        self.drop_table("UpsetData")

        query = """CREATE TABLE UpsetData (organism TEXT, assembly TEXT, sourcesAll TEXT, sourcesSub TEXT, transcriptCount INT)"""
        self.execute_query(query)

        for row in upset_data:
            query = "INSERT INTO UpsetData (organism, assembly, sourcesAll, sourcesSub, transcriptCount) VALUES (%s,%s,%s,%s,%s)"
            self.execute_query(query,row)

    def build_attributeSummaryTable(self):
        self.drop_table("AttributeSummary")
        query = """CREATE TABLE AttributeSummary AS
                    SELECT k.key_name, 
                        k.description,
                        kv.value, 
                        a.assemblyName,
                        s.name,
                        COUNT(*) AS count_of_records
                    FROM AttributeKeyValue kv 
                    JOIN AttributeKey k ON kv.key_name = k.key_name 
                    JOIN AttributeValueMap avm ON kv.key_name = avm.key_name AND kv.value = avm.std_value
                    JOIN TXAttribute ta ON avm.key_name = ta.name AND avm.og_value = ta.value
                    JOIN Sources s ON ta.sourceID = s.sourceID
                    JOIN Assembly a ON s.assemblyID = a.assemblyID
                    WHERE variable = 0
                    GROUP BY s.name, kv.key_name, kv.value, k.description;"""
        self.execute_query(query)

    def custom_transcript_set(self,settings):
        return
        

    ######################
    ######   GETS   ######
    ######################

    # get assemblyID from name
    def get_assemblyID(self,name:str) -> int:
        assemblyName = name.replace("'","\\'")
        query = "SELECT assemblyID FROM Assembly WHERE assemblyName = '"+assemblyName+"'"
        res = self.execute_query(query)
        assert len(res) == 1,"Invalid assembly name: "+name
        return res[0][0]

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
        query = "SELECT * FROM Dataset"
        res = self.execute_query(query)

        res = [x[1:] for x in res] # this is simple data - just output the list instead of the dict
        return res
    
    def get_sequeceData(self):
        return
    
    def get_assemblyID(self,name:str) -> int:
        query = "SELECT assemblyID FROM Assembly WHERE assemblyName = '"+name+"'"
        res = self.execute_query(query)
        assert len(res) == 1,"Invalid assembly name: "+name
        return res[0][0]
    
    def get_seqidMap(self,assemblyID:int,seqid_set:set=None,nomenclature:str=None) -> dict:
        # return map across all nomenclatures if both are None
        map = dict()
        if nomenclature is None and seqid_set is None:
            query = "SELECT sequenceName,sequenceID FROM SequenceIDMap WHERE assemblyID = "+str(assemblyID)
            res = self.execute_query(query)
            for row in res:
                map[row[0]] = row[1]

        elif nomenclature is not None and seqid_set is None:
            query = "SELECT sequenceName,sequenceID FROM SequenceIDMap WHERE assemblyID = "+str(assemblyID)+" AND nomenclature = '"+nomenclature+"'"
            res = self.execute_query(query)
            for row in res:
                map[row[0]] = row[1]

        elif nomenclature is None and seqid_set is not None:
            query = "SELECT sequenceName,sequenceID,nomenclature FROM SequenceIDMap WHERE assemblyID = "+str(assemblyID)+" AND sequenceName IN ("+",".join(["'"+str(s)+"'" for s in seqid_set])+")"
            res = self.execute_query(query)
            nomenclatures = set()
            for row in res:
                map[row[0]] = row[1]
                nomenclatures.add(row[2])
            assert len(nomenclatures) == 1,"Multiple nomenclatures found for the same sequenceID: "+str(nomenclatures)
            assert seqid_set == set(map.keys()),"Not all requested seqids were found in the database: "+str(seqid_set.difference(set(map.keys())))
        else:
            query = "SELECT sequenceName,sequenceID FROM SequenceIDMap WHERE assemblyID = "+str(assemblyID)+" AND nomenclature = '"+nomenclature+"' AND sequenceName IN ("+",".join(["'"+str(s)+"'" for s in seqid_set])+")"
            res = self.execute_query(query)
            for row in res:
                map[row[0]] = row[1]
            assert seqid_set == set(map.keys()),"Not all requested seqids were found in the database: "+str(seqid_set.difference(set(map.keys())))
        
        return map
    
    def get_attribute_information(self) -> dict:
        # retrieve a map of all keys, their alernative names along with all possible values permitted and their maps

        # query AttributeKeyMap where either og_key or alt_key matches the key. Retrieve unique std_key values. Assert it is unique (shout be guaranteed by the DB)
        query = """SELECT 
                    AttributeKeyMap.std_key,
                    GROUP_CONCAT(DISTINCT AttributeKeyMap.og_key) AS og_keys,
                    MAX(AttributeKey.variable) AS og_key_map,
                    AttributeValueMap.std_value,
                    GROUP_CONCAT(DISTINCT AttributeValueMap.og_value) AS og_values
                FROM 
                    AttributeKeyMap
                LEFT JOIN 
                    AttributeKey ON AttributeKeyMap.std_key = AttributeKey.key_name
                LEFT JOIN
                    AttributeValueMap ON AttributeKeyMap.std_key = AttributeValueMap.key_name
                GROUP BY 
                    AttributeKeyMap.std_key, AttributeValueMap.std_value;"""

        tmp = self.execute_query(query)
        res = {}
        for row in tmp:
            std_key = row[0]
            res.setdefault(std_key,{
                "synonyms": set(row[1].split(",")),
                'variable': row[2],
                "values": dict()
            })
            assert res[std_key]["variable"] == row[2],"Inconsistent variable value for key "+std_key
            assert res[std_key]["synonyms"] == set(row[1].split(",")),"Inconsistent synonyms for key "+std_key
            assert row[3] not in res[std_key]["values"],"Duplicate value found for key "+std_key+": "+row[3]

            res[std_key]["values"][row[3]] = set(row[4].split(","))

        return res
