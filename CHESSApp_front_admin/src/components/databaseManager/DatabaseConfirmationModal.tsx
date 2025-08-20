import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DatabaseConfirmationModalProps {
  showResetModal: boolean;
  showClearModal: boolean;
  clearTableName: string | null;
  loading: boolean;
  onResetConfirm: () => void;
  onClearConfirm: () => void;
  onResetCancel: () => void;
  onClearCancel: () => void;
}

export const DatabaseConfirmationModal: React.FC<DatabaseConfirmationModalProps> = ({
  showResetModal,
  showClearModal,
  clearTableName,
  loading,
  onResetConfirm,
  onClearConfirm,
  onResetCancel,
  onClearCancel,
}) => (
  <>
    {/* Reset Database Modal */}
    <Modal show={showResetModal} onHide={onResetCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Database Reset</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to reset the database? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onResetCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onResetConfirm} disabled={loading}>
          {loading ? 'Resetting...' : 'Yes, Reset'}
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Clear Table Modal */}
    <Modal show={showClearModal} onHide={onClearCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Clear Table</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to clear all rows from{' '}
        <strong>{clearTableName}</strong>? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClearCancel}>
          Cancel
        </Button>
        <Button variant="warning" onClick={onClearConfirm} disabled={loading}>
          {loading ? 'Clearing...' : 'Yes, Clear Table'}
        </Button>
      </Modal.Footer>
    </Modal>
  </>
);