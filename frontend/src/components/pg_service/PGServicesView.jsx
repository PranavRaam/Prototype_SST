import React, { useState } from 'react';
import PatientDetailView from './PatientDetailView';
import PatientFormComponent from '../patients/PatientFormComponent';
import './PGServicesView.css';

const PGServicesView = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Handle returning to the main view
  const handleBackToMain = () => {
    setSelectedPatient(null);
  };

  // If a patient is selected, show the patient detail view
  if (selectedPatient) {
    return (
      <PatientDetailView 
        patient={selectedPatient} 
        onBack={handleBackToMain} 
      />
    );
  }

  // Otherwise show the main services view
  return (
    <div className="pg-services-view">
      <header className="pg-services-header">
        <div className="pg-services-header-left">
          <button 
            className="pg-services-back-button" 
            onClick={() => window.history.back()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="pg-services-page-title">PG Services</h1>
        </div>
      </header>
      
      <main className="pg-services-main-content">
        <div className="pg-services-patient-form-container full-height">
          <PatientFormComponent />
        </div>
      </main>
    </div>
  );
};

export default PGServicesView;