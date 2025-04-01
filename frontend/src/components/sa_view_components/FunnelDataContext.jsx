import React, { createContext, useState, useEffect } from 'react';

// Initial PG data
const initialPgData = [
  { name: 'PG Alpha', patients: 120, remaining: 30, outcomes: 5 },
  { name: 'PG Beta', patients: 95, remaining: 20, outcomes: 2 },
  { name: 'PG Gamma', patients: 150, remaining: 45, outcomes: 7 },
  { name: 'PG Delta', patients: 80, remaining: 25, outcomes: 3 },
  { name: 'PG Epsilon', patients: 110, remaining: 35, outcomes: 4 },
  { name: 'PG Zeta', patients: 140, remaining: 40, outcomes: 6 },
  { name: 'PG Eta', patients: 100, remaining: 28, outcomes: 2 },
  { name: 'PG Theta', patients: 90, remaining: 18, outcomes: 1 },
  { name: 'PG Iota', patients: 130, remaining: 38, outcomes: 5 },
  { name: 'PG Kappa', patients: 85, remaining: 22, outcomes: 3 },
  { name: 'PG Lambda', patients: 125, remaining: 33, outcomes: 4 },
  { name: 'PG Mu', patients: 105, remaining: 27, outcomes: 2 },
  { name: 'PG Nu', patients: 115, remaining: 30, outcomes: 3 },
  { name: 'PG Xi', patients: 135, remaining: 42, outcomes: 6 },
  { name: 'PG Omicron', patients: 145, remaining: 48, outcomes: 7 }
];

// Initial HHAH data
const initialHhahData = [
  { name: 'HHAH Alpha', patients: 200, unbilled: 15, outcomes: 6 },
  { name: 'HHAH Beta', patients: 180, unbilled: 10, outcomes: 5 },
  { name: 'HHAH Gamma', patients: 220, unbilled: 18, outcomes: 7 },
  { name: 'HHAH Delta', patients: 170, unbilled: 12, outcomes: 4 },
  { name: 'HHAH Epsilon', patients: 190, unbilled: 14, outcomes: 5 },
  { name: 'HHAH Zeta', patients: 210, unbilled: 16, outcomes: 6 },
  { name: 'HHAH Eta', patients: 195, unbilled: 13, outcomes: 4 },
  { name: 'HHAH Theta', patients: 175, unbilled: 11, outcomes: 3 },
  { name: 'HHAH Iota', patients: 205, unbilled: 17, outcomes: 5 },
  { name: 'HHAH Kappa', patients: 185, unbilled: 12, outcomes: 4 },
  { name: 'HHAH Lambda', patients: 215, unbilled: 19, outcomes: 6 },
  { name: 'HHAH Mu', patients: 198, unbilled: 14, outcomes: 5 },
  { name: 'HHAH Nu', patients: 202, unbilled: 15, outcomes: 5 },
  { name: 'HHAH Xi', patients: 225, unbilled: 20, outcomes: 7 },
  { name: 'HHAH Omicron', patients: 230, unbilled: 22, outcomes: 8 }
];

// Initial PG funnel data
const initialPgFunnelData = [
  { name: "Total Potential Patients", value: 1000, fill: "#2980B9" },
  { name: "Active Interest", value: 800, fill: "#45B7D1" },
  { name: "Initial Contact", value: 600, fill: "#F39C12" },
  { name: "In Assessment", value: 400, fill: "#E67E22" },
  { name: "Ready for Service", value: 300, fill: "#E74C3C" },
  { name: "Service Started", value: 200, fill: "#E57373" },
  { name: "Active Treatment", value: 150, fill: "#4CAF50" },
  { name: "Ready for Discharge", value: 100, fill: "#795548" },
  { name: "Discharged", value: 50, fill: "#9C27B0" },
  { name: "Post-Discharge", value: 25, fill: "#F48FB1" }
];

// Initial HHAH funnel data
const initialHhahFunnelData = [
  { name: "Total Patient Base", value: 800, fill: "#C0392B" },
  { name: "Eligible Patients", value: 650, fill: "#E74C3C" },
  { name: "Assessment Ready", value: 500, fill: "#9B59B6" },
  { name: "Service Ready", value: 350, fill: "#F1C40F" },
  { name: "In Treatment", value: 200, fill: "#2ECC71" },
  { name: "Near Completion", value: 100, fill: "#16A085" },
  { name: "Complete", value: 50, fill: "#3498DB" }
];

// Initial assignments
const initialPgAssignments = {
  "Total Potential Patients": ["PG Alpha", "PG Beta", "PG Gamma"],
  "Active Interest": ["PG Delta", "PG Epsilon"],
  "Initial Contact": ["PG Zeta", "PG Eta"],
  "In Assessment": ["PG Theta", "PG Iota"],
  "Ready for Service": ["PG Kappa"],
  "Service Started": ["PG Lambda"],
  "Active Treatment": ["PG Mu"],
  "Ready for Discharge": ["PG Nu"],
  "Discharged": ["PG Xi"],
  "Post-Discharge": ["PG Omicron"]
};

const initialHhahAssignments = {
  "Total Patient Base": ["HHAH Alpha", "HHAH Beta", "HHAH Gamma"],
  "Eligible Patients": ["HHAH Delta", "HHAH Epsilon"],
  "Assessment Ready": ["HHAH Zeta", "HHAH Eta"],
  "Service Ready": ["HHAH Theta", "HHAH Iota"],
  "In Treatment": ["HHAH Kappa", "HHAH Lambda"],
  "Near Completion": ["HHAH Mu", "HHAH Nu"],
  "Complete": ["HHAH Xi", "HHAH Omicron"]
};

// Create the context
export const FunnelDataContext = createContext();

// Create the provider component
export const FunnelDataProvider = ({ children }) => {
  const [pgData, setPgData] = useState(initialPgData);
  const [hhahData, setHhahData] = useState(initialHhahData);
  const [pgFunnelData, setPgFunnelData] = useState(initialPgFunnelData);
  const [hhahFunnelData, setHhahFunnelData] = useState(initialHhahFunnelData);
  const [pgAssignments, setPgAssignments] = useState(initialPgAssignments);
  const [hhahAssignments, setHhahAssignments] = useState(initialHhahAssignments);

  // Function to update PG funnel data and assignments
  const updatePgFunnelData = (newFunnelData, pgName, stageName) => {
    setPgFunnelData(newFunnelData);
    
    // Update assignments
    const newAssignments = { ...pgAssignments };
    if (!newAssignments[stageName]) {
      newAssignments[stageName] = [];
    }
    newAssignments[stageName].push(pgName);
    setPgAssignments(newAssignments);
  };

  // Function to update HHAH funnel data and assignments
  const updateHhahFunnelData = (newFunnelData, hhahName, stageName) => {
    setHhahFunnelData(newFunnelData);
    
    // Update assignments
    const newAssignments = { ...hhahAssignments };
    if (!newAssignments[stageName]) {
      newAssignments[stageName] = [];
    }
    newAssignments[stageName].push(hhahName);
    setHhahAssignments(newAssignments);
  };

  // Function to move a PG from one stage to another
  const movePgToStage = (pgName, fromStage, toStage) => {
    const newAssignments = { ...pgAssignments };
    
    // Remove from current stage
    newAssignments[fromStage] = newAssignments[fromStage].filter(pg => pg !== pgName);
    
    // Add to new stage
    if (!newAssignments[toStage]) {
      newAssignments[toStage] = [];
    }
    newAssignments[toStage].push(pgName);
    
    setPgAssignments(newAssignments);
    
    // Find the PG data
    const pgItem = pgData.find(pg => pg.name === pgName);
    if (pgItem) {
      const patientValue = pgItem.patients;
      
      // Update funnel data
      const newFunnelData = [...pgFunnelData];
      
      // Find indices of the stages
      const fromIndex = newFunnelData.findIndex(item => item.name === fromStage);
      const toIndex = newFunnelData.findIndex(item => item.name === toStage);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        // If moving forward in the funnel
        if (fromIndex < toIndex) {
          for (let i = fromIndex + 1; i <= toIndex; i++) {
            newFunnelData[i].value += patientValue;
          }
        } 
        // If moving backward in the funnel
        else if (fromIndex > toIndex) {
          for (let i = toIndex + 1; i <= fromIndex; i++) {
            newFunnelData[i].value -= patientValue;
          }
        }
        
        setPgFunnelData(newFunnelData);
      }
    }
  };

  // Function to move an HHAH from one stage to another
  const moveHhahToStage = (hhahName, fromStage, toStage) => {
    const newAssignments = { ...hhahAssignments };
    
    // Remove from current stage
    newAssignments[fromStage] = newAssignments[fromStage].filter(hhah => hhah !== hhahName);
    
    // Add to new stage
    if (!newAssignments[toStage]) {
      newAssignments[toStage] = [];
    }
    newAssignments[toStage].push(hhahName);
    
    setHhahAssignments(newAssignments);
    
    // Find the HHAH data
    const hhahItem = hhahData.find(hhah => hhah.name === hhahName);
    if (hhahItem) {
      const patientValue = hhahItem.patients;
      
      // Update funnel data
      const newFunnelData = [...hhahFunnelData];
      
      // Find indices of the stages
      const fromIndex = newFunnelData.findIndex(item => item.name === fromStage);
      const toIndex = newFunnelData.findIndex(item => item.name === toStage);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        // If moving forward in the funnel
        if (fromIndex < toIndex) {
          for (let i = fromIndex + 1; i <= toIndex; i++) {
            newFunnelData[i].value += patientValue;
          }
        } 
        // If moving backward in the funnel
        else if (fromIndex > toIndex) {
          for (let i = toIndex + 1; i <= fromIndex; i++) {
            newFunnelData[i].value -= patientValue;
          }
        }
        
        setHhahFunnelData(newFunnelData);
      }
    }
  };

  return (
    <FunnelDataContext.Provider
      value={{
        pgData,
        setPgData,
        hhahData,
        setHhahData,
        pgFunnelData,
        setPgFunnelData,
        hhahFunnelData,
        setHhahFunnelData,
        pgAssignments,
        setPgAssignments,
        hhahAssignments,
        setHhahAssignments,
        updatePgFunnelData,
        updateHhahFunnelData,
        movePgToStage,
        moveHhahToStage
      }}
    >
      {children}
    </FunnelDataContext.Provider>
  );
};

// Export the FunnelDataProvider as default
export default FunnelDataProvider; 