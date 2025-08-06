import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner, Button, Tabs, Tab } from 'react-bootstrap';
import { fetchLatestRelease, fetchGitHubReleases, parseGitReleaseBody, formatFileSize, formatDate } from '../../utils/githubUtils';
import { GitHubRelease, ParsedReleaseData } from '../../types/github';
import ReleaseHistory from '../../components/download/ReleaseHistory';
import './Download.css';

const Download: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<{
    release: GitHubRelease;
    parsedData: ParsedReleaseData;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    const loadLatestRelease = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const release = await fetchLatestRelease();
        const parsedData = parseGitReleaseBody(release.body);
        
        setSelectedRelease({ release, parsedData });
      } catch (err) {
        console.error('Error loading release data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load release data');
      } finally {
        setLoading(false);
      }
    };

    loadLatestRelease();
  }, []);

  const handleReleaseSelect = async (release: GitHubRelease) => {
    try {
      setLoading(true);
      const parsedData = parseGitReleaseBody(release.body);
      setSelectedRelease({ release, parsedData });
      setActiveTab('current');
    } catch (err) {
      console.error('Error loading selected release:', err);
      setError(err instanceof Error ? err.message : 'Failed to load selected release');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading release information...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Release Data</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!selectedRelease) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>No Release Data Available</Alert.Heading>
          <p>Unable to load release information at this time.</p>
        </Alert>
      </Container>
    );
  }

  const { release, parsedData } = selectedRelease;
  
  const proteinCodingGenes = parseInt(parsedData.summary.protein_coding?.genes || '0');
  const lncRNAGenes = parseInt(parsedData.summary.lncrna?.genes || '0');
  const pseudogeneGenes = parseInt(parsedData.summary.pseudogene?.genes || '0');
  const altScaffoldGenes = parseInt(parsedData.summary.alt_scaffolds?.genes || '0');
  const otherGenes = parseInt(parsedData.summary.other?.genes || '0');
  
  const proteinCodingTranscripts = parseInt(parsedData.summary.protein_coding?.transcripts || '0');
  const lncRNATranscripts = parseInt(parsedData.summary.lncrna?.transcripts || '0');
  const pseudogeneTranscripts = parseInt(parsedData.summary.pseudogene?.transcripts || '0');
  const altScaffoldTranscripts = parseInt(parsedData.summary.alt_scaffolds?.transcripts || '0');
  const otherTranscripts = parseInt(parsedData.summary.other?.transcripts || '0');
  
  const totalGenes = proteinCodingGenes + lncRNAGenes + pseudogeneGenes + altScaffoldGenes + otherGenes;
  const totalTranscripts = proteinCodingTranscripts + lncRNATranscripts + pseudogeneTranscripts + altScaffoldTranscripts + otherTranscripts;

  // Create map of filename to asset for easy lookup
  const assetMap = new Map();
  release.assets.forEach(asset => {
    assetMap.set(asset.name, asset);
  });

  const CurrentReleaseContent = () => (
    <>
      {/* Release Overview */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>
            CHESS {release.tag_name} Release
          </Card.Title>
          <Card.Text>
            <strong>CHESS</strong> is a comprehensive set of human genes based on nearly
            10,000 RNA sequencing experiments produced by the GTEx project. 
            It includes a total of <strong>{proteinCodingGenes.toLocaleString()}</strong> protein-coding genes and <strong>{lncRNAGenes.toLocaleString()}</strong> lncRNA genes.
            Adding antisense and other RNA genes, release <strong>{release.tag_name}</strong> of the database 
            contains <strong>{totalGenes.toLocaleString()}</strong> genes and <strong>{totalTranscripts.toLocaleString()}</strong> transcripts. Of these transcripts,
            <strong> {proteinCodingTranscripts.toLocaleString()}</strong> represent protein-coding gene isoforms and the rest are noncoding
            RNAs. The database also contains <strong>{pseudogeneGenes.toLocaleString()}</strong> pseudogenes and <strong>{pseudogeneTranscripts.toLocaleString()}</strong> corresponding transcripts as well as <strong>{altScaffoldGenes.toLocaleString()}</strong> genes and <strong>{altScaffoldTranscripts.toLocaleString()}</strong> transcripts annotated on alternative scaffolds of GRCh38.
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Statistics Summary */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Release Statistics</Card.Title>
          <Row>
            <Col md={3} className="text-center mb-3">
              <div className="stat-item">
                <div className="stat-number">{totalGenes.toLocaleString()}</div>
                <div className="stat-label">Total Genes</div>
              </div>
            </Col>
            <Col md={3} className="text-center mb-3">
              <div className="stat-item">
                <div className="stat-number">{totalTranscripts.toLocaleString()}</div>
                <div className="stat-label">Total Transcripts</div>
              </div>
            </Col>
            <Col md={3} className="text-center mb-3">
              <div className="stat-item">
                <div className="stat-number">{proteinCodingGenes.toLocaleString()}</div>
                <div className="stat-label">Protein Coding Genes</div>
              </div>
            </Col>
            <Col md={3} className="text-center mb-3">
              <div className="stat-item">
                <div className="stat-number">{lncRNAGenes.toLocaleString()}</div>
                <div className="stat-label">lncRNA Genes</div>
              </div>
            </Col>
          </Row>
          
          {/* Additional Statistics Table */}
          <Table responsive striped className="mt-3">
            <thead>
              <tr>
                <th>Type</th>
                <th>Genes</th>
                <th>Transcripts</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.summary.protein_coding && (
                <tr>
                  <td>Protein Coding</td>
                  <td>{parsedData.summary.protein_coding.genes}</td>
                  <td>{parsedData.summary.protein_coding.transcripts}</td>
                </tr>
              )}
              {parsedData.summary.lncrna && (
                <tr>
                  <td>lncRNA</td>
                  <td>{parsedData.summary.lncrna.genes}</td>
                  <td>{parsedData.summary.lncrna.transcripts}</td>
                </tr>
              )}
              {parsedData.summary.pseudogene && (
                <tr>
                  <td>Pseudogene</td>
                  <td>{parsedData.summary.pseudogene.genes}</td>
                  <td>{parsedData.summary.pseudogene.transcripts}</td>
                </tr>
              )}
              {parsedData.summary.alt_scaffolds && (
                <tr>
                  <td>Alt Scaffolds</td>
                  <td>{parsedData.summary.alt_scaffolds.genes}</td>
                  <td>{parsedData.summary.alt_scaffolds.transcripts}</td>
                </tr>
              )}
              {parsedData.summary.other && (
                <tr>
                  <td>Other</td>
                  <td>{parsedData.summary.other.genes}</td>
                  <td>{parsedData.summary.other.transcripts}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Download Table */}
      <Card>
        <Card.Body>
          <Card.Title>CHESS {release.tag_name} Data</Card.Title>
          <Table responsive striped hover className="download-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Content</th>
                <th style={{ width: '50%' }}>Description</th>
                <th style={{ width: '30%' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.files.map((file, index) => {
                const primaryAsset = assetMap.get(file.filenames[0]?.trim());
                
                return (
                  <tr key={index}>
                    <td>
                      <strong>{file.summary}</strong>
                      {file.genome && (
                        <Badge bg="secondary" className="ms-2">{file.genome}</Badge>
                      )}
                    </td>
                    <td>{file.description}</td>
                    <td>
                      <div className="download-links">
                        {file.filenames.map((filename, fileIndex) => {
                          const asset = assetMap.get(filename.trim());
                          const fileType = file.types[fileIndex];
                          
                          return asset ? (
                            <div key={fileIndex} className="download-link-item">
                              <a 
                                href={asset.browser_download_url}
                                className="btn btn-sm btn-outline-primary me-2 mb-1"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {fileType}
                              </a>
                              <small className="text-muted d-block">
                                {formatFileSize(asset.size)} • Updated {formatDate(asset.updated_at)}
                              </small>
                            </div>
                          ) : null;
                        })}
                        
                        {/* Add genome fasta links if applicable */}
                        {file.genome === 'GRCh38' && (
                          <div className="download-link-item">
                            <a 
                              href="./data/hg38_p12_ucsc.fa.gz"
                              className="btn btn-sm btn-outline-secondary me-2 mb-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Genome Fasta
                            </a>
                            <small className="text-muted d-block">Reference genome</small>
                          </div>
                        )}
                        
                        {file.genome === 'CHM13' && (
                          <div className="download-link-item">
                            <a 
                              href="./data/chm13v2.0.fa.gz"
                              className="btn btn-sm btn-outline-secondary me-2 mb-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Genome Fasta
                            </a>
                            <small className="text-muted d-block">Reference genome</small>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Release Statement */}
      {parsedData.statement && (
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Release Notes</Card.Title>
            <Card.Text>{parsedData.statement}</Card.Text>
          </Card.Body>
        </Card>
      )}
    </>
  );

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="mb-4">Download Genome Annotations</h1>
          
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => setActiveTab(k || 'current')}
            className="mb-4"
          >
            <Tab eventKey="current" title={`${release.tag_name}`}>
              <CurrentReleaseContent />
            </Tab>
            <Tab eventKey="history" title="Release History">
              <ReleaseHistory onReleaseSelect={handleReleaseSelect} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default Download; 