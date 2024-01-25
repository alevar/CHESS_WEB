import React from 'react';
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import SashimiPlot from './SashimiPlot/SashimiPlot';
import SideBar from './SideBar/SideBar';
import "./SideBar/SideBar.css";

const Explore: React.FC = () => {
  return (
    <Container fluid>
      <Row>
        <Col className="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
          <SideBar />
        </Col>
        <Col className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Dashboard</h1>
          </div>
          <canvas className="my-4 w-100" id="myChart" width="900" height="380"></canvas>
        </Col>
      </Row>
    </Container>
  );
}

export default Explore;
