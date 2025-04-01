import React, { useState, useContext } from 'react';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/AddForm.css';

const AddHHAHForm = ({ onClose }) => {
  const [hhahName, setHhahName] = useState('');
  const [patients, setPatients] = useState('');
  const [unbilled, setUnbilled] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [funnelStage, setFunnelStage] = useState('Total Patient Base');
  const { hhahData, setHhahData, hhahFunnelData, updateHhahFunnelData } = useContext(FunnelDataContext) || {};

  const hhahStages = [
    "Total Patient Base",
    "Eligible Patients",
    "Assessment Ready",
    "Service Ready",
    "In Treatment",
    "Near Completion",
    "Complete"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form and context
    if (!hhahName || !patients || !unbilled || !outcomes || !funnelStage) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!hhahData || !setHhahData || !hhahFunnelData || !updateHhahFunnelData) {
      alert('Context data is not available. Please try again later.');
      return;
    }

    // Add new HHAH to list
    const newHhah = {
      name: hhahName,
      patients: parseInt(patients),
      unbilled: parseInt(unbilled),
      outcomes: parseInt(outcomes)
    };
    
    const updatedHhahData = [...hhahData, newHhah];
    setHhahData(updatedHhahData);
    
    // Update funnel data
    const newFunnelData = [...hhahFunnelData];
    const stageIndex = hhahStages.indexOf(funnelStage);
    
    if (stageIndex !== -1) {
      // Update the value for the stage and cascade down through stages
      for (let i = stageIndex; i < newFunnelData.length; i++) {
        newFunnelData[i].value += parseInt(patients);
      }
      
      // Update funnel assignments (add the new HHAH to its stage)
      updateHhahFunnelData(newFunnelData, hhahName, funnelStage);
    }
    
    // Close the form
    onClose();
  };

  return (
    <div className="add-form-overlay">
      <div className="add-form-container">
        <h3>Add New HHAH Agency</h3>
        <button className="close-button" onClick={onClose}>×</button>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>HHAH Name</label>
            <input 
              type="text" 
              value={hhahName} 
              onChange={(e) => setHhahName(e.target.value)}
              placeholder="Enter HHAH name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Total Patients</label>
            <input 
              type="number" 
              value={patients} 
              onChange={(e) => setPatients(e.target.value)}
              placeholder="Number of patients"
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Unbilled Episodes</label>
            <input 
              type="number" 
              value={unbilled} 
              onChange={(e) => setUnbilled(e.target.value)}
              placeholder="Unbilled episodes"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Active/Reactive OC</label>
            <input 
              type="number" 
              value={outcomes} 
              onChange={(e) => setOutcomes(e.target.value)}
              placeholder="Number of outcomes"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Funnel Stage</label>
            <select 
              value={funnelStage} 
              onChange={(e) => setFunnelStage(e.target.value)}
              required
            >
              {hhahStages.map((stage, index) => (
                <option key={index} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add HHAH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHHAHForm; 