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
12. instead of defining queries inside functions inside modules - develop and API which can connect to DB and has a set of queries which it knows how to handle (insert record, update record, etc)
13. Need to make sure the attributes are non-redundant. Say 2 sources share an attribute key-value (or are very similar). Should be deduplciate them somehow?
14. Need much better error handling and propagation - for example, if an entry can not be inserted into the dbxref - should remove the corresponding modification to the transcript and elsewhere. Basically, do not commit until sure it is correct. This should be possible to do with the new api interface
15. change the code so that commit is issued after n records are inserted, not after each record. This should speed up the process.
16. build a view containing summary with all data for the initial loading of the website. Is it possible for this table to be recomputed automatically when the underlying data changes?