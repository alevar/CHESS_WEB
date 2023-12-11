import sys

from definitions import *

# declares a transcript class used for parsing data into the database
class TX:
    def __init__(self,transcript_lines:list,seqid_map:dict):
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

        self.from_strlist(transcript_lines,seqid_map)

    def check_valid_transcript_attributes(self,attributes:dict):
        assert "transcript_id" in attributes,"transcript_id attribute not found"
        assert "gene_id" in attributes,"gene_id attribute not found"

    def from_strlist(self,transcript_lines:list,seqid_map:dict):
        tx_lcs = transcript_lines[0].rstrip().split("\t")
        assert tx_lcs[2]=="transcript","wrong record type found when parsing normalized input GTF. Expected type transcript, found type "+tx_lcs[2]+" for record: "+"\n".join(transcript)
        
        self.attributes = extract_attributes(tx_lcs[8],gff=False)
        self.attributes = {k:v.replace("'","\\").replace("\"","\\") for k,v in self.attributes.items()}
        self.check_valid_transcript_attributes(self.attributes)

        self.seqid = tx_lcs[0]
        assert self.seqid in seqid_map,"sequence ID not found in sequence ID map"
        self.seqid = seqid_map[self.seqid]
        self.strand = 1 if tx_lcs[6]=="+" else 0
        self.start = tx_lcs[3]
        self.end = tx_lcs[4]
        self.score = 0 if tx_lcs[5]=="." else tx_lcs[5]

        self.tid = self.attributes["transcript_id"]
        self.gid = self.attributes["gene_id"]

        self.gene_name = self.attributes.get("gene_name",None)
        self.gene_type = self.attributes.get("gene_type",None)

        # get exon chain (and cds if available)
        self.exons = []
        self.cds = (sys.maxsize,0)
        for line in transcript_lines:
            lcs = line.split("\t")
            if lcs[2]=="exon":
                self.exons.append((int(lcs[3]),int(lcs[4])))
            elif lcs[2]=="CDS":
                self.cds = (min(self.cds[0],int(lcs[3])),max(self.cds[1],int(lcs[4])))
            else:
                continue

        # extract introns
        self.introns = chain_inv(self.exons)