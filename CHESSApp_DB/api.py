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
        science_name = data["science_name"]
        common_name = data["common_name"].replace("'","\\'")
        information = data["information"].replace("'","\\'")

        # no need to check science_name, it is a primary key
        query = f"INSERT INTO organism (scientific_name, common_name, information) VALUES ('{science_name}', '{common_name}', '{information}')"
        return self.execute_query(query)
    

    ##############################
    ########   ASSEMBLY   ########
    ##############################
    def insert_assembly(self, data:dict):
        assembly_name = data["name"].replace("'","\\'")
        science_name = data["organism_science_name"]
        organism_id = self.get_organism_id(science_name)
        link = data["link"]
        information = data["information"].replace("'","\\'")

        # no need to check assembly_name, it is a primary key
        query = f"INSERT INTO assembly (assembly_name, organism_id, link, information) VALUES ('{assembly_name}', '{organism_id}', '{link}', '{information}')"
        return self.execute_query(query)
    
    def insert_contig(self,assembly_id,contig,nomenclature,length):
        # create a new entry for the contig
        # count the number of entries in the sequence_id table for the current assembly
        query = f"SELECT COUNT(*) FROM sequence_id WHERE assembly_id = {assembly_id}"
        seqid = self.execute_query(query)[0][0] + 1
        query = f"INSERT INTO sequence_id (assembly_id, sequence_id, length) SELECT \
                                                    {assembly_id}, {seqid}, {length};"
        self.execute_query(query)

        query = f"INSERT INTO sequence_id_map (assembly_id, sequence_id, nomenclature, sequence_name) VALUES ('{assembly_id}', '{seqid}', '{nomenclature}', '{contig}')"
        return self.execute_query(query)

    ##############################
    ##########  SOURCE  ##########
    ##############################
    def insert_source(self, data:dict, source_format:str):
        source_name = data["name"].replace("'","\\'")
        assembly_name = data["assembly_name"].replace("'","\\'")
        link = data["link"]
        information = data["information"].replace("'","\\'")
        citation = data["citation"]

        query = """ INSERT INTO sources (assembly_id, name, link, information, original_format, citation)
                    SELECT a.assembly_id, %s, %s, %s, %s, %s
                    FROM assembly a
                    WHERE a.assembly_name = %s
                """
        return self.execute_query(query,(source_name, link, information, source_format, citation, assembly_name))
    
    def insert_intron(self, assembly_id:int,sequence_id:int,strand:str,start:int,end:int):
        query = f"INSERT IGNORE INTO intron (assembly_id, sequence_id, strand, start, end) VALUES ({assembly_id},{sequence_id},'{strand}','{start}','{end}')"
        return self.execute_query(query)
    
    def insert_transcript(self, transcript:TX, assembly_id:int):
        query = f"INSERT INTO transcript (assembly_id,sequence_id,strand,start,end) VALUES ('{assembly_id}','{transcript.seqid}',{transcript.strand},'{transcript.start}','{transcript.end}')"
        tx_res = self.execute_query(query)
    
        # deal with introns here since they are part of transcript
        for intron in transcript.introns:
            i_res = self.insert_intron(assembly_id, transcript.seqid, transcript.strand, intron[0], intron[1])
            
            # insert transcript to intron mapping
            query = f"INSERT INTO transcript_intron (tid, iid) SELECT {tx_res}, i.iid FROM intron i WHERE \
                                                                                            i.assembly_id = {assembly_id} AND \
                                                                                            i.sequence_id = {transcript.seqid} AND \
                                                                                            i.strand = {transcript.strand} AND \
                                                                                            i.start = {intron[0]} AND \
                                                                                            i.end = {intron[1]}"
            txi_res = self.execute_query(query)
        
        return tx_res
    
    def insert_gene(self, transcript:TX, source_id:int):
        query = f"INSERT INTO gene (gene_id, source_id, name, type_key, type_value) VALUES (%s, %s, %s, %s, %s)"
        values = (transcript.gene_id, source_id, transcript.gene_name_value, transcript.gene_type_key, transcript.gene_type_value)

        return self.execute_query(query, values)
    
    def insert_dbxref(self, transcript:TX, tid:int, gid:int, source_id:int):
        query = f"INSERT INTO tx_dbxref (tid, source_id, transcript_id, start, end, type_key, type_value, gid"
        values = (tid, source_id, transcript.tid, transcript.start, transcript.end, transcript.transcript_type_key, transcript.transcript_type_value, gid)
        if transcript.cds_start is not None and transcript.cds_end is not None:
            query += ", cds_start"
            values += (transcript.cds_start,)
            query += ", cds_end"
            values += (transcript.cds_end,)
        if transcript.score is not None:
            query += ", score"
            values += (transcript.score,)
        query += ") VALUES (%s, %s, %s, %s, %s, %s, %s, %s"
        if transcript.cds_start is not None and transcript.cds_end is not None:
            query += ", %s, %s"
        if transcript.score is not None:
            query += ", %s"
        query += ")"

        return self.execute_query(query, values)
    

    ##############################
    #######  NOMENCLATURE  #######
    ##############################
    def insert_nomenclature(self, assembly_id:int, sequence_id:int, altID:str, nomenclature:str):
        # no need to check assembly_id and sequence_id, they are primary keys
        query = f"INSERT INTO sequence_id_map (assembly_id, sequence_id, sequence_name, nomenclature) VALUES ('{assembly_id}', '{sequence_id}', '{altID}', '{nomenclature}')"
        return self.execute_query(query)


    ##############################
    #########   DATASET   ########
    ##############################
    def insert_dataset(self, data:dict):
        dataset_name = data["name"].replace("'","\\'")
        sample_count = int(data["sample_count"])
        information = data["information"].replace("'","\\'")

        query = f"INSERT INTO dataset (name,sample_count,information) VALUES ('{dataset_name}','{sample_count}','{information}')"
        return self.execute_query(query)
    
    def insert_transcript_evidence(self, tid:int, dataset_id:int, evidence:dict):
        query = f"INSERT INTO transcript_dataset (tid, dataset_id, sample_count, expression_mean, expression_std) VALUES (%s, %s, %s, %s, %s)"

        values = (tid, dataset_id, evidence["sample_count"], evidence["expression_mean"], evidence["expression_std"])
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

    def tid2lid_map(self,assembly_id:int):
        # // retrieve a map of tids from transcript table to lid from locus table
        query = f"SELECT t.tid, l.lid FROM tx_dbxref t JOIN gene g on t.gid = g.gid JOIN locus l on g.lid = l.lid WHERE \
                                                                                            l.assembly_id = {assembly_id}"
        
        select_ref = self.execute_query(query)

        tid2lid = dict()
        for row in select_ref:
            tid2lid[row[0]] = row[1]
        
        return tid2lid

    def to_gtf(self,assembly_id:int,seqid_map:dict,outfname:str):
        # reverse seqid_map
        seqid_map_rev = {v:k for k,v in seqid_map.items()}

        # retrieve transcripts for a given assembly and outputs them as a GTF file
        query = f"SELECT * FROM transcript t JOIN transcript_intron ti ON t.tid = ti.tid \
                                             JOIN intron i ON ti.iid = i.iid WHERE \
                                                                t.assembly_id = {assembly_id} AND \
                                                                i.assembly_id = {assembly_id} ORDER BY t.tid;"
        select_res = self.execute_query(query)

        with open(outfname,"w") as outFP:
            if select_res is None or not select_res:
                print(f"No transcripts found for assembly {assembly_id}.")
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
    
    def find_loci(self,  nodes):
        """Finds loci via shared transcripts
        Identical to finding connected components in a graph.
        DB returns a list of nodes: tid to gid. DFS scans to find all groups where either a transcript is shared or a gene is shared

        Args:
        nodes: A list of nodes, where each node is a tuple of two values.

        Returns:
        A list of lists, where each inner list represents a connected component.
        """

        class UnionFind:
            def __init__(self, n):
                self.parent = [i for i in range(n)]
                self.rank = [0] * n

            def find(self, x):
                if self.parent[x] != x:
                    self.parent[x] = self.find(self.parent[x])  # Path compression
                return self.parent[x]

            def union(self, x, y):
                root_x = self.find(x)
                root_y = self.find(y)
                if root_x == root_y:
                    return  # Already in the same set

                # Union by rank to optimize tree height
                if self.rank[root_x] < self.rank[root_y]:
                    self.parent[root_x] = root_y
                elif self.rank[root_x] > self.rank[root_y]:
                    self.parent[root_y] = root_x
                else:
                    self.parent[root_y] = root_x
                    self.rank[root_x] += 1

        uf = UnionFind(len(nodes))
        components = {}

        # Optimize connectivity checks:
        for i, node in enumerate(nodes):
            for j in range(i + 1, len(nodes)):
                if (node[0] == nodes[j][0] or node[1] == nodes[j][1]) and uf.find(i) != uf.find(j):
                    uf.union(i, j)

        # Construct components based on final union-find structure:
        for i, node in enumerate(nodes):
            root = uf.find(i)
            components.setdefault(root, []).append(node)

        return list(components.values())
    
    def genes2locus(self,gids:set[int]) -> list:
        # construct locus coordinate using transcripts linked to a set of genes
        query = """
            SELECT
                MIN(Tx.start) AS start,
                MAX(Tx.end) AS end,
                T.assembly_id,
                T.sequence_id,
                T.strand
            FROM
                gene G
            JOIN
                tx_dbxref Tx ON G.gid = Tx.gid
            JOIN
                transcript T ON Tx.tid = T.tid
            WHERE
                G.gid IN ("""
        
        query += ", ".join([str(gid) for gid in gids])

        query += """)
            GROUP BY
                T.assembly_id, T.sequence_id, T.strand
            HAVING
                COUNT(DISTINCT T.assembly_id) = 1
                AND COUNT(DISTINCT T.sequence_id) = 1
                AND COUNT(DISTINCT T.strand) = 1;
            """
        
        res = self.execute_query(query)

        assert len(res) == 1,"Invalid gene set. Multiple loci found for a single gene set."

        return res[0]
    
    def insert_locus(self,assembly_id:int,sequence_id:int,strand:str,start:int,end:int):
        query = f"INSERT INTO locus (assembly_id, sequence_id, strand, start, end) VALUES ({assembly_id},{sequence_id},{strand},'{start}','{end}')"
        return self.execute_query(query)
    
    def set_gene_lid(self,gid:int,lid:int):
        query = f"UPDATE gene SET lid = {lid} WHERE gid = {gid}"
        return self.execute_query(query)

    def get_genome_sequences(self):
        # returns a list of assembly_id,sequence_id,strand
        query = "SELECT DISTINCT assembly_id, sequence_id, strand FROM transcript"
        return self.execute_query(query)
    
    def build_locus_table(self):
        # do for each assembly, sequence and strand:
        genome_sequences = self.get_genome_sequences()
        for assembly_id,sequence_id,strand in genome_sequences:
            query = """
                SELECT
                    TX.tid,
                    G.gid
                FROM
                    tx_dbxref TX
                JOIN
                    gene G ON TX.gid = G.gid
                JOIN transcript T ON TX.tid = T.tid
                WHERE T.assembly_id = """+str(assembly_id)+""" AND T.sequence_id = """+str(sequence_id)+""" AND T.strand = '"""+str(strand)+"""';
            """

            nodes = self.execute_query(query)

            loci = self.find_loci(nodes)

            # traverse connected components and insert into loci ang gene tables
            for lid, locus in enumerate(loci):
                gene_set = set([x[1] for x in locus])

                # get coordinates for the locus: minimum start and maximum end and sequence ID and strand
                locus_coords = self.genes2locus(gene_set)

                # add locus to the locus table
                lid = self.insert_locus(locus_coords[2],locus_coords[3],locus_coords[4],locus_coords[0],locus_coords[1])
        
                # update genes with the lid
                for gid in gene_set:
                    self.set_gene_lid(gid,lid)

    def build_locus_summary_table(self):
        # generate summary tables
        # for each locus
        #    for each source report lists of
        #        gene_ids
        #        gene_names
        #        transcript_ids
        #        assembly_id
        query = "SELECT assembly_id FROM assembly"
        assemblies = [x[0] for x in self.execute_query(query)]

        for assembly_id in assemblies:
            table_name = f"db_locus_summary_{assembly_id}"
            # drop existing table
            self.drop_table(table_name)

            # get source IDs
            query = "SELECT source_id FROM sources where assembly_id = "+str(assembly_id)
            source_ids = [x[0] for x in self.execute_query(query)]

            # create indices
            index_strings = "INDEX (`lid` ASC)"
            index_strings += f", INDEX (`sequence_id` ASC, `strand` ASC, `start` ASC, `end` ASC)"

            # create table
            query = f"""
                    CREATE TABLE {table_name} (
                        `lid` INT,
                        `sequence_id` INT,
                        `strand` INT,
                        `start` INT,
                        `end` INT,
                        {", ".join([f"`{source_id}.gene_id` TEXT" for source_id in source_ids])},
                        {", ".join([f"`{source_id}.gene_name` TEXT" for source_id in source_ids])},
                        PRIMARY KEY (lid),
                        FULLTEXT KEY ({", ".join([f"`{source_id}.gene_id`" for source_id in source_ids])},
                                      {", ".join([f"`{source_id}.gene_name`" for source_id in source_ids])}) WITH PARSER NGRAM,
                        {index_strings}
                    );
                    """
            
            res = self.execute_query(query)
            
            # populate table
            # Generate and execute the INSERT INTO query
            gene_id_inserts = "\n".join([f"GROUP_CONCAT(DISTINCT CASE WHEN gene.source_id = {source_id} THEN gene.gene_id ELSE NULL END) AS `{source_id}.gene_id`," for source_id in source_ids])
            if len(gene_id_inserts) > 0:
                gene_id_inserts = gene_id_inserts[:-1] # remove the last comma
            
            gene_name_inserts = "\n".join([f"GROUP_CONCAT(DISTINCT CASE WHEN gene.source_id = {source_id} THEN gene.name ELSE NULL END) AS `{source_id}.gene_name`," for source_id in source_ids])
            if len(gene_name_inserts) > 0:
                gene_name_inserts = gene_name_inserts[:-1] # remove the last comma
            
            insert_into_query = f"""
                    INSERT INTO {table_name} (
                        `lid`,
                        `sequence_id`,
                        `strand`,
                        `start`,
                        `end`,
                        {", ".join([f"`{source_id}.gene_id`" for source_id in source_ids] +
                                    [f"`{source_id}.gene_name`" for source_id in source_ids])}
                    )
                    SELECT
                        locus.lid,
                        locus.sequence_id,
                        locus.strand,
                        locus.start,
                        locus.end,
                        {gene_id_inserts},
                        {gene_name_inserts}
                    FROM
                        locus
                    LEFT JOIN
                        gene ON locus.lid = gene.lid
                    GROUP BY
                        locus.lid, locus.sequence_id, locus.strand;
                    """

            # Execute the INSERT INTO query
            res = self.execute_query(insert_into_query)
            
    def build_db_tx_summary_table(self):
        # a single table of all transcripts in the database with all relevant information included. No need too store any positions, etc
        # this table is a lot faster to query since no joins are necessary and all information is as condensed as possible
        # 1. tid (pk) - no need to store any additional transcript identifiers - those are only needed for extracting gtf, etc
        # 2. assembly_id (pk)
        # 3. source (pk)
        # 4. one field for each specified attribute

        # that's it for now but can be supplemented with additional fields later

        # get list of assemblies
        query = "SELECT assembly_id FROM assembly"
        assemblies = [x[0] for x in self.execute_query(query)]

        for assembly_id in assemblies:
            table_name = f"db_tx_summary_{assembly_id}"
            # drop existing table
            self.drop_table(table_name)

            # get source IDs
            query = "SELECT source_id FROM sources where assembly_id = "+str(assembly_id)
            source_ids = [x[0] for x in self.execute_query(query)]
            
            # This is list of attribute names used in this summary table. Actual definition of how they are fetched are below
            attribute_keys = ["gene_type","transcript_type","has_cds"]

            index_strings = f"""INDEX ({", ".join([f"`{source_id}` ASC" for source_id in source_ids])})"""
            index_strings += f", INDEX ({', '.join([f'`{source_id}.has_cds` ASC' for source_id in source_ids])})"
            for source_id in source_ids:
                index_strings += f", INDEX (`{source_id}` ASC)"
                index_strings += f", INDEX (`{source_id}.transcript_id` ASC)"
                index_strings += ", INDEX ("+", ".join([f"`{source_id}.{key}` ASC" for key in attribute_keys])+")"
                for attribute_key in attribute_keys:
                    index_strings += f", INDEX (`{source_id}.{attribute_key}` ASC)"

            # create table
            query = f"""
                    CREATE TABLE {table_name} (
                        `tid` INT,
                        {", ".join([f"`{source_id}` INT" for source_id in source_ids])},
                        {", ".join([f"`{source_id}.transcript_id` VARCHAR(50)" for source_id in source_ids])},
                        {", ".join([f"`{source_id}.{key}` INT" for key in attribute_keys for source_id in source_ids])},
                        PRIMARY KEY (tid),
                        {index_strings}
                    );
                    """
            res = self.execute_query(query)

            # populate table
            source_cases = "\n".join([f"MAX(CASE WHEN s.source_id = {source_id} THEN 1 ELSE 0 END) AS \"{source_id}\"," for source_id in source_ids])
            if len(source_cases) > 0:
                source_cases = source_cases[:-1] # remove the last comma

            # gene_type cases
            geneType_cases = "\n".join([f"MAX(CASE WHEN akv.key_name = 'gene_type' and s.source_id = {source_id} THEN akv.kvid ELSE NULL END) AS \"{source_id}.gene_type\"," for source_id in source_ids])
            if len(geneType_cases) > 0:
                geneType_cases = geneType_cases[:-1] # remove the last comma
            # transcript_type cases
            transcriptType_cases = "\n".join([f"MAX(CASE WHEN akv.key_name = dbx.type_key and s.source_id = {source_id} THEN akv.kvid ELSE NULL END) AS \"{source_id}.transcript_type\"," for source_id in source_ids])
            if len(transcriptType_cases) > 0:
                transcriptType_cases = transcriptType_cases[:-1] # remove the last comma

            # attach source-specific transcript ID  to the table
            transcriptID_cases = "\n".join([f"MAX(CASE WHEN s.source_id = {source_id} THEN dbx.transcript_id ELSE NULL END) AS \"{source_id}.transcript_id\"," for source_id in source_ids])
            if len(transcriptID_cases) > 0:
                transcriptID_cases = transcriptID_cases[:-1] # remove the last comma

            # has_cds cases
            has_cds_cases = "\n".join([f"MAX(CASE WHEN dbx.cds_start IS NOT NULL and s.source_id = {source_id} THEN 1 ELSE 0 END) AS \"{source_id}.has_cds\"," for source_id in source_ids])
            if len(has_cds_cases) > 0:
                has_cds_cases = has_cds_cases[:-1] # remove the last comma

            query = f"""
                    INSERT INTO {table_name}
                    SELECT
                            tid,
                            {source_cases},
                            {transcriptID_cases},
                            {geneType_cases},
                            {transcriptType_cases},
                            {has_cds_cases}
                        FROM
                            tx_dbxref dbx
                        JOIN sources s USING (source_id)
                        JOIN tx_attribute txa USING (tid, source_id, transcript_id)
                        JOIN attribute_value_map avm ON txa.name = avm.key_name AND txa.value = avm.og_value
                        JOIN attribute_key ak USING (key_name)
                        JOIN attribute_key_value akv ON txa.name = akv.key_name AND avm.std_value = akv.value
                        WHERE
                            s.assembly_id = {assembly_id}
                        GROUP BY
                            tid;
                    """
            res = self.execute_query(query)
        
        return True
    
    def build_db_gene_summary_table(self):
        # build a table summarizing gene information for quick lookup
        # geneID
        # location
        # sources in which it exists
        # name in each source
        # ID of each source
        # list of transcript IDs for each source

         # get list of assemblies
        query = "SELECT assembly_id FROM assembly"
        assemblies = [x[0] for x in self.execute_query(query)]

        for assembly_id in assemblies:
            table_name = f"db_gene_summary_{assembly_id}"
            # drop existing table
            self.drop_table(table_name)

            # get source IDs
            query = "SELECT source_id FROM sources where assembly_id = "+str(assembly_id)
            source_ids = [x[0] for x in self.execute_query(query)]

            index_strings = f"""INDEX ({", ".join([f"`{source_id}` ASC" for source_id in source_ids])})"""
            index_strings += f", INDEX ({', '.join([f'`{source_id}.gene_id` ASC' for source_id in source_ids])})"
            index_strings += f""", INDEX ({'`seqid` ASC, `strand` ASC, `start` ASC, `end` ASC'})"""

            # create table
            query = f"""
                    CREATE TABLE {table_name} (
                        `gene_name` INT,
                        `seqid` INT,
                        `strand` INT,
                        `start` INT,
                        `end` INT,
                        {", ".join([f"`{source_id}` INT" for source_id in source_ids])},
                        {", ".join([f"`{source_id}.gene_id` INT" for source_id in source_ids])},
                        PRIMARY KEY (gene_name),
                        {index_strings}
                    );
                    """
            
            res = self.execute_query(query)
        return
    
    def build_all_count_summary_table(self):
        self.drop_table("all_count_summary")
        query = """CREATE TABLE all_count_summary 
                        SELECT
                            O.scientific_name AS organism_name,
                            A.assembly_name AS assembly_name,
                            COALESCE(S.name, 'Total') AS source_name,
                            MAX(DISTINCT S.last_updated) as last_updated,
                            COUNT(DISTINCT T.tid) AS total_transcripts,
                            COUNT(DISTINCT G.gid) AS total_genes
                        FROM
                            organism O
                        LEFT JOIN
                            assembly A ON O.organism_id = A.organism_id
                        LEFT JOIN
                            sequence_id SI ON A.assembly_id = SI.assembly_id
                        LEFT JOIN
                            transcript T ON SI.sequence_id = T.sequence_id AND SI.assembly_id = T.assembly_id
                        LEFT JOIN
                            tx_dbxref TX ON T.tid = TX.tid
                        LEFT JOIN
                            sources S ON TX.source_id = S.source_id
                        LEFT JOIN
                            gene G ON TX.gid = G.gid
                        GROUP BY
                            O.scientific_name, A.assembly_name, S.name WITH ROLLUP
                        HAVING
                            (O.scientific_name IS NOT NULL AND A.assembly_name IS NOT NULL AND S.name IS NOT NULL)
                        ORDER BY
                            O.scientific_name, A.assembly_name, S.name;"""
        return self.execute_query(query)

    def get_source_combination_count(self,sources:list):
        query = """SELECT COUNT(tidCount) 
                    FROM (
                        SELECT COUNT(DISTINCT tid) AS tidCount
                        FROM tx_dbxref AS t1
                        LEFT JOIN sources s1 on t1.source_id = s1.source_id
                        WHERE s1.name IN (%s)
                        AND NOT EXISTS (
                            SELECT 1
                            FROM tx_dbxref AS t2
                            LEFT JOIN sources s2 on t2.source_id = s2.source_id
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
    
    def build_upset_data_table(self,upset_data):
        self.drop_table("upset_data")

        query = """CREATE TABLE upset_data (organism TEXT, assembly TEXT, sources_all TEXT, sources_sub TEXT, transcript_count INT)"""
        self.execute_query(query)

        for row in upset_data:
            query = "INSERT INTO upset_data (organism, assembly, sources_all, sources_sub, transcript_count) VALUES (%s,%s,%s,%s,%s)"
            self.execute_query(query,row)

    def build_attribute_summary_table(self):
        self.drop_table("attribute_summary")
        query = """CREATE TABLE attribute_summary AS
                    SELECT 
                        kv.kvid,
                        k.key_name, 
                        k.description,
                        kv.value,
                        s.source_id,
                        COUNT(*) AS count_of_records
                    FROM attribute_key_value kv 
                    JOIN attribute_key k ON kv.key_name = k.key_name 
                    JOIN attribute_value_map avm ON kv.key_name = avm.key_name AND kv.value = avm.std_value
                    JOIN tx_attribute ta ON avm.key_name = ta.name AND avm.og_value = ta.value
                    JOIN sources s ON ta.source_id = s.source_id
                    WHERE variable = 0
                    GROUP BY s.source_id, kv.key_name, kv.value, k.description;"""
        self.execute_query(query)

    def build_transcript_type_summary_table(self):
        # links transcript_type from the tx_dbxref table to the sources and attributes and
        # aggregates information about the number of genes with each type
        # tx_dbxref table stores std_key and og_value. The summary also links it to the kvid entries for quick lookup
        self.drop_table("transcript_type_summary")
        query = """CREATE TABLE transcript_type_summary AS
                    SELECT
                        kv.kvid,
                        k.key_name,
                        k.description,
                        kv.value,
                        s.source_id,
                        COUNT(*) AS count_of_records
                    FROM attribute_key_value kv
                    JOIN attribute_key k ON kv.key_name = k.key_name
                    JOIN attribute_value_map avm ON kv.key_name = avm.key_name AND kv.value = avm.std_value
                    JOIN tx_dbxref on avm.key_name = tx_dbxref.type_key AND avm.og_value = tx_dbxref.type_value
                    JOIN sources s ON tx_dbxref.source_id = s.source_id
                    GROUP BY s.source_id, kv.key_name, kv.value, k.description;"""
        self.execute_query(query)

    def build_gene_type_summary_table(self):
        # TODO: redo using gene table

        # links standardized gene_type key from the attributes table to the sources and 
        # aggregates information about the number of genes with each type

        self.drop_table("gene_type_summary")
        query = """CREATE TABLE gene_type_summary AS
                    SELECT 
                        kv.kvid,
                        k.key_name, 
                        k.description,
                        kv.value,
                        s.source_id,
                        COUNT(*) AS count_of_records
                    FROM attribute_key_value kv 
                    JOIN attribute_key k ON kv.key_name = k.key_name 
                    JOIN attribute_value_map avm ON kv.key_name = avm.key_name AND kv.value = avm.std_value
                    JOIN tx_attribute ta ON avm.key_name = ta.name AND avm.og_value = ta.value
                    JOIN sources s ON ta.source_id = s.source_id
                    WHERE k.key_name = 'gene_type'
                    GROUP BY s.source_id, kv.key_name, kv.value, k.description;"""
        self.execute_query(query)


    def custom_transcript_set(self,settings):
        return
        

    ######################
    ######   GETS   ######
    ######################

    # get assembly_id from name
    def get_assembly_id(self,name:str) -> int:
        assembly_name = name.replace("'","\\'")
        query = "SELECT assembly_id FROM assembly WHERE assembly_name = '"+assembly_name+"'"
        res = self.execute_query(query)
        assert len(res) == 1,"Invalid assembly name: "+name
        return res[0][0]

    # get summary table
    def get_all_count_summary_table(self) -> dict:
        query = "SELECT * FROM all_count_summary"
        res = self.execute_query(query)

        # parse the summary list into a dictionary
        summary = {"species_name":dict()}
        for row in res:
            summary["species_name"].setdefault(row[0],{"assembly_name":dict()})
            summary["species_name"][row[0]]["assembly_name"].setdefault(row[1],{"source_name":dict()})
            assert row[2] not in summary["species_name"][row[0]]["assembly_name"][row[1]]["source_name"],"Duplicate source name found in all_count_summary table: "+row[2]
            summary["species_name"][row[0]]["assembly_name"][row[1]]["source_name"][row[2]] = {
                "last_updated":row[3],
                "total_transcripts":row[4],
                "total_genes":row[5]
                }

        return summary
    
    # get full source information
    def get_sources(self):
        query = "SELECT * FROM sources"
        res = self.execute_query(query)

        # parse list into a dictionary
        sources = dict()
        for row in res:
            sources[row[0]] = {
                "name":row[1],
                "link":row[2],
                "information":row[3],
                "original_format":row[4],
                "last_updated":row[5]
            }
        return sources
    
    def get_upset_data(self):
        query = "SELECT * FROM upset_data"
        res = self.execute_query(query)

        # parse list into a dictionary
        upsetData = dict()
        for row in res:
            upsetData["species_name"].setdefault(row[0],{"assembly_name":dict()})
            upsetData["species_name"][row[0]]["assembly_name"].setdefault(row[1],{"sources":dict()})
            sub_sources = tuple(row[3].split(","))
            assert sub_sources not in upsetData["species_name"][row[0]]["assembly_name"][row[1]]["sources"],"Duplicate source name found in upsetData table: "+sub_sources
            upsetData["species_name"][row[0]]["assembly_name"][row[1]]["sources"][sub_sources] = int(row[4])
        
        return upsetData

    def get_datasets(self):
        query = "SELECT * FROM dataset"
        res = self.execute_query(query)

        res = [x[1:] for x in res] # this is simple data - just output the list instead of the dict
        return res
    
    def get_sequece_data(self):
        return
    
    def get_organism_id(self,name:str) -> int:
        query = "SELECT organism_id FROM organism WHERE scientific_name = '"+name+"'"
        res = self.execute_query(query)
        assert len(res) == 1,"Invalid organism name: "+name
        return res[0][0]
    
    def get_seqid_map(self,assembly_id:int,seqid_set:set=None,nomenclature:str=None) -> dict:
        # return map across all nomenclatures if both are None
        map = dict()
        if nomenclature is None and seqid_set is None:
            query = "SELECT sequence_name,sequence_id FROM sequence_id_map WHERE assembly_id = "+str(assembly_id)
            res = self.execute_query(query)
            for row in res:
                map[row[0]] = row[1]

        elif nomenclature is not None and seqid_set is None:
            query = "SELECT sequence_name,sequence_id FROM sequence_id_map WHERE assembly_id = "+str(assembly_id)+" AND nomenclature = '"+nomenclature+"'"
            res = self.execute_query(query)
            for row in res:
                map[row[0]] = row[1]

        elif nomenclature is None and seqid_set is not None:
            query = "SELECT sequence_name,sequence_id,nomenclature FROM sequence_id_map WHERE assembly_id = "+str(assembly_id)+" AND sequence_name IN ("+",".join(["'"+str(s)+"'" for s in seqid_set])+")"
            res = self.execute_query(query)
            nomenclatures = set()
            for row in res:
                map[row[0]] = row[1]
                nomenclatures.add(row[2])
            assert len(nomenclatures) == 1,"Multiple nomenclatures found for the same sequence_id: "+str(nomenclatures)
            assert seqid_set == set(map.keys()),"Not all requested seqids were found in the database: "+str(seqid_set.difference(set(map.keys())))
        else:
            query = "SELECT sequence_name,sequence_id FROM sequence_id_map WHERE assembly_id = "+str(assembly_id)+" AND nomenclature = '"+nomenclature+"' AND sequence_name IN ("+",".join(["'"+str(s)+"'" for s in seqid_set])+")"
            res = self.execute_query(query)
            for row in res:
                map[row[0]] = row[1]
            assert seqid_set == set(map.keys()),"Not all requested seqids were found in the database: "+str(seqid_set.difference(set(map.keys())))
        
        return map
    
    def get_attribute_information(self) -> dict:
        # retrieve a map of all keys, their alernative names along with all possible values permitted and their maps

        # query attribute_key_map where either og_key or alt_key matches the key. Retrieve unique std_key values. Assert it is unique (shout be guaranteed by the DB)
        query = """SELECT 
                    attribute_key_map.std_key,
                    GROUP_CONCAT(DISTINCT attribute_key_map.og_key) AS og_keys,
                    MAX(attribute_key.variable) AS og_key_map,
                    attribute_value_map.std_value,
                    GROUP_CONCAT(DISTINCT attribute_value_map.og_value) AS og_values
                FROM 
                    attribute_key_map
                LEFT JOIN 
                    attribute_key ON attribute_key_map.std_key = attribute_key.key_name
                LEFT JOIN
                    attribute_value_map ON attribute_key_map.std_key = attribute_value_map.key_name
                GROUP BY 
                    attribute_key_map.std_key, attribute_value_map.std_value;"""

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
