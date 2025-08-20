import sys

from .utils import *

# declares a transcript class used for parsing data into the database
class TX:
    def __init__(self,transcript_lines:list=None):
        self.seqid = None
        self.strand = None
        self.start = None
        self.end = None
        self.tid = None # not kept in attributes
        self.gene_id = None # not kept in attributes
        self.exons = []
        self.introns = []
        self.cds_start = None
        self.cds_end = None
        self.attributes = None
        self.score = "."
        
        self.transcript_type_key = "transcript_type"
        self.gene_type_key = "gene_type"
        self.gene_name_key = "gene_name"
        self.transcript_type_value = None
        self.gene_type_value = None
        self.gene_name_value = None

        if transcript_lines is not None:
            self.from_strlist(transcript_lines)

    def exons_from_introns(self):
        self.exons = [[self.start,0]]
        for intron in sorted(self.introns):
            assert intron[0] >= self.start and intron[1] <= self.end,"intron not contained in transcript"
            self.exons[-1][1] = intron[0]
            self.exons.append([intron[1],0])
        self.exons[-1][1] = self.end
        return

    def set_required_attributes(self,attributes:dict):
        assert "transcript_id" in attributes,"transcript_id attribute not found"
        assert "gene_id" in attributes,"gene_id attribute not found"
        assert self.gene_name_key is not None,"gene_name_key is not set"
        assert self.gene_type_key is not None,"gene_type_key is not set"
        assert self.transcript_type_key is not None,"transcript_type_key is not set"
        
        if self.gene_name_key not in attributes:
            self.attributes[self.gene_name_key] = "NA"
        if self.gene_type_key not in attributes:
            self.attributes[self.gene_type_key] = "NA"
        if self.transcript_type_key not in attributes:
            self.attributes[self.transcript_type_key] = "NA"

    def from_strlist(self,transcript_lines:list):
        tx_lcs = transcript_lines[0].rstrip().split("\t")
        assert tx_lcs[2]=="transcript","wrong record type found when parsing normalized input GTF. Expected type transcript, found type "+tx_lcs[2]+" for record: "+"\n".join(transcript)
        
        self.attributes = extract_attributes(tx_lcs[8],gff=False)
        self.attributes = {k:v.replace("'","\\'").replace("\"","\\\"") for k,v in self.attributes.items()}
        self.set_required_attributes(self.attributes)

        self.seqid = tx_lcs[0]
        self.strand = 1 if tx_lcs[6]=="+" else 0
        self.start = tx_lcs[3]
        self.end = tx_lcs[4]
        self.score = 0 if tx_lcs[5]=="." else tx_lcs[5]

        self.tid = self.attributes["transcript_id"]
        self.gene_id = self.attributes["gene_id"]

        self.transcript_type_value = self.attributes[self.transcript_type_key]
        self.gene_type_value = self.attributes[self.gene_type_key]
        self.gene_name_value = self.attributes[self.gene_name_key]

        # get exon chain (and cds if available)
        self.exons = []
        cds = (sys.maxsize,0)
        found_cds = False
        for line in transcript_lines:
            lcs = line.split("\t")
            if lcs[2]=="exon":
                self.exons.append((int(lcs[3]),int(lcs[4])))
            elif lcs[2]=="CDS":
                cds = (min(cds[0],int(lcs[3])),max(cds[1],int(lcs[4])))
                found_cds = True
            else:
                continue

        if found_cds:
            self.cds_start,self.cds_end = cds

        # extract introns
        self.introns = chain_inv(self.exons)

    def to_gtf(self):
        """
        This function returns a GTF record for this transcript.

        Returns:
        str: A GTF record for this transcript.
        """
        gtf = "\t".join([self.seqid,"db","transcript",str(self.start),str(self.end),str(self.score),self.strand,".","transcript_id \""+str(self.tid)+"\";"])
        for exon in self.exons:
            gtf += "\n"+"\t".join([self.seqid,"db","exon",str(exon[0]),str(exon[1]),str(self.score),self.strand,".","transcript_id \""+str(self.tid)+"\";"])
        return gtf