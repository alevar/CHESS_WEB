#!/usr/bin/env bash

# builds the database and populates it with the data from the example


# clear previous versions. sets up new user and DB. Sets up tables, triggers, etc
sudo mysql -u root < ../chess.db.schema.mysql.sql

# add species information to the DB
python ../addOrganisms.py addOrganisms --configuration ./configurations/example.organisms.json --db_configuration ./configurations/example.mysql.json

# add assembly information to the DB
python ../addAssemblies.py addAssemblies --configuration ./configurations/example.assemblies.json --db_configuration ./configurations/example.mysql.json

# add sources to the DB
python ../addSources.py addSources --configuration ./configurations/example.sources.json --db_configuration ./configurations/example.mysql.json --temp ./temp --log ./addSources.log





