import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-cog me-2"></i>
          CHESS Administrative Interface
        </Link>
      </div>
    </nav>
  );
};

export default Header; 