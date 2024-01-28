import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Data {
  id: number;
  name: string;
  age: number;
  country: string;
}

const initialData: Data[] = [
  { id: 1, name: 'John Doe', age: 25, country: 'USA' },
  { id: 2, name: 'Jane Doe', age: 30, country: 'Canada' },
  { id: 3, name: 'Bob Smith', age: 18, country: 'Australia' },
  { id: 4, name: 'Mary Smith', age: 21, country: 'England' },
  { id: 5, name: 'James Bond', age: 45, country: 'UK' },
  { id: 6, name: 'Steve Rogers', age: 35, country: 'USA' },
];

const MyTable: React.FC = () => {
  const [data, setData] = useState<Data[]>(initialData);
  const [filter, setFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<string | null>(null);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value.toLowerCase());
  };

  const handleSort = (key: string) => {
    setSortKey(key);
    const sortedData = [...data].sort((a, b) => (a[key] > b[key] ? 1 : -1));
    setData(sortedData);
  };

  const handleRowClick = (id: number) => {
    // Handle row click as needed
    console.log(`Row ${id} clicked`);
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) => value.toString().toLowerCase().includes(filter))
  );

  return (
    <div>
      <input type="text" className="form-control mb-2" placeholder="Filter" onChange={handleFilterChange} />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>ID {sortKey === 'id' && <i className="bi bi-caret-down-fill"></i>}</th>
            <th onClick={() => handleSort('name')}>Name {sortKey === 'name' && <i className="bi bi-caret-down-fill"></i>}</th>
            <th onClick={() => handleSort('age')}>Age {sortKey === 'age' && <i className="bi bi-caret-down-fill"></i>}</th>
            <th onClick={() => handleSort('country')}>Country {sortKey === 'country' && <i className="bi bi-caret-down-fill"></i>}</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id} onClick={() => handleRowClick(row.id)}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.age}</td>
              <td>{row.country}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default MyTable;
