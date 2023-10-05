#!/usr/bin/env python3

import os
import sys
import copy
import json
import argparse
import subprocess

import mysql.connector

def _addOrganisms(connection, configuration):
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES LIKE 'Organisms'")
    if cursor.fetchone() is None:
        print("Organisms table does not exist.")
        exit(1)
    else:              
        config = None
        with open(configuration, 'r') as configFP:
            config = json.load(configFP)

        for organism,data in config.items():
            scienceName = data["scienceName"]
            commonName = data["commonName"].replace("'","\\'")
            information = data["information"].replace("'","\\'")

            # check if the organism already exists and skip if it does
            cursor.execute(f"SELECT * FROM Organisms WHERE scientificName='{scienceName}'")
            if cursor.fetchone() is not None:
                print(f"Organism {scienceName} already exists.")
                continue

            insert_query = f"INSERT INTO Organisms (scientificName, commonName, information) VALUES ('{scienceName}', '{commonName}', '{information}')"

            cursor.execute(insert_query)
            connection.commit()

def addOrganisms_main(args):
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

            _addOrganisms(connection, args.configuration)

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
    ########   ORGANISM   ########
    ##############################
    parser_addOrganisms=subparsers.add_parser('addOrganisms',
                                        help='addOrganisms help')
    parser_addOrganisms.add_argument('--configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file. Configuration is provided in JSON format. See example in CHESSApp_DB/data/organisms.json')
    parser_addOrganisms.add_argument('--db_configuration',
                              required=True,
                              type=str,
                              help='Path to the configuration file for connecting to the mysql database. Configuration is provided in JSON format. See example in CHESSApp_DB/data/mysql.json')
    parser_addOrganisms.set_defaults(func=addOrganisms_main)
    args=parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main(sys.argv[1:])