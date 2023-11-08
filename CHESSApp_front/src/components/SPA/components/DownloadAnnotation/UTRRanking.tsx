import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

interface UTRRankingProps {
  options: string[];
  defaultRanking: string[];
}

const UTRRanking: React.FC<UTRRankingProps> = ({
  options,
  defaultRanking,
}) => {
  const [ranking, setRanking] = useState(defaultRanking);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const newRanking = [...ranking];
    newRanking[parseInt(name)] = value;
    setRanking(newRanking);
  };

  return (
    <Form>
      {options.map((option, index) => (
        <Form.Group controlId={`formRanking${index}`} key={index}>
          <Form.Control
            as="select"
            name={index.toString()}
            value={ranking[index]}
            onChange={handleChange}
          >
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      ))}
    </Form>
  );
};

export default UTRRanking;
