import './Footer.css'
import { useLocation } from 'react-router-dom';
import { Container, Footer, Nav, NavLink } from 'react-bootstrap';

function Footer() {
    const location = useLocation();

    return (
        <div className="bg-light border-top">
            <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4">
                <p className="col-md-4 mb-0 text-body-secondary">&copy; 2023 CCB</p>

                <ul className="nav col-md-4">
                    <li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">Home</a></li>
                    <li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">Contact Us</a></li>
                    <li className="nav-item"><a href="#" className="nav-link px-2 text-body-secondary">About</a></li>
                </ul>
            </footer>
        </div>
    );
}

export default Footer;