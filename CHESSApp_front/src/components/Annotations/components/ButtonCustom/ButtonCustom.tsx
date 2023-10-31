import React from 'react';

const ButtonCustom = ({ onClick }) => {
  return (
    <button className="btn btn-primary" onClick={onClick}>
      Create Custom Annotation
    </button>
  );
};

export default ButtonCustom;