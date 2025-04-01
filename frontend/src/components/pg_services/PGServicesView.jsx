import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './PGServicesView.css';

const dummyData = [
  {
    ptName: "John Smith",
    dob: "1965-03-15",
    pg: "Group A",
    hhah: "Yes",
    cpoMinsCaptured: 45,
    remarks: "Regular checkup needed",
    newDocs: 10,
    newCPODocsCreated: 15
  },
  {
    ptName: "Mary Johnson",
    dob: "1978-08-22",
    pg: "Group B",
    hhah: "No",
    cpoMinsCaptured: 30,
    remarks: "Pending assessment",
    newDocs: 9,
    newCPODocsCreated: 15
  },
  {
    ptName: "Robert Chen",
    dob: "1952-11-05",
    pg: "Group C",
    hhah: "Yes",
    cpoMinsCaptured: 60,
    remarks: "Post-surgery recovery",
    newDocs: 15,
    newCPODocsCreated: 15
  },
  {
    ptName: "Elizabeth Taylor",
    dob: "1948-07-19",
    pg: "Group A",
    hhah: "No",
    cpoMinsCaptured: 25,
    remarks: "Medication review pending",
    newDocs: 8,
    newCPODocsCreated: 15
  },
  {
    ptName: "James Wilson",
    dob: "1972-09-30",
    pg: "Group D",
    hhah: "Yes",
    cpoMinsCaptured: 40,
    remarks: "Stable condition",
    newDocs: 12,
    newCPODocsCreated: 15
  },
  {
    ptName: "Patricia Davis",
    dob: "1961-12-08",
    pg: "Group B",
    hhah: "Yes",
    cpoMinsCaptured: 55,
    remarks: "Physical therapy required",
    newDocs: 14,
    newCPODocsCreated: 15
  },
  {
    ptName: "Thomas Martinez",
    dob: "1955-02-14",
    pg: "Group C",
    hhah: "No",
    cpoMinsCaptured: 35,
    remarks: "High priority - follow up",
    newDocs: 11,
    newCPODocsCreated: 15
  },
  {
    ptName: "Jennifer Lopez",
    dob: "1980-04-25",
    pg: "Group A",
    hhah: "Yes",
    cpoMinsCaptured: 50,
    remarks: "Annual wellness visit",
    newDocs: 13,
    newCPODocsCreated: 15
  },
  {
    ptName: "William Anderson",
    dob: "1943-10-31",
    pg: "Group D",
    hhah: "No",
    cpoMinsCaptured: 20,
    remarks: "Memory care evaluation",
    newDocs: 7,
    newCPODocsCreated: 15
  },
  {
    ptName: "Linda Thompson",
    dob: "1968-06-17",
    pg: "Group B",
    hhah: "Yes",
    cpoMinsCaptured: 65,
    remarks: "Completed all documents",
    newDocs: 16,
    newCPODocsCreated: 15
  },
  {
    ptName: "Charles Robinson",
    dob: "1975-01-09",
    pg: "Group C",
    hhah: "No",
    cpoMinsCaptured: 28,
    remarks: "New patient intake",
    newDocs: 6,
    newCPODocsCreated: 15
  },
  {
    ptName: "Margaret Scott",
    dob: "1959-05-22",
    pg: "Group A",
    hhah: "Yes",
    cpoMinsCaptured: 48,
    remarks: "Chronic condition management",
    newDocs: 17,
    newCPODocsCreated: 15
  },
  {
    ptName: "Joseph Nguyen",
    dob: "1963-07-04",
    pg: "Group D",
    hhah: "No",
    cpoMinsCaptured: 32,
    remarks: "Lab results pending",
    newDocs: 5,
    newCPODocsCreated: 15
  },
  {
    ptName: "Susan King",
    dob: "1970-12-12",
    pg: "Group B",
    hhah: "Yes",
    cpoMinsCaptured: 58,
    remarks: "Preventive care completed",
    newDocs: 18,
    newCPODocsCreated: 15
  },
  {
    ptName: "Daniel Wright",
    dob: "1947-03-08",
    pg: "Group C",
    hhah: "Yes",
    cpoMinsCaptured: 42,
    remarks: "Home health services needed",
    newDocs: 19,
    newCPODocsCreated: 15
  },
  {
    ptName: "Karen Evans",
    dob: "1969-09-19",
    pg: "Group A",
    hhah: "No",
    cpoMinsCaptured: 27,
    remarks: "Urgent: medication adjustment",
    newDocs: 4,
    newCPODocsCreated: 15
  },
  {
    ptName: "Paul Baker",
    dob: "1954-11-27",
    pg: "Group D",
    hhah: "Yes",
    cpoMinsCaptured: 52,
    remarks: "Stable - routine monitoring",
    newDocs: 20,
    newCPODocsCreated: 15
  },
  {
    ptName: "Nancy Rivera",
    dob: "1973-02-14",
    pg: "Group B",
    hhah: "No",
    cpoMinsCaptured: 38,
    remarks: "Behavioral health referral",
    newDocs: 3,
    newCPODocsCreated: 15
  },
  {
    ptName: "Mark Cooper",
    dob: "1960-04-03",
    pg: "Group C",
    hhah: "Yes",
    cpoMinsCaptured: 62,
    remarks: "Cardiac rehab in progress",
    newDocs: 21,
    newCPODocsCreated: 15
  },
  {
    ptName: "Lisa Morris",
    dob: "1957-08-11",
    pg: "Group A",
    hhah: "No",
    cpoMinsCaptured: 29,
    remarks: "Critical: needs immediate review",
    newDocs: 2,
    newCPODocsCreated: 15
  }
];

const PGServicesView = ({ onBack }) => {
  const [data] = useState(dummyData);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on current filters
  const filteredData = data.filter(item => {
    // Apply search filter
    if (searchTerm && !Object.values(item).some(
      val => String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }

    // Apply HHAH filter
    if (filterType === 'hhahYes' && item.hhah.toLowerCase() !== 'yes') {
      return false;
    }
    if (filterType === 'hhahNo' && item.hhah.toLowerCase() !== 'no') {
      return false;
    }

    return true;
  });

  // Handle export to Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(item => ({
        "PT.NAME": item.ptName,
        "DOB": item.dob,
        "PG": item.pg,
        "HHAH": item.hhah,
        "CPO MINS CAPTURED": item.cpoMinsCaptured,
        "REMARKS": item.remarks,
        "NEWDOCS": item.newDocs,
        "NEW CPO DOCS CREATED": item.newCPODocsCreated
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PG Services");
    XLSX.writeFile(workbook, "PG_Services_Data.xlsx");
  };

  return (
    <div className="pg-services-container">
      <div className="pg-header">
        <h2>PG Services View</h2>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filterType === 'hhahYes' ? 'active' : ''}`}
            onClick={() => setFilterType('hhahYes')}
          >
            HHAH Yes
          </button>
          <button 
            className={`filter-tab ${filterType === 'hhahNo' ? 'active' : ''}`}
            onClick={() => setFilterType('hhahNo')}
          >
            HHAH No
          </button>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Patient, PG, or Remarks"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </span>
          </div>
          
          <div className="action-buttons">
            <button className="icon-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12 2H4a1.5 1.5 0 0 0-1.5 1.5v2a.5.5 0 0 0 1 0v-2z"/>
                <path d="M8.354 10.354a.5.5 0 0 0 0-.708L6.707 8l1.647-1.646a.5.5 0 0 0-.708-.708l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708 0z"/>
              </svg>
            </button>
            <button className="icon-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4.754a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 5.754v4.5a1.5 1.5 0 0 0 1.5 1.5h6a.5.5 0 0 0 .5-.5v-1.5a.5.5 0 0 1 1 0v1.5a1.5 1.5 0 0 1-1.5 1.5h-6A2.5 2.5 0 0 1 0 10.754v-4.5a2.5 2.5 0 0 1 2.5-2.5h6a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 0 1 0v-1.5A1.5 1.5 0 0 0 8.5 2.754h-6A2.5 2.5 0 0 0 0 5.254v4.5A2.5 2.5 0 0 0 2.5 12.254h6A1.5 1.5 0 0 0 10 10.754v-1.5a.5.5 0 0 0-1 0v1.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 0 .5-.5Z"/>
                <path d="M16 8a.5.5 0 0 0-.5-.5H11a.5.5 0 0 0 0 1h4.5a.5.5 0 0 0 .5-.5Z"/>
              </svg>
            </button>
            <button className="icon-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
            <button className="icon-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
            </button>
          </div>
          
          <button className="export-button" onClick={handleExport}>
            Export to Excel
          </button>
        </div>
      </div>
      
      <div className="pg-table">
        <table>
          <thead>
            <tr>
              <th>PT.NAME</th>
              <th>DOB</th>
              <th>PG</th>
              <th>HHAH</th>
              <th>CPO MINS CAPTURED</th>
              <th>REMARKS</th>
              <th>NEWDOCS</th>
              <th>NEW CPO DOCS CREATED</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.ptName}</td>
                <td>{item.dob}</td>
                <td>{item.pg}</td>
                <td>{item.hhah}</td>
                <td className="center-align">{item.cpoMinsCaptured}</td>
                <td>{item.remarks}</td>
                <td className="center-align">{item.newDocs}</td>
                <td className="center-align">{item.newCPODocsCreated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PGServicesView; 