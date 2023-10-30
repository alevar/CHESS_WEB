import './Header.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">CHESS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/" active={location.pathname === '/'}>Home</Nav.Link>
            <Nav.Link href="/about" active={location.pathname === '/about'}>About</Nav.Link>
            <Nav.Link href="/contact" active={location.pathname === '/contact'}>Contact Us</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;