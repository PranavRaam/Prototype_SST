import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../sa_view_css/NavigationButtons.css';

const NavigationButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="nav-buttons-container">
      <button 
        className="nav-button"
        onClick={() => navigate('/pg-services')}
      >
        PG Services
      </button>
      <button 
        className="nav-button"
        onClick={() => navigate('/hhah-services')}
      >
        HHAH Services
      </button>
    </div>
  );
};

export default NavigationButtons; 