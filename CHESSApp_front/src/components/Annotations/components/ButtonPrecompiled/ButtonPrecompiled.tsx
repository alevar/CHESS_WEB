import React, { useState } from 'react';
import { Modal, Button, Card, Accordion, Row, Col } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

import GlobalContext from "../../../GlobalContext";

const ButtonPrecompiled = () => {
  const globalData = React.useContext(GlobalContext);

  const [show, setShow] = useState(false);
  const [expandedElement, setExpandedElement] = useState(null);

  const handleClose = () => {
    setShow(false);
    setExpandedElement(null);
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
          <Modal.Title>Popular Annotations</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Row xs={1} md={2} lg={3} className="g-4">
            {Object.entries(globalData).map(([key, value], index) => (
              <Col key={key} style={{ marginBottom: '20px' }}>
                <Card
                  style={{ width: '18rem', height: '15rem', cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => handleCardClick(key)}
                >
                  <Card.Body>
                    <Card.Title style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {value.name}
                    </Card.Title>
                    <Card.Text style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {value.information}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {expandedElement && (
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>{globalData[expandedElement].name}</Card.Title>
                <Card.Text>{globalData[expandedElement].description}</Card.Text>
                <Card.Text>Last Updated: {globalData[expandedElement].lastUpdated}</Card.Text>
                <Card.Text>Link: {globalData[expandedElement].link}</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ButtonPrecompiled;
