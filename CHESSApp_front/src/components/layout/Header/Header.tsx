import React from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import GenomeSelectModal from './components/GenomeSelectModal/GenomeSelectModal';

import ccb_logo from '../../../assets/logos/ccb.logo.svg';
import chess_logo from '../../../assets/logos/chess.logo.cropped.svg';

import './Header.css';

const Header: React.FC = () => {
    return (
        <div className="bg-light border-bottom shadow-sm">
            <header className="header py-3">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <Link to="" className="d-flex align-items-center">
                                <div>
                                    <img src={chess_logo} alt="CHESS Logo" style={{ height: '80px', marginRight: '15px' }} />
                                </div>
                                <div>
                                    <h1 className="text-dark">
                                        CHESS
                                    </h1>
                                    <h5 className="text-muted">
                                        evidence-based annotation project
                                    </h5>
                                </div>
                            </Link>
                        </Col>

                        <Col md={5} className="text-end">
                            <Nav className="justify-content-end">
                                <Nav.Item>
                                    <GenomeSelectModal />
                                </Nav.Item>
                                <Nav.Item>
                                    <Link to="about" className="nav-link">About</Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Link to="contact" className="nav-link">Contact</Link>
                                </Nav.Item>
                            </Nav>
                        </Col>

                        <Col md={1} className="text-end">
                            <Nav.Link href="https://ccb.jhu.edu/" className="d-flex align-items-center justify-content-end">
                                <img src={ccb_logo} alt="CCB Logo" style={{ height: '80px', marginLeft: '15px' }} />
                            </Nav.Link>
                        </Col>
                    </Row>
                </Container>
            </header>
        </div>
    );
};

export default Header;
