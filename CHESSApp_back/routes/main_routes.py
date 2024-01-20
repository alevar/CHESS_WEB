# Declares all routes for the CHESS Web App
# Please put all routes in this file
# A route is a URL that the user can visit
# Please provide documentation for each route

import os
import smtplib
from email.mime.text import MIMEText
from flask import Blueprint
from sqlalchemy import text, func
from CHESSApp_back import db, db_methods
from flask import jsonify, request

main_blueprint = Blueprint('main', __name__)

# Route: /send-email
# Handles sending emails from the contact form
# expects a JSON object with email and message keys
# Returns: JSON object with success key
@main_blueprint.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data['email']
    message = data['message']

    try:
        # Set up SMTP server
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
        smtp_username = os.environ.get('EMAIL_FROM_ADDRESS')
        smtp_password = os.environ.get('EMAIL_FROM_PASSWORD')
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)

        # Create message
        msg = MIMEText(message)
        msg['Subject'] = 'Message from {}'.format(email)
        msg['From'] = smtp_username
        msg['To'] = os.environ.get('EMAIL_TO_ADDRESS')

        # Send message
        server.sendmail(smtp_username, [os.environ.get('EMAIL_TO_ADDRESS')], msg.as_string())
        server.quit()

        return jsonify({'success': True})
    except Exception as e:
        print(e)
        return jsonify({'success': False})

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
@main_blueprint.route('/assemblies')
def get_seqids():
    query = text("SELECT DISTINCT assemblyName FROM Assembly")
    results = db.session.execute(query)
    return jsonify([x.assemblyName for x in results])

# Route: /globalData
# Fetches data about the database required for building the user interface and all interactions
# Data object:
#   organisms
#   seqid: list of all seqids in the database.
#        - transcript: transcript counts
#        - gene: gene counts
#   tissue: list of all tissue names in the database
#        - transcript: transcript counts
#        - gene: gene counts
#   source: list of all tissue names in the database
#        - transcript: transcript counts
#        - gene: gene counts
@main_blueprint.route('/globalData', methods=['GET'])
def globalData():
    sources = db_methods.get_all_sources()
    organisms = db_methods.get_all_organisms()
    assemblies = db_methods.get_all_assemblies()
    attributes = db_methods.get_attributeSummary()
    gene_types = db_methods.get_geneTypeSummary()
    transcript_types = db_methods.get_transcriptTypeSummary()
    nomenclatures = db_methods.get_assembly2nomenclature()

    data = {
        "organisms":organisms,
        "assemblies":assemblies,
        "sources":sources,
        "attributes":attributes,
        "gene_types":gene_types,
        "transcript_types":transcript_types,
        "nomenclature":nomenclatures
    }

    return jsonify(data)

@main_blueprint.route('/txSummarySlice',methods=['POST'])
def txSummarySlice():
    settings = request.get_json()

    # cleanup settings to prepare for the DB query
    clean_settings = dict()
    for sourceID in settings["sources_include"]:
        for key,values in settings["attributes"][str(sourceID)].items():
            clean_settings.setdefault(int(sourceID),dict())
            clean_settings[sourceID][key] = values
            

    res = {"summary":[]}
    if len(clean_settings) > 0:
        # get a slice of the txSummary table and return
        summary = db_methods.get_dbTxSlice(settings["genome"],clean_settings)
        res["summary"] = summary
        return jsonify(res)
    else:
        return jsonify(res)

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
