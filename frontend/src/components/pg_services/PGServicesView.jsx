import React, { useState, useEffect } from 'react';
import './PGServicesView.css';
import * as XLSX from 'xlsx';

// Sample data for demonstration
const dummyData = [
  {
    ptName: 'John Smith',
    dob: '12/15/1945',
    pg: 'Internal Medicine Associates',
    hhah: 'Yes',
    cpoMinsCaptured: 45,
    remarks: 'Stable condition, monitoring required',
    newDocs: 3,
    newCPODocsCreated: 2
  },
  {
    ptName: 'Mary Johnson',
    dob: '05/22/1938',
    pg: 'Lakeside Primary Care',
    hhah: 'No',
    cpoMinsCaptured: 30,
    remarks: 'Follow-up in 2 weeks',
    newDocs: 1,
    newCPODocsCreated: 1
  },
  {
    ptName: 'Robert Williams',
    dob: '09/03/1942',
    pg: 'Downtown Medical Group',
    hhah: 'Yes',
    cpoMinsCaptured: 60,
    remarks: 'Medication adjustment needed',
    newDocs: 4,
    newCPODocsCreated: 3
  },
  {
    ptName: 'Patricia Brown',
    dob: '11/18/1950',
    pg: 'Westside Healthcare',
    hhah: 'No',
    cpoMinsCaptured: 15,
    remarks: 'New patient assessment',
    newDocs: 5,
    newCPODocsCreated: 2
  },
  {
    ptName: 'James Davis',
    dob: '04/07/1940',
    pg: 'Hillcrest Medical Partners',
    hhah: 'Yes',
    cpoMinsCaptured: 75,
    remarks: 'Chronic condition management',
    newDocs: 2,
    newCPODocsCreated: 2
  },
  {
    ptName: 'Jennifer Miller',
    dob: '01/25/1948',
    pg: 'Eastside Family Practice',
    hhah: 'No',
    cpoMinsCaptured: 20,
    remarks: 'Lab results pending',
    newDocs: 0,
    newCPODocsCreated: 0
  },
  {
    ptName: 'Charles Wilson',
    dob: '07/14/1939',
    pg: 'Valley Medical Associates',
    hhah: 'Yes',
    cpoMinsCaptured: 50,
    remarks: 'Post-hospital follow-up',
    newDocs: 6,
    newCPODocsCreated: 4
  },
  {
    ptName: 'Elizabeth Moore',
    dob: '03/30/1946',
    pg: 'Riverview Health Group',
    hhah: 'No',
    cpoMinsCaptured: 25,
    remarks: 'Routine checkup',
    newDocs: 1,
    newCPODocsCreated: 1
  }
];

const PGServicesView = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredData, setFilteredData] = useState(dummyData);
  
  // Filter and search logic
  useEffect(() => {
    let results = [...dummyData];
    
    // Apply search
    if (searchTerm) {
      results = results.filter(item => 
        item.ptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pg.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(results);
  }, [searchTerm, filterType]);
  
  const handleExport = () => {
    // Create a worksheet from the filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    
    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PG Services");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "PG_Services_Report.xlsx");
  };
  
  return (
    <div className="pg-services-container">
      <div className="back-button" onClick={onBack}>
        ← Back
      </div>
      
      <h1 className="pg-services-title">PG Services</h1>
      
      <div className="pg-services-header">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
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