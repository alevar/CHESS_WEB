# Declares all routes for the CHESS Web App
# Please put all routes in this file
# A route is a URL that the user can visit
# Please provide documentation for each route

from flask import Blueprint
from sqlalchemy import text, func
from CHESSApp_back import db
from flask import jsonify, request

main_blueprint = Blueprint('main', __name__)

# Route: /getSources
# Route implemented for testing purposes only
# Returns a JSON object with all sources in the database
@main_blueprint.route('/getSources')
def get_sources():
    query = text("SELECT name, information, link, lastUpdated FROM Sources")
    results = db.session.execute(query)
    json_res = [{"name":x.name,
                     "description":x.information,
                     "link":x.link,
                     "lastUpdated":x.lastUpdated} for x in results]
    return jsonify(json_res)

# Route: /seqids
# Route implemented for testing purposes only
# Returns: JSON object with all seqids in the database
@main_blueprint.route('/seqids')
def get_seqids():
    query = text("SELECT DISTINCT seqid FROM features")
    results = db.session.execute(query)
    return jsonify([x.seqid for x in results])

# Route: /globalData
# Fetches data about the database required for building the user interface and all interactions
# Data object:
#   seqid: list of all seqids in the database.
#        - transcript: transcript counts
#        - gene: gene counts
#   tissue: list of all tissue names in the database
#        - transcript: transcript counts
#        - gene: gene counts
#   source: list of all tissue names in the database
#        - transcript: transcript counts
#        - gene: gene counts
@main_blueprint.route('/globalData')
def globalData():
    data = dict()

    query = text("SELECT DISTINCT(seqids), COUNT(*) FROM features WHERE featuretype = 'transcript' GROUP BY seqids")
    results = db.session.execute(query)
    data["seqid"] = {x.seqid: {"transcript": x.count} for x in results}

    query = text("SELECT DISTINCT(source), COUNT(*) FROM features WHERE featuretype = 'transcript' GROUP BY source")
    results = db.session.execute(query)
    data["source"] = {x.source: {"transcript": x.count} for x in results}

    query = text("SELECT DISTINCT(tissue), COUNT(*) FROM features WHERE featuretype = 'transcript' GROUP BY tissue")
    results = db.session.execute(query)
    data["tissue"] = {x.tissue: {"transcript": x.count} for x in results}

    for res in results:
        if res.seqid not in data:
            data[res.seqid] = []
        data[res.seqid].append(res.source)
    return jsonify([x.seqid for x in results])

# Route: /fetchData
# Fetches all data based on user defined settings
# Stores data in an object and passes back to the front-end for display
# All main data is fetched through this function unless otherwise specified (charts, tables, summaries, etc.)
@main_blueprint.route('/fetchData', methods=['POST'])
def fetch_data():
    settings = request.get_json()

    data = {}

    query = text("SELECT source,COUNT(id) FROM features WHERE featuretype = 'transcript' AND seqid = :seqid GROUP BY source")
    result = db.session.execute(query,{"seqid":settings['seqid']})

    for source,count in result:
        assert source not in data, "Duplicate source found: "+source
        data[source] = count

    return jsonify(data)

# Route: /getAttrCountsBySeqid
# Route implemeted for testing purposes only
# Accepts a JSON object with seqid values as keys and featuretype values as values
# Returns: JSON object with seqid values as keys and a list of featuretype and count as values
# Illustrates how to parse data from the user and query the database
@main_blueprint.route('/getAttrCountsBySeqid', methods=['POST'])
def get_attribute_counts():
    settings = request.get_json()

    data = {}
    for key, value in settings.items():
        query = text("SELECT COUNT(*) FROM features WHERE seqid = :seqid AND featuretype = :featuretype")
        result = db.session.execute(query, {'seqid': key, 'featuretype': value}).scalar()
        data[key] = [value,result]

    return jsonify(data)

# Route: /generateFile
# Route is used to trigger creation of GTF/GFF file based on use-provided settings
@main_blueprint.route('/generateFile')
def generate_file():
    return jsonify({'status': 'success'})



# Route: /getChartData
# Route implemented for testing purposes only
# Fetches some data to be displayed as a chart onthe main interface
# Returns: JSON object with seqid values as keys and a list of featuretype and count as values
@main_blueprint.route('/getChartData')
def get_chart_data():
    query = text("SELECT seqid, featuretype, COUNT(*) FROM features GROUP BY seqid, featuretype")
    results = db.session.execute(query)
    return jsonify([{'seqid': x.seqid, 'featuretype': x.featuretype, 'count': x.count} for x in results])
