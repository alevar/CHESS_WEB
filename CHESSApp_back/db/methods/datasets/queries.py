from sqlalchemy import text
from db.db import db

def get_all_datasets():
    """
    Get all datasets stored in the database
    """
    try:
        query = text("""
            SELECT 
                d.dataset_id,
                d.name,
                d.description,
                d.data_type
            FROM dataset d
            ORDER BY d.dataset_id DESC
        """)
        
        result = db.session.execute(query)
        datasets = {}
        
        for row in result:
            dataset = {
                'dataset_id': row.dataset_id,
                'name': row.name,
                'description': row.description,
                'data_type': row.data_type or ''
            }
            datasets[row.dataset_id] = dataset
        
        return {
            "success": True,
            "data": datasets
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "message": f"Failed to fetch datasets: {str(e)}"
        }

def get_dataset_by_id(dataset_id):
    """
    Get a specific dataset by ID
    """
    try:
        query = text("""
            SELECT 
                d.dataset_id,
                d.name,
                d.description,
                d.data_type
            FROM dataset d
            WHERE d.dataset_id = :dataset_id
        """)
        
        result = db.session.execute(query, {'dataset_id': dataset_id})
        row = result.fetchone()
        
        if row:
            return {
                'dataset_id': row.dataset_id,
                'name': row.name,
                'description': row.description,
                'data_type': row.data_type or ''
            }
        
        return None
        
    except Exception as e:
        return None

def dataset_exists_by_id(dataset_id: int):
    try:
        result = db.session.execute(text("""
            SELECT COUNT(*) FROM dataset WHERE dataset_id = :dataset_id
        """), {"dataset_id": dataset_id}).fetchone()
        return result[0] > 0
    except Exception as e:
        return False