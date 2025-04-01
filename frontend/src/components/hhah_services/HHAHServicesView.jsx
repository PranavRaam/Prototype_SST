import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './HHAHServicesView.css';

const dummyData = [
  {
    ptName: "John Smith",
    dob: "1965-03-15",
    soc: "2024-01-01",
    fromToDate: "2024-01-01 - 2024-12-31",
    is485Signed: true,
    docsToBeSignedCount: 2,
    daysLeftForBilling: 15,
    pg: "Group A",
    physician: "Dr. Sarah Wilson",
    remarks: "Regular checkup needed"
  },
  {
    ptName: "Mary Johnson",
    dob: "1978-08-22",
    soc: "2024-02-15",
    fromToDate: "2024-02-15 - 2024-12-31",
    is485Signed: false,
    docsToBeSignedCount: 5,
    daysLeftForBilling: 3,
    pg: "Group B",
    physician: "Dr. Michael Brown",
    remarks: "Pending assessment"
  },
  {
    ptName: "Robert Chen",
    dob: "1952-11-05",
    soc: "2024-03-10",
    fromToDate: "2024-03-10 - 2025-03-09",
    is485Signed: true,
    docsToBeSignedCount: 1,
    daysLeftForBilling: 45,
    pg: "Group C",
    physician: "Dr. Amanda Lee",
    remarks: "Post-surgery recovery"
  },
  {
    ptName: "Elizabeth Taylor",
    dob: "1948-07-19",
    soc: "2024-01-22",
    fromToDate: "2024-01-22 - 2024-07-22",
    is485Signed: false,
    docsToBeSignedCount: 3,
    daysLeftForBilling: 7,
    pg: "Group A",
    physician: "Dr. David Miller",
    remarks: "Medication review pending"
  },
  {
    ptName: "James Wilson",
    dob: "1972-09-30",
    soc: "2024-04-05",
    fromToDate: "2024-04-05 - 2025-04-04",
    is485Signed: true,
    docsToBeSignedCount: 0,
    daysLeftForBilling: 92,
    pg: "Group D",
    physician: "Dr. Jennifer Park",
    remarks: "Stable condition"
  },
  {
    ptName: "Patricia Davis",
    dob: "1961-12-08",
    soc: "2024-05-18",
    fromToDate: "2024-05-18 - 2024-11-18",
    is485Signed: true,
    docsToBeSignedCount: 4,
    daysLeftForBilling: 22,
    pg: "Group B",
    physician: "Dr. Kevin White",
    remarks: "Physical therapy required"
  }
];

const HHAHServicesView = ({ onBack }) => {
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

    // Apply signed filter
    if (filterType === '485Signed' && !item.is485Signed) {
      return false;
    }
    if (filterType === '485Unsigned' && item.is485Signed) {
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
        "SOC": item.soc,
        "FROM - TO DATE": item.fromToDate,
        "485 SIGNED": item.is485Signed ? "Yes" : "No",
        "DOC TO BE SIGNED": item.docsToBeSignedCount,
        "DAYS LEFT (TO BE BILLED)": item.daysLeftForBilling,
        "PG": item.pg,
        "PHYSICIAN": item.physician,
        "REMARKS": item.remarks
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HHAH Services");
    XLSX.writeFile(workbook, "HHAH_Services_Data.xlsx");
  };

  return (
    <div className="hhah-services-container">
      <div className="hhah-header">
        <h2>HHAH Services View</h2>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filterType === '485Signed' ? 'active' : ''}`}
            onClick={() => setFilterType('485Signed')}
          >
            485 Signed
          </button>
          <button 
            className={`filter-tab ${filterType === '485Unsigned' ? 'active' : ''}`}
            onClick={() => setFilterType('485Unsigned')}
          >
            485 Unsigned
          </button>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Patient, PG, or Physician"
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
      
      <div className="hhah-table">
        <table>
          <thead>
            <tr>
              <th>PT.NAME</th>
              <th>DOB</th>
              <th>SOC</th>
              <th>FROM - TO DATE</th>
              <th>485 SIGNED</th>
              <th>DOC TO BE SIGNED</th>
              <th>DAYS LEFT (TO BE BILLED)</th>
              <th>PG</th>
              <th>PHYSICIAN</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.ptName}</td>
                <td>{item.dob}</td>
                <td>{item.soc}</td>
                <td>{item.fromToDate}</td>
                <td className="center-align">{item.is485Signed ? '✓' : '✗'}</td>
                <td className="center-align">{item.docsToBeSignedCount}</td>
                <td className={item.daysLeftForBilling <= 7 ? 'urgent' : ''}>{item.daysLeftForBilling}</td>
                <td>{item.pg}</td>
                <td>{item.physician}</td>
                <td>{item.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HHAHServicesView; 