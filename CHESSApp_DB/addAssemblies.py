#!/usr/bin/env python3

import os
import sys
import copy
import json
import argparse
import subprocess

import mysql.connector

def parse_fai(fai_fname:str) -> dict:
    assert os.path.exists(fai_fname),"fai file does not exist"

    fai_dict = {}
    with open(fai_fname, 'r') as fai_fp:
        for line in fai_fp:
            line = line.strip().split('\t')
            fai_dict[line[0]] = int(line[1])
    
    return fai_dict

def _addAssemblies(connection, configuration):
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES LIKE 'Assemblies'")
    if cursor.fetchone() is None:
        print("Assemblies table does not exist.")
        exit(1)
    else:              
        config = None
        with open(configuration, 'r') as configFP:
            config = json.load(configFP)

        for assembly,data in config.items():
            assemblyName = data["name"].replace("'","\\'")
            fai_data = parse_fai(data["fastaIndex"])
            scienceName = data["organismScienceName"]
            link = data["link"]
            information = data["information"].replace("'","\\'")
            nomenclature = data["nomenclature"]

            # check if the assembly already exists and skip if it does
            cursor.execute(f"SELECT * FROM Assemblies WHERE assemblyName='{assemblyName}'")
            if cursor.fetchone() is not None:
                print(f"Assembly {assemblyName} already exists.")
                continue

            insert_query = f"INSERT INTO Assemblies (assemblyName, organismName, link, information) VALUES ('{assemblyName}', '{scienceName}', '{link}', '{information}')"

            cursor.execute(insert_query)
            connection.commit()

            # now also write contig information from the index file into SequenceIDs table
            for contig,length in fai_data.items():
                cursor.execute(f"INSERT INTO SequenceIDs (assemblyName, sequenceID, length, nomenclature) VALUES ('{assemblyName}', '{contig}', {length}, '{nomenclature}')")
                connection.commit()

def establish_connection(args,main_fn):
    assert os.path.exists(args.configuration),"configuration file does not exist"
    assert os.path.exists(args.db_configuration),"database configuration file does not exist"
    
    db_config = None
    with open(args.db_configuration, 'r') as db_configFP:
        db_config = json.load(db_configFP)
    
    try:
        db_host = db_config["CHESSDB_HOST"]
        db_port = db_config["CHESSDB_PORT"]
        db_user = db_config["CHESSDB_USER"]
        db_password = db_config["CHESSDB_PASSWORD"]
        db_name = db_config["CHESSDB_NAME"]
    except KeyError as err:
        print(f"Key {err} not found in database configuration file.")
        exit(1)

    try:
        connection = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )

        if connection.is_connected():
            print("Connected to the database.")

            main_fn(connection, args.configuration)

        else:
            print("Failed to connect to the database.")
            exit(1)
    except mysql.connector.Error as error:
        print("Failed to connect to the database.")
        print(error)
        exit(1)
    finally:
        if connection.is_connected():
            connection.close()
            print("Connection to the database closed.")

    return

def main(args):
    parser = argparse.ArgumentParser(description='''Help Page''')
    subparsers = parser.add_subparsers(help='sub-command help')

    ##############################
    ########   ASSEMBLY   ########
    ##############################
    parser_addAssemblies=subparsers.add_parser('addAssemblies',
                                        help='addAssemblies help')
    parser_addAssemblies.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/assemblies.json')
    parser_addAssemblies.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addAssemblies.set_defaults(func=establish_connection,main_fn=_addAssemblies)
    args=parser.parse_args()
    args.func(args,args.main_fn)


if __name__ == "__main__":
    main(sys.argv[1:])