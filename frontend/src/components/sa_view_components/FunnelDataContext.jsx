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
  { name: "They exist but they haven't heard of us", value: 1000, fill: "#2980B9" },
  { name: "They've now heard of us but that's it", value: 800, fill: "#45B7D1" },
  { name: "Enough interest that they're interacting with our content", value: 600, fill: "#F39C12" },
  { name: "Enough interest that they're now talking to us", value: 400, fill: "#E67E22" },
  { name: "They've had a demo", value: 300, fill: "#E74C3C" },
  { name: "In the buying process", value: 200, fill: "#E57373" },
  { name: "Deal is so hot your hands will burn if you touch it", value: 150, fill: "#4CAF50" },
  { name: "On the platform", value: 100, fill: "#795548" },
  { name: "In the upselling zone", value: 50, fill: "#9C27B0" },
  { name: "Upsold to CPOs/CCMs/RPMs/other services", value: 25, fill: "#F48FB1" }
];

// Initial HHAH funnel data
const initialHhahFunnelData = [
  { name: "They exist but they haven't heard of us", value: 800, fill: "#C0392B" },
  { name: "They've now heard of us but that's it", value: 650, fill: "#E74C3C" },
  { name: "Enough interest that they're interacting with our content", value: 500, fill: "#9B59B6" },
  { name: "Enough interest that they're now talking to us", value: 350, fill: "#F1C40F" },
  { name: "99 cent model", value: 200, fill: "#2ECC71" },
  { name: "Upsold (Fully subscribed)", value: 100, fill: "#16A085" }
];

// Initial assignments
const initialPgAssignments = {
  "They exist but they haven't heard of us": ["PG Alpha", "PG Beta", "PG Gamma"],
  "They've now heard of us but that's it": ["PG Delta", "PG Epsilon"],
  "Enough interest that they're interacting with our content": ["PG Zeta", "PG Eta"],
  "Enough interest that they're now talking to us": ["PG Theta", "PG Iota"],
  "They've had a demo": ["PG Kappa"],
  "In the buying process": ["PG Lambda"],
  "Deal is so hot your hands will burn if you touch it": ["PG Mu"],
  "On the platform": ["PG Nu"],
  "In the upselling zone": ["PG Xi"],
  "Upsold to CPOs/CCMs/RPMs/other services": ["PG Omicron"]
};

const initialHhahAssignments = {
  "They exist but they haven't heard of us": ["HHAH Alpha", "HHAH Beta", "HHAH Gamma"],
  "They've now heard of us but that's it": ["HHAH Delta", "HHAH Epsilon"],
  "Enough interest that they're interacting with our content": ["HHAH Zeta", "HHAH Eta"],
  "Enough interest that they're now talking to us": ["HHAH Theta", "HHAH Iota"],
  "99 cent model": ["HHAH Kappa", "HHAH Lambda"],
  "Upsold (Fully subscribed)": ["HHAH Mu", "HHAH Nu", "HHAH Xi", "HHAH Omicron"]
};

// Create the context
const FunnelDataContext = createContext();

// Create the provider component
const FunnelDataProvider = ({ children }) => {
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

export { FunnelDataContext, FunnelDataProvider }; 