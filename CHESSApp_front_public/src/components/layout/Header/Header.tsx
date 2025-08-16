import React, { useState } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Nav, 
    Navbar, 
    Button, 
    Form, 
    FormControl,
    InputGroup,
    Card
} from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { usePathManager } from '../../../hooks/usePathManager';

interface NavItem {
    id: string;
    to: string;
    label: string;
}

import { AppSettingsModal } from '../../modals/AppSettingsModal';

import ccb_logo from '../../../assets/logos/ccb.logo.svg';
import chess_logo from '../../../assets/logos/chess.logo.cropped.svg';
import './Header.css';

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    
    const appData = useSelector((state: RootState) => state.appData);
    const dbData = useSelector((state: RootState) => state.dbData);
    
    // Use the path manager hook
    const {
        buildPath,
        isRouteActive,
        isStructuredAppPath,
        isInitialized
    } = usePathManager();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchTerm = formData.get('search') as string;
        if (searchTerm.trim()) {
            if (isInitialized && isStructuredAppPath(location.pathname)) {
                // If in app context, navigate to explore with search
                const { path } = buildPath('explore');
                navigate(`${path}?q=${encodeURIComponent(searchTerm.trim())}`);
            } else {
                // If not in app context, navigate to root and let App.tsx handle it
                navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
            }
            setShowSearch(false);
            setExpanded(false);
        }
    };

    // Build navigation items
    const navItems: NavItem[] = [
        { id: 'browser', to: buildPath('browser').path, label: 'Browser' },
        { id: 'downloads', to: buildPath('downloads').path, label: 'Download' },
        { id: 'about', to: buildPath('about').path, label: 'About' },
        { id: 'contact', to: buildPath('contact').path, label: 'Contact' }
    ];

    return (
        <>
            <Card className="header border-0 rounded-0 shadow-sm">
                <Navbar expand="lg" className="py-2 bg-white">
                    <Container fluid className="px-4">
                        {/* Left section - Brand */}
                        <Navbar.Brand 
                            as={Link} 
                            to={buildPath('').path}
                            className="d-flex align-items-center text-decoration-none brand-section"
                        >
                            <img src={chess_logo} alt="CHESS" className="brand-logo" />
                            <div className="brand-text">
                                <div className="brand-title">CHESS</div>
                                <div className="brand-subtitle">evidence-based annotation</div>
                            </div>
                        </Navbar.Brand>

                        {/* Center section - Navigation */}
                        <div className="d-none d-lg-flex justify-content-center flex-grow-1">
                            <Nav className="nav-center">
                                <Nav.Item>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => setShowSearch(!showSearch)}
                                        className="p-2"
                                    >
                                        <Search className="me-1" />
                                    </Button>
                                </Nav.Item>
                                {navItems.map((item) => (
                                    <Nav.Item key={item.id}>
                                        <Nav.Link 
                                            as={Link}
                                            to={item.to}
                                            className={`${isRouteActive(item.id, location.pathname) ? 'active' : ''}`}
                                        >
                                            {item.label}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </div>

                        {/* Right section - Fixed width container for consistent positioning */}
                        <div className="d-flex align-items-center right-section" style={{ minWidth: '300px', justifyContent: 'flex-end' }}>
                            <div className="me-3">
                                {isInitialized && isStructuredAppPath(location.pathname) && (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => setShowSettingsModal(true)}
                                        className="d-flex align-items-center w-100"
                                    >
                                        <span className="text-truncate">
                                            {appData.selections.source_id && appData.selections.version_id ? (
                                                <>
                                                    {dbData.sources[appData.selections.source_id]?.name || 'Unknown Source'} / 
                                                    {dbData.sources[appData.selections.source_id]?.versions?.[appData.selections.version_id]?.version_name || 'Unknown Version'}
                                                </>
                                            ) : (
                                                'Configure Genome Settings'
                                            )}
                                        </span>
                                    </Button>
                                )}
                            </div>

                            {/* CCB logo - always in the same position */}
                            <Nav.Link
                                href="https://ccb.jhu.edu/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="d-none d-md-block ccb-link p-0"
                            >
                                <img src={ccb_logo} alt="CCB" className="ccb-logo" />
                            </Nav.Link>
                        </div>
                    </Container>
                </Navbar>

                {/* Expandable Search Bar */}
                {showSearch && (
                    <Card.Body className="border-top bg-light p-0">
                        <Container fluid className="px-4 py-3">
                            <Row className="justify-content-center">
                                <Col lg={6} xl={4}>
                                    <Form onSubmit={handleSearch}>
                                        <InputGroup>
                                            <FormControl
                                                type="search"
                                                name="search"
                                                placeholder="Search genes, transcripts, or annotations..."
                                                autoFocus
                                            />
                                            <Button type="submit" variant="primary">
                                                <Search />
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </Card.Body>
                )}
            </Card>
            
            {/* App Settings Modal */}
            <AppSettingsModal 
                show={showSettingsModal}
                canClose={true}
                onClose={() => setShowSettingsModal(false)}
            />
        </>
    );
};

export default Header;