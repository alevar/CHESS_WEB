from sqlalchemy import text
from db.db import db
from .queries import *

def reset_database():
    """
    Deletes all data from all tables in the database. Use with caution!
    Returns a dict with the status of the operation.
    """
    try:
        db.session.execute(text('SET FOREIGN_KEY_CHECKS = 0;'))
        actual_tables = list_tables()
        
        for table in actual_tables:
            db.session.execute(text(f'TRUNCATE TABLE `{table}`;'))
        db.session.execute(text('SET FOREIGN_KEY_CHECKS = 1;'))
        db.session.commit()
        return {"success": True, "message": f"Database reset successfully. Truncated {len(actual_tables)} tables."}
    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": str(e)}

def get_table_info(table_name):
    """
    Returns information about a specific table or view including its description.
    Returns a dict with table information or error details.
    """
    try:
        result = db.session.execute(text("""
            SELECT 
                table_name,
                table_type,
                table_comment
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = :table_name
        """), {"table_name": table_name}).fetchone()
        
        if not result:
            return {
                "name": table_name,
                "type": "unknown",
                "description": "Table/view not found",
                "error": f"Table or view '{table_name}' does not exist"
            }
        
        table_type = "view" if result[1] == "VIEW" else "table"
        description = result[2] if result[2] else f"{table_type.capitalize()} {table_name}"
        
        return {
            "name": table_name,
            "type": table_type,
            "description": description
        }
    except Exception as e:
        return {
            "name": table_name,
            "type": "unknown",
            "description": "Error retrieving table info",
            "error": str(e)
        }

def clear_table(table_name):
    """
    Deletes all rows from the specified table.
    Returns a dict with the status of the operation.
    """
    try:
        db.session.execute(text(f'DELETE FROM `{table_name}`;'))
        db.session.commit()
        return {"success": True, "message": f"Table '{table_name}' cleared successfully."}
    except Exception as e:
        db.session.rollback()
        return {"success": False, "message": str(e)}