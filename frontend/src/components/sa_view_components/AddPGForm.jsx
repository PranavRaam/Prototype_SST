import React, { useState, useContext } from 'react';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/AddForm.css';

const AddPGForm = ({ onClose }) => {
  const [pgName, setPgName] = useState('');
  const [patients, setPatients] = useState('');
  const [remaining, setRemaining] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [funnelStage, setFunnelStage] = useState('Total Potential Patients');
  const { pgData, setPgData, pgFunnelData, updatePgFunnelData } = useContext(FunnelDataContext) || {};

  const pgStages = [
    "Total Potential Patients",
    "Active Interest",
    "Initial Contact",
    "In Assessment",
    "Ready for Service",
    "Service Started", 
    "Active Treatment",
    "Ready for Discharge",
    "Discharged",
    "Post-Discharge"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form and context
    if (!pgName || !patients || !remaining || !outcomes || !funnelStage) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!pgData || !setPgData || !pgFunnelData || !updatePgFunnelData) {
      alert('Context data is not available. Please try again later.');
      return;
    }

    // Add new PG to list
    const newPg = {
      name: pgName,
      patients: parseInt(patients),
      remaining: parseInt(remaining),
      outcomes: parseInt(outcomes)
    };
    
    const updatedPgData = [...pgData, newPg];
    setPgData(updatedPgData);
    
    // Update funnel data
    const newFunnelData = [...pgFunnelData];
    const stageIndex = pgStages.indexOf(funnelStage);
    
    if (stageIndex !== -1) {
      // Update the value for the stage and cascade down through stages
      for (let i = stageIndex; i < newFunnelData.length; i++) {
        newFunnelData[i].value += parseInt(patients);
      }
      
      // Update funnel assignments (add the new PG to its stage)
      updatePgFunnelData(newFunnelData, pgName, funnelStage);
    }
    
    // Close the form
    onClose();
  };

  return (
    <div className="add-form-overlay">
      <div className="add-form-container">
        <h3>Add New Physician Group</h3>
        <button className="close-button" onClick={onClose}>×</button>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>PG Name</label>
            <input 
              type="text" 
              value={pgName} 
              onChange={(e) => setPgName(e.target.value)}
              placeholder="Enter PG name"
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
            <label>Patients Remaining (30 CPO)</label>
            <input 
              type="number" 
              value={remaining} 
              onChange={(e) => setRemaining(e.target.value)}
              placeholder="Patients remaining"
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
              {pgStages.map((stage, index) => (
                <option key={index} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add PG
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPGForm; 