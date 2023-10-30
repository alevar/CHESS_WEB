Frontend:
1. When selecting sources - would be really cool to have a dynamic venn diagram or upsetplot
so that when one selects which datasets to include, it automatically shows the overlaps of transcripts
and what subset of the total pool of transcripts will be displayed.


DB:
1. how can we efficiently maintain versions of the same database (chess2.0->2.1->3.0->3.0.1, etc)
2. make sure when running gffread nothing gets deduplicated
3. make sure gffread and gffcomapre do not discard duplicates, also do not merge close exons, etc
4. should we replace annotated.gtf with tracking file instead (or tmap/refmap) to avoid writing a dummy gtf in db is empty?
5. reconcile gene_names, etc.
6. need some integrity checks - run after DB is modified to verify consistency and fill in any missing date. Whenever possible, we can write additional trigers to run on inserts to validate records in various tables.
7. When adding the same source it shouldn't just quit, but check if any information is missing. Only throw an error if some information is inconsistent. This would help avoid situation when something goes wrong and the entire database needs to be redone from scratch.
8. Need to parallelize INSERT and UPDATE queries when adding transcript records to speed up execution.
9. currently many assertions which strongly terminate execution. Need to handle more gracefully on a case-by-case basis.
10. Should we do enums differently? Currently stored as enum type, but what if separated out into a different table?
11. make it so transactions are only committed if the entire operation succeeded (such as adding an entire resource)
12. <DONE> instead of defining queries inside functions inside modules - develop and API which can connect to DB and has a set of queries which it knows how to handle (insert record, update record, etc)
13. Need to make sure the attributes are non-redundant. Say 2 sources share an attribute key-value (or are very similar). Should be deduplciate them somehow?
14. Need much better error handling and propagation - for example, if an entry can not be inserted into the dbxref - should remove the corresponding modification to the transcript and elsewhere. Basically, do not commit until sure it is correct. This should be possible to do with the new api interface
15. change the code so that commit is issued after n records are inserted, not after each record. This should speed up the process.
16. build a view containing summary with all data for the initial loading of the website. Is it possible for this table to be recomputed automatically when the underlying data changes?
17. Ideally, instead of having just Dataset, we could represent an arbitrarily deep sequence of groups, where a dataset can be subdivided into multiple groupings (male vs female, bodysite, histological type etc.). Users should be able to ask for anything in the entire dataset, or select a subset of the data based on the grouping. This would be a very powerful feature, but would require a lot of work to implement. Could we do this by providing an additional table which link two datasetIDs together asigning them to a group? And then we have another table for keeping track of groups themselves. The problem is that this does not scale - we need something that allows us to represent arbitrarily deep hierarchies. This is a very interesting problem, but I am not sure how to solve it. Can we achieve this via self-referencing table design and recursive querying? Should we add individual samples from each dataset? Would be nice but potentially extremely costly on performance to store tens of thousands of observations for each transcript.
18. Need delete functionality (delete source, organism, assembly, dataset, etc)
19. Suppose Transcripts has two transcripts A and B which are almost the same but were not deduplicated by gffcompare/gffread. We try to insert another transcript which matches both. Right now, when parsing the annotated.gtf file only one reference transcript will be reported for each query, thus we will miss the mapping for the second reference transcript. We should consult refmap file to handle them correctly.
20. Need a system to maintain versions of annotations. An additional table which keeps information about the changes in transcripts from one version to another
21. In addition to the transcript and gene types as assigned by the source annotation, we should come up with some automated metric which can be assigned to all transcripts after they've been added to the DB. The simplest case - there exists a group of transcripts under the same gene_id. one or more of the transcripts has CDS. we call gene protein-coding and propagate the label to the transcripts. If transcript has no cds - call non-coding in protein coding.
22. sometimes the same attribute maybe called in slight variations in different sources. For example "lncRNA" vs "lnc_RNA". We should have a table which maps these variations to a single canonical name. This would allow us to do more accurate counting of transcripts by type.
23. Assign transcript type based on the gene type.
24. for now - represent GTEx as a source itself and datasets can be the individual bodysites.
25. polycistronic ..... AAAAAAAAAAAAAAAAAAAAAAA!!!!YYYYYYYYYY!!!!!!!!!!!!
26. can we add an annotate mode? User submits a gtf file and the database compares it and annotates with available info (dbxref for all sources at least, but some attributes as well)
27. Should create a user to be used by the backend. The user should not have any privileges besides reading the data to avoid accidental DB modifications.

Functionality:
1. When we generate a GTF/GFF file, how do we describe which parameters were used? Should we add a comment to the file? or should we also provide a metadata file?
2. Should suggest citations when fetching an annotation depending on which sources are being used so that everyone gets credit. Can be stored in the GTF comments and in the metadatafile.