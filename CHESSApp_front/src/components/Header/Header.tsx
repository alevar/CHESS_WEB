import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';

import './Header.css';
import ccb_logo from '../../public/ccb.logo.svg';

function Header() {
  const location = useLocation();
  const base_path = location.pathname.split('/').slice(0, 5).join('/');

  return (
    <Navbar bg="light" expand="lg">
      <Container className="d-flex justify-content-center">
        <Navbar.Brand href="/">CHESS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/download" active={location.pathname === "/download"}>Download</Nav.Link>
            <Nav.Link href={base_path + "/custom"} active={location.pathname === base_path + "/custom"}>Build</Nav.Link>
            <Nav.Link href={base_path + "/explore"} active={location.pathname.includes(base_path + "/explore")}>Explore</Nav.Link>
            <Nav.Link href="/about" active={location.pathname === '/about'}>About</Nav.Link>
            <Nav.Link href="/contact" active={location.pathname === '/contact'}>Contact Us</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Nav.Link href="https://ccb.jhu.edu" className="d-flex align-items-center">
          <img src={ccb_logo} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
        </Nav.Link>
      </Container>
    </Navbar>
  );
}

export default Header;
