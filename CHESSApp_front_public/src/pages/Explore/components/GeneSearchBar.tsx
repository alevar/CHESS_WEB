import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

interface GeneSearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
}

const GeneSearchBar: React.FC<GeneSearchBarProps> = ({
  onSearch,
  placeholder = "Search genes by name, ID, or type...",
  disabled = false,
  value = '',
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const triggerSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch();
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup size="lg">
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button
          variant="primary"
          type="submit"
          onClick={triggerSearch}
          disabled={disabled || !inputValue.trim()}
        >
          <Search />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default GeneSearchBar;