import React, { useState, useEffect } from 'react';
import { Table, Card, Spinner, Alert } from 'react-bootstrap';
import { fetchGitHubReleases, parseGitReleaseBody } from '../../utils/githubUtils';
import { GitHubRelease, ParsedReleaseData } from '../../types/github';

interface ReleaseHistoryProps {
  onReleaseSelect?: (release: GitHubRelease) => void;
}

const ReleaseHistory: React.FC<ReleaseHistoryProps> = ({ onReleaseSelect }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [releases, setReleases] = useState<Array<{
    release: GitHubRelease;
    parsedData: ParsedReleaseData;
  }>>([]);

  useEffect(() => {
    const loadReleases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allReleases = await fetchGitHubReleases();
        
        const releasesWithData = allReleases.map(release => {
          const parsedData = parseGitReleaseBody(release.body);
          return { release, parsedData };
        });
        
        setReleases(releasesWithData);
      } catch (err) {
        console.error('Error loading releases:', err);
        setError(err instanceof Error ? err.message : 'Failed to load releases');
      } finally {
        setLoading(false);
      }
    };

    loadReleases();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const calculateTotals = (summary: any) => {
    const proteinCoding = summary.protein_coding || { genes: '0', transcripts: '0' };
    const lncRNA = summary.lncRNA || { genes: '0', transcripts: '0' };
    const other = summary.other || { genes: '0', transcripts: '0' };

    const totalGenes = parseInt(proteinCoding.genes) + parseInt(lncRNA.genes) + parseInt(other.genes);
    const totalTranscripts = parseInt(proteinCoding.transcripts) + parseInt(lncRNA.transcripts) + parseInt(other.transcripts);

    return { totalGenes, totalTranscripts };
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading release history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Release History</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Release History</Card.Title>
        <Table responsive striped hover className="release-history-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Notes</th>
              <th>Statistics</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {releases.map(({ release, parsedData }, index) => {
              const { totalGenes, totalTranscripts } = calculateTotals(parsedData.summary);
              
              return (
                <tr 
                  key={release.id} 
                  className={index % 2 === 0 ? 'altrow' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onReleaseSelect && onReleaseSelect(release)}
                >
                  <td>
                    <a 
                      href={release.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {release.name}
                    </a>
                  </td>
                  <td>
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {parsedData.statement || 'No release notes available'}
                    </div>
                  </td>
                  <td>
                    <Table size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th></th>
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
                        <tr style={{ fontWeight: 'bold', borderTop: '1px solid #dee2e6' }}>
                          <td>Total</td>
                          <td>{totalGenes.toLocaleString()}</td>
                          <td>{totalTranscripts.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </td>
                  <td>{formatDate(release.published_at)}</td>
                  <td>
                    <a 
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Learn More
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ReleaseHistory; 