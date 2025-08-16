import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

interface ErrorBoundaryProps {
  error: string;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <Container>
          <Alert variant="danger" className="text-center">
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Database Connection Error
            </Alert.Heading>
            <p className="mb-3">
              Unable to load the CHESS database. Please check your connection and try again.
            </p>
            <div className="text-muted small mb-3">
              Error: {error}
            </div>
          </Alert>
        </Container>
      </div>
    </div>
  );
};

export default ErrorBoundary;