import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAppData, useSelectedOrganism, useSelectedAssembly, useSelectedSource, useSelectedVersion, useSelectedNomenclature } from '../../hooks/useGlobalData';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

import './Explore.css';

const Explore: React.FC = () => {
  return (
    <Container className="py-4">
      <p>Explore</p>
    </Container>
  );
};

export default Explore;