from sqlalchemy import func, text
from CHESSApp_back import db

# GETTER FUNCTIONS
def get_all_organsims():
    query = text("SELECT * FROM Organisms")
    res = db.session.execute(query)
    json_res = dict()
    for row in res:
        print(row)
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
        json_res[(row.organismName,row.assemblyName)] = {
            "assemblyName":row.assemblyName,
            "organismName":row.organismName,
            "link":row.link,
            "information":row.information
        }
    return json_res

# get full source information
def get_sources():
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

def get_AllCountSummaryTable() -> dict:
    query = text("SELECT * FROM AllCountSummary")
    res = db.session.execute(query)

    print(res)

    # parse the summary list into a dictionary
    summary = {"species":dict()}
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
    query = "SELECT * FROM UpsetData"
    res = db.session.execute(query)

    # parse list into a dictionary
    upsetData = dict()
    for row in res:
        upsetData["species"].setdefault(row[0],{"assembly":dict()})
        upsetData["species"][row[0]]["assembly"].setdefault(row[1],{"sources":dict()})
        sub_sources = tuple(row[3].split(","))
        assert sub_sources not in upsetData["species"][row[0]]["assembly"][row[1]]["sources"],"Duplicate source name found in upsetData table: "+sub_sources
        upsetData["species"][row[0]]["assembly"][row[1]]["sources"][sub_sources] = int(row[4])

    return upsetData