import React from 'react';
import { Spinner } from 'react-bootstrap';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  variant = 'primary',
  fullScreen = false,
  className = ''
}) => {
  const spinnerContent = (
    <div className={`text-center loading-spinner-content ${className}`}>
      <Spinner 
        animation="border" 
        variant={variant} 
        className="mb-3" 
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <div className="text-muted">{message}</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex flex-column min-vh-100 loading-spinner-fullscreen">
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center p-4">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;