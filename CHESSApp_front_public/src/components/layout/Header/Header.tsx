import React, { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import GenomeSelectModal from './components/GenomeSelectModal/GenomeSelectModal';
import ccb_logo from '../../../assets/logos/ccb.logo.svg';
import chess_logo from '../../../assets/logos/chess.logo.cropped.svg';
import './Header.css';

const Header: React.FC = () => {
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);
    
    const isActive = (path: string) => {
        return location.pathname.includes(path);
    };

    const navItems = [
        { to: 'download', label: 'Download' },
        { to: 'browser', label: 'Genome Browser' },
        { to: 'explore', label: 'Explore' },
        { to: 'custom', label: 'Custom Annotation' },
        { to: 'about', label: 'About' }
    ];

    return (
        <div className="bg-light border-bottom shadow-sm header">
            <Navbar expand="lg" className="py-2">
                <Container>
                    {/* Logo and Title */}
                    <Navbar.Brand as={Link} to="" className="d-flex align-items-center text-decoration-none me-4">
                        <img src={chess_logo} alt="CHESS Logo" className="me-3" />
                        <div>
                            <h1 className="text-dark mb-0">CHESS</h1>
                            <h5 className="text-muted mb-0">evidence-based annotation project</h5>
                        </div>
                    </Navbar.Brand>

                    {/* Navigation Toggle for Mobile */}
                    <Navbar.Toggle 
                        aria-controls="navbar-nav" 
                        onClick={() => setExpanded(!expanded)}
                    />

                    {/* Navigation Items */}
                    <Navbar.Collapse id="navbar-nav" className="justify-content-center">
                        <Nav className="me-auto">
                            {navItems.map((item) => (
                                <Nav.Item key={item.to} className="me-2">
                                    <Link 
                                        to={item.to} 
                                        className={`nav-link ${isActive(item.to) ? 'active' : ''}`}
                                        onClick={() => setExpanded(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Navbar.Collapse>

                    {/* Right Side Items */}
                    <div className="d-flex align-items-center">
                        <GenomeSelectModal />
                        <a 
                            href="https://ccb.jhu.edu/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="ms-3 d-none d-md-block"
                        >
                            <img src={ccb_logo} alt="CCB Logo" />
                        </a>
                    </div>
                </Container>
            </Navbar>
        </div>
    );
};

export default Header;
