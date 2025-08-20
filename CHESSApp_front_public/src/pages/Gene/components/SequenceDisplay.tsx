import React, { useState } from 'react';
import { Card, Badge, Alert, Button } from 'react-bootstrap';
import { FullTranscriptData } from '../../../types/geneTypes';

interface SequenceDisplayProps {
  transcriptData: FullTranscriptData | null;
}

const SequenceDisplay: React.FC<SequenceDisplayProps> = ({ transcriptData }) => {
  const [expandedSequences, setExpandedSequences] = useState<Set<string>>(new Set());

  if (!transcriptData?.nt_sequence) return null;

  const sequences = [
    {
      id: 'nucleotide',
      label: 'DNA',
      title: 'Nucleotide Sequence (Full Transcript)',
      sequence: transcriptData.nt_sequence,
      variant: 'primary'
    },
    {
      id: 'cds',
      label: 'CDS', 
      title: 'CDS Sequence (Coding Region)',
      sequence: transcriptData.cds_sequence,
      variant: 'secondary'
    },
    {
      id: 'amino',
      label: 'AA',
      title: 'Amino Acid Sequence (Translated)', 
      sequence: transcriptData.cds_aa_sequence,
      variant: 'success'
    }
  ];

  const validSequences = sequences.filter(seq => seq.sequence?.trim());
  const hasCdsData = transcriptData.cds_sequence?.trim() || transcriptData.cds_aa_sequence?.trim();

  const toggleSequence = (sequenceId: string) => {
    const newExpanded = new Set(expandedSequences);
    if (newExpanded.has(sequenceId)) {
      newExpanded.delete(sequenceId);
    } else {
      newExpanded.add(sequenceId);
    }
    setExpandedSequences(newExpanded);
  };

  return (
    <div className="sequence-display">
      {validSequences.map(seq => (
        <div key={seq.id} className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <Badge 
              bg={seq.variant} 
              className="me-2"
              style={{ cursor: 'pointer' }}
              onClick={() => toggleSequence(seq.id)}
            >
              {seq.label}
            </Badge>
            <span className="fw-semibold me-2">{seq.title}</span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => toggleSequence(seq.id)}
              className="ms-auto"
            >
              {expandedSequences.has(seq.id) ? 'Collapse' : 'Expand'}
            </Button>
          </div>
          
          {expandedSequences.has(seq.id) && (
            <Card>
              <Card.Body className="p-3">
                <code 
                  className="d-block text-break"
                  style={{ 
                    fontSize: '0.75rem', 
                    lineHeight: '1.4',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {seq.sequence}
                </code>
              </Card.Body>
            </Card>
          )}
        </div>
      ))}
      
      {!hasCdsData && (
        <Alert variant="info" className="mb-0">
          No CDS sequence available for this transcript
        </Alert>
      )}
    </div>
  );
};

export default SequenceDisplay;