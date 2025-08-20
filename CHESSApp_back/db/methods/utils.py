# contains reusable funcitons used throughout the experiments

import os
import json
import copy
import base64
import random
import subprocess

def serialize_sql_data(cell):
    if isinstance(cell, bytes):
        try:
            return cell.decode('utf-8')
        except Exception:
            return base64.b64encode(cell).decode('ascii')
    return cell

gff3cols=["seqid","source","type","start","end","score","strand","phase","attributes"]

def is_gff(fname:str) -> bool:
    """
    This function checks whether a file is in GFF format.
    The method uses only transcript_id vs ID= to distinguish between GFF and GTF

    Parameters:
    fname (str): The name of the file to check.

    Returns:
    bool: A flag indicating whether the file is in GFF format.
    """
    assert os.path.exists(fname),"file does not exist: "+fname
    gff = None
    
    with open(fname,"r") as fp:
        for line in fp:
            if line.startswith("#"):
                continue
            lcs = line.strip().split("\t")
            if len(lcs) > 9:
                gff = None
                break
            
            if lcs[2] not in ["gene","transcript","exon","CDS"]:
                gff = None
                break

            if lcs[2] == "transcript":
                if lcs[8].startswith("ID="):
                    gff = True
                    break
                elif lcs[8].startswith("transcript_id"):
                    gff = False
                    break
                else:
                    gff = None
                    break
            else:
                continue
    return gff

def get_gff3cols() -> list:
    """
    This function returns the column names for a GFF3 file.

    Returns:
    list: A list of column names for a GFF3 file.
    """
    return gff3cols
    
def extract_attributes(attribute_str:str,gff=False)->dict:
    """
    This function extracts attributes from an attribute string. Assumes that the only information passed is the 9th column of the GTF file;
    
    Parameters:
    attribute_str (str): The attribute string to extract attributes from.
    gff (bool, optional): A flag indicating whether the attribute string is from a GFF file. Defaults to False.

    Returns:
    dict: A dictionary of attributes extracted from the attribute string.
    """
    attrs = attribute_str.rstrip().rstrip(";").split(";")
    attrs = [x.strip() for x in attrs]
    attrs = [x.strip("\"") for x in attrs]
    attrs_dict = dict()
    sep = " \""
    if gff:
        sep = "="
    for at in attrs:
        k,v = at.split(sep)
        attrs_dict.setdefault(k,v)
        
    return attrs_dict

def chain_inv(chain:list) -> list:
    """
    This function inverts a chain of intervals, instead returning the intervals that are not in the chain. Potential use cases include finding introns from exons.

    Parameters:
    chain (list): The chain of intervals to invert.

    Returns:
    list: A list of intervals that are not in the input chain.
    """
    if len(chain)<=1:
        return list()
    
    res = []
    for i in range(1,len(chain)):
        res.append((chain[i-1][1],chain[i][0]))
        
    return res

def to_attribute_string(attrs:dict,gff:bool=False,feature_type:str=None)->str:
    """
    This function converts a dictionary of attributes to an attribute string. Guarantees order of essential attributes.

    Parameters:
    attrs (dict): A dictionary of attributes.
    gff (bool, optional): A flag indicating whether to convert to GFF format. Defaults to False.
    feature_type (str, optional): The feature type of the GFF file. Defaults to None.

    Returns:
    str: An attribute string.
    """
    order = ["ID","Parent","transcript_id","gene_id","gene_name","gene_type","db_xref","description","max_TPM","sample_count","assembly_id","tag"]
    res = ""
    sep = " "
    quote = "\""
    end = "; "
    if gff:
        assert feature_type in ["gene","transcript","exon","CDS"],"wrong type: "+str(feature_type)
        sep = "="
        quote = ""
        end = ";"
        
    for k in order:
        if k in attrs:
            if gff:
                assert ";" not in attrs[k],"invalid character in attribute: "+attrs[k]
            
            if gff and feature_type=="gene" and k=="transcript_id":
                continue
            elif gff and feature_type=="gene" and k=="gene_id":
                res+="ID="+quote+attrs[k]+quote+end
            elif gff and feature_type=="transcript" and k=="transcript_id":
                res+="ID="+quote+attrs[k]+quote+end
            elif gff and feature_type=="transcript" and k=="gene_id":
                res+="Parent="+quote+attrs[k]+quote+end
            elif gff and feature_type in ["exon","CDS"] and k=="transcript_id":
                res+="Parent="+quote+attrs[k]+quote+end
            elif gff and feature_type in ["exon","CDS"] and k=="gene_id":
                continue
            else:        
                res+=k+sep+quote+attrs[k]+quote+end
    
    # add any other attributes in sorted order
    for k in sorted(list(attrs)):
        if k not in order:
            if gff:
                assert ";" not in attrs[k],"invalid character in attribute: "+attrs[k]
            res+=k+sep+quote+attrs[k]+quote+end
    
    if not gff:
        res = res.rstrip()
    if gff:
        res = res.rstrip(";")
    return res

def run_gffread(infname:str,outfname:str):
    assert os.path.exists(infname),"input file does not exist: "+infname

    cmd = ["gffread","-T","-F","--cluster-only",
            "-o",outfname,
            infname]

    print("Executing gffread to normalize the input annotation file")
    print(" ".join(cmd))

    proc = subprocess.Popen(cmd,stderr=subprocess.PIPE)

    proc.wait()

def get_seqids_from_gtf(infname:str) -> list:
    assert os.path.exists(infname),"input file does not exist: "+infname

    seqids = set()
    with open(infname,"r") as fp:
        for line in fp:
            if line.startswith("#"):
                continue
            lcs = line.strip().split("\t")
            seqids.add(lcs[0])

    return list(seqids)

def load_attributes_from_gtf(gtf_fname:str, max_values:int) -> dict:
    # if the number of observed values for the attribute is over the max_value - it is treated as variable and values are not stored

    # determine the type of file (GTF or GFF)
    fname_is_gff = is_gff(gtf_fname)
    
    # iterate and extract attributes from all lines (irrespective of the feature type, except exon and CDS).
    # The unnecessary ones will be dealt with after gffread conversion
    # build a giant map of all attributes and their values across all entries in the file

    attributes = dict()

    with open(gtf_fname, 'r') as inFP:
        for line in inFP:
            if line[0] == "#":
                continue
            lcs = line.rstrip().split("\t")
            if not len(lcs) == 9:
                continue

            if lcs[2] in ["exon","CDS"]:
                continue

            attrs = extract_attributes(lcs[8],fname_is_gff)
            # join attrs into the main attributes dictionary
            for k,v in attrs.items():
                attributes.setdefault(k,{"values":set(),"over_max_capacity":False})
                if len(attributes[k]["values"])>max_values:
                    attributes[k]["over_max_capacity"] = True
                    attributes[k]["values"] = set()
                    continue
                if attributes[k]["over_max_capacity"]:
                    attributes[k]["over_max_capacity"] = True
                    attributes[k]["values"] = set()
                    continue
                attributes[k]["values"].add(v)

    return attributes

# reads GTF file (assumes gffreat -T output) and combines all records into transcript structures (one per transcript)
# storing associated exons and cds records
# yields transcripts one by one
def read_gffread_gtf(infname:str):
    assert os.path.exists(infname),"input file does not exist: "+infname
    transcript_lines = [] # lines associated with a transcript
    current_tid = None
    prev_tid = None
    
    with open(infname) as inFP:
        for line in inFP:
            if line[0] == "#":
                continue
            lcs = line.rstrip().split("\t")
            if not len(lcs) == 9:
                continue

            tid = lcs[8].split("transcript_id \"", 1)[1].split("\"", 1)[0]

            if lcs[2]=="transcript":
                to_yield = current_tid is not None
                prev_tid = current_tid
                current_tid = tid
                old_transcript_lines = copy.deepcopy(transcript_lines)
                transcript_lines = [line.rstrip()]
                if to_yield:
                    assert not len(old_transcript_lines)==0,"empty transcript lines for: "+prev_tid
                    yield old_transcript_lines
            else:
                assert tid==current_tid,"records out of order: "+current_tid+" > "+tid
                transcript_lines.append(line.rstrip())

    if current_tid is not None:
        assert not len(transcript_lines)==0,"empty transcript lines for: "+current_tid
        yield transcript_lines 

def convert_gtf_nomenclature(input_gtf:str,output_gtf:str,seqid_map:dict):
    assert os.path.exists(input_gtf),"input file does not exist: "+input_gtf

    with open(input_gtf,"r") as inFP, open(output_gtf,"w") as outFP:
        for line in inFP:
            if line.startswith("#"):
                outFP.write(line)
                continue
            lcs = line.rstrip().split("\t")
            if not len(lcs) == 9:
                continue
            seqid = lcs[0]
            if seqid in seqid_map:
                lcs[0] = seqid_map[seqid]
            outFP.write("\t".join(lcs)+"\n")


def run_gffcompare(query: str, reference: str, outfname: str):
    """
    Run gffcompare to compare query and reference GTF files.
    
    Args:
        query: Path to query GTF file
        reference: Path to reference GTF file
        outfname: Output filename prefix
    """
    assert os.path.exists(query), "query file does not exist: " + query
    assert os.path.exists(reference), "reference file does not exist: " + reference

    cmd = ["gffcompare", "-F",
           "-r", reference,
           "-o", outfname,
           query]

    print("Executing gffcompare to build transcript map")
    print(" ".join(cmd))
   
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE)
    proc.wait()


def run_gffread_gtf_to_gff(gtf_file: str, gff_file: str):
    """
    Convert GTF file to GFF format using gffread.
    
    Args:
        gtf_file: Path to input GTF file
        gff_file: Path to output GFF file
    """
    assert os.path.exists(gtf_file), "GTF file does not exist: " + gtf_file

    cmd = ["gffread", "-F", "--keep-exon-attrs", "-o", gff_file, gtf_file]

    print("Executing gffread to convert GTF to GFF")
    print(" ".join(cmd))
   
    proc = subprocess.Popen(cmd, stderr=subprocess.PIPE)
    proc.wait()

def prepare_source_files_from_gtf(input_gtf_file: str, source_file_base_name: str):
    """
    Generates all files to represent the source annotation in the database.
    
    Args:
        gtf_file: Path to input GTF file
    """

    result = {
        "gtf_file": {
            "file_type": "gtf",
            "file_path": source_file_base_name + ".gtf.gz",
            "description": "GTF file for source version assembly " + source_file_base_name
        },
        "gff_file": {
            "file_type": "gff",
            "file_path": source_file_base_name + ".gff.gz",
            "description": "GFF file for source version assembly " + source_file_base_name
        },
        "sorted_gff_file_bgz": {
            "file_type": "sorted_gff_bgz",
            "file_path": source_file_base_name + ".sorted.gff.gz",
            "description": "Sorted GFF file for source version assembly " + source_file_base_name
        },
        "sorted_gff_file_bgz_tbi": {
            "file_type": "sorted_gff_bgz_tbi",
            "file_path": source_file_base_name + ".sorted.gff.gz.tbi",
            "description": "Tabix index for sorted GFF file for source version assembly " + source_file_base_name
        }
    }

    assert os.path.exists(input_gtf_file), "GTF file does not exist: " + input_gtf_file

    try:
        # Create a gtf_file from the input_gtf_file by compressing it
        gzip_cmd = f"gzip -c {input_gtf_file} > {result['gtf_file']['file_path']}"
        subprocess.run(gzip_cmd, shell=True, check=True)
    except Exception as e:
        raise f"Error creating gtf_file: {e}"

    try:
        # Use the gtf_file to create a gff_file
        run_gffread_gtf_to_gff(input_gtf_file, result["gff_file"]["file_path"].rstrip(".gz"))
    except Exception as e:
        raise f"Error creating gff_file: {e}"

    # Compress the gff_file - no need to keep the original gff_file
    try:
        gzip_cmd = f"gzip -f {result['gff_file']['file_path'].rstrip('.gz')}"
        subprocess.run(gzip_cmd, shell=True, check=True)
    except Exception as e:
        raise f"Error compressing gff_file: {e}"

    # Sort the gff_file
    try:
        base = source_file_base_name
        sort_cmd = f"gffread -F --keep-exon-attrs -o- {input_gtf_file} | sort -t$'\t' -k1,1 -k4,4n > {result['sorted_gff_file_bgz']['file_path'].rstrip('.gz')}"
        subprocess.run(sort_cmd, shell=True, check=True)
    except Exception as e:
        raise f"Error sorting gff_file: {e}"
    
    # Compress the sorted gff_file - no need to keep the original sorted gff_file
    try:
        bgzip_cmd = f"bgzip -f {result['sorted_gff_file_bgz']['file_path'].rstrip('.gz')}"
        subprocess.run(bgzip_cmd, shell=True, check=True)
    except Exception as e:
        raise f"Error compressing sorted gff_file: {e}"

    # Index the sorted gff_file
    try:
        tabix_cmd = f"tabix -p gff {result['sorted_gff_file_bgz']['file_path']}"
        subprocess.run(tabix_cmd, shell=True, check=True)
    except Exception as e:
        raise f"Error indexing sorted gff_file: {e}"

    return result