# contains reusable funcitons used throughout the experiments

import os
import json
import random
import subprocess

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
            
            if lcs[2] not in ["transcript","exon","CDS"]:
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