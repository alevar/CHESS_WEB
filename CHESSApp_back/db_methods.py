from sqlalchemy import func, text
from CHESSApp_back import db

# GETTER FUNCTIONS
def get_all_organisms():
    query = text("SELECT * FROM Organisms")
    res = db.session.execute(query)
    json_res = dict()
    for row in res:
        json_res[row.scientificName] = {
            "scientificName":row.scientificName,
            "commonName":row.commonName,
            "information":row.information
        }
    return json_res

def get_all_assemblies():
    query = text("SELECT * FROM Assemblies")
    res = db.session.execute(query)
    json_res = dict()
    for row in res:
        json_res[row.assemblyName] = {
            "assembly":row.assemblyName,
            "organism":row.organismName,
            "link":row.link,
            "information":row.information
        }
    return json_res

# get full source information
def get_all_sources():
    query = text("SELECT a.assemblyName, s.name, s.link, s.information, s.originalFormat, s.lastUpdated, s.citation FROM Sources s JOIN Assembly a on s.assemblyID = a.assemblyID")
    res = db.session.execute(query)

    # parse list into a dictionary
    sources = dict()
    for row in res:
        sources.setdefault(row.assemblyName,dict())
        sources[row.assemblyName][row.name] = {
            "name":row.name,
            "link":row.link,
            "information":row.information,
            "citation":row.citation,
            "originalFormat":row.originalFormat,
            "lastUpdated":row.lastUpdated,
            "assembly":row.assemblyName
        }
    return sources

def get_attributeSummary():
    query = text("SELECT * FROM AttributeSummary")
    res = db.session.execute(query)

    # parse list into a dictionary
    attributes = dict()
    for row in res:
        attributes.setdefault(row[0],{"description":"",
                                       "values":dict()})
        attributes[row[0]]["description"] = row[1]
        attributes[row[0]]["values"].setdefault(row[2],dict()) # value
        attributes[row[0]]["values"][row[2]].setdefault(row[3],dict()) # assembly
        attributes[row[0]]["values"][row[2]][row[3]][row[4]] = row[5] # source to count
    
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

def get_dbTxSlice(settings):
    # settings should have:
    # 1. assemblyID
    # 2. for each sourceID to include:
    #   - key (standard name)
    #   - value (kvid)
    # returns a slice of the dbTxSummary table with matching data
    # summarized by the number of transcripts in each category

    # construct query
    query = "SELECT "
    # add all columns
    for sourceID, attributes in settings["data"].items():
        query += "dbtx.`"+str(sourceID)+"`, "
        for k,v in attributes.items():
            query += "dbtx.`"+str(sourceID)+"."+k+"`, "
    # add count
    query += " COUNT(*)"

    query += " FROM dbTxSummary_"+str(settings["assemblyID"])+" dbtx WHERE "

    for sourceID, attributes in settings["data"].items():
        query += "dbtx.`"+str(sourceID)+"` = 1"
        for key,values in attributes.items():
            # values are a list. test for containment
            query += " AND dbtx.`"+str(sourceID)+"."+key+"` IN ("
            for v in values:
                query += str(v)+","
            query = query[:-1] # remove last comma
            query += ")"
        query += " AND "
    query = query[:-5] # remove last AND
    
    # attach groupby
    query += " GROUP BY "
    for sourceID, attributes in settings["data"].items():
        query += "dbtx.`"+str(sourceID)+"`, "
        for k,v in attributes.items():
            query += "dbtx.`"+str(sourceID)+"."+k+"`, "
    query = query[:-2] # remove last comma

    query += ";"
    print(query)

    # execute query
    res = db.session.execute(text(query))
    return res



# contents of the json with DB state
# all counts table (contains mappings between all organisms, assemblies, sources)
# key attributes: gene_type, transcript_type, 
# sequence IDs



# TODOs:
# DB: add info about the type of sequenceID (alt, random, primary, etc)
# DB: add table of files and a link to the source. One to many relationship (single source - multiple files). Persistent files should be added and fetched for download