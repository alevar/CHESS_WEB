import os
import subprocess

def organize_nomenclatures(nomenclature_mappings):
    """
    Converts the flat list from get_nomenclatures() into a nested structure:
    {
        assembly_id: {
            'nomenclatures': [...],
            'sequence_name_mappings': {...},
            'sequence_id_mappings': {...}
        }
    }
    """
    result = {}

    for assembly_id, rows in nomenclature_mappings.items():
        for row in rows:
            assembly_id = row["assembly_id"]
            nomenclature = row["nomenclature"]
            sequence_name = row["sequence_name"]
            sequence_id = row["sequence_id"]
            length = row["length"]

            if assembly_id not in result:
                result[assembly_id] = {
                    "nomenclatures": [],
                    "sequence_name_mappings": {},
                    "sequence_id_mappings": {}
                }

            if nomenclature not in result[assembly_id]["nomenclatures"]:
                result[assembly_id]["nomenclatures"].append(nomenclature)

            if nomenclature not in result[assembly_id]["sequence_name_mappings"]:
                result[assembly_id]["sequence_name_mappings"][nomenclature] = {}
                
            result[assembly_id]["sequence_name_mappings"][nomenclature][sequence_name] = sequence_id

            # Sequence ID mappings
            if sequence_id not in result[assembly_id]["sequence_id_mappings"]:
                result[assembly_id]["sequence_id_mappings"][sequence_id] = {
                    "length": length,
                    "nomenclatures": {}
                }
            result[assembly_id]["sequence_id_mappings"][sequence_id]["nomenclatures"][nomenclature] = sequence_name

    return result

def validate_and_index_fasta(file_path):
    """
    Validates and indexes a FASTA file, returning sequence information.
    Optimized for large files by processing sequences in chunks.
    """
    try:
        # run faidx on the given file
        subprocess.run(['samtools', 'faidx', file_path])
        assert os.path.exists(file_path + '.fai'), "FAI index not created"
        # sequence names and lengths into a dictionary
        sequence_lengths = {}
        with open(file_path + '.fai', 'r') as f:
            for line in f:
                seqid, length, _, _, _ = line.strip().split('\t')
                assert seqid not in sequence_lengths, "Duplicate sequence ID found in FASTA file: " + seqid
                sequence_lengths[seqid] = int(length)
        
        if not sequence_lengths:
            raise Exception("No sequences found in FASTA file")
        
        return sequence_lengths
        
    except Exception as e:
        raise Exception(f"Error processing FASTA file: {str(e)}")

def load_nomenclature_mapping(file_path):
    """
    Loads a nomenclature mapping from a TSV file.
    """
    mapping = {}
    with open(file_path, 'r') as f:
        for line_num, line in enumerate(f):
            line = line.strip()

            parts = line.split('\t')
            if len(parts) != 2:
                return {"success": False, "message": f"Invalid TSV format at line {line_num}. Expected 2 columns, got {len(parts)}"}
            
            source_id, new_id = parts[0].strip(), parts[1].strip()
            if not source_id or not new_id:
                return {"success": False, "message": f"Empty values at line {line_num}"}
            
            if source_id in mapping:
                return {"success": False, "message": f"Duplicate source ID '{source_id}' at line {line_num}"}
            
            mapping[source_id] = new_id

    return mapping

def translate_fasta_file(source_file_path, new_full_path, mapping):
    with open(source_file_path, 'r') as source_file, open(new_full_path, 'w') as new_file:
        for line in source_file:
            if line.startswith('>'):
                seqid = line.strip()[1:].split(" ")[0]
                if seqid in mapping:
                    new_seqid = mapping[seqid]
                    new_file.write(f">{new_seqid}\n")
                else:
                    raise Exception(f"Sequence ID {seqid} not found in mapping")
            else:
                new_file.write(line)