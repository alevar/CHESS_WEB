# Public-facing API routes for the CHESS Web App

import os
import smtplib
from email.mime.text import MIMEText
from timeit import main
from flask import Blueprint, jsonify, request, send_from_directory
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

    if not organisms["success"] or not assemblies["success"] or not sources["success"] or not nomenclatures["success"] or not genome_files["success"]:
        return jsonify({"error": "Failed to fetch organisms, assemblies, or sources, nomenclatures, or genome files`"}), 500
    
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
        "configurations": configurations
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
