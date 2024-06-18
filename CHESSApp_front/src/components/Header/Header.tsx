import React, { useState, useMemo, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Nav, Navbar, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

import { DatabaseState } from '../../features/database/databaseSlice';
import { RootState } from '../../app/store';
import { 
  SettingsState,
  setStatus,
  setAssembly,
  setOrganism,
  setAttributes,
  setIncludeSources 
} from '../../features/settings/settingsSlice';

import './Header.css';
import chess_logo from '../../public/chess.logo.png';
import ccb_logo from '../../public/ccb.logo.svg';

interface GenomeModalProps {
  show: boolean;
  handleClose: () => void;
  globalData: DatabaseState;
  settings: SettingsState;
  selectedGenome: string;
  handleGenomeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleLoadGenome: () => void;
}

const GenomeModal: React.FC<GenomeModalProps> = ({
  show,
  handleClose,
  globalData,
  settings,
  selectedGenome,
  handleGenomeChange,
  handleLoadGenome,
}) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Select a Genome</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        {Object.entries(globalData.assemblies).map(([assemblyID, assemblyData]) => (
          <Form.Check
            type="radio"
            name="genome"
            id={assemblyID}
            key={assemblyID}
            label={assemblyData.assembly}
            value={assemblyID}
            onChange={handleGenomeChange}
            checked={selectedGenome === assemblyID}
          />
        ))}
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
      <Button variant="primary" onClick={handleLoadGenome}>
        Load
      </Button>
    </Modal.Footer>
  </Modal>
);

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const base_path = useMemo(() => location.pathname.split('/').slice(0, 3).join('/'), [location.pathname]);

  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [selectedGenome, setSelectedGenome] = useState(settings.value.genome.toString());

  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleGenomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedGenome(e.target.value);
  };

  const handleLoadGenome = () => {
    handleCloseModal();

    const organismID = globalData.assemblies[selectedGenome].organismID;
    const sources_list = globalData.ass2src[parseInt(selectedGenome)];

    dispatch(setOrganism(parseInt(organismID)));
    dispatch(setAssembly(parseInt(selectedGenome)));
    dispatch(setIncludeSources(sources_list));

    const pathParts = location.pathname.split('/');
    if (pathParts.length > 3) {
      pathParts[3] = selectedGenome;
    }

    const newPath = pathParts.join('/');
    navigate(newPath);
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="border-bottom">
        <Container className="d-flex justify-content-center">
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img src={chess_logo} style={{ height: '50px', marginRight: '15px' }} className="d-inline-block align-top" alt="Chess Logo" />
            <span className="d-none d-lg-inline">CHESS</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/download" active={location.pathname === "/download"}>Download</Nav.Link>
              <Nav.Link href={`${base_path}/custom`} active={location.pathname === `${base_path}/custom`}>Build</Nav.Link>
              <Nav.Link href={`${base_path}/explore`} active={location.pathname.includes(`${base_path}/explore`)}>Explore</Nav.Link>
              <Nav.Link href="/about" active={location.pathname === '/about'}>About</Nav.Link>
              <Nav.Link href="/contact" active={location.pathname === '/contact'}>Contact Us</Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Nav>
            <Button variant="primary" onClick={handleOpenModal}>
              {globalData.assemblies[settings.value.genome]?.assembly || 'Change Genome'}
            </Button>
            <Nav.Link href="https://ccb.jhu.edu" className="d-flex align-items-center">
              <img src={ccb_logo} alt="CCB Logo" style={{ height: '50px', marginRight: '15px' }} />
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <GenomeModal
        show={showModal}
        handleClose={handleCloseModal}
        globalData={globalData}
        settings={settings.value}
        selectedGenome={selectedGenome}
        handleGenomeChange={handleGenomeChange}
        handleLoadGenome={handleLoadGenome}
      />
    </>
  );
};

export default React.memo(Header);
