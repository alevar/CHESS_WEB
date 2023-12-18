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

def get_attributeSummary(fixed_only):
    query = ""
    if fixed_only:
        query = text("""SELECT kv.key_name, kv.value, k.description 
                        FROM AttributeKeyValue kv 
                        JOIN AttributeKey k ON kv.key_name = k.key_name 
                        WHERE variable = 0
                    """)
    else:
        query = text("""SELECT kv.key_name, kv.value, k.description 
                        FROM AttributeKeyValue kv 
                        JOIN AttributeKey k ON kv.key_name = k.key_name
                    """)
    res = db.session.execute(query)

    # parse list into a dictionary
    attributes = dict()
    for row in res:
        attributes.setdefault(row[0],{"description":"",
                                       "values":list()})
        attributes[row[0]]["description"] = row[2]
        attributes[row[0]]["values"].append(row[1])
    
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
        summary.setdefault(row[0],{"assembly":dict()})
        summary[row[0]]["assembly"].setdefault(row[1],{"source":dict()})
        assert row[2] not in summary[row[0]]["assembly"][row[1]]["source"],"Duplicate source name found in AllCountSummary table: "+row[2]
        summary[row[0]]["assembly"][row[1]]["source"][row[2]] = {
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
        upsetData.setdefault(row.organism,{"assembly":dict()})
        upsetData[row.organism]["assembly"].setdefault(row[1],{"sources":dict()})
        sub_sources = ";".join(tuple(row[3].split(",")))
        assert sub_sources not in upsetData[row.organism]["assembly"][row[1]]["sources"],"Duplicate source name found in upsetData table: "+sub_sources
        upsetData[row.organism]["assembly"][row[1]]["sources"][sub_sources] = int(row[4])

    return upsetData


# contents of the json with DB state
# all counts table (contains mappings between all organisms, assemblies, sources)
# key attributes: gene_type, transcript_type, 
# sequence IDs



# TODOs:
# DB: add info about the type of sequenceID (alt, random, primary, etc)
# DB: add table of files and a link to the source. One to many relationship (single source - multiple files). Persistent files should be added and fetched for download