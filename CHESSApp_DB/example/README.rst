faidx ~/genomicData/hg38/hg38_p12_ucsc.fa chr18 chr19 > ./HomoSapiens/GRCh38/grch38.18.19.fa
samtools faidx ./HomoSapiens/GRCh38/grch38.18.19.fa
awk -F'\t' '$1=="chr18" || $1=="chr19"' ~/genomicData/hg38/annotations/MANE.v10.gtf > ./HomoSapiens/GRCh38/MANE.v10.18.19.gtf
awk -F'\t' '$1=="chr18" || $1=="chr19"' ~/genomicData/hg38/annotations/refseq.gtf > ./HomoSapiens/GRCh38/refseq.18.19.gtf
awk -F'\t' '$1=="chr18" || $1=="chr19"' ~/genomicData/hg38/annotations/gencode.v41.gtf > ./HomoSapiens/GRCh38/gencode.v41.18.19.gtf
awk -F'\t' '$1=="chr18" || $1=="chr19"' ~/genomicData/hg38/annotations/chess3.0.gtf > ./HomoSapiens/GRCh38/chess3.0.grch38.18.19.gtf
awk -F'\t' '$1=="chr18" || $1=="chr19"' ~/genomicData/chm13/chess3.0.1.CHM13.gtf > ./HomoSapiens/CHM13/chess3.0.1.CHM13.18.19.gtf
faidx ~/genomicData/chm13/chm13v2.0.fa chr18 chr19 > ./HomoSapiens/CHM13/chm13.18.19.fa
samtools faidx ./HomoSapiens/CHM13/chm13.18.19.fa
notebooks/test.ipynb

