import React, { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, List } from 'react-bootstrap-icons'; // Bootstrap icons
import GenomeSelectModal from './components/GenomeSelectModal/GenomeSelectModal';
import ccb_logo from '../../../assets/logos/ccb.logo.svg';
import chess_logo from '../../../assets/logos/chess.logo.cropped.svg';
import './Header.css';

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    
    const isActive = (path: string) => {
        return location.pathname.includes(path);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchTerm = formData.get('search') as string;
        if (searchTerm.trim()) {
            const relativePath = `explore?q=${encodeURIComponent(searchTerm.trim())}`;
 
            navigate(relativePath, { relative: "path" });
            setShowSearch(false);
            setExpanded(false);
        }
    };

    const navItems = [
        { to: 'browser', label: 'Browser' },
        { to: 'download', label: 'Download' },
        { to: 'about', label: 'About' }
    ];

    return (
        <>
            {/* Main Header */}
            <div className="bg-white border-bottom shadow-sm header">
                <Navbar expand="lg" className="py-2">
                    <Container fluid className="px-4">
                        {/* Logo Section - More Compact */}
                        <Navbar.Brand as={Link} to="" className="d-flex align-items-center text-decoration-none brand-section">
                            <img src={chess_logo} alt="CHESS" className="brand-logo" />
                            <div className="brand-text">
                                <div className="brand-title">CHESS</div>
                                <div className="brand-subtitle">evidence-based annotation</div>
                            </div>
                        </Navbar.Brand>

                        {/* Center Navigation - Hidden on Mobile */}
                        <div className="d-none d-lg-flex justify-content-center flex-grow-1">
                            <Nav className="nav-center">
                                <Nav.Item>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => setShowSearch(!showSearch)}
                                    >
                                        <Search className="me-1" />
                                    </Button>
                                </Nav.Item>
                                {navItems.map((item) => (
                                    <Nav.Item key={item.to}>
                                        <Link 
                                            to={item.to}
                                            className={`nav-link-custom ${isActive(item.to) ? 'active' : ''}`}
                                        >
                                            {item.label}
                                        </Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </div>

                        {/* Right Section */}
                        <div className="d-flex align-items-center right-section">
                            {/* Genome Select */}
                            <div className="me-2">
                                <GenomeSelectModal />
                            </div>

                            {/* CCB Logo */}
                            <a 
                                href="https://ccb.jhu.edu/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="d-none d-md-block ccb-link"
                            >
                                <img src={ccb_logo} alt="CCB" className="ccb-logo" />
                            </a>

                            {/* Mobile Menu Toggle */}
                            <Navbar.Toggle 
                                aria-controls="navbar-nav" 
                                className="d-lg-none ms-2 custom-toggler"
                                onClick={() => setExpanded(!expanded)}
                            >
                                <List size={20} />
                            </Navbar.Toggle>
                        </div>
                    </Container>
                </Navbar>

                {/* Expandable Search Bar */}
                {showSearch && (
                    <div className="search-dropdown border-top bg-light">
                        <Container fluid className="px-4 py-3">
                            <Row className="justify-content-center">
                                <Col lg={6} xl={4}>
                                    <form onSubmit={handleSearch} className="d-flex">
                                        <input
                                            type="search"
                                            name="search"
                                            className="form-control"
                                            placeholder="Search genes, transcripts, or annotations..."
                                            autoFocus
                                        />
                                        <Button type="submit" variant="primary" className="ms-2">
                                            <Search />
                                        </Button>
                                    </form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                )}

                {/* Mobile Navigation */}
                <Navbar.Collapse in={expanded} className="d-lg-none">
                    <Container fluid className="px-4">
                        <div className="mobile-nav py-3">
                            {/* Mobile Navigation Items */}
                            <Nav className="flex-column mb-3">
                                {navItems.map((item) => (
                                    <Nav.Item key={item.to} className="mb-1">
                                        <Link 
                                            to={item.to} 
                                            className={`nav-link-mobile ${isActive(item.to) ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    </Nav.Item>
                                ))}
                            </Nav>

                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="d-flex">
                                <input
                                    type="search"
                                    name="search"
                                    className="form-control"
                                    placeholder="Search genes..."
                                />
                                <Button type="submit" variant="primary" className="ms-2">
                                    <Search />
                                </Button>
                            </form>
                        </div>
                    </Container>
                </Navbar.Collapse>
            </div>
        </>
    );
};

export default Header;