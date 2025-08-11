import React from 'react';

interface SidebarProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`sidebar-static ${className}`.trim()}>
      {title && (
        <div className="sidebar-header">
          <h5 className="sidebar-title">{title}</h5>
        </div>
      )}
      <div className="sidebar-content">
        {children || <div className="text-muted">Sidebar content goes here.</div>}
      </div>
    </div>
  );
};

export default Sidebar; 