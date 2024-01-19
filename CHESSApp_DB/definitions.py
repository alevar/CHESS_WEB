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