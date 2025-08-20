import React, { useEffect, useState } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

interface ErrorBoundaryProps {
  error: string;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error }) => {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          redirectToCHESS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const redirectToCHESS = () => {
    setIsRedirecting(true);
    window.location.href = 'https://ccb.jhu.edu/chess/';
  };

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
            <div className="mb-3">
              <p className="mb-2">
                Redirecting to CHESS website in <strong>{countdown}</strong> seconds...
              </p>
              <Button 
                variant="primary" 
                onClick={redirectToCHESS}
                disabled={isRedirecting}
              >
                {isRedirecting ? 'Redirecting...' : 'Go to CHESS Website Now'}
              </Button>
            </div>
          </Alert>
        </Container>
      </div>
    </div>
  );
};

export default ErrorBoundary;