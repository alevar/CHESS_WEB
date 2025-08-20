import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

interface GeneSearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const GeneSearchBar: React.FC<GeneSearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search genes by name, ID, or type...",
  disabled = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        onSearch(searchTerm.trim());
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup size="lg">
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button 
          variant="primary" 
          type="submit"
          onClick={handleSearchClick}
          disabled={disabled || !searchTerm.trim()}
        >
          <Search />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default GeneSearchBar; 