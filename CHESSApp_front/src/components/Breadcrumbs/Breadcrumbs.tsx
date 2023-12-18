import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import './Breadcrumbs.css';

interface BreadcrumbsProps {
  organism: string | null;
  assembly: string | null;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ organism, assembly }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <li
            key={name}
            className={`breadcrumb-item ${isLast ? 'active' : ''}`}
            aria-current={isLast ? 'page' : undefined}
          >
            {isLast ? (
              <span className="breadcrumb-text">{name}</span>
            ) : (
              <Link className="breadcrumb-link" to={routeTo}>
                {organism || name}
              </Link>
            )}
          </li>
        );
      })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
