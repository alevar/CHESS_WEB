import mysql.connector

from prettytable import PrettyTable
import textwrap
import re
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
            cursor.execute(query, data)
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
    
    # TODO: assert entries in the SequenceIDMap table are unique - no contig name should be duplicated for a given assembly
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
    ########  ATTRIBUTE  #########
    ##############################
    def insert_attribute_pair(self, attribute_key:str, attribute_value:str):
        query = f"INSERT INTO AttributePairs (name, value) VALUES ('{attribute_key}', '{attribute_value}')"
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

        query = f"INSERT INTO Transcript (assemblyName,sequenceID,strand,start,end,exons) VALUES ('{assemblyName}','{transcript.seqid}',{transcript.strand},'{transcript.start}','{transcript.end}','{transcript.exons}')"
        return self.execute_query(query)
    
    def insert_txattribute(self, tid:int, sourceID:int, transcriptID:str, attribute_key:str, attribute_value:str):
        query = f"INSERT INTO Attribute (tid,sourceID,transcript_id,name,value) VALUES ('{tid}','{sourceID}','{transcriptID}','{attribute_key}','{attribute_value}')"
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

    def to_gtf(self,assembly:str,outfname:str):
        # retrieve transcripts for a given assembly and outputs them as a GTF file
        query = f"SELECT * FROM Transcript WHERE assemblyName='{assembly}'"
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
                            Organism O
                        LEFT JOIN
                            Assembly A ON O.scientificName = A.organismName
                        LEFT JOIN
                            SequenceID SI ON A.assemblyName = SI.assemblyName
                        LEFT JOIN
                            Transcript T ON SI.sequenceID = T.sequenceID AND SI.assemblyName = T.assemblyName
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
    
    def get_seqidMap(self,assemblyID:int,nomenclature:str) -> dict:
        # retrieve a map from the DB sequenceID to a given nomenclature for the given assembly and nomenclature
        query = "SELECT sequenceName,sequenceID FROM SequenceIDMap WHERE assemblyID = "+str(assemblyID)+" AND nomenclature = '"+nomenclature+"'"
        tmp = self.execute_query(query)
        res = dict()
        for k,v in tmp:
            assert k not in res,"duplicate entries: "+k
            res[k] = v
        return res
    
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
                "synonyms": row[1].split(","),
                'variable': row[2],
                "values": dict()
            })
            assert res[std_key]["variable"] == row[2],"Inconsistent variable value for key "+std_key
            assert res[std_key]["synonyms"] == row[1].split(","),"Inconsistent synonyms for key "+std_key
            assert row[3] not in res[std_key]["values"],"Duplicate value found for key "+std_key+": "+row[3]

            res[std_key]["values"][row[3]] = row[4].split(",")

        return res

# class to hold information and mappings for all attributes in the database
# the class will have user inputs, interactions, updates to the attributes, etc
class Attributes:
    def __init__(self,db_connection:CHESS_DB_API):
        self.commands = [] # list of SQL queries to be executed to sync the database with the changes made by the user
        self.current_state = self.main_menu

        self.dbcon = db_connection
        # retrieve all attribute information from the database
        self.db_info = self.dbcon.get_attribute_information()
        # get map of all keys to their standard names
        self.key_og2std = dict()
        self.key_std2og = dict()
        self.val_og2std = dict()
        self.val_std2og = dict()
        for k,v in self.db_info.items():
            self.val_og2std[k] = dict()
            self.val_std2og[k] = dict()
            
            # process keys
            for k_syn in v["synonyms"]:
                self.key_og2std[k_syn] = k
                self.key_std2og.setdefault(k,set()).add(k_syn)
            
            # process values
            for val,synonyms in v["values"].items():
                for v_syn in synonyms:
                    self.val_og2std[k][v_syn] = val
                    self.val_std2og[k].setdefault(val,set()).add(v_syn)

    def wrap_text(self,text, width=20):
        return textwrap.fill(text, width)
    
    def quit_state(self):
        return True
    
    def rename_key_state(self, selected_key):
        print("Renaming entry: " + selected_key)
        new_name = input("Provide new name for the entry: ")
        if new_name == selected_key:
            print("New name is the same as the old name. No changes made.")
            return self.main_menu
        elif new_name in self.db_info:
            print("New name already exists. No changes made.")
            return self.main_menu
        else:
            print(f"Renaming '{selected_key}' to '{new_name}'.")
            confirmation = input("Press 'y' to accept changes, any other key to cancel:")
            if confirmation.lower() == 'y':
                # Implement the renaming logic here
                # Update the data structures accordingly

                # Placeholder: You may want to update the name in all relevant structures
                self.key_og2std[new_name] = self.key_og2std[selected_key]
                self.key_std2og[new_name] = self.key_std2og[selected_key]
                self.val_og2std[new_name] = self.val_og2std[selected_key]
                self.val_std2og[new_name] = self.val_std2og[selected_key]

                # Remove old_key_name from the data structures
                del self.db_info[selected_key]
                del self.key_og2std[selected_key]
                del self.key_std2og[selected_key]
                del self.val_og2std[selected_key]
                del self.val_std2og[selected_key]

                print(f"Entry '{selected_key}' renamed to '{new_name}' successfully.")
            
            return self.main_menu
    
    def match_input(self, user_input, state, order):
        if (res := re.match(r"^\d+$", user_input)): # match a number
            idx = int(res.group())
            if state == self.main_menu:
                if idx >= 1 and idx <= max(order): # check if the number is in the range of the keys
                    return self.value_state(order[idx])
                else:
                    return None
            else:
                return None
        elif user_input == "m":
            return self.main_menu()
        elif user_input == "q":
            return self.quit_state()
        elif user_input == "a":
            print("add new entry")
        elif re.match(r"^m\d+,\d+$",user_input):
            print("Option 4: 'm#,#' - Merge two entries")
        elif re.match(r"^r\d+$",user_input):
            print("Option 5: 'r#' - Remove entry")
        elif (res := re.match(r'^n\d+$',user_input)):
            idx = int(res.group()[1:])
            self.rename_state(user_input)
            if state == self.main_menu:
                if idx >= 1 and idx <= max(order): # check if the number is in the range of the keys
                    return self.rename_key_state(order[idx])
                else:
                    return None
            else:
                return None
        elif re.match(r"^v\d+$",user_input):
            print("Option 7: 'v#' - Flip variable status")
        else:
            print("Invalid choice. Please enter a valid option.")

    def print_keys(self):
        table = PrettyTable()
        table.field_names = ["#", "Key", "Synonyms", "Variable"]

        order = dict()
        for idx, (key, value) in enumerate(self.db_info.items(), 1):
            order[idx] = key
            table.add_row([idx, key, self.wrap_text(", ".join(value['synonyms']), width=100), value['variable']],divider=True)

        print(table)
        return order

    def print_values_for_key(self, selected_key):
        if selected_key in self.db_info:
            values_info = self.db_info[selected_key]["values"]
            table = PrettyTable()
            table.title = f"Values for Key '{selected_key}'"
            table.field_names = ["#","Value", "Synonyms"]

            order = dict()
            for idx, (val, synonyms) in enumerate(values_info.items(), 1):
                order[idx] = val
                table.add_row([idx, val, ", ".join(synonyms)])

            print(table)
            return order

    def main_menu(self):
        options = """
Options:
1. '#' - View details about a key
2. 'm' - Main menu
3. 'q' - Quit
4. 'm#,#' - Merge two entries (e.g., 'm1,2')
5. 'r#' - Remove entry (e.g., 'r3')
6. 'n#' - Rename entry (e.g., 'n4')
7. 'v#' - Flip variable status (e.g., 'v2')
8. 'a' - Add new entry
"""
        print("Current Keys:")
        order = self.print_keys()
        print(options)
        user_input = input("Enter your choice: ")
        res = self.match_input(user_input, self.main_menu, order)
        while True:
            if res is not None:
                # res is a function to be executed
                return res
            else:
                order = self.print_keys()
                print("Invalid choice. Please enter a valid option.")
                print(options)
                user_input = input("Enter your choice: ")
                res = self.match_input(user_input, self.main_menu,order)

    def value_state(self, selected_key):
        options = """
Options:
1. 'm' - Main menu
2. 'q' - Quit
3. 'm#,#' - Merge two entries (e.g., 'm1,2')
4. 'r#' - Remove entry (e.g., 'r3')
5. 'n#' - Rename entry (e.g., 'n4')
6. 'a' - Add new entry
"""
        order = self.print_values_for_key(selected_key)
        print(options)
        user_input = input("Enter your choice: ")
        res = self.match_input(user_input, self.value_state, order)
        while True:
            if res is not None:
                return res
            else:
                self.print_keys()
                print("Invalid choice. Please enter a valid option.")
                print(options)
                user_input = input("Enter your choice: ")
                res = self.match_input(user_input, self.value_state)

    def prompt(self):
        while True:
            self.current_state = self.current_state()
            if self.current_state == True: # quit
                break
            

    def view_values_state(self, selected_key):
        while True:
            self.print_values_for_key(selected_key)

            print("\nOptions:")
            print("1. Merge entries")
            print("2. Remove entry")
            print("3. Rename entry")
            print("4. Back to main menu")

            try:
                choice = input("Enter your choice (1-4): ")

                if choice == '1':
                    self.merge_entries_state()
                elif choice == '2':
                    self.remove_entry_state()
                elif choice == '3':
                    self.rename_entry_state(selected_key)
                elif choice == '4':
                    self.current_state = self.view_table_state
                    return
                else:
                    print("Invalid choice.")
            except ValueError:
                print("Invalid input. Please enter a valid number.")

    def merge_entries_state(self):
        self.print_keys()

        print("\nMerge Entries:")
        print("Enter two key numbers to merge (press 'm' to return to main menu):")

        try:
            key1 = int(input("Enter the first key number: "))
            if key1 == 'm':
                self.current_state = self.view_table_state
                return

            key2 = int(input("Enter the second key number: "))
            if key2 == 'm':
                self.current_state = self.view_table_state
                return

            keys_list = list(self.db_info.keys())
            if 1 <= key1 <= len(keys_list) and 1 <= key2 <= len(keys_list) and key1 != key2:
                key1_name = keys_list[key1 - 1]
                key2_name = keys_list[key2 - 1]

                self.print_values_for_key(key1_name)
                self.print_values_for_key(key2_name)

                print(f"\nMerging '{key1_name}' and '{key2_name}'.")
                print("Press 'y' to accept changes, any other key to cancel:")

                confirmation = input()
                if confirmation.lower() == 'y':
                    # Implement the merging logic here
                    # Update the data structures accordingly

                    # Placeholder: You may want to copy values from key2 to key1
                    self.db_info[key1_name]["values"].update(self.db_info[key2_name]["values"])

                    # Remove key2 entry from data structures
                    del self.db_info[key2_name]
                    del self.key_og2std[key2_name]
                    del self.key_std2og[key1_name]  # Remove key2 from synonyms of key1
                    del self.val_og2std[key2_name]
                    del self.val_std2og[key1_name]  # Remove key2 from synonyms of key1

                    print(f"Entries '{key1_name}' and '{key2_name}' merged successfully.")

            else:
                print("Invalid key numbers.")
        except ValueError:
            print("Invalid input. Please enter valid numbers.")

    def remove_entry_state(self):
        self.print_keys()

        print("\nRemove Entry:")
        print("Enter a key number to remove (press 'm' to return to main menu):")

        try:
            key_num = int(input("Enter the key number: "))
            if key_num == 'm':
                self.current_state = self.view_table_state
                return

            keys_list = list(self.db_info.keys())
            if 1 <= key_num <= len(keys_list):
                key_name = keys_list[key_num - 1]

                self.print_values_for_key(key_name)

                print(f"\nRemoving entry '{key_name}'.")
                print("Press 'y' to accept deletion, any other key to cancel:")

                confirmation = input()
                if confirmation.lower() == 'y':
                    # Implement the removal logic here
                    # Update the data structures accordingly

                    del self.db_info[key_name]
                    del self.key_og2std[key_name]
                    del self.key_std2og[key_name]
                    del self.val_og2std[key_name]
                    del self.val_std2og[key_name]

                    print(f"Entry '{key_name}' removed successfully.")

            else:
                print("Invalid key number.")
        except ValueError:
            print("Invalid input. Please enter a valid number.")

    def rename_entry_state(self, selected_key):
        self.print_keys()

        print("\nRename Entry:")
        print("Enter a key number to rename (press 'm' to return to main menu):")

        try:
            key_num = int(input("Enter the key number: "))
            if key_num == 'm':
                self.current_state = self.view_table_state
                return

            keys_list = list(self.db_info.keys())
            if 1 <= key_num <= len(keys_list):
                old_key_name = keys_list[key_num - 1]

                new_name = input(f"Enter a new name for '{old_key_name}':")

                print(f"\nRenaming '{old_key_name}' to '{new_name}'.")
                print("Press 'y' to accept changes, any other key to cancel:")

                confirmation = input()
                if confirmation.lower() == 'y':
                    # Implement the renaming logic here
                    # Update the data structures accordingly

                    # Placeholder: You may want to update the name in all relevant structures
                    self.key_og2std[new_name] = self.key_og2std[old_key_name]
                    self.key_std2og[new_name] = self.key_std2og[old_key_name]
                    self.val_og2std[new_name] = self.val_og2std[old_key_name]
                    self.val_std2og[new_name] = self.val_std2og[old_key_name]

                    # Remove old_key_name from the data structures
                    del self.db_info[old_key_name]
                    del self.key_og2std[old_key_name]
                    del self.key_std2og[old_key_name]
                    del self.val_og2std[old_key_name]
                    del self.val_std2og[old_key_name]

                    print(f"Entry '{old_key_name}' renamed to '{new_name}' successfully.")

            else:
                print("Invalid key number.")
        except ValueError:
            print("Invalid input. Please enter a valid number.")