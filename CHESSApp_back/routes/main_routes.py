# Declares all routes for the CHESS Web App
# Please put all routes in this file
# A route is a URL that the user can visit
# Please provide documentation for each route

from flask import Blueprint
from sqlalchemy import text, func
from CHESSApp_back import db
from flask import jsonify, request

main_blueprint = Blueprint('main', __name__)

# Route: /seqids
# Route implemented for testing purposes only
# Returns: JSON object with all seqids in the database
@main_blueprint.route('/seqids')
def get_seqids():
    query = text("SELECT DISTINCT seqid FROM features")
    results = db.session.execute(query)
    return jsonify([x.seqid for x in results])

# Route: /getAttrCountsBySeqid
# Route implemeted for testing purposes only
# Accepts a JSON object with seqid values as keys and featuretype values as values
# Returns: JSON object with seqid values as keys and a list of featuretype and count as values
@main_blueprint.route('/getAttrCountsBySeqid', methods=['POST'])
def get_attr_counts_by_seqid():
    seqid_values = request.get_json()

    counts = {}
    for key, value in seqid_values.items():
        query = text("SELECT COUNT(*) FROM features WHERE seqid = :seqid AND featuretype = :featuretype")
        result = db.session.execute(query, {'seqid': key, 'featuretype': value}).scalar()
        counts[key] = [value,result]

    return jsonify(counts)