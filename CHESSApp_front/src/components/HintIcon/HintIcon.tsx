import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './HintIcon.css'; // Import the CSS file

interface HintIconProps {
  sourceData: {
    name: string;
    information: string;
  };
}

const HintIcon: React.FC<HintIconProps> = ({ sourceData }) => {
  const renderTooltip = (props: any) => (
    <Tooltip id="hint-tooltip" {...props}>
      <div>
        <b>{sourceData.name}</b>
      </div>
      <hr style={{ margin: '5px 0' }} /> {/* Horizontal separator */}
      <div>{sourceData.information}</div>
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="top" overlay={renderTooltip}>
      <FontAwesomeIcon icon={faQuestionCircle} className="hint-icon" />
    </OverlayTrigger>
  );
};

export default HintIcon;
