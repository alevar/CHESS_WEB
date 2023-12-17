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
    query = text("SELECT * FROM Sources")
    res = db.session.execute(query)

    # parse list into a dictionary
    sources = dict()
    for row in res:
        sources[row.name] = {
            "name":row.name,
            "link":row.link,
            "information":row.information,
            "originalFormat":row.originalFormat,
            "lastUpdated":row.lastUpdated
        }
    return sources

def get_attributeSummary(fixed_only):
    query = text("""SELECT 
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
                    AttributeKeyMap.std_key, AttributeValueMap.std_value;""")

def get_datasets():
    query = text("SELECT * FROM Datasets")
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
        summary["species"].setdefault(row[0],{"assembly":dict()})
        summary["species"][row[0]]["assembly"].setdefault(row[1],{"source":dict()})
        assert row[2] not in summary["species"][row[0]]["assembly"][row[1]]["source"],"Duplicate source name found in AllCountSummary table: "+row[2]
        summary["species"][row[0]]["assembly"][row[1]]["source"][row[2]] = {
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
        upsetData["species"].setdefault(row.organism,{"assembly":dict()})
        upsetData["species"][row.organism]["assembly"].setdefault(row[1],{"sources":dict()})
        sub_sources = tuple(row[3].split(","))
        assert sub_sources not in upsetData["species"][row.organism]["assembly"][row[1]]["sources"],"Duplicate source name found in upsetData table: "+sub_sources
        upsetData["species"][row.organism]["assembly"][row[1]]["sources"][sub_sources] = int(row[4])

    return upsetData


# contents of the json with DB state
# all counts table (contains mappings between all organisms, assemblies, sources)
# key attributes: gene_type, transcript_type, 
# sequence IDs



# TODOs:
# DB: add info about the type of sequenceID (alt, random, primary, etc)
# DB: add table of files and a link to the source. One to many relationship (single source - multiple files). Persistent files should be added and fetched for download