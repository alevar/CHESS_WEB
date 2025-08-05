import os
import time
import tempfile
from sqlalchemy import text
from werkzeug.utils import secure_filename

from db.db import db
from .queries import *
from db.methods.utils import *
from .utils import *
from ..TempFileManager import get_temp_file_manager
from config.paths import FASTA_FILES_DIR, SOURCE_FILES_DIR

# ============================================================================
# ORGANISM
# ============================================================================

def add_organism(taxonomy_id, scientific_name, common_name, information=""):
    """
    Adds a new organism to the database.
    """
    try:
        # Insert new organism
        db.session.execute(text("""
            INSERT INTO organism (taxonomy_id, scientific_name, common_name, information)
            VALUES (:taxonomy_id, :scientific_name, :common_name, :information)
        """), {
            "taxonomy_id": taxonomy_id,
            "scientific_name": scientific_name,
            "common_name": common_name,
            "information": information
        })
        
        return {"success": True, "message": "Organism added successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def update_organism(taxonomy_id, scientific_name, common_name, information=""):
    """
    Updates an existing organism in the database.
    """
    try:
        if not organism_exists(taxonomy_id):
            return {"success": False, "message": "Organism not found"}
        
        db.session.execute(text("""
            UPDATE organism 
            SET scientific_name = :scientific_name, common_name = :common_name, information = :information
            WHERE taxonomy_id = :taxonomy_id
        """), {
            "taxonomy_id": taxonomy_id,
            "scientific_name": scientific_name,
            "common_name": common_name,
            "information": information
        })
        
        return {"success": True, "message": "Organism updated successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def delete_organism(taxonomy_id):
    """
    Deletes an organism from the database.
    """
    try:
        if not organism_exists(taxonomy_id):
            return {"success": False, "message": "Organism not found"}
        
        db.session.execute(text("""
            DELETE FROM organism WHERE taxonomy_id = :taxonomy_id
        """), {"taxonomy_id": taxonomy_id})
        
        return {"success": True, "message": "Organism deleted successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

# ============================================================================
# ASSEMBLY
# ============================================================================

def add_assembly(assembly_name, taxonomy_id, information=""):
    """
    Adds a new assembly to the database.
    """
    try:
        if not assembly_exists(assembly_name):
            return {"success": False, "message": "Assembly with this name already exists"}
        
        if not organism_exists(taxonomy_id):
            return {"success": False, "message": "Organism with this taxonomy ID does not exist"}
        
        db.session.execute(text("""
            INSERT INTO assembly (assembly_name, taxonomy_id, information)
            VALUES (:assembly_name, :taxonomy_id, :information)
        """), {
            "assembly_name": assembly_name,
            "taxonomy_id": taxonomy_id,
            "information": information
        })
        
        return {"success": True, "message": "Assembly added successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def update_assembly(assembly_id, assembly_name, taxonomy_id, information=""):
    """
    Updates an existing assembly in the database.
    """
    try:
        assembly = get_assembly(assembly_id)
        if not assembly or len(assembly) == 0:
            return {"success": False, "message": "Assembly not found"}
        
        if not organism_exists(taxonomy_id):
            return {"success": False, "message": "Organism with this taxonomy ID does not exist"}
        
        db.session.execute(text("""
            UPDATE assembly 
            SET assembly_name = :assembly_name, taxonomy_id = :taxonomy_id, information = :information
            WHERE assembly_id = :assembly_id
        """), {
            "assembly_id": assembly_id,
            "assembly_name": assembly_name,
            "taxonomy_id": taxonomy_id, 
            "information": information
        })
        
        return {"success": True, "message": "Assembly updated successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def delete_assembly(assembly_id):
    """
    Deletes an assembly from the database.
    """
    try:
        assembly = get_assembly(assembly_id)
        if not assembly or len(assembly) == 0:
            return {"success": False, "message": "Assembly not found"}

        # Delete assembly
        db.session.execute(text("""
            DELETE FROM assembly WHERE assembly_id = :assembly_id
        """), {"assembly_id": assembly_id})
        
        return {"success": True, "message": "Assembly deleted successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

def process_fasta_file(assembly_id, nomenclature, file):
    """
    Processes a FASTA file upload for an assembly.
    Optimized for large files with better error handling.
    """
    
    try:
        assembly = get_assembly(assembly_id)
        if not assembly or len(assembly) == 0:
            return {"success": False, "message": "Assembly not found"}
        
        safe_filename = f"{assembly.taxonomy_id}_{assembly_id}_{nomenclature}.fasta"
        file_path = os.path.join(FASTA_FILES_DIR, safe_filename)
        file.save(file_path)
        
        try:
            fasta_index = validate_and_index_fasta(file_path)
            
            if not fasta_index:
                raise Exception("No valid sequences found in FASTA file")
            
            nomenclature_result = insert_nomenclature(nomenclature, assembly_id)
            sequence_count = create_sequence_entries(assembly_id, fasta_index, nomenclature)
            file_record_id = insert_genome_file(assembly_id, file_path, nomenclature)
            
            print(f"Successfully processed {sequence_count} sequences")
            
            return {
                "success": True, 
                "message": f"FASTA file processed successfully. {sequence_count} sequences added.",
                "file_id": file_record_id,
                "nomenclature": nomenclature_result,
                "sequence_count": sequence_count
            }
            
        except Exception as e:
            print(f"Error processing FASTA file: {str(e)}")
            raise e
            
    except Exception as e:
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        return {"success": False, "message": str(e)}

def insert_nomenclature(nomenclature, assembly_id):
    """
    Inserts nomenclature into the nomenclature table.
    """
    try:
        if not assembly_exists(assembly_id):
            raise Exception("Assembly not found")
        if nomenclature_exists(nomenclature, assembly_id):
            return nomenclature
        
        db.session.execute(text("""
            INSERT INTO nomenclature (nomenclature, assembly_id)
            VALUES (:nomenclature, :assembly_id)
        """), {
            "nomenclature": nomenclature,
            "assembly_id": assembly_id
        })
        
        return nomenclature
        
    except Exception as e:
        raise Exception(f"Error inserting nomenclature: {str(e)}")

def create_sequence_entries(assembly_id, sequences, nomenclature):
    """
    Creates entries in sequence_id and sequence_id_map tables using bulk operations.
    Optimized for large datasets by processing in chunks.
    """
    try:
        for sequence_name, sequence_length in sequences.items():
            result = db.session.execute(text("""
                INSERT INTO sequence_id (assembly_id, length)
                VALUES (:assembly_id, :length)
            """), {
                "assembly_id": assembly_id,
                "length": sequence_length
            })
            
            # Get the auto-generated sequence_id
            sequence_id = result.lastrowid

            db.session.execute(text("""
                INSERT INTO sequence_id_map (assembly_id, sequence_id, nomenclature, sequence_name)
                VALUES (:assembly_id, :sequence_id, :nomenclature, :sequence_name)
            """), {
                "assembly_id": assembly_id,
                "sequence_id": sequence_id,
                "nomenclature": nomenclature,
                "sequence_name": sequence_name
            })

        return len(sequences)

    except Exception as e:
        raise Exception(f"Error creating sequence entries: {str(e)}")

def insert_genome_file(assembly_id, file_path, nomenclature):
    """
    Inserts file path into genome_file table.
    """
    try:
        result = db.session.execute(text("""
            INSERT INTO genome_file (assembly_id, nomenclature, file_path)
            VALUES (:assembly_id, :nomenclature, :file_path)
        """), {
            "assembly_id": assembly_id,
            "nomenclature": nomenclature,
            "file_path": file_path
        })
        
        return result.lastrowid
        
    except Exception as e:
        raise Exception(f"Error inserting genome file: {str(e)}") 

def remove_nomenclature_from_assembly(assembly_id, nomenclature):
    """
    Removes a nomenclature and all associated sequence mappings from an assembly.
    Simplified with CASCADE constraints - only need to delete from sequence_id_map.
    """
    try:
        if not assembly_exists(assembly_id):
            return {"success": False, "message": "Assembly not found"}
        
        if not nomenclature_exists(nomenclature, assembly_id):
            return {"success": False, "message": "Nomenclature not found for this assembly"}

        # Get genome file info before deletion for file cleanup
        genome_file = db.session.execute(text("""
            SELECT file_path FROM genome_file 
            WHERE assembly_id = :assembly_id AND nomenclature = :nomenclature
        """), {
            "assembly_id": assembly_id,
            "nomenclature": nomenclature
        }).fetchone()
        
        # cascade should propagate deletion to everything else that is relevant
        # delete from nomenclature table
        db.session.execute(text("""
            DELETE FROM nomenclature WHERE assembly_id = :assembly_id AND nomenclature = :nomenclature
        """), {
            "assembly_id": assembly_id,
            "nomenclature": nomenclature
        })
        
        # Clean up the actual file from disk
        if genome_file and genome_file.file_path:
            file_path = os.path.join(os.getcwd(), genome_file.file_path)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Warning: Could not delete file {file_path}: {str(e)}")
        
        return {
            "success": True,
            "message": f"Nomenclature '{nomenclature}' removed from assembly successfully"
        }
            
    except Exception as e:
        return {"success": False, "message": str(e)} 

def process_nomenclature_tsv(source_file, assembly_id, source_nomenclature, new_nomenclature):
    """
    Process a TSV file to create a new nomenclature mapping for an assembly.
    The TSV file should have two columns: source_id and new_id.
    """
    
    try:
        assembly = get_assembly(assembly_id)
        if not assembly or len(assembly) == 0:
            return {"success": False, "message": "Assembly not found"}
        
        if not nomenclature_exists(source_nomenclature, assembly_id):
            return {"success": False, "message": "Source nomenclature not found for this assembly"}
        
        if nomenclature_exists(new_nomenclature, assembly_id):
            return {"success": False, "message": f"Nomenclature '{new_nomenclature}' already exists for this assembly"}
        
        temp_manager = get_temp_file_manager()
        with temp_manager.managed_temp_file(name='nomenclature_upload_tsv') as temp_file_path:
            source_file.save(temp_file_path)
        
        try:
            mapping = load_nomenclature_mapping(temp_file_path)
            if not mapping:
                return {"success": False, "message": "No valid mappings found in TSV file"}
            
            # Get existing sequence mappings for source nomenclature
            existing_nomenclatures = get_nomenclatures(assembly_id)
            existing_names = {row["sequence_name"] for row in existing_nomenclatures["data"][assembly_id]}
            
            # Validate that all source IDs in TSV exist in the source nomenclature
            missing_ids = set(mapping.keys()) - existing_names
            if missing_ids:
                return {"success": False, "message": f"Source IDs not found in '{source_nomenclature}': {', '.join(list(missing_ids)[:10])}{'...' if len(missing_ids) > 10 else ''}"}
            
            # Insert new nomenclature if it doesn't exist globally
            insert_nomenclature(new_nomenclature,assembly_id)
            
            # Create new sequence mappings
            mapping_count = 0
            for row in existing_nomenclatures["data"][assembly_id]:
                if row["sequence_name"] in mapping:
                    # Insert new nomenclature mapping
                    db.session.execute(text("""
                        INSERT INTO sequence_id_map (assembly_id, sequence_id, nomenclature, sequence_name)
                        VALUES (:assembly_id, :sequence_id, :nomenclature, :sequence_name)
                    """), {
                        "assembly_id": assembly_id,
                        "sequence_id": row["sequence_id"],
                        "nomenclature": new_nomenclature,
                        "sequence_name": mapping[row["sequence_name"]]
                    })
                    mapping_count += 1

            # lastly we need to create a version of the fasta file with the new nomenclature names and add it to the genome_file table
            # get the fasta file for the source nomenclature
            fasta_file = db.session.execute(text("""
                SELECT file_path FROM genome_file WHERE assembly_id = :assembly_id AND nomenclature = :nomenclature
            """), {
                "assembly_id": assembly_id,
                "nomenclature": source_nomenclature
            }).fetchone()
            
            if fasta_file:
                # Create new FASTA file with new nomenclature names
                source_file_path = os.path.join(os.getcwd(), "data", fasta_file.file_path)
                if os.path.exists(source_file_path):
                    # Create new filename for the new nomenclature
                    new_filename = f"{assembly.taxonomy_id}_{assembly_id}_{new_nomenclature}.fasta"
                    new_full_path = os.path.join(FASTA_FILES_DIR, new_filename)
                    
                    translate_fasta_file(source_file_path, new_full_path, mapping)
                    
                    db.session.execute(text("""
                        INSERT INTO genome_file (assembly_id, nomenclature, file_path)
                        VALUES (:assembly_id, :nomenclature, :file_path)
                    """), {
                        "assembly_id": assembly_id,
                        "nomenclature": new_nomenclature,
                        "file_path": new_file_path
                    })
                else:
                    return {"success": False, "message": f"Source FASTA file not found: {source_file_path}"}
            else:
                return {"success": False, "message": f"No FASTA file found for source nomenclature '{source_nomenclature}'"}
            
            # need to check any files that are associated with the current assembly and source nomenclature and create new versions for the new nomenclature
            # get all the files for the current assembly and source nomenclature
            source_files = get_all_source_files(assembly_id, source_nomenclature, "gtf")
            
            for source_file in source_files["data"]:
                sva_id = source_file.sva_id
                file_path = source_file.file_path

                gtf_filename = f"{sva_id}_{new_nomenclature}.gtf"
                gff_filename = f"{sva_id}_{new_nomenclature}.gff"
                gtf_filepath = os.path.join(SOURCE_FILES_DIR, gtf_filename)
                gff_filepath = os.path.join(SOURCE_FILES_DIR, gff_filename)
                
                try:
                    convert_nomenclature(file_path,gtf_filepath,mapping)
                    run_gffread_gtf_to_gff(gtf_filepath, gff_filepath)
                    
                    db.session.execute(
                        text("INSERT INTO source_file (sva_id, assembly_id, file_path, nomenclature, filetype, description) VALUES (:sva_id, :assembly_id, :file_path, :nomenclature, :filetype, :description)"),
                        {
                            "sva_id": sva_id,
                            "assembly_id": assembly_id,
                            "file_path": gtf_filepath,
                            "nomenclature": new_nomenclature,
                            "filetype": "gtf",
                            "description": f"GTF file for source version assembly {sva_id} with nomenclature {new_nomenclature}"
                        }
                    )
                    
                    db.session.execute(
                        text("INSERT INTO source_file (sva_id, assembly_id, file_path, nomenclature, filetype, description) VALUES (:sva_id, :assembly_id, :file_path, :nomenclature, :filetype, :description)"),
                        {
                            "sva_id": sva_id,
                            "assembly_id": assembly_id,
                            "file_path": gff_filepath,
                            "nomenclature": new_nomenclature,
                            "filetype": "gff",
                            "description": f"GFF file for source version assembly {sva_id} with nomenclature {new_nomenclature}"
                        }
                    )
                    
                except Exception as e:
                    raise e
            
            return {
                "success": True,
                "message": f"Successfully created nomenclature '{new_nomenclature}' with {mapping_count} sequence mappings and new FASTA file"
            }
            
        finally:
            temp_manager.cleanup_file(temp_file_path)
                
    except Exception as e:
        temp_manager.cleanup_file(temp_file_path)
        return {"success": False, "message": str(e)}
