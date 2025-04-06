import React, { useState } from 'react';
import PatientDetailView from './PatientDetailView';
import PatientFormComponent from '../patients/PatientFormComponent';
import './PGServicesView.css';
import '../patients/PatientFormComponent.css';

const PGServicesView = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToMain = () => {
    setSelectedPatient(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // If a patient is selected, render the PatientDetailView
  if (selectedPatient) {
    return (
      <PatientDetailView 
        patient={selectedPatient} 
        onBack={handleBackToMain} 
      />
    );
  }

  // Otherwise, render the PatientFormComponent with improved UI
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
        <div className="pg-services-search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search patients by name, PG, or HHAH..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pg-services-search-input"
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </header>
      
      <main className="pg-services-main-content">
        <div className="pg-services-content-card">
          <PatientFormComponent 
            onPatientClick={handlePatientSelect} 
            searchQuery={searchQuery}
          />
        </div>
      </main>
    </div>
  );
};

export default PGServicesView;