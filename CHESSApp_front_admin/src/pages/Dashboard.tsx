import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card,
  Spinner, 
  Alert 
} from 'react-bootstrap';
import { RootState } from '../redux/store';
import { StatsCard } from '../components/dashboard/StatsCard';
import { QuickActionButton } from '../components/dashboard/QuickActionButton';

const Dashboard: React.FC = () => {
  const { sources, assemblies, organisms, loading, error } = useSelector(
    (state: RootState) => state.globalData
  );
  const navigate = useNavigate();

  const navigateToSection = (section: string) => {
    navigate(`/${section}`);
  };

  const hasData = sources && assemblies && organisms;
  const stats = hasData ? {
    organisms: Object.keys(organisms).length,
    assemblies: Object.keys(assemblies).length,
    sources: Object.keys(sources).length,
  } : null;

  const quickActions = [
    { icon: 'fas fa-database', label: 'Manage Database', section: 'database', variant: 'primary' },
    { icon: 'fas fa-dna', label: 'Manage Organisms', section: 'organisms', variant: 'primary' },
    { icon: 'fas fa-layer-group', label: 'Manage Assemblies', section: 'assemblies', variant: 'success' },
    { icon: 'fas fa-tags', label: 'Manage Sources', section: 'sources', variant: 'warning' },
  ];

  const renderStats = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger">
          Error loading data: {error}
        </Alert>
      );
    }

    if (!hasData) {
      return (
        <Alert variant="warning">
          Unable to load database statistics
        </Alert>
      );
    }

    return (
      <Row>
        <StatsCard count={stats!.organisms} label="Organisms" variant="primary" />
        <StatsCard count={stats!.assemblies} label="Assemblies" variant="success" />
        <StatsCard count={stats!.sources} label="Sources" variant="secondary" />
      </Row>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-database me-2" />
                Database Overview
              </h5>
            </Card.Header>
            <Card.Body>
              {renderStats()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2" />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {quickActions.map((action) => (
                  <QuickActionButton
                    key={action.section}
                    icon={action.icon}
                    label={action.label}
                    section={action.section}
                    variant={action.variant}
                    onClick={navigateToSection}
                  />
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;