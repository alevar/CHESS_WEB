import os

# reusable components

def extract_attributes(attribute_str:str,gff=False)->dict: # extract attribute key values into dictionary
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

# checks whether a file is a GFF file (returns False if file in GTF format)
# uses only transcript_id vs ID= to distinguish between GFF and GTF
def is_gff(fname) -> bool:
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