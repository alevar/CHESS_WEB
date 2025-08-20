import React from 'react';

interface SidebarProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  sticky?: boolean; // New prop to control sticky behavior
  stickyTop?: number; // Offset from top when sticky
}

const Sidebar: React.FC<SidebarProps> = ({ 
  title, 
  children, 
  className = '', 
  sticky = true,
  stickyTop = 20 
}) => {
  const sidebarStyle = sticky ? {
    position: 'sticky' as const,
    top: `${stickyTop}px`,
    alignSelf: 'flex-start' // Prevents stretching to full height
  } : {};

  return (
    <div 
      className={`sidebar-static ${className}`.trim()}
      style={sidebarStyle}
    >
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