# Public-facing API routes for the CHESS Web App

import os
import smtplib
from email.mime.text import MIMEText
from timeit import main
from flask import Blueprint, jsonify, request, send_from_directory, Response
from sqlalchemy import text
from db.methods import *
from db.db import db

public_bp = Blueprint('public', __name__)

@public_bp.route('/globalData', methods=['GET'])
def global_data():
    """
    Fetches comprehensive data about the database for UI building
    Returns: JSON object with organisms, assemblies (including nomenclatures), sources
    """
    sources = get_all_source_versions()
    organisms = get_all_organisms()
    assemblies = get_all_assemblies()
    nomenclatures = get_nomenclatures()
    genome_files = get_genome_files()
    configurations = get_all_configurations()
    datasets = get_all_datasets()

    if not organisms["success"] or not assemblies["success"] or not sources["success"] or not nomenclatures["success"] or not genome_files["success"] or not datasets["success"]:
        return jsonify({"error": "Failed to fetch organisms, assemblies, sources, nomenclatures, genome files, or datasets"}), 500
    
    sources = organize_all_source_versions(sources["data"])
    nomenclatures = organize_nomenclatures(nomenclatures["data"])

    # Add nomenclature data to assemblies
    for assembly_id in assemblies["data"]:
        assemblies["data"][assembly_id]["nomenclatures"] = nomenclatures[assembly_id]["nomenclatures"] if assembly_id in nomenclatures else []
        assemblies["data"][assembly_id]["sequence_name_mappings"] = nomenclatures[assembly_id]["sequence_name_mappings"] if assembly_id in nomenclatures else {}
        assemblies["data"][assembly_id]["sequence_id_mappings"] = nomenclatures[assembly_id]["sequence_id_mappings"] if assembly_id in nomenclatures else {}

    for assembly_id in assemblies["data"]:
        assemblies["data"][assembly_id]["genome_files"] = []

    # add genome files to assemblies
    for genome_file_id, genome_file_data in genome_files["data"].items():
        assembly_id = genome_file_data["assembly_id"]
        nomenclature = genome_file_data["nomenclature"]
        file_path = genome_file_data["file_path"]
        if assembly_id in assemblies["data"]:
            assemblies["data"][assembly_id]["genome_files"].append({
                "genome_file_id": genome_file_data["genome_file_id"],
                "nomenclature": nomenclature,
                "file_path": file_path
            })

    data = {
        "organisms": organisms["data"],
        "assemblies": assemblies["data"],
        "sources": sources,
        "configurations": configurations,
        "datasets": datasets["data"] if isinstance(datasets, dict) and "data" in datasets else datasets
    }

    return jsonify(data)

@public_bp.route('/organisms', methods=['GET'])
def get_organisms():
    """
    Returns all organisms from the database.
    """
    try:
        result = get_all_organisms()
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 500
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to fetch organisms: {str(e)}"}), 500

@public_bp.route('/assemblies', methods=['GET'])
def get_assemblies():
    """
    Returns all assemblies from the database.
    """
    try:
        result = get_all_assemblies()
        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 500
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to fetch assemblies: {str(e)}"}), 500

@public_bp.route('/assemblies/<int:assembly_id>/nomenclatures', methods=['GET'])
def get_assembly_nomenclatures(assembly_id):
    """
    Gets all nomenclatures for a specific assembly.
    """
    try:
        if not assembly_exists(assembly_id):
            return jsonify({"success": False, "message": "Assembly not found"}), 404
        
        # Get nomenclatures for this assembly
        nomenclatures = db.session.execute(text("""
            SELECT DISTINCT nomenclature
            FROM sequence_id_map
            WHERE assembly_id = :assembly_id
            ORDER BY nomenclature
        """), {"assembly_id": assembly_id}).fetchall()
        
        nomenclature_list = [n.nomenclature for n in nomenclatures]
        return jsonify({"success": True, "data": nomenclature_list})
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to get nomenclatures: {str(e)}"}), 500

# ============================================================================
# CONFIGURATIONS ROUTES
# ============================================================================

@public_bp.route('/configurations', methods=['GET'])
def get_configurations():
    """
    Get all configurations
    """
    try:
        configurations = get_all_configurations()
        return jsonify({
            "success": True,
            "configurations": configurations
        })
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to get configurations: {str(e)}"}), 500

@public_bp.route('/fasta/<int:assembly_id>/<string:nomenclature>', methods=['GET'])
def get_fasta(assembly_id, nomenclature):
    """
    Get the fasta file for a specific organism, assembly, source, version, and nomenclature
    """
    try:
        fasta_file = get_fasta_file(assembly_id, nomenclature)
        return send_from_directory(fasta_file["file_path"], fasta_file["file_name"])
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to get fasta file: {str(e)}"}), 500

@public_bp.route('/fai/<int:assembly_id>/<string:nomenclature>', methods=['GET'])
def get_fai(assembly_id, nomenclature):
    """
    Get the fai file for a specific organism, assembly, source, version, and nomenclature
    """
    try:
        fai_file = get_fai_file(assembly_id, nomenclature)
        return send_from_directory(fai_file["file_path"], fai_file["file_name"])
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to get fai file: {str(e)}"}), 500

@public_bp.route('/gff3bgz/<int:sva_id>/<string:nomenclature>', methods=['GET'])
def get_gff3bgz(sva_id, nomenclature):
    """
    Get the gff3bgz file for a specific organism, assembly, source, version, and nomenclature
    """
    try:
        gff3bgz_file = get_gff3bgz_file(sva_id, nomenclature)
        full_path = os.path.join(gff3bgz_file["file_path"], gff3bgz_file["file_name"])
        
        # Try alternative approach: manually read file and create response
        try:
            with open(full_path, 'rb') as f:
                file_data = f.read()
            
            response = Response(
                file_data,
                mimetype='application/octet-stream',
                headers={
                    'Content-Disposition': f'inline; filename="{gff3bgz_file["file_name"]}"',
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'public, max-age=3600'
                }
            )
            return response
            
        except Exception as file_read_error:
            # Fallback to send_from_directory
            response = send_from_directory(gff3bgz_file["file_path"], gff3bgz_file["file_name"])
            response.headers['Content-Type'] = 'application/gzip'
            response.headers['Accept-Ranges'] = 'bytes'
            
            # Ensure no encoding is applied
            if 'Content-Encoding' in response.headers:
                del response.headers['Content-Encoding']
            return response
    except Exception as e:
        print(f"ERROR: Failed to get gff3bgz file: {str(e)}")
        return jsonify({"success": False, "message": f"Failed to get gff3bgz file: {str(e)}"}), 500

@public_bp.route('/gff3bgztbi/<int:sva_id>/<string:nomenclature>', methods=['GET'])
def get_gff3bgztbi(sva_id, nomenclature):
    """
    Get the gff3bgztbi file for a specific organism, assembly, source, version, and nomenclature
    """
    try:
        gff3bgztbi_file = get_gff3bgztbi_file(sva_id, nomenclature)
        full_path = os.path.join(gff3bgztbi_file["file_path"], gff3bgztbi_file["file_name"])
        
        response = send_from_directory(gff3bgztbi_file["file_path"], gff3bgztbi_file["file_name"])
        response.headers['Content-Type'] = 'application/octet-stream'
        return response
    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to get gff3bgztbi file: {str(e)}"}), 500
