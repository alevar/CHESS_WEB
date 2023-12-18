import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

import { useSelector, useDispatch } from 'react-redux';
import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState, set_format, set_nomenclature, set_nascent } from '../../../../features/settings/settingsSlice';

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

const DownloadButton = () => {
  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);

  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [expandedElement, setExpandedElement] = useState(null);

  const handleClose = () => {
    setShow(false);
    setExpandedElement(null);
  };

  const handleDownload = () => {
    setShow(false);
    setExpandedElement(null);
    console.log("download");
  };

  const handleShow = () => setShow(true);

  const handleCardClick = (element) => {
    if (expandedElement === element) {
      setExpandedElement(null);
    } else {
      setExpandedElement(element);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={handleShow} className="custom-button">
        Download Existing Annotation
      </Button>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Configure your download</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Form.Group controlId="formatSelect">
            <Form.Label>Format</Form.Label>
            <Form.Select defaultValue="GTF" onChange={(e) => dispatch(set_format(e.target.value))}>
              <option>GTF</option>
              <option>GFF</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="nomenclatureSelect">
            <Form.Label>Nomenclature</Form.Label>
            <Form.Select defaultValue={globalData["nomenclature"]["GRCh38"][0]} onChange={(e) => dispatch(set_nomenclature(e.target.value))}>
              {globalData["nomenclature"]["GRCh38"].map((option, index) => (
                <option key={index}>{option}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="nascentRNASelect">
            <Form.Check 
              type="checkbox" 
              label="Include nascent RNA in the output" 
              onChange={(e) => dispatch(set_nascent(e.target.checked))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Row>
            <Col className="text-end">
              <Button variant="primary" onClick={handleDownload}>
                Download
              </Button>
            </Col>
            <Col className="text-start">
              <Button variant="danger" onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DownloadButton;
