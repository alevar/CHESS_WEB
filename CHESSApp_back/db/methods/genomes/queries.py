from sqlalchemy import text
from db.db import db
from db.methods.utils import *

def organism_exists(taxonomy_id: int):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM organism WHERE taxonomy_id = :taxonomy_id
        """), {"taxonomy_id": taxonomy_id}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False

def assembly_exists(assembly_id: int):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM assembly WHERE assembly_id = :assembly_id
        """), {"assembly_id": assembly_id}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False

def nomenclature_exists(nomenclature: str, assembly_id: int):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM nomenclature WHERE nomenclature = :nomenclature AND assembly_id = :assembly_id
        """), {"nomenclature": nomenclature, "assembly_id": assembly_id}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False

def get_assembly(assembly_id: int):
    try:
        result = db.session.execute(text("""
            SELECT assembly_id, assembly_name, taxonomy_id FROM assembly WHERE assembly_id = :assembly_id
        """), {"assembly_id": assembly_id}).fetchone()
        return result
    except Exception as e:
        return None

# Organism management methods
def get_all_organisms():
    """
    Returns all organisms from the database.
    """
    try:
        result = db.session.execute(text("""
            SELECT taxonomy_id, scientific_name, common_name, information
            FROM organism
            ORDER BY scientific_name
        """)).fetchall()
        
        organisms = {}
        for row in result:
            organisms[row.taxonomy_id] = {
                "taxonomy_id": row.taxonomy_id,
                "scientific_name": row.scientific_name,
                "common_name": row.common_name,
                "information": row.information or ""
            }
        
        return {"success": True, "data": organisms}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_all_assemblies():
    try:
        result = db.session.execute(text("""
            SELECT assembly_id, assembly_name, taxonomy_id, information
            FROM assembly
            ORDER BY assembly_name
        """)).fetchall()
        
        assemblies = {}
        for row in result:
            assemblies[row.assembly_id] = {
                "assembly_id": row.assembly_id,
                "assembly_name": row.assembly_name,
                "taxonomy_id": row.taxonomy_id,
                "information": row.information or ""
            }
        
        return {"success": True, "data": assemblies}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_all_source_files(assembly_id: int, source_nomenclature: str, filetype: str):
    try:
        result = db.session.execute(text("""
            SELECT file_path, sva_id, assembly_id, nomenclature, filetype, description
            FROM source_file
            WHERE assembly_id = :assembly_id AND nomenclature = :source_nomenclature AND filetype = :filetype
        """), {
            "assembly_id": assembly_id,
            "source_nomenclature": source_nomenclature,
            "filetype": filetype
        }).fetchall()

        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_nomenclatures(assembly_id: int = None):
    """
    Returns all nomenclature mappings from the database.
    If assembly_id is provided, returns only mappings for that assembly.
    Output: {assembly_id: [row_dict, ...], ...}
    """
    try:
        query = """
            SELECT sim.assembly_id, 
                   sim.sequence_id, 
                   sim.nomenclature, 
                   sim.sequence_name, 
                   si.length 
            FROM sequence_id_map sim 
            LEFT JOIN sequence_id si 
                ON sim.assembly_id = si.assembly_id AND sim.sequence_id = si.sequence_id
        """
        params = {}
        if assembly_id:
            query += " WHERE sim.assembly_id = :assembly_id"
            params["assembly_id"] = assembly_id

        query += " ORDER BY sim.assembly_id, sim.nomenclature, sim.sequence_name"

        result = db.session.execute(text(query), params).fetchall()

        # Group rows by assembly_id
        data = {}
        for row in result:
            row_dict = {
                "assembly_id": row.assembly_id,
                "sequence_id": row.sequence_id,
                "nomenclature": row.nomenclature,
                "sequence_name": row.sequence_name,
                "length": row.length
            }
            if row.assembly_id not in data:
                data[row.assembly_id] = []
            data[row.assembly_id].append(row_dict)

        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_genome_files():
    try:
        result = db.session.execute(text("""
            SELECT genome_file_id, assembly_id, nomenclature, file_path
            FROM genome_file
        """)).fetchall()

        genome_files = {}
        for row in result:
            genome_files[row.genome_file_id] = {
                "genome_file_id": row.genome_file_id,
                "assembly_id": row.assembly_id,
                "nomenclature": row.nomenclature,
                "file_path": row.file_path
            }
        
        return {"success": True, "data": genome_files}
    except Exception as e:
        return {"success": False, "message": str(e)}