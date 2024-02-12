from sqlalchemy import func, text
from CHESSApp_back import db

import sys

# GETTER FUNCTIONS
def get_all_organisms():
    query = text("SELECT * FROM Organism")
    res = db.session.execute(query)
    json_res = dict()
    for row in res:
        json_res[row.organismID] = {
            "id":row.organismID,
            "scientificName":row.scientificName,
            "commonName":row.commonName,
            "information":row.information
        }
    return json_res

def get_all_assemblies():
    query = text("SELECT * FROM Assembly")
    res = db.session.execute(query)
    json_res = dict()
    for row in res:
        json_res[row.assemblyID] = {
            "id":row.assemblyID,
            "assembly":row.assemblyName,
            "organismID":row.organismID,
            "link":row.link,
            "information":row.information
        }
    return json_res

# get full source information
def get_all_sources(genome=None):
    query = text("SELECT * FROM Sources")
    if genome:
        query  = text(f"SELECT * FROM Sources WHERE assemblyID = {genome}")
    res = db.session.execute(query)

    # parse list into a dictionary
    sources = dict()
    for row in res:
        sources[row.sourceID] = {
            "name":row.name,
            "id":row.sourceID,
            "link":row.link,
            "information":row.information,
            "citation":row.citation,
            "originalFormat":row.originalFormat,
            "lastUpdated":row.lastUpdated,
            "assemblyID":row.assemblyID
        }
    return sources

def get_seqidMap():
    query = text("SELECT * FROM SequenceIDMap")
    res = db.session.execute(query)

    # parse list into a dictionary
    seqids = dict()
    for row in res:
        seqids.setdefault(row.assemblyID,{})
        seqids[row.assemblyID].setdefault(row.sequenceID,dict())
        seqids[row.assemblyID][row.sequenceID][row.nomenclature] = row.sequenceName
    return seqids

def get_attributeSummary():
    query = text("SELECT * FROM AttributeSummary")
    res = db.session.execute(query)

    # parse list into a dictionary
    attributes = dict()
    for row in res:
        attributes.setdefault(row.kvid,{"key":row.key_name,
                                        "value":row.value,
                                        "description":row.description,
                                        "id":row.kvid,
                                        "sources":[]})
        attributes[row.kvid]["sources"].append(row.sourceID)
    
    return attributes

def get_transcriptTypeSummary():
    query = text("SELECT * FROM TranscriptTypeSummary")
    res = db.session.execute(query)

    # parse list into a dictionary
    attributes = dict()
    for row in res:
        attributes.setdefault(row.kvid,{"key":row.key_name,
                                        "value":row.value,
                                        "description":row.description,
                                        "id":row.kvid,
                                        "sources":[]})
        attributes[row.kvid]["sources"].append(row.sourceID)
    
    return attributes

def get_geneTypeSummary():
    query = text("SELECT * FROM GeneTypeSummary")
    res = db.session.execute(query)

    # parse list into a dictionary
    attributes = dict()
    for row in res:
        attributes.setdefault(row.kvid,{"key":row.key_name,
                                        "value":row.value,
                                        "description":row.description,
                                        "id":row.kvid,
                                        "sources":[]})
        attributes[row.kvid]["sources"].append(row.sourceID)
    
    return attributes

def get_datasets():
    query = text("SELECT * FROM Dataset")
    res = db.session.execute(query)

    # parse list into a dictionary
    datasets = dict()
    for row in res:
        datasets[row.name] = {
            "name":row.name,
            "information":row.source
        }
    return datasets

def get_assembly2nomenclature():
    query = text("select distinct assemblyName, nomenclature from SequenceIDMap s JOIN Assembly a on s.assemblyID = a.assemblyID;")
    res = db.session.execute(query)

    # parse list into a dictionary
    assembly2nomenclature = dict()
    for row in res:
        assembly2nomenclature.setdefault(row[0],[])
        assembly2nomenclature[row[0]].append(row[1])
    return assembly2nomenclature

def get_AllCountSummaryTable() -> dict:
    query = text("SELECT * FROM AllCountSummary")
    res = db.session.execute(query)

    summary = dict()
    # parse the summary list into a dictionary
    for row in res:
        summary.setdefault(row[0],dict())
        summary[row[0]].setdefault(row[1],dict())
        assert row[2] not in summary[row[0]][row[1]],"Duplicate source name found in AllCountSummary table: "+row[2]
        summary[row[0]][row[1]][row[2]] = {
            "lastUpdated":row[3],
            "totalTranscripts":row[4],
            "totalGenes":row[5]
            }

    return summary


def get_upsetData():
    query = text("SELECT * FROM UpsetData")
    res = db.session.execute(query)

    # parse list into a dictionary
    upsetData = dict()
    for row in res:
        upsetData.setdefault(row.organism,dict())
        upsetData[row.organism].setdefault(row[1],dict())
        sub_sources = ";".join(tuple(row[3].split(",")))
        assert sub_sources not in upsetData[row.organism][row[1]],"Duplicate source name found in upsetData table: "+sub_sources
        upsetData[row.organism][row[1]][sub_sources] = int(row[4])

    return upsetData

def get_dbTxSlice(genome,attributes):
    # parameters:
    # 1. assemblyID
    # 2. attributes: for each sourceID to include:
    #   - sourceID
    #       - key (standard name)
    #       - value (kvid)
    # returns a slice of the dbTxSummary table with matching data
    # summarized by the number of transcripts in each category

    # construct query
    query = "SELECT "
    # add all columns
    for sourceID, attrs in attributes.items():
        query += "dbtx.`"+str(sourceID)+"`, "
        for k,v in attrs.items():
            query += "dbtx.`"+str(sourceID)+"."+k+"`, "
    # add count
    query += " COUNT(*) as count"

    query += " FROM dbTxSummary_"+str(genome)+" dbtx WHERE "

    for sourceID, attrs in attributes.items():
        query += "( dbtx.`"+str(sourceID)+"` = 1"
        for key,values in attrs.items():
            # values are a list. test for containment
            query += " AND dbtx.`"+str(sourceID)+"."+key+"` IN ("
            for v in values:
                query += str(v)+","
            query = query[:-1] # remove last comma
            query += ")"
        query += ") OR "
    query = query[:-4] # remove last AND
    
    # attach groupby
    query += " GROUP BY "
    for sourceID, attrs in attributes.items():
        query += "dbtx.`"+str(sourceID)+"`, "
        for k,v in attrs.items():
            query += "dbtx.`"+str(sourceID)+"."+k+"`, "
    query = query[:-2] # remove last comma

    query += ";"

    # execute query
    res = db.session.execute(text(query))

    summary = {}
    # parse the results into a dictionary
    for row in res:
        row_source_intersection = []
        gene_type_intersection = []
        tx_type_intersection = []
        # organize summary as: intersection: individual values for each source
        # when subsetting based on upset selection - just don't include the entries with the specific intersection
        tmp_summary = dict()
        for sourceID, attrs in attributes.items():
            if row.__getattr__(str(sourceID)) == 1:
                row_source_intersection.append(str(sourceID))

                has_gene_type = False
                if "gene_type" in attrs:
                    gene_type_intersection.append(str(row.__getattr__(str(sourceID)+".gene_type")))
                    has_gene_type = True

                has_transcript_type = False
                if "transcript_type" in attrs:
                    tx_type_intersection.append(str(row.__getattr__(str(sourceID)+".transcript_type")))
                    has_transcript_type = True
                    
                if has_gene_type and has_transcript_type:
                    tmp_summary.setdefault(sourceID,dict())
                    tmp_summary[sourceID].setdefault(gene_type_intersection[-1],dict())
                    tmp_summary[sourceID][gene_type_intersection[-1]].setdefault(tx_type_intersection[-1],0)
                    tmp_summary[sourceID][gene_type_intersection[-1]][tx_type_intersection[-1]] += row.count
                else:
                    pass

        row_source_intersection = ",".join(sorted(row_source_intersection))
        summary.setdefault(row_source_intersection,dict())
        for sourceID, values in tmp_summary.items():
            summary[row_source_intersection].setdefault(sourceID,dict())
            for gene_type, tx_types in values.items():
                summary[row_source_intersection][sourceID].setdefault(gene_type,dict())
                for tx_type, count in tx_types.items():
                    summary[row_source_intersection][sourceID][gene_type].setdefault(tx_type,0)
                    summary[row_source_intersection][sourceID][gene_type][tx_type] += count

    return summary


def get_dbLocusSlice(genome,attributes):
    # parameters:
    # 1. assemblyID
    # 2. attributes: for each sourceID to include:
    #   - sourceID
    #       - key (standard name)
    #       - value (kvid)
    # returns a slice of the dbTxSummary table with matching data
    # summarized by the number of transcripts in each category

    # construct query
    query = "SELECT *  FROM dbLocusSummary_"+str(genome)+" dbl;"

    # execute query
    res = db.session.execute(text(query))

    loci = []
    # parse the results into a dictionary
    for row in res:
        loci.append(list(row))

    return loci

def findLoci(genome:int,term:str):
    # parameters:
    # 1. assemblyID
    # 2. term: search term
    # returns a list of loci that match the search term
    # construct query

    sources = get_all_sources(genome)
    sourceIDs = [x["id"] for x in sources.values()]
    
    # get all sources for the genome
    query = f"""SELECT 
                    dbl.lid AS locusID,
                    dbl.sequenceID AS seqid,
                    dbl.strand AS strand,
                    dbl.start AS start,
                    dbl.end AS end,
                    {','.join([f'dbl.`{x}.gene_id`' for x in sourceIDs])},
                    {','.join([f'dbl.`{x}.gene_name`' for x in sourceIDs])}
                FROM dbLocusSummary_{genome} dbl
                    WHERE 
                        MATCH (
                            {','.join([f'dbl.`{x}.gene_id`' for x in sourceIDs])},
                            {','.join([f'dbl.`{x}.gene_name`' for x in sourceIDs])} 
                        ) 
                        AGAINST ('{term}' IN NATURAL LANGUAGE MODE);"""
    
    # execute query
    res = db.session.execute(text(query))

    loci = []
    columns = ["locusID","seqid","strand","start","end"]+[sources[x]["name"]+" Gene ID" for x in sourceIDs]+[sources[x]["name"]+" Gene Name" for x in sourceIDs]
    # parse the results into a dictionary
    for row in res:
        loci.append([row.locusID,row.seqid,row.strand,row.start,row.end]+[row.__getattr__(f"{x}.gene_id") for x in sourceIDs]+[row.__getattr__(f"{x}.gene_name") for x in sourceIDs])

    return {"columns":columns,"loci":loci}

def getLocus(lid:int):
    # parameters:
    # 1. locusID
    # returns a dictionary with the locus details

    # construct query
    query = f"""SELECT 
                    l.lid AS lid, 
                    l.sequenceID AS seqid,
                    CAST(l.strand AS SIGNED) AS strand,
                    l.start AS locus_start,
                    l.end AS locus_end,
                    g.sourceID AS sourceID,
                    g.gid AS gid, 
                    g.gene_id AS gene_id,
                    g.name AS gene_name,
                    tx.tid AS tid, 
                    tx.transcript_id AS transcript_id,
                    tx.start AS transcript_start,
                    tx.end AS transcript_end,
                    tx.cds_start AS cds_start,
                    tx.cds_end AS cds_end,
                    i.start AS intron_start,
                    i.end AS intron_end
                FROM Locus l
                    JOIN Gene g ON l.lid = g.lid
                    JOIN TxDBXREF tx ON g.gid = tx.gid
                    JOIN Transcript t ON tx.tid = t.tid
                    LEFT JOIN TranscriptToIntron ti ON t.tid = ti.tid
                    LEFT JOIN Intron i ON ti.iid = i.iid
                WHERE l.lid = {lid};"""
    
    # execute query
    res = db.session.execute(text(query))

    locus = {"position":{},"data":{"transcripts":{},"genes":{}}}
    # parse the results into a dictionary
    for row_i,row in enumerate(res):
        if row_i == 0:
            locus["position"] = {"seqid":row.seqid,
                                 "strand":row.strand,
                                 "start":row.locus_start,
                                 "end":row.locus_end}
        # results are structured as follows:
        #   transcripts: {
        #    tid: {
        #      intron_chain,
        #      transcript_start,
        #      transcript_end,
        #      sources: {
        #       sourceID: {
        #        gid: {
        #         transcript_id,
        #         transcript_start,
        #         transcript_end,
        #         cds_start,
        #         cds_end,
        #       }
        #      }
        #     }
        #    }
        #   }
        #   genes: {
        #    gid: {
        #     gene_id,
        #     gene_name,
        #     sourceID
        #    }
        #   }
        locus["data"]["transcripts"].setdefault(row.tid,{"intron_chain":[],
                                                         "transcript_start":sys.maxsize,
                                                         "transcript_end":0,
                                                         "sources":{}})
        locus["data"]["transcripts"][row.tid]["sources"].setdefault(row.sourceID,dict())
        locus["data"]["transcripts"][row.tid]["sources"][row.sourceID].setdefault(row.gid,{"transcript_id":row.transcript_id,
                                                                                            "transcript_start":row.transcript_start,
                                                                                            "transcript_end":row.transcript_end,
                                                                                            "cds_start":row.cds_start,
                                                                                            "cds_end":row.cds_end})
        # update introns
        if row.intron_start is not None and row.intron_end is not None:
            locus["data"]["transcripts"][row.tid]["intron_chain"].append([row.intron_start,row.intron_end])
        else:
            locus["data"]["transcripts"][row.tid]["intron_chain"] = []
        
        # update transcript start and end
        locus["data"]["transcripts"][row.tid]["transcript_start"] = min(locus["data"]["transcripts"][row.tid]["transcript_start"],row.transcript_start)
        locus["data"]["transcripts"][row.tid]["transcript_end"] = max(locus["data"]["transcripts"][row.tid]["transcript_end"],row.transcript_end)
        
        # add source and gene-specific versions of the transcripts
        locus["data"]["transcripts"][row.tid]["sources"][row.sourceID][row.gid] = {"transcript_id":row.transcript_id,
                                                                                   "transcript_start":row.transcript_start,
                                                                                   "transcript_end":row.transcript_end,
                                                                                   "cds_start":row.cds_start,
                                                                                   "cds_end":row.cds_end}

        # add gene information
        locus["data"]["genes"].setdefault(row.gid,{"gene_id":row.gene_id,"gene_name":row.gene_name,"sourceID":row.sourceID})

    return locus



