from flask import Blueprint
from sqlalchemy import text, func
from CHESSApp_back import db
from flask import jsonify, request

main_blueprint = Blueprint('main', __name__)

@main_blueprint.route('/seqids')
def get_seqids():
    query = text("SELECT DISTINCT seqid FROM features")
    results = db.session.execute(query)
    return jsonify([x.seqid for x in results])

@main_blueprint.route('/getAttrCountsBySeqid', methods=['POST'])
def get_attr_counts_by_seqid():
    seqid_values = request.get_json()

    counts = {}
    for key, value in seqid_values.items():
        query = text("SELECT COUNT(*) FROM features WHERE seqid = :seqid AND featuretype = :featuretype")
        result = db.session.execute(query, {'seqid': key, 'featuretype': value}).scalar()
        counts[key] = [value,result]

    return jsonify(counts)