from sqlalchemy import text
from db.db import db
from db.methods.utils import *

def source_exists_by_name(source_name):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM source WHERE name = :name
        """), {"name": source_name}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False

def source_exists_by_id(source_id):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM source WHERE source_id = :id
        """), {"id": source_id}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False

def get_source_by_name(source_name):
    try:
        result = db.session.execute(text("""
            SELECT source_id, name, information, link, citation FROM source WHERE name = :name
        """), {"name": source_name}).fetchone()
        return result
    except Exception as e:
        return None

def get_source_by_id(source_id):
    try:
        result = db.session.execute(text("""
            SELECT source_id, name, information, link, citation FROM source WHERE source_id = :id
        """), {"id": source_id}).fetchone()
        return result
    except Exception as e:
        return None

def source_version_exists(source_id, version_name):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM source_version WHERE source_id = :source_id AND version_name = :version_name
        """), {"source_id": source_id, "version_name": version_name}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False

def source_version_exists_by_id(sv_id):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM source_version WHERE sv_id = :sv_id
        """), {"sv_id": sv_id}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False

def get_files_by_sv_id(sv_id):
    try:
        result = db.session.execute(text("""
            SELECT sf.file_path, sf.nomenclature, sf.filetype
            FROM source_file sf 
            JOIN source_version_assembly sva ON sf.sva_id = sva.sva_id 
            WHERE sva.sv_id = :sv_id 
        """), {"sv_id": sv_id}).fetchall()
        return result
    except Exception as e:
        return None

def get_all_source_versions():
    """
    Returns all source versions with source names from the all_source_versions view.
    Returns a dictionary with success status and data or error message.
    """
    try:
        query = text("SELECT * FROM all_source_versions ORDER BY source_name, version_name")
        res = db.session.execute(query)
        
        source_versions = []
        for row in res:
            source_versions.append({
                "source_id": row.source_id,
                "source_name": row.source_name,
                "information": row.information,
                "link": row.link,
                "citation": row.citation,
                # Source version information
                "sv_id": row.sv_id,
                "version_name": row.version_name,
                "last_updated": row.last_updated,
                "version_rank": row.version_rank,
                # Assembly information
                "sva_id": row.sva_id,
                "assembly_id": row.assembly_id,
                "assembly_name": row.assembly_name,
                "assembly_information": row.assembly_information,
                # Organism information
                "taxonomy_id": row.taxonomy_id,
                "scientific_name": row.scientific_name,
                "common_name": row.common_name,
                "organism_information": row.organism_information,
                # File information
                "file_path": row.file_path,
                "filetype": row.filetype,
                "nomenclature": row.nomenclature,
                "file_description": row.file_description
            })
        
        return {"success": True, "data": source_versions}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_latest_source_versions():
    """
    Returns the latest source versions with source names from the latest_source_versions view.
    Returns a dictionary with success status and data or error message.
    """
    try:
        query = text("SELECT * FROM latest_source_versions ORDER BY source_name")
        res = db.session.execute(query)
        
        source_versions = []
        for row in res:
            source_versions.append({
                "sv_id": row.sv_id,
                "source_name": row.source_name,
                "version": row.version_name,
                "information": row.information,
                "link": row.link,
                "last_updated": row.last_updated,
                "version_rank": row.version_rank,
                "source_id": row.source_id,
                "citation": row.citation,
                # Assembly information
                "sva_id": row.sva_id,
                "assembly_id": row.assembly_id,
                "assembly_name": row.assembly_name,
                "assembly_information": row.assembly_information,
                # Organism information
                "taxonomy_id": row.taxonomy_id,
                "scientific_name": row.scientific_name,
                "common_name": row.common_name,
                "organism_information": row.organism_information,
                # File information
                "file_path": row.file_path,
                "filetype": row.filetype,
                "nomenclature": row.nomenclature,
                "file_description": row.file_description
            })
        
        return {"success": True, "data": source_versions}
    except Exception as e:
        return {"success": False, "message": str(e)}


