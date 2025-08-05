import os
import shutil
from typing import Dict, List, Optional, Tuple
from sqlalchemy import text
from db.db import db
from werkzeug.utils import secure_filename
import gzip
import subprocess
from db.methods.utils import *
from db.methods.genomes.queries import *
from db.methods.genomes.utils import *
from db.methods.TX import TX
from config.paths import SOURCE_FILES_DIR, TEMP_FILES_DIR
from db.methods.TempFileManager import get_temp_file_manager

from .queries import *
from .utils import *

def add_source(data: Dict) -> Dict:
    """
    Adds a new base source to the database.
    
    Args:
        data: Dictionary containing source information
            - name: Source name
            - information: Description/information
            - link: Source link
            - citation: Source citation
    
    Returns:
        Dictionary with success status and source_id
    """
    try:
        existing_source = get_source_by_name(data["name"])
        if existing_source:
            return {"success": False,"message": f"Source with name '{data['name']}' already exists"}
        
        result = db.session.execute(
            text("""
                INSERT INTO source (name, information, link, citation)
                VALUES (:name, :information, :link, :citation)
            """),
            {
                "name": data["name"],
                "information": data["information"],
                "link": data["link"],
                "citation": data["citation"]
            }
        )
        
        return {
            "success": True,
            "source_id": result.lastrowid,
            "message": "Source added successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to add source: {str(e)}"
        }

def update_source(source_id: int, data: Dict) -> Dict:
    """
    Updates an existing base source.
    
    Args:
        source_id: Source ID
        data: Dictionary containing updated source information
            - name: Source name
            - information: Description/information
            - link: Source link
            - citation: Source citation
    
    Returns:
        Dictionary with success status
    """
    try:
        existing_source = get_source_by_name(data["name"])
        if not existing_source or len(existing_source) == 0:
            return {"success": False,"message": f"Source with name '{data['name']}' does not exist"}
        
        db.session.execute(
            text("""
                UPDATE source 
                SET name = :name, information = :information, link = :link, citation = :citation
                WHERE source_id = :source_id
            """),
            {
                "name": data["name"],
                "information": data["information"],
                "link": data["link"],
                "citation": data["citation"],
                "source_id": source_id
            }
        )
        
        return {
            "success": True,
            "message": "Source updated successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to update source: {str(e)}"
        }


def delete_source(source_id: int) -> Dict:
    """
    Deletes a base source and all its versions.
    
    Args:
        source_id: Source ID
    
    Returns:
        Dictionary with success status
    """
    try:
        if not source_exists_by_id(source_id):
            return {"success": False,"message": f"Source with ID '{source_id}' does not exist"}
        
        
        db.session.execute(
            text("DELETE FROM source WHERE source_id = :source_id"),
            {"source_id": source_id}
        )
        
        return {
            "success": True,
            "message": "Source deleted successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to delete source: {str(e)}"
        }


def add_source_version(data: Dict) -> Dict:
    """
    Adds a new source version to the database.
    
    Args:
        data: Dictionary containing source version information
            - source_id: Source ID
            - version_name: Version name
    
    Returns:
        Dictionary with success status and sv_id
    """
    try:
        if not source_exists_by_id(data["source_id"]):
            return {
                "success": False,
                "message": f"Source with ID {data['source_id']} does not exist"
            }
        
        if source_version_exists(data["source_id"], data["version_name"]):
            return {
                "success": False,
                "message": f"Version '{data['version_name']}' already exists for this source"
            }
        
        # Get the next rank for this source
        query_text = "SELECT MAX(version_rank) FROM source_version WHERE source_id = :source_id"
        max_rank_result = db.session.execute(text(query_text), {"source_id": data["source_id"]}).fetchone()
        
        rank = (max_rank_result[0] or 0) + 1
        
        version_result = db.session.execute(
            text("""
                INSERT INTO source_version (source_id, version_name, version_rank)
                VALUES (:source_id, :version_name, :version_rank)
            """),
            {
                "source_id": data["source_id"],
                "version_name": data["version_name"],
                "version_rank": rank
            }
        )
        
        sv_id = version_result.lastrowid
        
        return {
            "success": True,
            "sv_id": sv_id,
            "message": "Source version added successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to add source version: {str(e)}"
        }

def delete_source_version(sv_id: int) -> Dict:
    """
    Deletes a source version from the database and cleans up associated files.
    
    Args:
        sv_id: Source version ID
    
    Returns:
        Dictionary with success status
    """
    files_to_remove = []
    try:
        if not source_version_exists_by_id(sv_id):
            return {
                "success": False,
                "message": f"Source version with ID {sv_id} does not exist"
            }

        files_to_remove = get_files_by_sv_id(sv_id)
        if files_to_remove is None:
            return {"success": False,"message": f"Error getting files for source version with ID {sv_id}"}
        
        db.session.execute(
            text("DELETE FROM source_version WHERE sv_id = :sv_id"),
            {"sv_id": sv_id}
        )
        
        for file_data in files_to_remove:
            if os.path.exists(file_data["file_path"]):
                try:
                    os.remove(file_data["file_path"])
                except Exception as e:
                    continue
        
        return {
            "success": True,
            "message": "Source version deleted successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to delete source version: {str(e)}"
        }

def reorder_source_versions(source_id: int, new_order: List[int]) -> Dict:
    """
    Reorders source versions for a specific source by updating their ranks.
    
    Args:
        source_id: Source ID
        new_order: List of sv_ids in the desired order (rank 1, 2, 3, etc.)
    
    Returns:
        Dictionary with success status
    """
    try:
        if not source_exists_by_id(source_id):
            return {
                "success": False,
                "message": f"Source with ID {source_id} does not exist"
            }
        
        for i, sv_id in enumerate(new_order):
            if not source_version_exists_by_id(sv_id):
                return {
                    "success": False,
                    "message": f"Source version with ID {sv_id} does not belong to source {source_id}"
                }
        
        # Update ranks based on new order
        # there is unique constraint on version_rank per sv_id
        # First pass: Set all to negative values to avoid conflicts
        for i, sv_id in enumerate(new_order):
            db.session.execute(
                text("UPDATE source_version SET version_rank = :temp_rank WHERE sv_id = :sv_id"),
                {"temp_rank": -(i + 1), "sv_id": sv_id}
            )

        # Second pass: Set to final positive values
        for i, sv_id in enumerate(new_order):
            db.session.execute(
                text("UPDATE source_version SET version_rank = :final_rank WHERE sv_id = :sv_id"),
                {"final_rank": i, "sv_id": sv_id}
            )
        
        return {
            "success": True,
            "message": "Source versions reordered successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to reorder source versions: {str(e)}"
        } 


def verify_annotation_file_upload_data(data) -> Dict:
    """
    Adds an annotation file to a source version.
    """
    try:
        source_version_id = int(data["source_version_id"])
        assembly_id = int(data["assembly_id"])
        description = data["description"]
        
        if not source_version_exists_by_id(source_version_id):
            return {"success": False,"message": f"Source version with ID {source_version_id} does not exist"}
        
        if not assembly_exists(assembly_id):
            return {"success": False,"message": f"Assembly with ID {assembly_id} does not exist"}

        temp_manager = get_temp_file_manager()
        with temp_manager.managed_temp_file(name='gtf_file') as temp_gtf_file_path:
            data["file"].save(temp_gtf_file_path)

        file_format = is_gff(temp_gtf_file_path)
        if file_format == True:
            file_format = "GFF"
        elif file_format == False:
            file_format = "GTF"
        else:
            return {
                "success": False,
                "message": "Invalid file format. Please upload a GTF or GFF file."
            }

        # Create normalized GTF file path
        with temp_manager.managed_temp_file(name='normalized_gtf') as norm_gtf_path:
            run_gffread(temp_gtf_file_path, norm_gtf_path)

        # check sequence ids in the file
        gtf_seqids = get_seqids_from_gtf(norm_gtf_path)
        if not gtf_seqids:  
            return {"success": False,"message": "No sequence IDs found in the file"}
        
        # verify that all sequence ids are in the database
        # get all sequence ids by nomenclature for the assembly
        db_seqids = get_nomenclatures(assembly_id)
        db_seqids = organize_nomenclatures(db_seqids["data"])[assembly_id]

        # write output file skipping any sequence_ids not in the database
        matching_nomenclatures = set()
        for nomenclature, sequence_name_mappings in db_seqids["sequence_name_mappings"].items():
            if set(gtf_seqids) - set(sequence_name_mappings.keys()):
                continue
            else:
                matching_nomenclatures.add(nomenclature)
        
        if not matching_nomenclatures:
            return {
                "success": False,
                "message": f"No nomenclature found where all {len(gtf_seqids)} sequences from the file are present"
            }
        
        # next we need to process the attributes
        # these attributes will be sent back to the frontend to prompt user to resolve conflicts if exist
        attrs = load_attributes_from_gtf(norm_gtf_path,100)
        
        # Process attributes to categorize them and provide better structure for frontend
        processed_attributes = {}
        for attr_name, attr_data in attrs.items():
            processed_attributes[attr_name] = {
                "type": "variable" if attr_data["over_max_capacity"] else "categorical",
                "values": list(attr_data["values"]) if not attr_data["over_max_capacity"] else [],
                "value_count": len(attr_data["values"]) if not attr_data["over_max_capacity"] else "variable"
            }
        
        return {
            "success": True,
            "status": "nomenclature_detection",
            "detected_nomenclatures": list(matching_nomenclatures),
            "attributes": processed_attributes,
            "file_sequences": list(gtf_seqids),
            "assembly_id": assembly_id,
            "source_version_id": source_version_id,
            "description": description,
            "temp_file_path": temp_gtf_file_path,
            "norm_gtf_path": norm_gtf_path
        }
        
    except Exception as e:
        temp_manager.cleanup_all()
        return {
            "success": False,
            "message": f"Failed to add annotation file: {str(e)}"
        }

def confirm_and_process_annotation_file(confirmation_data: Dict) -> Dict:
    """
    Processes the annotation file after user confirms the nomenclature and attribute mappings.
    
    Args:
        confirmation_data: Dictionary containing:
            - selected_nomenclature: The nomenclature chosen by user
            - transcript_type_key: attribute key to use for transcript_type
            - gene_type_key: attribute key to use for gene_type  
            - gene_name_key: attribute key to use for gene_name
            - attribute_types: dictionary mapping attribute names to their types (categorical/variable)
            - assembly_id: Assembly ID
            - source_version_id: Source version ID
            - description: File description
            - temp_file_path: Path to temporary uploaded file
            - norm_gtf_path: Path to normalized GTF file
    
    Returns:
        Dictionary with processing results
    """
    temp_manager = get_temp_file_manager()
    try:
        temp_file_path = confirmation_data.get("temp_file_path")
        norm_gtf_path = confirmation_data.get("norm_gtf_path")
        selected_nomenclature = confirmation_data.get("selected_nomenclature")
        transcript_type_key = confirmation_data.get("transcript_type_key")
        gene_type_key = confirmation_data.get("gene_type_key")
        gene_name_key = confirmation_data.get("gene_name_key")
        attribute_types = confirmation_data.get("attribute_types", {})
        categorical_attribute_values = confirmation_data.get("categorical_attribute_values", {})
        assembly_id = confirmation_data.get("assembly_id")
        source_version_id = confirmation_data.get("source_version_id")
        description = confirmation_data.get("description")

        if not selected_nomenclature:
            return {"success": False,"message": "No nomenclature selected"}
        if not transcript_type_key:
            return {"success": False,"message": "Transcript type attribute key is required"}
        if not gene_type_key:
            return {"success": False,"message": "Gene type attribute key is required"}
        if not gene_name_key:
            return {"success": False,"message": "Gene name attribute key is required"} 

        result = db.session.execute(
            text("INSERT INTO source_version_assembly (sv_id, assembly_id) VALUES (:source_version_id, :assembly_id)"),
            {
                "source_version_id": source_version_id,
                "assembly_id": assembly_id
            }
        )
        sva_id = result.lastrowid
        if not sva_id:
            return {"success": False,"message": "Failed to create entry in the source_version_assembly table"}

        # now we need to process all attributes
        for attribute_key, attribute_type in attribute_types.items():
            existing_key = db.session.execute(
                text("SELECT key_name FROM attribute_key WHERE key_name = :key_name"),
                {"key_name": attribute_key}
            ).fetchone()
            
            if not existing_key:
                variable = 1 if attribute_type == "variable" else 0
                db.session.execute(
                    text("INSERT INTO attribute_key (key_name, variable, description) VALUES (:key_name, :variable, :description)"),
                    {
                        "key_name": attribute_key,
                        "variable": variable,
                        "description": f"Auto-generated key for {attribute_key}"
                    }
                )
                
                db.session.execute(
                    text("INSERT INTO attribute_key_map (og_key, std_key) VALUES (:og_key, :std_key)"),
                    {
                        "og_key": attribute_key,
                        "std_key": attribute_key
                    }
                )
                
                if attribute_type == "variable":
                    db.session.execute(
                        text("INSERT INTO attribute_key_value (key_name, value) VALUES (:key_name, '')"),
                        {"key_name": attribute_key}
                    )
                    db.session.execute(
                        text("INSERT INTO attribute_value_map (key_name, og_value, std_value) VALUES (:key_name, '', '')"),
                        {"key_name": attribute_key}
                    )
                
                if attribute_type == "categorical":
                    attr_values = categorical_attribute_values.get(attribute_key, [])
                    for attr_value in attr_values:
                        transformed_attr_value = attr_value.replace("'","\\'").replace("\"","\\\"")
                        
                        existing_value = db.session.execute(
                            text("SELECT value FROM attribute_key_value WHERE key_name = :key_name AND value = :value"),
                            {"key_name": attribute_key, "value": transformed_attr_value}
                        ).fetchone()
                        
                        if not existing_value:
                            db.session.execute(
                                text("INSERT INTO attribute_key_value (key_name, value) VALUES (:key_name, :value)"),
                                {"key_name": attribute_key, "value": transformed_attr_value}
                            )
                            
                            db.session.execute(
                                text("INSERT INTO attribute_value_map (key_name, std_value, og_value) VALUES (:key_name, :std_value, :og_value)"),
                                {"key_name": attribute_key, "std_value": transformed_attr_value, "og_value": transformed_attr_value}
                            )
        
        # extract current GTF for the database
        with temp_manager.managed_temp_file(name='db_gtf') as db_gtf_fname:
            to_gtf(assembly_id,selected_nomenclature,db_gtf_fname)

        # run gffcompare between the database GTF and the normalized input file
        with temp_manager.managed_temp_file(name='gffcmp_gtf') as gffcmp_gtf_fname:
            run_gffcompare(norm_gtf_path,db_gtf_fname,gffcmp_gtf_fname)

        tracking = load_tracking(gffcmp_gtf_fname+".tracking")

        db_seqids = get_nomenclatures(assembly_id)
        db_seqids = organize_nomenclatures(db_seqids["data"])[assembly_id]
        assert selected_nomenclature in db_seqids["nomenclatures"], f"Nomenclature {selected_nomenclature} not found in the database"

        # iterate over the contents of the file and add them to the database
        # construct gene_id to Gene.gid map, add every new gene as an entry into Gene Table
        gene_map = dict()
        for transcript_lines in read_gffread_gtf(norm_gtf_path):
            transcript = TX()
            transcript.gene_name_key = gene_name_key
            transcript.gene_type_key = gene_type_key
            transcript.transcript_type_key = transcript_type_key
            transcript.from_strlist(transcript_lines)
            assert transcript.seqid in db_seqids["sequence_name_mappings"][selected_nomenclature], f"Sequence ID {transcript.seqid} not found in the database"
            transcript.seqid = db_seqids["sequence_name_mappings"][selected_nomenclature][transcript.seqid]

            working_gid = gene_map.get(transcript.gene_id,None)
            if working_gid is None:
                working_gid = insert_gene(transcript,sva_id)
                if not working_gid["success"]:
                    raise Exception(f"Failed to insert gene: {working_gid['message']}")
                working_gid = working_gid["gene_id"]
                gene_map[transcript.gene_id] = working_gid
            
            working_tid = tracking.get(transcript.tid,None) # tid PK of the transcript being worked on as it appears in the Transcripts table

            if working_tid is None:
                working_tid = insert_transcript(transcript)
                if not working_tid["success"]:
                    raise Exception(f"Failed to insert transcript: {working_tid['message']}")
                working_tid = working_tid["transcript_id"]

            insert_dbxref(transcript,working_tid,working_gid,sva_id)
            for attribute_key, attribute_value in transcript.attributes.items():
                if attribute_key in ["transcript_id", "gene_id"]:
                    continue
                if attribute_key not in attribute_types:
                    continue
                
                attribute_type = attribute_types[attribute_key]
                
                # For categorical attributes, values are already added upfront
                value_text = ""
                value = ""
                if attribute_type == "categorical":
                    value = attribute_value
                else:
                    value_text = attribute_value
                db.session.execute(
                    text("INSERT INTO tx_attribute (tid, sva_id, transcript_id, name, value, value_text, key_text) VALUES (:tid, :sva_id, :transcript_id, :name, :value, :value_text, :key_text)"),
                    {
                        "tid": working_tid,
                        "sva_id": sva_id,
                        "transcript_id": transcript.tid,
                        "name": attribute_key,
                        "value": value,
                        "value_text": value_text,
                        "key_text": attribute_key
                    }
                )

        for target_nomenclature in db_seqids["nomenclatures"]:
            gtf_filename = f"{sva_id}_{target_nomenclature}.gtf"
            gff_filename = f"{sva_id}_{target_nomenclature}.gff"
            gtf_filepath = os.path.join(SOURCE_FILES_DIR, gtf_filename)
            gff_filepath = os.path.join(SOURCE_FILES_DIR, gff_filename)

            nomenclature_map = {}
            for source_seqname, seqid in db_seqids["sequence_name_mappings"][selected_nomenclature].items():
                nomenclature_map[source_seqname] = db_seqids["sequence_id_mappings"][seqid]["nomenclatures"][target_nomenclature]
            
            try:
                convert_nomenclature(norm_gtf_path,gtf_filepath,nomenclature_map)
                run_gffread_gtf_to_gff(gtf_filepath, gff_filepath)
                
                db.session.execute(
                    text("INSERT INTO source_file (sva_id, assembly_id, file_path, nomenclature, filetype, description) VALUES (:sva_id, :assembly_id, :file_path, :nomenclature, :filetype, :description)"),
                    {
                        "sva_id": sva_id,
                        "assembly_id": assembly_id,
                        "file_path": gtf_filepath,
                        "nomenclature": target_nomenclature,
                        "filetype": "gtf",
                        "description": f"GTF file for source version assembly {sva_id} with nomenclature {target_nomenclature}"
                    }
                )
                db.session.execute(
                    text("INSERT INTO source_file (sva_id, assembly_id, file_path, nomenclature, filetype, description) VALUES (:sva_id, :assembly_id, :file_path, :nomenclature, :filetype, :description)"),
                    {
                        "sva_id": sva_id,
                        "assembly_id": assembly_id,
                        "file_path": gff_filepath,
                        "nomenclature": target_nomenclature,
                        "filetype": "gff",
                        "description": f"GFF file for source version assembly {sva_id} with nomenclature {target_nomenclature}"
                    }
                )
                
            except Exception as e:
                raise e
        
        return {
            "success": True,
            "message": f"Annotation file processed successfully with nomenclature: {selected_nomenclature}",
            "attribute_mappings": {
                "transcript_type": transcript_type_key,
                "gene_type": gene_type_key,
                "gene_name": gene_name_key
            },
            "attribute_types": attribute_types
        }
        
    except Exception as e:
        return {"success": False,"message": f"Failed to process annotation file: {str(e)}"}

def to_gtf(assembly_id: int, selected_nomenclature: str, outfname: str) -> None:
    """
    Retrieve transcripts for a given assembly and output them as a GTF file.
    
    Args:
        assembly_id: The ID of the assembly to retrieve transcripts for
        selected_nomenclature: The nomenclature to use for sequence mapping
        outfname: Output filename for the GTF file
    
    Returns:
        None
    
    Raises:
        Exception: If there's an error writing to the file or executing the query
    """
    # Query to retrieve transcript data with intron information
    query = text("""
        SELECT 
            t.tid,
            t.sequence_id,
            t.strand,
            t.start,
            t.end,
            ti.tid as ti_tid,
            ti.iid,
            i.iid as intron_iid,
            i.sequence_id as intron_sequence_id,
            i.strand as intron_strand,
            i.start as intron_start,
            i.end as intron_end,
            sim.sequence_name
        FROM transcript t 
        JOIN transcript_intron ti ON t.tid = ti.tid 
        JOIN intron i ON ti.iid = i.iid 
        JOIN sequence_id s ON t.sequence_id = s.sequence_id
        JOIN sequence_id_map sim ON s.sequence_id = sim.sequence_id 
                                AND s.assembly_id = sim.assembly_id
        WHERE 
            s.assembly_id = :assembly_id 
            AND sim.nomenclature = :nomenclature
        ORDER BY t.tid;
    """)
    
    try:
        select_res = db.session.execute(
            query, 
            {"assembly_id": assembly_id, "nomenclature": selected_nomenclature}
        )
        
        with open(outfname, "w") as out_fp:
            # Check if we have any results
            rows = [dict(row._mapping) for row in select_res]
            if not rows:
                out_fp.write("\t\t\ttranscript\t0\t0\t.\t+\t.\ttranscript_id \"nan\";\n")
                out_fp.write("\t\t\texon\t0\t0\t.\t+\t.\ttranscript_id \"nan\";\n")
            else:
                for tx in group_rows(rows):
                    out_fp.write(tx.to_gtf() + "\n")
                    
    except Exception as e:
        raise

def insert_gene(transcript: TX, sva_id: int) -> Dict:
    """
    Insert a gene record and return the generated gid.
    
    Args:
        transcript: TX object containing gene information
        sva_id: Source version assembly ID
    
    Returns:
        Dictionary with success status and gene_id
    """
    try:
        result = db.session.execute(
            text("INSERT INTO gene (gene_id, sva_id, name, type_key, type_value) VALUES (:gene_id, :sva_id, :name, :type_key, :type_value)"),
            {
                "gene_id": transcript.gene_id,
                "sva_id": sva_id,
                "name": transcript.gene_name_value,
                "type_key": transcript.gene_type_key,
                "type_value": transcript.gene_type_value
            }
        )
        
        return {
            "success": True,
            "gene_id": result.lastrowid,
            "message": "Gene inserted successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to insert gene: {str(e)}"
        }

def insert_intron(sequence_id: int, strand: str, start: int, end: int) -> Dict:
    """
    Insert an intron record and return the iid (new or existing).
    
    Args:
        sequence_id: Sequence ID
        strand: Strand (+ or -)
        start: Start position
        end: End position
    
    Returns:
        Dictionary with success status and intron_id
    """
    try:
        result = db.session.execute(
            text("""
                INSERT INTO intron (sequence_id, strand, start, end) 
                VALUES (:sequence_id, :strand, :start, :end)
                ON DUPLICATE KEY UPDATE 
                    iid = LAST_INSERT_ID(iid)
            """),
            {
                "sequence_id": sequence_id,
                "strand": strand,
                "start": start,
                "end": end
            }
        )
        
        return {
            "success": True,
            "intron_id": result.lastrowid,
            "message": "Intron processed successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "intron_id": None,
            "message": f"Failed to insert intron: {str(e)}"
        }

def insert_transcript(transcript: TX) -> Dict:
    """
    Insert a transcript record and return the generated tid.
    
    Args:
        transcript: TX object containing transcript information
        assembly_id: Assembly ID
    
    Returns:
        Dictionary with success status and transcript_id
    """
    try:
        result = db.session.execute(
            text("INSERT INTO transcript (sequence_id, strand, start, end) VALUES (:sequence_id, :strand, :start, :end)"),
            {
                "sequence_id": transcript.seqid,
                "strand": transcript.strand,
                "start": transcript.start,
                "end": transcript.end
            }
        )
        
        tid = result.lastrowid
        
        # Deal with introns here since they are part of transcript
        for intron in transcript.introns:
            intron_result = insert_intron(transcript.seqid, transcript.strand, intron[0], intron[1])
            
            if intron_result["success"]:
                db.session.execute(
                    text("INSERT INTO transcript_intron (tid, iid) VALUES (:tid, :iid)"),
                    {"tid": tid, "iid": intron_result["intron_id"]}
                )
            else:
                raise Exception(f"Failed to insert intron: {intron_result['message']}")
        
        return {
            "success": True,
            "transcript_id": tid,
            "message": "Transcript inserted successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to insert transcript: {str(e)}"
        }

def insert_dbxref(transcript: TX, tid: int, gid: int, sva_id: int) -> Dict:
    """
    Insert a transcript database cross-reference record.
    
    Args:
        transcript: TX object containing transcript information
        tid: Transcript ID
        gid: Gene ID
        sva_id: Source version assembly ID
    
    Returns:
        Dictionary with success status and record_id
    """
    try:
        columns = ["tid", "sva_id", "transcript_id", "start", "end", "type_key", "type_value", "gid"]
        values = [tid, sva_id, transcript.tid, transcript.start, transcript.end, 
                  transcript.transcript_type_key, transcript.transcript_type_value, gid]
        
        if transcript.cds_start is not None and transcript.cds_end is not None:
            columns.extend(["cds_start", "cds_end"])
            values.extend([transcript.cds_start, transcript.cds_end])
        
        if transcript.score is not None:
            columns.append("score")
            values.append(transcript.score)
        
        placeholders = ", ".join([f":{col}" for col in columns])
        column_list = ", ".join(columns)
        
        query = f"INSERT INTO tx_dbxref ({column_list}) VALUES ({placeholders})"
        
        result = db.session.execute(
            text(query),
            dict(zip(columns, values))
        )
        
        return {
            "success": True,
            "record_id": result.lastrowid,
            "message": "Database cross-reference inserted successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to insert database cross-reference: {str(e)}"
        }