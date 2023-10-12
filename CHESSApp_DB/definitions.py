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



class TX:
    def __init__(self,transcript_lines:list):
        self.seqid = None
        self.strand = None
        self.start = None
        self.end = None
        self.tid = None # not kept in attributes
        self.gid = None # not kept in attributes
        self.exons = None
        self.cds = None
        self.attributes = None
        self.gene_name = None # not kept in attributes
        self.gene_type = None # not kept in attributes
        self.transcript_type = None # not kept in attributes
        self.score = None

        self.from_strlist(transcript_lines)

    def check_valid_transcript_attributes(self,attributes:dict):
        assert "transcript_id" in attributes,"transcript_id attribute not found"
        assert "gene_id" in attributes,"gene_id attribute not found"

    def from_strlist(self,transcript_lines:list):
        tx_lcs = transcript_lines[0].rstrip().split("\t")
        assert tx_lcs[2]=="transcript","wrong record type found when parsing normalized input GTF. Expected type transcript, found type "+tx_lcs[2]+" for record: "+"\n".join(transcript)
        
        self.attributes = extract_attributes(tx_lcs[8],gff=False)
        self.attributes = {k:v.replace("'","\\").replace("\"","\\") for k,v in self.attributes.items()}
        self.check_valid_transcript_attributes(self.attributes)

        self.seqid = tx_lcs[0]
        self.strand = 1 if tx_lcs[6]=="+" else 0
        self.start = tx_lcs[3]
        self.end = tx_lcs[4]
        self.score = 0 if tx_lcs[5]=="." else tx_lcs[5]

        self.tid = self.attributes["transcript_id"]
        self.gid = self.attributes["gene_id"]

        self.gene_name = self.attributes.get("gene_name",None)
        self.gene_type = self.attributes.get("gene_type",None)

        # get exon chain (and cds if available)
        self.exons = ""
        self.cds = ""
        for line in transcript_lines:
            lcs = line.split("\t")
            if lcs[2]=="exon":
                self.exons += lcs[3]+"-"+lcs[4]+","
            elif lcs[2]=="CDS":
                self.cds += lcs[3]+"-"+lcs[4]+","
            else:
                continue
        # remove trailing comma
        self.exons = self.exons.rstrip(",")
        self.cds = self.cds.rstrip(",")