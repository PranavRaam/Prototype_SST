import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ServicesTable from './ServicesTable';
import PatientDetailView from './PatientDetailView';
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

const PGServicesView = () => {
  const [data, setData] = useState(dummyData);
  const [searchTerm, setSearchTerm] = useState('');
  const [hhahFilter, setHhahFilter] = useState('all');
  const [activeSorts, setActiveSorts] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const applyFiltersAndSorts = (dataToFilter, term, hhah, sorts) => {
    let filteredData = [...dataToFilter];

    // Apply search filter
    if (term) {
      const searchLower = term.toLowerCase();
      filteredData = filteredData.filter(item =>
        Object.values(item).some(
          val => {
            if (typeof val === 'string') {
              return val.toLowerCase().includes(searchLower);
            }
            // For non-string values, convert to string and check
            return String(val).toLowerCase().includes(searchLower);
          }
        )
      );
    }

    // Apply HHAH filter
    if (hhah !== 'all') {
      filteredData = filteredData.filter(item =>
        hhah === 'yes' ? item.hhah.toLowerCase() === 'yes' : item.hhah.toLowerCase() === 'no'
      );
    }

    // Apply multiple sorts
    if (sorts.length > 0) {
      filteredData = [...filteredData].sort((a, b) => {
        for (const sortId of sorts) {
          let comparison = 0;
          switch(sortId) {
            case 'pg':
              comparison = a.pg.localeCompare(b.pg);
              break;
            case 'name':
              comparison = a.ptName.localeCompare(b.ptName);
              break;
            case 'docs':
              comparison = a.newDocs - b.newDocs;
              break;
            case 'mins':
              comparison = a.cpoMinsCaptured - b.cpoMinsCaptured;
              break;
            default:
              break;
          }
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = applyFiltersAndSorts(dummyData, term, hhahFilter, activeSorts);
    setData(filtered);
  };

  const handleHhahFilter = (status) => {
    setHhahFilter(status);
    const filtered = applyFiltersAndSorts(dummyData, searchTerm, status, activeSorts);
    setData(filtered);
  };

  const toggleSort = (sortId) => {
    const newActiveSorts = activeSorts.includes(sortId)
      ? activeSorts.filter(id => id !== sortId)
      : [...activeSorts, sortId];
    
    setActiveSorts(newActiveSorts);
    const filtered = applyFiltersAndSorts(dummyData, searchTerm, hhahFilter, newActiveSorts);
    setData(filtered);
  };

  const formatToUSDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US');
  };

  const getFormattedData = () => {
    return data.map(item => ({
      ...item,
      dob: formatToUSDate(item.dob)
    }));
  };

  const exportToExcel = () => {
    const formattedData = getFormattedData();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "PG Services Data");
    XLSX.writeFile(workbook, "PG_Services_Data.xlsx");
  };

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
          <h1 className="pg-services-page-title">PG Services View</h1>
        </div>
        <div className="pg-services-header-right">
          <div className="pg-services-filter-group">
            <button 
              className={`pg-services-filter-button ${hhahFilter === 'all' ? 'pg-services-active' : ''}`}
              onClick={() => handleHhahFilter('all')}
            >
              All
            </button>
            <button 
              className={`pg-services-filter-button ${hhahFilter === 'yes' ? 'pg-services-active' : ''}`}
              onClick={() => handleHhahFilter('yes')}
            >
              HHAH Yes
            </button>
            <button 
              className={`pg-services-filter-button ${hhahFilter === 'no' ? 'pg-services-active' : ''}`}
              onClick={() => handleHhahFilter('no')}
            >
              HHAH No
            </button>
          </div>
          
          <SearchBar onSearch={handleSearch} />
          
          <div className="pg-services-sort-circles-container">
            {/* Patient Name (A-Z) */}
            <div 
              className={`pg-services-sort-circle ${activeSorts.includes('name') ? 'pg-services-active' : ''}`}
              onClick={() => toggleSort('name')}
              title="Patient Name (A-Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 6h6M16 12h6M16 18h6M4 6h6v12H4V6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="pg-services-tooltip">Patient Name (A-Z)</span>
            </div>

            {/* PG (A-Z) */}
            <div 
              className={`pg-services-sort-circle ${activeSorts.includes('pg') ? 'pg-services-active' : ''}`}
              onClick={() => toggleSort('pg')}
              title="PG (A-Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="pg-services-tooltip">PG (A-Z)</span>
            </div>

            {/* New Docs (Low-High) */}
            <div 
              className={`pg-services-sort-circle ${activeSorts.includes('docs') ? 'pg-services-active' : ''}`}
              onClick={() => toggleSort('docs')}
              title="New Docs (Low-High)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className="pg-services-tooltip">New Docs (Low-High)</span>
            </div>

            {/* CPO Mins (Low-High) */}
            <div 
              className={`pg-services-sort-circle ${activeSorts.includes('mins') ? 'pg-services-active' : ''}`}
              onClick={() => toggleSort('mins')}
              title="CPO Mins (Low-High)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="pg-services-tooltip">CPO Mins (Low-High)</span>
            </div>
          </div>
          
          <button className="pg-services-action-button" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </header>
      
      <main className="pg-services-main-content">
        <div className="pg-services-content-card">
          <ServicesTable 
            data={data} 
            onSelectPatient={handlePatientSelect}
          />
        </div>
      </main>
    </div>
  );
};

export default PGServicesView;