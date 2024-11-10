#!/usr/bin/env zsh

/home/avaraby1/soft/mysql/mysql-8.4.1-linux-glibc2.28-x86_64/bin/mysql -u root -p --socket=/home/avaraby1/MySQL/socket < ./production/chess.db.schema.mysql.sql
./db_setup.py addOrganisms --configuration ./production/configurations/organisms.json --db_configuration ./production/configurations/mysql.json
./db_setup.py addAssemblies --configuration ./production/configurations/assemblies.json --db_configuration ./production/configurations/mysql.json
./db_setup.py addNomenclatures --configuration ./production/configurations/nomenclatures.json --db_configuration ./production/configurations/mysql.json
./db_setup.py addAttributes --configuration ./production/configurations/attributes.json --db_configuration ./production/configurations/mysql.json
./db_setup.py addSources --configuration ./production/configurations/sources.json --db_configuration ./production/configurations/mysql.json --skipUnknownAttributes --temp ./production/temp --log ./production/log
./db_setup.py compile --db_configuration ./production/configurations/mysql.json
