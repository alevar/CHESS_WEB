import React, { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FullTranscriptData } from '../../../types/geneTypes';
import ExpressionBoxplot from './ExpressionBoxplot';
import PDBEntry from './PDBEntry';
import { TRANSCRIPT_COLORS } from '../constants';

interface DatasetDisplayProps {
  primaryTranscriptDetails: FullTranscriptData | null;
  secondaryTranscriptDetails: FullTranscriptData | null;
  isSecondaryModeEnabled?: boolean;
}

const DatasetDisplay: React.FC<DatasetDisplayProps> = ({
  primaryTranscriptDetails,
  secondaryTranscriptDetails,
  isSecondaryModeEnabled = false
}) => {
  const [boxplotSortBy, setBoxplotSortBy] = useState<'median' | 'group' | 'mean' | 'count'>('median');
  const [boxplotSortOrder, setBoxplotSortOrder] = useState<'asc' | 'desc'>('desc');
  const [boxplotSortByTranscript, setBoxplotSortByTranscript] = useState<'primary' | 'secondary'>('primary');

  if (!primaryTranscriptDetails?.datasets) {
    return null;
  }

  return (
    <>
      {primaryTranscriptDetails.datasets.map((primaryDataset: any, index: number) => {
        // Find corresponding secondary dataset
        const secondaryDataset = secondaryTranscriptDetails?.datasets?.find((d: any) =>
          d.dataset_name === primaryDataset.dataset_name
        );

        return (
          <div key={index} id={`primary-dataset-${index}`} className="mb-4">
            <Row className="mb-3">
              <Col>
                <h5 className="fw-bold">
                  <i className="bi bi-table me-2"></i>
                  {primaryDataset.dataset_name}
                </h5>
                <p className="text-muted mb-0 small">{primaryDataset.dataset_description}</p>
              </Col>
            </Row>
            
            {/* Dataset Content */}
            <Row>
              {primaryDataset.data_type === 'pdb' && (
                <>
                    <Col md={isSecondaryModeEnabled ? 6 : 12}>
                        <PDBEntry dataset={primaryDataset} bg_color={TRANSCRIPT_COLORS.primary.lightest} />
                    </Col>

                    {/* Secondary Dataset Column - Only show if dual mode is enabled */}
                    {isSecondaryModeEnabled && secondaryDataset && secondaryDataset.data_type === 'pdb' && (
                        <Col md={6}>
                            <PDBEntry dataset={secondaryDataset} bg_color={TRANSCRIPT_COLORS.secondary.lightest} />
                        </Col>
                    )}
                </>
              )}

              {primaryDataset.data_type === 'boxplot' && primaryDataset.data_entries.length > 0 && (
                <Col xs={12}>
                  <Card>
                    <Card.Body>
                      {isSecondaryModeEnabled && secondaryDataset && secondaryDataset.data_type === 'boxplot' ? (
                          <ExpressionBoxplot
                              data={primaryDataset.data_entries[0].data}
                              secondaryData={secondaryDataset.data_entries[0]?.data}
                              height={400}
                              sortBy={boxplotSortBy}
                              sortOrder={boxplotSortOrder}
                              sortByTranscript={boxplotSortByTranscript}
                              onSortByChange={setBoxplotSortBy}
                              onSortOrderChange={setBoxplotSortOrder}
                              onSortByTranscriptChange={setBoxplotSortByTranscript}
                              primaryColor={TRANSCRIPT_COLORS.primary.main}
                              secondaryColor={TRANSCRIPT_COLORS.secondary.main}
                              primaryLabel={primaryTranscriptDetails?.transcript_id || 'Primary'}
                              secondaryLabel={secondaryTranscriptDetails?.transcript_id || 'Secondary'}
                              comparisonMode={true}
                          />
                      ) : (
                          <ExpressionBoxplot
                              data={primaryDataset.data_entries[0].data}
                              height={400}
                              sortBy={boxplotSortBy}
                              sortOrder={boxplotSortOrder}
                              sortByTranscript={boxplotSortByTranscript}
                              onSortByChange={setBoxplotSortBy}
                              onSortOrderChange={setBoxplotSortOrder}
                              onSortByTranscriptChange={setBoxplotSortByTranscript}
                              primaryColor={TRANSCRIPT_COLORS.primary.main}
                              secondaryColor={TRANSCRIPT_COLORS.secondary.main}
                              />
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        );
      })}
    </>
  );
};

export default DatasetDisplay;