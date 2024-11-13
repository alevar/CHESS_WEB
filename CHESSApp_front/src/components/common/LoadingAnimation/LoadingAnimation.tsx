import React from 'react';
import chessLogo from '../../../assets/logos/chess.logo.cropped.svg';
import './LoadingAnimation.css';

const LoadingAnimation: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="text">Loading ...</div>
      <div className="animation-wrapper">
        <img src={chessLogo} alt="Loading" className="loading-logo" />
      </div>
    </div>
  );
};

export default LoadingAnimation;
