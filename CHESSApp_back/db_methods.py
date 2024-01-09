from sqlalchemy import func, text
from CHESSApp_back import db

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
def get_all_sources():
    query = text("SELECT * FROM Sources")
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
    # settings should have:
    # 1. assemblyID
    # 2. data: for each sourceID to include:
    #   - key (standard name)
    #   - value (kvid)
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

    upsetSummary = {} # list of sourceIDs in the intersection : dict( list of attributes in the intersection : count )
    sourceSummary = {} # sourceID : { gene_type : { transcript_type : count } }}
    # parse the results into a dictionary
    for row in res:
        row_source_intersection = []
        gene_type_intersection = []
        tx_type_intersection = []
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
                    sourceSummary.setdefault(sourceID,dict())
                    sourceSummary[sourceID].setdefault(gene_type_intersection[-1],dict())
                    sourceSummary[sourceID][gene_type_intersection[-1]][tx_type_intersection[-1]] = row.count
                elif has_gene_type:
                    sourceSummary.setdefault(sourceID,dict())
                    sourceSummary[sourceID].setdefault(gene_type_intersection[-1],dict())
                    sourceSummary[sourceID][gene_type_intersection[-1]][""] = row.count
                elif has_transcript_type:
                    sourceSummary.setdefault(sourceID,dict())
                    sourceSummary[sourceID].setdefault("",dict())
                    sourceSummary[sourceID][""][tx_type_intersection[-1]] = row.count
                else:
                    pass

        row_source_intersection = ",".join(row_source_intersection)
        upsetSummary.setdefault(row_source_intersection,dict())
        if len(gene_type_intersection) > 0:
            gene_type_intersection = ",".join(gene_type_intersection)
            upsetSummary[row_source_intersection].setdefault("gene_type",dict())
            upsetSummary[row_source_intersection]["gene_type"][gene_type_intersection] = row.count
        if len(tx_type_intersection) > 0:
            tx_type_intersection = ",".join(tx_type_intersection)
            upsetSummary[row_source_intersection].setdefault("transcript_type",dict())
            upsetSummary[row_source_intersection]["transcript_type"][tx_type_intersection] = row.count

    return upsetSummary, sourceSummary