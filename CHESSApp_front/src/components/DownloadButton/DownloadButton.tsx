import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

import './DownloadButton.css';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { DatabaseState } from '../../features/database/databaseSlice';
import { SettingsState, setFormat, setNomenclature, setNascent } from '../../features/settings/settingsSlice';

const DownloadButton: React.FC = () => {
  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);

  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [expandedElement, setExpandedElement] = useState<null | string>(null);

  const handleClose = () => {
    setShow(false);
    setExpandedElement(null);
  };

  const handleDownload = () => {
    setShow(false);
    setExpandedElement(null);
    console.log("Download initiated");
  };

  const handleShow = () => setShow(true);

  const handleCardClick = (element: string) => {
    if (expandedElement === element) {
      setExpandedElement(null);
    } else {
      setExpandedElement(element);
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={handleShow} className="custom-button btn btn-download">
        DOWNLOAD
      </Button>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Configure your download</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Form.Group controlId="formatSelect">
            <Form.Label>Format</Form.Label>
            <Form.Select
              defaultValue="GTF"
              onChange={(e) => dispatch(setFormat(e.target.value))}
            >
              <option>GTF</option>
              <option>GFF</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="nomenclatureSelect">
            <Form.Label>Nomenclature</Form.Label>
            <Form.Select
              defaultValue={globalData.nomenclature?.GRCh38[0]}
              onChange={(e) => dispatch(setNomenclature(e.target.value))}
            >
              {globalData.nomenclature?.GRCh38.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="nascentRNASelect">
            <Form.Check
              type="checkbox"
              label="Include nascent RNA in the output"
              onChange={(e) => dispatch(setNascent(e.target.checked))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Row style={{ width: '100%' }}>
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
