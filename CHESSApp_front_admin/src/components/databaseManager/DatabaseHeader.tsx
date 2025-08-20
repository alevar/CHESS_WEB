import React from 'react';
import { Button } from 'react-bootstrap';

interface DatabaseHeaderProps {
  onResetDatabase: () => void;
  loading: boolean;
}

export const DatabaseHeader: React.FC<DatabaseHeaderProps> = ({ 
  onResetDatabase, 
  loading 
}) => (
  <div className="mb-4">
    <h2>Database Management</h2>
    <Button 
      variant="danger" 
      onClick={onResetDatabase}
      disabled={loading}
      className="mb-3"
    >
      Reset Database
    </Button>
  </div>
);