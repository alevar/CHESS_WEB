import React from 'react';
import { Alert } from 'react-bootstrap';

interface NotificationBannerProps {
  message: string | null;
  type: 'success' | 'danger';
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  message, 
  type, 
  onDismiss 
}) => {
  if (!message) return null;

  return (
    <Alert variant={type} dismissible onClose={onDismiss} className="mt-3">
      {message}
    </Alert>
  );
};