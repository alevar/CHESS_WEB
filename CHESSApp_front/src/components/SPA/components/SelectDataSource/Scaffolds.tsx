import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

export function Scaffolds() {
    const [alt, setAlt] = useState(false);
    const [random, setRandom] = useState(false);
    const [unplaced, setUnplaced] = useState(false);
    const [patches, setPatches] = useState(false);
  
    return (
      <Form>
        <Form.Group as={Row} className="align-items-center">
          <Form.Label column sm={3} className="text-center">
            Alt
          </Form.Label>
          <Col sm={9}>
            <Form.Check
              type="switch"
              id="alt-switch"
              label=""
              checked={alt}
              onChange={() => setAlt(!alt)}
            />
          </Col>
        </Form.Group>
  
        <Form.Group as={Row} className="align-items-center">
          <Form.Label column sm={3} className="text-center">
            Random
          </Form.Label>
          <Col sm={9}>
            <Form.Check
              type="switch"
              id="random-switch"
              label=""
              checked={random}
              onChange={() => setRandom(!random)}
            />
          </Col>
        </Form.Group>
  
        <Form.Group as={Row} className="align-items-center">
          <Form.Label column sm={3} className="text-center">
            Unplaced
          </Form.Label>
          <Col sm={9}>
            <Form.Check
              type="switch"
              id="unplaced-switch"
              label=""
              checked={unplaced}
              onChange={() => setUnplaced(!unplaced)}
            />
          </Col>
        </Form.Group>
  
        <Form.Group as={Row} className="align-items-center">
          <Form.Label column sm={3} className="text-center">
            Patches
          </Form.Label>
          <Col sm={9}>
            <Form.Check
              type="switch"
              id="patches-switch"
              label=""
              checked={patches}
              onChange={() => setPatches(!patches)}
            />
          </Col>
        </Form.Group>
      </Form>);
}
