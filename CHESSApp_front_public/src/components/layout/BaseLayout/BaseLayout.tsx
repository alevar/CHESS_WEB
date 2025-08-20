import React from 'react';
import { Container } from 'react-bootstrap';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Container fluid>
      <Header />
      {children}
      <Footer />
    </Container>
  );
};

export default BaseLayout; 