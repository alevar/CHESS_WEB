// HintIcon.tsx

import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

interface HintIconProps {
  sourceData: string;
}

const HintIcon: React.FC<HintIconProps> = ({ sourceData }) => {
  const renderTooltip = (props) => (
    <Tooltip id="hint-tooltip" {...props}>
      <div>
        <b>{sourceData["name"]}</b>
      </div>
      <hr style={{ margin: '5px 0' }} /> {/* Horizontal separator */}
      <div>
        {sourceData["information"]}
      </div>
    </Tooltip>
  );
  

  return (
    <OverlayTrigger placement="right" overlay={renderTooltip}>
      <FontAwesomeIcon icon={faQuestionCircle} style={{ cursor: 'pointer' }} />
    </OverlayTrigger>
  );
};

export default HintIcon;
