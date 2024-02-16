import React, { useState } from 'react';
import { Button, Form, FormControl, InputGroup } from 'react-bootstrap';

interface GeneSearchProps {
  onSearch: (query: string) => void;
}

const GeneSearch: React.FC<GeneSearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSendClick = () => {
    onSearch(searchQuery);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendClick();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="geneSearch">
        <InputGroup>
          <FormControl
            type="text"
            placeholder="Enter gene name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Use a regular div for compatibility */}
          <div>
            <Button variant="primary" onClick={handleSendClick}>
              Search
            </Button>
          </div>
        </InputGroup>
      </Form.Group>
    </Form>
  );
};

export default GeneSearch;
