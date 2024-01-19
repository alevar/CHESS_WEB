import sys

from definitions import *

# declares a transcript class used for parsing data into the database
class TX:
    def __init__(self,transcript_lines:list=None,seqid_map:dict=None):
        self.seqid = None
        self.strand = None
        self.start = None
        self.end = None
        self.tid = None # not kept in attributes
        self.gid = None # not kept in attributes
        self.exons = []
        self.introns = []
        self.cds_start = None
        self.cds_end = None
        self.attributes = None
        self.score = "."
        
        self.transcript_type_value = None
        self.gene_type_value = None
        self.gene_name_value = None

        if transcript_lines is not None and seqid_map is not None:
            self.from_strlist(transcript_lines,seqid_map)

    def exons_from_introns(self):
        self.exons = [[self.start,0]]
        for intron in sorted(self.introns):
            assert intron[0] >= self.start and intron[1] <= self.end,"intron not contained in transcript"
            self.exons[-1][1] = intron[0]
            self.exons.append([intron[1],0])
        self.exons[-1][1] = self.end
        return

    def check_valid_transcript_attributes(self,attributes:dict):
        assert "transcript_id" in attributes,"transcript_id attribute not found"
        assert "gene_id" in attributes,"gene_id attribute not found"
        assert "gene_name" in attributes,"gene_name attribute not found"
        assert "transcript_name" in attributes,"transcript_name attribute not found"
        assert "gene_type" in attributes,"gene_type attribute not found"

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

        self.transcript_type_value = self.attributes["transcript_type"]
        self.gene_type_value = self.attributes["gene_type"]
        self.gene_name_value = self.attributes["gene_name"]

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