from prettytable import PrettyTable
import textwrap
import re

import api

# class to hold information and mappings for all attributes in the database
# the class will have user inputs, interactions, updates to the attributes, etc
class AttributeManagementSystem:
    def __init__(self,db_connection:api.CHESS_DB_API):
        self.dbcon = db_connection
        # retrieve all attribute information from the database
        self.db_info = self.dbcon.get_attribute_information()
        # get map of all keys to their standard names
        self.key_og2std = dict()
        self.key_std2og = dict()
        self.val_og2std = dict()
        self.val_std2og = dict()
        for k,v in self.db_info.items():
            self.val_og2std[k] = dict()
            self.val_std2og[k] = dict()
            
            # process keys
            for k_syn in v["synonyms"]:
                self.key_og2std[k_syn] = k
                self.key_std2og.setdefault(k,set()).add(k_syn)
            
            # process values
            for val,synonyms in v["values"].items():
                for v_syn in synonyms:
                    self.val_og2std[k][v_syn] = val
                    self.val_std2og[k].setdefault(val,set()).add(v_syn)


        # running variables
        self.commands = [] # list of SQL queries to be executed to sync the database with the changes made by the user
        self.prev_state = self.key_state
        self.next_state = self.key_state
        self.user_input = None
        self.order = None
        self.selected_key = None
        self.selected_value = None
        self.selected_synonym = None


        # table formatting options
        self.width = 100
        
        # attribute resolution
        self.to_resolve_stack = [] # stack of keys linked to sets of values to be resolved
        # the resolution prompt will pop the top of the stack and present the user with resolution strategies
    
    
    def prompt(self):
        while self.next_state():
            continue
        return
            

##############################################################################################################
# General Functions
##############################################################################################################
    def wrap_text(self,text, width=20):
        return textwrap.fill(text, width)
    
    def print_keys(self):
        table = PrettyTable()
        table.field_names = ["#", "Key", "Synonyms", "Variable"]

        order = dict()
        for idx, (key, value) in enumerate(self.db_info.items(), 1):
            order[idx] = key
            table.add_row([idx, key, self.wrap_text(", ".join(value['synonyms']), width=self.width), value['variable']],divider=True)

        print(table)
        return order

    def print_values_for_key(self, selected_key):
        if selected_key in self.db_info:
            values_info = self.db_info[selected_key]["values"]
            table = PrettyTable()
            table.title = f"Values for Key '{selected_key}'"
            table.field_names = ["#","Value", "Synonyms"]

            order = dict()
            for idx, (val, synonyms) in enumerate(values_info.items(), 1):
                order[idx] = val
                table.add_row([idx, val, self.wrap_text(", ".join(synonyms),width=self.width)],divider=True)

            print(table)
            return order
        
    def print_list(self, list, title):
        table = PrettyTable()
        table.title = title
        table.field_names = ["#", "Value"]

        order = dict()
        for idx, val in enumerate(list, 1):
            order[idx] = val
            table.add_row([idx, self.wrap_text(val, width=self.width)],divider=True)

        print(table)
        return order
    


##############################################################################################################
# Input Matching
##############################################################################################################
    def match_input(self, user_input):
        #+++++++++++++++++++++++++++++++++++
        # SWITCH TO VALUE TABLE
        #+++++++++++++++++++++++++++++++++++
        if (res := re.match(r"^\d+v$", user_input)): # match a number
            idx = int(res.group()[:-1])
            if not (idx >= 1 and idx <= max(self.order)): # check if the number is in the range of the keys
                return None
            
            if self.prev_state == self.key_state:
                self.selected_key = self.order[idx]
                self.prev_state = self.value_state
                self.next_state =  self.value_state
                return True
            else:
                return None
        #+++++++++++++++++++++++++++++++++++
        # MAIN MENU
        #+++++++++++++++++++++++++++++++++++
        elif user_input == "m":
            self.prev_state = self.key_state
            self.next_state = self.key_state
            return True
        #+++++++++++++++++++++++++++++++++++
        # SWITCH TO SYNONYM TABLE
        #+++++++++++++++++++++++++++++++++++
        if (res := re.match(r"^\d+s$", user_input)): # match a number
            idx = int(res.group()[:-1])
            if not (idx >= 1 and idx <= max(self.order)): # check if the number is in the range of the keys
                return None
            
            if self.prev_state == self.key_state:
                self.selected_key = self.order[idx]
                self.prev_state = self.key_synonym_state
                self.next_state =  self.key_synonym_state
                return True
            elif self.prev_state == self.value_state:
                self.selected_value = self.order[idx]
                self.prev_state = self.value_synonym_state
                self.next_state = self.value_synonym_state
                return True
            else:
                return None
        #+++++++++++++++++++++++++++++++++++
        # SAVE
        #+++++++++++++++++++++++++++++++++++
        elif user_input == "s":
            self.next_state = self.save_changes
            return True
        #+++++++++++++++++++++++++++++++++++
        # QUIT
        #+++++++++++++++++++++++++++++++++++
        elif user_input == "q":
            self.next_state = self.quit_state
            return True
        #+++++++++++++++++++++++++++++++++++
        # ADD ENTRY
        #+++++++++++++++++++++++++++++++++++
        elif user_input == "a":
            if self.prev_state == self.key_synonym_state:
                self.next_state = self.key_synonym_add_state
                return True
            elif self.prev_state == self.value_state:
                self.next_state = self.value_add_state
                return True
            elif self.prev_state == self.key_state:
                self.next_state = self.key_add_state
                return True
            elif self.prev_state == self.value_synonym_state:
                self.next_state = self.value_synonym_add_state
                return True
            else:
                return None
        #+++++++++++++++++++++++++++++++++++
        # REMOVE ENTRY
        #+++++++++++++++++++++++++++++++++++
        elif (res := re.match(r"^r\d+$",user_input)):
            idx = int(res.group()[1:])
            if not (idx >= 1 and idx <= max(self.order)): # check if the number is in the range of the keys
                return None
            
            if self.prev_state == self.key_state:
                self.selected_key = self.order[idx]
                self.next_state =  self.key_remove_state
                return True
            elif self.prev_state == self.value_state:
                self.selected_value = self.order[idx]
                self.next_state = self.value_remove_state
                return True
            elif self.prev_state == self.key_synonym_state:
                self.selected_synonym = self.order[idx]
                self.next_state = self.key_synonym_remove_state
                return True
            elif self.prev_state == self.value_synonym_state:
                self.selected_synonym = self.order[idx]
                self.next_state = self.value_synonym_remove_state
                return True
            else:
                return None
        #+++++++++++++++++++++++++++++++++++
        # RENAME ENTRY
        #+++++++++++++++++++++++++++++++++++
        elif (res := re.match(r'^n\d+$',user_input)):
            idx = int(res.group()[1:])
            if not (idx >= 1 and idx <= max(self.order)): # check if the number is in the range of the keys
                return None
            
            if self.prev_state == self.key_state:
                self.selected_key = self.order[idx]
                self.next_state =  self.key_rename_state
                return True
            elif self.prev_state == self.value_state:
                self.selected_value = self.order[idx]
                self.next_state = self.value_rename_state
                return True
            else:
                return None
        else:
            print("Invalid choice. Please enter a valid option.")


    
##############################################################################################################
# States
##############################################################################################################

    def quit_state(self):
        return False
    
    def execute_and_commit(self):
        for query in self.commands:
            self.dbcon.execute_query(query)
        self.dbcon.commit(force=True)
        self.commands = []
    
    def save_changes(self):
        # present a list of changes to the user for review and ask for confirmation to execute and commit
        if len(self.commands) == 0:
            print("No changes to commit.")
        else:
            print("The following changes will be made to the database:")
            for query in self.commands:
                print(query)
            confirmation = input("Press 'y' to accept changes, any other key to cancel:")
            
            if confirmation.lower() == 'y':
                self.execute_and_commit()
                print("Changes committed successfully.")

        self.next_state = self.prev_state
        return True


#+++++++++++++++++++++++++++++++++++
# Key State
#+++++++++++++++++++++++++++++++++++
    def key_state(self):
        options = """
Options:
> '#v' - Enter value table (e.g., '3v')
> '#s' - Enter synonyms table (e.g., '3s')
> 'm' - Main menu
> 'q' - Quit
> 'r#' - Remove entry (e.g., 'r3')
> 'n#' - Rename entry (e.g., 'n3')
> 'a' - Add new entry
> 's' - Save changes
"""

        # Whenever we get to this point - reset values before returning
        self.selected_key = None
        self.selected_value = None
        self.selected_synonym = None

        res = None
        while res is None:
            print("Current Keys:")
            self.order = self.print_keys()
            print(options)
            self.user_input = input("Enter your choice: ")
            res = self.match_input(self.user_input)
            if res is None:
                print("Invalid choice. Please enter a valid option.")

        return True

    #===================
    # Add Key
    #===================
    def key_add_state(self):
        # return to previous state
        self.next_state = self.prev_state

        self.user_input = input("Provide name for the new entry: ")
        new_name = self.user_input
        self.user_input = input("Is the new entry variable? (y/n): ")
        variable = 1 if self.user_input.lower() == 'y' else 0

        if new_name in self.db_info:
            print("New name already exists. No changes made.")
        else:
            description = input("Please describe the new entry: ")
            print(f"Adding new entry '{new_name}'.")
            confirmation = input("Press 'y' to accept changes, any other key to cancel: ")
            if confirmation.lower() == 'y':
                # update key
                query = f'INSERT INTO AttributeKey (key_name, variable, description) VALUES ("{new_name}","{variable}","{description}")'
                self.commands.append(query)
                query = f'INSERT INTO AttributeKeyMap (std_key, og_key) VALUES ("{new_name}","{new_name}")'

                # update dictionaries
                self.key_og2std[new_name] = new_name
                self.key_std2og[new_name] = set([new_name])
                self.val_og2std[new_name] = dict()
                self.val_std2og[new_name] = dict()
                self.db_info[new_name] = {
                    "synonyms": set([new_name]),
                    "variable": variable,
                    "values": dict()
                }

                print(f"Entry '{new_name}' added successfully.")
        
        return True
    
    #===================
    # Rename Key
    #===================
    def key_rename_state(self):
        # return to previous state
        self.next_state = self.prev_state

        self.user_input = input("Provide new name for the entry: ")
        new_name = self.user_input
        if new_name == self.selected_key:
            print("New name is the same as the old name. No changes made.")
        elif new_name in self.db_info:
            print("New name already exists. No changes made.")
        else:
            print(f"Renaming '{self.selected_key}' to '{new_name}'.")
            confirmation = input("Press 'y' to accept changes, any other key to cancel:")
            if confirmation.lower() == 'y':
                # update key
                query = f'UPDATE AttributeKey SET key_name = "{new_name}" WHERE key_name = "{self.selected_key}"'
                self.commands.append(query)
                # add old key to synonyms of new key
                if not self.selected_key in self.key_og2std:
                    query = f'INSERT INTO AttributeKeyMap (std_key, og_key) VALUES ("{new_name}","{self.selected_key}")'
                    self.commands.append(query)

                # update dictionaries
                # get list of synonyms for selected_key
                synonyms = self.key_std2og[self.selected_key]
                # rename synonym mappings
                for syn in synonyms:
                    del self.key_og2std[syn]
                    self.key_og2std[syn] = new_name
                self.key_std2og[new_name] = self.key_std2og[self.selected_key]
                self.key_std2og[new_name].add(self.selected_key)
                del self.key_std2og[self.selected_key]
                self.val_og2std[new_name] = self.val_og2std[self.selected_key]
                del self.val_og2std[self.selected_key]
                self.val_std2og[new_name] = self.val_std2og[self.selected_key]
                del self.val_std2og[self.selected_key]

                self.db_info[new_name] = self.db_info[self.selected_key]
                self.db_info[new_name]["synonyms"].add(self.selected_key)
                del self.db_info[self.selected_key]

                print(f"Entry '{self.selected_key}' renamed to '{new_name}' successfully.")

        return True

    #===================
    # Remove Key
    #===================
    def key_remove_state(self):
        # return to previous state
        self.next_state = self.prev_state

        print("Removing entry: " + self.selected_key)
        confirmation = input("Press 'y' to accept changes, any other key to cancel:")
        if confirmation.lower() == 'y':
            # update key
            query = f'DELETE FROM AttributeKey WHERE key_name = "{self.selected_key}"'
            self.commands.append(query)
            # update dictionaries
            # get list of synonyms for selected_key
            synonyms = self.key_std2og[self.selected_key]
            # remove synonym mappings
            for syn in synonyms:
                del self.key_og2std[syn]
            del self.key_std2og[self.selected_key]
            del self.val_og2std[self.selected_key]
            del self.val_std2og[self.selected_key]
            del self.db_info[self.selected_key]

            print(f"Entry '{self.selected_key}' removed successfully.")
            
        return True


    #+++++++++++++++++++++++++++++++
    # Key Synonym State
    #+++++++++++++++++++++++++++++++
    def key_synonym_state(self):
        options = """
Options:
> 'm' - Main menu
> 'q' - Quit
> 'r#' - Remove synonym (e.g., 'r3')
> 'a' - Add synonym
> 's' - Save changes
"""
        
        # Whenever we get to this point - reset values before returning
        self.selected_value = None
        self.selected_synonym = None

        res = None
        while res is None:
            print("Synonyms for entry: " + self.selected_key)
            self.order = self.print_list(self.key_std2og[self.selected_key],self.selected_key)
            print(options)
            self.user_input = input("Enter your choice: ")
            res = self.match_input(self.user_input)
            if res is None:
                print("Invalid choice. Please enter a valid option.")

        return True

    #===================
    # Add Key Synonym
    #===================
    def key_synonym_add_state(self):
        # return to previous state
        self.next_state = self.prev_state

        self.user_input = input("Provide new synonym for the entry: ")
        new_synonym = self.user_input
        if new_synonym in self.key_og2std:
            print("Synonym already exists. No changes made.")
        else:
            print(f"Adding new synonym '{new_synonym}' to entry '{self.selected_key}'.")
            confirmation = input("Press 'y' to accept changes, any other key to cancel: ")
            if confirmation.lower() == 'y':
                # update key
                query = f'INSERT INTO AttributeKeyMap (std_key, og_key) VALUES ("{self.selected_key}","{new_synonym}")'
                self.commands.append(query)

                # update dictionaries
                self.key_og2std[new_synonym] = self.selected_key
                self.key_std2og[self.selected_key].add(new_synonym)
                self.db_info[self.selected_key]["synonyms"].add(new_synonym)

                print(f"Synonym '{new_synonym}' added successfully.")
            
        return True
        
    #===================
    # Remove Key Synonym
    #===================
    def key_synonym_remove_state(self):
        # return to previous state
        self.next_state = self.prev_state

        print(f"Removing synonym '{self.selected_key}' from entry '{self.selected_key}'.")
        confirmation = input("Press 'y' to accept changes, any other key to cancel: ")
        if confirmation.lower() == 'y':
            # update key
            query = f'DELETE FROM AttributeKeyMap WHERE std_key = "{self.selected_key}" AND og_key = "{self.selected_key}"'
            self.commands.append(query)

            # update dictionaries
            del self.key_og2std[self.selected_key]
            self.key_std2og[self.selected_key].remove(self.selected_key)
            self.db_info[self.selected_key]["synonyms"].remove(self.selected_key)

            print(f"Synonym '{self.selected_key}' removed successfully.")

            # check if the synonym was the last one for the key and add a new synonym same as key if it was to maintain consistency
            if len(self.key_std2og[self.selected_key]) == 0:
                print(f"Synonym '{self.selected_key}' was the last synonym for entry '{self.selected_key}'. Adding new synonym '{self.selected_key}' to maintain consistency.")
                query = f'INSERT INTO AttributeKeyMap (std_key, og_key) VALUES ("{self.selected_key}","{self.selected_key}")'
                self.commands.append(query)
                self.key_og2std[self.selected_key] = self.selected_key
                self.key_std2og[self.selected_key].add(self.selected_key)
                self.db_info[self.selected_key]["synonyms"].add(self.selected_key)
                print(f"Synonym '{self.selected_key}' added successfully.")
            
        return True


    #+++++++++++++++++++++++++++++++++++
    # Value State
    #+++++++++++++++++++++++++++++++++++
    def value_state(self):
        options = """
    Options:
    > '#s' - Enter synonyms table (e.g., '3s')
    > 'm' - Main menu
    > 'q' - Quit
    > 'r#' - Remove entry (e.g., 'r3')
    > 'n#' - Rename entry (e.g., 'n4')
    > 'a' - Add new entry
    > 's' - Save changes
    """
        # Whenever we get to this point - reset values before returning
        self.selected_value = None
        self.selected_synonym = None

        res = None
        while res is None:
            print("Synonyms for entry: " + self.selected_key)
            self.order = self.print_values_for_key(self.selected_key)
            print(options)
            self.user_input = input("Enter your choice: ")
            res = self.match_input(self.user_input)
            if res is None:
                print("Invalid choice. Please enter a valid option.")

        return True

    #===================
    # Add Value
    #===================
    def value_add_state(self):
        # return to previous state
        self.next_state = self.prev_state

        self.user_input = input("Provide name for the new entry: ")
        new_name = self.user_input
        if new_name in self.db_info[self.selected_key]["values"]:
            print("New name already exists. No changes made.")
        else:
            print(f"Adding new entry '{new_name}' to key '{self.selected_key}'.")
            confirmation = input("Press 'y' to accept changes, any other key to cancel: ")
            if confirmation.lower() == 'y':
                # update key
                query = f'INSERT INTO AttributeValue (key_name, value_name) VALUES ("{self.selected_key}","{new_name}")'
                self.commands.append(query)

                # update dictionaries
                self.val_og2std[self.selected_key][new_name] = new_name
                self.val_std2og[self.selected_key].setdefault(new_name,set()).add(new_name)
                self.db_info[self.selected_key]["values"][new_name] = set([new_name])

                print(f"Entry '{new_name}' added successfully.")
        
        return True
    
    #===================
    # Rename Value
    #===================
    def value_rename_state(self):
        # return to previous state
        self.next_state = self.prev_state

        self.user_input = input("Provide new name for the entry: ")
        new_name = self.user_input
        if new_name == self.selected_value:
            print("New name is the same as the old name. No changes made.")
        elif new_name in self.db_info[self.selected_key]["values"]:
            print("New name already exists. No changes made.")
        else:
            print(f"Renaming '{self.selected_value}' to '{new_name}'.")
            confirmation = input("Press 'y' to accept changes, any other key to cancel:")
            if confirmation.lower() == 'y':
                # update key
                query = f'UPDATE AttributeValue SET value_name = "{new_name}" WHERE key_name = "{self.selected_key}" AND value_name = "{self.selected_value}"'
                self.commands.append(query)
                # add old key to synonyms of new key
                if not self.selected_value in self.val_og2std[self.selected_key]:
                    query = f'INSERT INTO AttributeValueMap (key_name, std_value, og_value) VALUES ("{self.selected_key}","{new_name}","{self.selected_value}")'
                    self.commands.append(query)

                # update dictionaries
                # get list of synonyms for selected_key
                synonyms = self.val_std2og[self.selected_key][self.selected_value]
                # rename synonym mappings
                for syn in synonyms:
                    del self.val_og2std[self.selected_key][syn]
                    self.val_og2std[self.selected_key][syn] = new_name
                self.val_std2og[self.selected_key][new_name] = self.val_std2og[self.selected_key][self.selected_value]
                self.val_std2og[self.selected_key][new_name].add(self.selected_value)
                del self.val_std2og[self.selected_key][self.selected_value]
                self.db_info[self.selected_key]["values"][new_name] = self.db_info[self.selected_key]["values"][self.selected_value]
                del self.db_info[self.selected_key]["values"][self.selected_value]

                print(f"Entry '{self.selected_value}' renamed to '{new_name}' successfully.")

        return True
        
    #===================
    # Remove Value
    #===================
    def value_remove_state(self):
        # return to previous state
        self.next_state = self.prev_state

        print("Removing entry: " + self.selected_value)
        confirmation = input("Press 'y' to accept changes, any other key to cancel:")
        if confirmation.lower() == 'y':
            # update key
            query = f'DELETE FROM AttributeValue WHERE key_name = "{self.selected_key}" AND value_name = "{self.selected_value}"'
            self.commands.append(query)
            # update dictionaries
            # get list of synonyms for selected_key
            synonyms = self.val_std2og[self.selected_key][self.selected_value]
            # remove synonym mappings
            for syn in synonyms:
                del self.val_og2std[self.selected_key][syn]
            del self.val_std2og[self.selected_key][self.selected_value]
            del self.db_info[self.selected_key]["values"][self.selected_value]

            print(f"Entry '{self.selected_value}' removed successfully.")
            
        return True
    
    #+++++++++++++++++++++++++++++++
    # Value Synonym State
    #+++++++++++++++++++++++++++++++
    def value_synonym_state(self):
        options = """
Options:
> 'm' - Main menu
> 'q' - Quit
> 'r#' - Remove synonym (e.g., 'r3')
> 'a' - Add synonym
> 's' - Save changes
"""

        # Whenever we get to this point - reset values before returning
        self.selected_synonym = None

        res = None
        while res is None:
            print("Synonyms for entry: " + self.selected_key)
            self.order = self.print_list(self.val_std2og[self.selected_key][self.selected_value],self.selected_value)
            print(options)
            self.user_input = input("Enter your choice: ")
            res = self.match_input(self.user_input)
            if res is None:
                print("Invalid choice. Please enter a valid option.")

        return True

    #===================
    # Add Value Synonym
    #===================
    def value_synonym_add_state(self):
        # return to previous state
        self.next_state = self.prev_state

        self.user_input = input("Provide new synonym for the entry: ")
        new_synonym = self.user_input
        if new_synonym in self.val_og2std[self.selected_key]:
            print("Synonym already exists. No changes made.")
        else:
            print(f"Adding new synonym '{new_synonym}' to entry '{self.selected_value}'.")
            confirmation = input("Press 'y' to accept changes, any other key to cancel: ")
            if confirmation.lower() == 'y':
                # update key
                query = f'INSERT INTO AttributeValueMap (key_name, std_value, og_value) VALUES ("{self.selected_key}","{self.selected_value}","{new_synonym}")'
                self.commands.append(query)

                # update dictionaries
                self.val_og2std[self.selected_key][new_synonym] = self.selected_value
                self.val_std2og[self.selected_key][self.selected_value].add(new_synonym)
                self.db_info[self.selected_key]["values"][self.selected_value].add(new_synonym)

                print(f"Synonym '{new_synonym}' added successfully.")
            
        return True
        
    #===================
    # Remove Value Synonym
    #===================
    def value_synonym_remove_state(self):
        # return to previous state
        self.next_state = self.prev_state

        print(f"Removing synonym '{self.selected_value}' from entry '{self.selected_value}'.")
        confirmation = input("Press 'y' to accept changes, any other key to cancel: ")
        if confirmation.lower() == 'y':
            # update key
            query = f'DELETE FROM AttributeValueMap WHERE key_name = "{self.selected_key}" AND std_value = "{self.selected_value}" AND og_value = "{self.selected_value}"'
            self.commands.append(query)

            # update dictionaries
            del self.val_og2std[self.selected_key][self.selected_value]
            self.val_std2og[self.selected_key][self.selected_value].remove(self.selected_value)
            self.db_info[self.selected_key]["values"][self.selected_value].remove(self.selected_value)

            print(f"Synonym '{self.selected_value}' removed successfully.")

            # check if the synonym was the last one for the key and add a new synonym same as key if it was to maintain consistency
            if len(self.val_std2og[self.selected_key][self.selected_value]) == 0:
                print(f"Synonym '{self.selected_value}' was the last synonym for entry '{self.selected_value}'. Adding new synonym '{self.selected_value}' to maintain consistency.")
                query = f'INSERT INTO AttributeValueMap (key_name, std_value, og_value) VALUES ("{self.selected_key}","{self.selected_value}","{self.selected_value}")'
                self.commands.append(query)
                self.val_og2std[self.selected_key][self.selected_value] = self.selected_value
                self.val_std2og[self.selected_key][self.selected_value].add(self.selected_value)
                self.db_info[self.selected_key]["values"][self.selected_value].add(self.selected_value)
                print(f"Synonym '{self.selected_value}' added successfully.")
            
        return True
    

    ##############################################################################################################
    # API Functions
    ##############################################################################################################
    def check_key(self,key):
        # checks if key exists in the database
        if key in self.db_info: # is key
            return key
        if key in self.key_og2std: # is synonym
            return self.key_og2std[key]

        return None
        
    def check_value(self,key,value):
        # checks if value exists in the database
        if self.db_info[key]["variable"] == 1:
            return ""
        if value in self.db_info[key]["values"]:
            return value
        if value in self.val_og2std[key]:
            return self.val_og2std[key][value]
        
        return None
        
    def add_key(self,key,variable,description):
        # checks if key already exists, if not - prompts user to insert as a synonym into existing key
        # or create a new entry

        # check if key already exists
        if key in self.db_info:
            print(f"Key '{key}' already exists.")
            # make sure variable matches
            assert variable == self.db_info[key]["variable"], f"Variable for key '{key}' does not match variable for key '{self.key_og2std[key]}' in the database."
            return key
        else:
            # check if key is a synonym for another key
            if key in self.key_og2std:
                print(f"Key '{key}' is a synonym for key '{self.key_og2std[key]}'.")
                # make sure variable matches
                assert variable == self.db_info[self.key_og2std[key]]["variable"], f"Variable for key '{key}' does not match variable for key '{self.key_og2std[key]}' in the database."
                return self.key_og2std[key]
            else:
                # insert new key
                query = f'INSERT INTO AttributeKey (key_name, variable, description) VALUES ("{key}","{variable}","{description}")'
                self.commands.append(query)
                query = f'INSERT INTO AttributeKeyMap (std_key, og_key) VALUES ("{key}","{key}")'
                self.commands.append(query)

                # update dictionaries
                self.key_og2std[key] = key
                self.key_std2og.setdefault(key,set()).add(key)
                self.val_og2std[key] = dict()
                self.val_std2og[key] = dict()
                self.db_info[key] = {
                    "synonyms": set([key]),
                    "variable": variable,
                    "values": dict()
                }

                return key
    
    def add_key_synonym(self,key,synonym):
        assert key in self.db_info, f"Key '{key}' does not exist."
        # check if key already exists
        if synonym in self.db_info:
            print(f"Synonym '{synonym}' is already a key.")
            return key
        else:
            # check if synonym already exists
            if synonym in self.key_og2std:
                print(f"Synonym '{synonym}' already exists for key '{key}'.")
                return key
            else:
                # insert new synonym
                query = f'INSERT INTO AttributeKeyMap (std_key, og_key) VALUES ("{key}","{synonym}")'
                self.commands.append(query)

                # update dictionaries
                self.key_og2std[synonym] = key
                self.key_std2og[key].add(synonym)
                self.db_info[key]["synonyms"].add(synonym)
                return key
            
    def add_value(self,key,value):
        assert key in self.db_info, f"Key '{key}' does not exist."
        
        # check if key is variable or not. If variable - then return empty string
        if self.db_info[key]["variable"] == 1:
            print(f"Key '{key}' is variable. Cannot add value.")
            return ""
        
        # check if value already exists
        value_exists = value in self.db_info[key]["values"]
        if value_exists:
            print(f"Value '{value}' already exists for key '{key}'.")
            return value
        else:
            # check if value is a synonym for another value
            if value in self.val_og2std[key]:
                print(f"Value '{value}' is a synonym for value '{self.val_og2std[key][value]}' for key '{key}'.")
                return self.val_og2std[key][value]
            else:
                # insert new value
                query = f'INSERT INTO AttributeKeyValue (key_name, value) VALUES ("{key}","{value}")'
                self.commands.append(query)
                query = f'INSERT INTO AttributeValueMap (key_name, std_value, og_value) VALUES ("{key}","{value}","{value}")'
                self.commands.append(query)

                # update dictionaries
                self.val_og2std[key][value] = value
                self.val_std2og[key].setdefault(value,set()).add(value)
                self.db_info[key]["values"][value] = set([value])
                return value
            
    def add_value_synonym(self,key,value,synonym):
        assert key in self.db_info, f"Key '{key}' does not exist."
        if self.db_info[key]["variable"] == 1:
            print(f"Key '{key}' is variable. Cannot add value.")
            return ""
        
        # check if value already exists
        synonym_is_value = synonym in self.db_info[key]["values"]
        if synonym_is_value:
            print(f"Synonym '{synonym}' is already a value for key '{key}'.")
            return value
        else:
            # check if synonym already exists
            if synonym in self.val_og2std[key]:
                print(f"Synonym '{synonym}' already exists for value '{value}' for key '{key}'.")
                return self.val_og2std[key][synonym]
            else:
                # insert new synonym
                query = f'INSERT INTO AttributeValueMap (key_name, std_value, og_value) VALUES ("{key}","{value}","{synonym}")'
                self.commands.append(query)

                # update dictionaries
                self.val_og2std[key][synonym] = value
                self.val_std2og[key][value].add(synonym)
                self.db_info[key]["values"][value].add(synonym)
                return value
            
    # add transcript attributes (TXAttribute)
    def insert_transcript_attribute(self,tid:int,sid:int,transcript_id:str,key:str,value:str):
        assert key in self.key_std2og or key in self.key_og2std, f"Unknown key {key} provided"

        # find the key representative in database
        std_key = key
        if key in self.key_og2std:
            std_key = self.key_og2std[key]
        else:
            assert key in self.key_std2og, f"Key {key} not found in database"
        
        # check if key is variable - if so, only populate value_text, otherwise traverse synonyms
        variable_key = self.db_info[std_key]["variable"] == 1

        # if not variable - make sure the provided value is also compatible with the database
        ins_value = ""
        value_text = ""
        if not variable_key:
            assert value in self.val_og2std[std_key] or value in self.db_info[std_key]["values"], f"Unknown value {value} provided for key {key}"
            ins_value = value
        else:
            value_text = value
        
        # insert into database
        query = f'INSERT INTO TXAttribute (tid, sid, transcript_id, name, value, value_text) VALUES ("{tid}","{sid}","{transcript_id}","{key}","{ins_value}","{value_text}")'
        return self.dbcon.execute_query(query)