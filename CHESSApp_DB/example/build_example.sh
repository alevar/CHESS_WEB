#!/usr/bin/env bash

# builds the database and populates it with the data from the example


# clear previous versions. sets up new user and DB. Sets up tables, triggers, etc
mysql -u root -p < ./data/chess.db.schema.mysql.sql

# add species information to the DB
python ./db_setup.py addOrganisms --configuration ./example/configurations/example.organisms.json --db_configuration ./example/configurations/example.mysql.json

# add assembly information to the DB
python ./db_setup.py addAssemblies --configuration ./example/configurations/example.assemblies.json --db_configuration ./example/configurations/example.mysql.json

# add nomenclatures to the DB
python ./db_setup.py addNomenclatures --configuration ./example/configurations/example.nomenclatures.json --db_configuration ./example/configurations/example.mysql.json

# add attribute configuration to the DB
python ./db_setup.py addAttributes --configuration ./example/configurations/example.attributes.json --db_configuration ./example/configurations/example.mysql.json

# add sources to the DB
python ./db_setup.py addSources --configuration ./example/configurations/example.sources.json --db_configuration ./example/configurations/example.mysql.json --temp ./example/temp --log ./example/log --skipUnknownAttributes

# build auxilary tables
python ./db_setup.py compile --db_configuration ./example/configurations/example.mysql.json

