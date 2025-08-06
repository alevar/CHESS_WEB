import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ title, children, className }) => {
  return (
    <aside className={`sidebar p-3 bg-light border-end ${className || ''}`.trim()}>
      {title && <h4 className="sidebar-title mb-3">{title}</h4>}
      <div className="sidebar-content">
        {children || <div className="text-muted">Sidebar content goes here.</div>}
      </div>
    </aside>
  );
};

export default Sidebar; 