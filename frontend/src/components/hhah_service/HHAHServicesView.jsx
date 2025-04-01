import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ServicesTable from './ServicesTable';
import * as XLSX from 'xlsx';  // Import XLSX library for Excel export
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
  },
  {
    ptName: "Thomas Martinez",
    dob: "1955-02-14",
    soc: "2024-06-01",
    fromToDate: "2024-06-01 - 2024-12-01",
    is485Signed: false,
    docsToBeSignedCount: 6,
    daysLeftForBilling: 5,
    pg: "Group C",
    physician: "Dr. Lisa Garcia",
    remarks: "High priority - follow up"
  },
  {
    ptName: "Jennifer Lopez",
    dob: "1980-04-25",
    soc: "2024-03-15",
    fromToDate: "2024-03-15 - 2025-03-14",
    is485Signed: true,
    docsToBeSignedCount: 1,
    daysLeftForBilling: 60,
    pg: "Group A",
    physician: "Dr. Richard Kim",
    remarks: "Annual wellness visit"
  },
  {
    ptName: "William Anderson",
    dob: "1943-10-31",
    soc: "2024-07-10",
    fromToDate: "2024-07-10 - 2024-10-10",
    is485Signed: false,
    docsToBeSignedCount: 7,
    daysLeftForBilling: 12,
    pg: "Group D",
    physician: "Dr. Nancy Clark",
    remarks: "Memory care evaluation"
  },
  {
    ptName: "Linda Thompson",
    dob: "1968-06-17",
    soc: "2024-02-28",
    fromToDate: "2024-02-28 - 2025-02-27",
    is485Signed: true,
    docsToBeSignedCount: 0,
    daysLeftForBilling: 210,
    pg: "Group B",
    physician: "Dr. Brian Adams",
    remarks: "Completed all documents"
  },
  {
    ptName: "Charles Robinson",
    dob: "1975-01-09",
    soc: "2024-08-15",
    fromToDate: "2024-08-15 - 2025-02-15",
    is485Signed: false,
    docsToBeSignedCount: 2,
    daysLeftForBilling: 30,
    pg: "Group C",
    physician: "Dr. Emily Young",
    remarks: "New patient intake"
  },
  {
    ptName: "Margaret Scott",
    dob: "1959-05-22",
    soc: "2024-04-30",
    fromToDate: "2024-04-30 - 2024-10-30",
    is485Signed: true,
    docsToBeSignedCount: 3,
    daysLeftForBilling: 18,
    pg: "Group A",
    physician: "Dr. Daniel Baker",
    remarks: "Chronic condition management"
  },
  {
    ptName: "Joseph Nguyen",
    dob: "1963-07-04",
    soc: "2024-09-05",
    fromToDate: "2024-09-05 - 2025-03-05",
    is485Signed: false,
    docsToBeSignedCount: 5,
    daysLeftForBilling: 25,
    pg: "Group D",
    physician: "Dr. Jessica Hall",
    remarks: "Lab results pending"
  },
  {
    ptName: "Susan King",
    dob: "1970-12-12",
    soc: "2024-05-20",
    fromToDate: "2024-05-20 - 2024-11-20",
    is485Signed: true,
    docsToBeSignedCount: 1,
    daysLeftForBilling: 42,
    pg: "Group B",
    physician: "Dr. Matthew Allen",
    remarks: "Preventive care completed"
  },
  {
    ptName: "Daniel Wright",
    dob: "1947-03-08",
    soc: "2024-10-01",
    fromToDate: "2024-10-01 - 2025-04-01",
    is485Signed: true,
    docsToBeSignedCount: 4,
    daysLeftForBilling: 65,
    pg: "Group C",
    physician: "Dr. Samantha Hill",
    remarks: "Home health services needed"
  },
  {
    ptName: "Karen Evans",
    dob: "1969-09-19",
    soc: "2024-06-12",
    fromToDate: "2024-06-12 - 2024-12-12",
    is485Signed: false,
    docsToBeSignedCount: 6,
    daysLeftForBilling: 8,
    pg: "Group A",
    physician: "Dr. Christopher Green",
    remarks: "Urgent: medication adjustment"
  },
  {
    ptName: "Paul Baker",
    dob: "1954-11-27",
    soc: "2024-07-25",
    fromToDate: "2024-07-25 - 2025-01-25",
    is485Signed: true,
    docsToBeSignedCount: 0,
    daysLeftForBilling: 95,
    pg: "Group D",
    physician: "Dr. Olivia Carter",
    remarks: "Stable - routine monitoring"
  },
  {
    ptName: "Nancy Rivera",
    dob: "1973-02-14",
    soc: "2024-08-08",
    fromToDate: "2024-08-08 - 2025-02-08",
    is485Signed: false,
    docsToBeSignedCount: 3,
    daysLeftForBilling: 17,
    pg: "Group B",
    physician: "Dr. Andrew Perez",
    remarks: "Behavioral health referral"
  },
  {
    ptName: "Mark Cooper",
    dob: "1960-04-03",
    soc: "2024-09-30",
    fromToDate: "2024-09-30 - 2025-03-30",
    is485Signed: true,
    docsToBeSignedCount: 2,
    daysLeftForBilling: 110,
    pg: "Group C",
    physician: "Dr. Rachel Turner",
    remarks: "Cardiac rehab in progress"
  },
  {
    ptName: "Lisa Morris",
    dob: "1957-08-11",
    soc: "2024-11-15",
    fromToDate: "2024-11-15 - 2025-05-15",
    is485Signed: false,
    docsToBeSignedCount: 7,
    daysLeftForBilling: 3,
    pg: "Group A",
    physician: "Dr. Jason Phillips",
    remarks: "Critical: needs immediate review"
  }
];


const HHAHServicesView = () => {
  const [data, setData] = useState(dummyData);
  const [searchTerm, setSearchTerm] = useState('');
  const [signedFilter, setSignedFilter] = useState('all');
  const [activeSorts, setActiveSorts] = useState([]);

  const applyFiltersAndSorts = (dataToFilter, term, signed, sorts) => {
    let filteredData = [...dataToFilter];

    // Apply search filter
    if (term) {
      filteredData = filteredData.filter(item =>
        Object.values(item).some(
          val => typeof val === 'string' && 
          val.toLowerCase().includes(term.toLowerCase())
        )
      );
    }

    // Apply 485 signed filter
    if (signed !== 'all') {
      filteredData = filteredData.filter(item =>
        signed === 'signed' ? item.is485Signed : !item.is485Signed
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
            case 'physician':
              comparison = a.physician.localeCompare(b.physician);
              break;
            case 'docs':
              comparison = a.docsToBeSignedCount - b.docsToBeSignedCount;
              break;
            case 'days':
              comparison = a.daysLeftForBilling - b.daysLeftForBilling;
              break;
            case 'name':
              comparison = a.ptName.localeCompare(b.ptName);
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
    const filtered = applyFiltersAndSorts(dummyData, term, signedFilter, activeSorts);
    setData(filtered);
  };

  const handleSignedFilter = (status) => {
    setSignedFilter(status);
    const filtered = applyFiltersAndSorts(dummyData, searchTerm, status, activeSorts);
    setData(filtered);
  };

  const toggleSort = (sortId) => {
    const newActiveSorts = activeSorts.includes(sortId)
      ? activeSorts.filter(id => id !== sortId)
      : [...activeSorts, sortId];
    
    setActiveSorts(newActiveSorts);
    const filtered = applyFiltersAndSorts(dummyData, searchTerm, signedFilter, newActiveSorts);
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
      dob: formatToUSDate(item.dob),
      soc: formatToUSDate(item.soc),
      fromToDate: item.fromToDate
        .split(' - ')
        .map(formatToUSDate)
        .join(' - ')
    }));
  };

  const exportToExcel = () => {
    const formattedData = getFormattedData();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Services Data");
    XLSX.writeFile(workbook, "HHAH_Services_Data.xlsx");
  };

  return (
    <div className="viv-hhah-services-view">
      <header className="viv-hhah-view-header">
        <div className="viv-hhah-header-left">
          <button className="viv-hhah-back-button" onClick={() => window.history.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="viv-hhah-page-title">HHAH Services View</h1>
        </div>
        <div className="viv-hhah-header-right">
          <div className="viv-hhah-filter-group">
            <button 
              className={`viv-hhah-filter-button ${signedFilter === 'all' ? 'viv-hhah-active' : ''}`}
              onClick={() => handleSignedFilter('all')}
            >
              All
            </button>
            <button 
              className={`viv-hhah-filter-button ${signedFilter === 'signed' ? 'viv-hhah-active' : ''}`}
              onClick={() => handleSignedFilter('signed')}
            >
              485 Signed
            </button>
            <button 
              className={`viv-hhah-filter-button ${signedFilter === 'unsigned' ? 'viv-hhah-active' : ''}`}
              onClick={() => handleSignedFilter('unsigned')}
            >
              485 Unsigned
            </button>
          </div>
          
          <SearchBar onSearch={handleSearch} />
          
          <div className="viv-hhah-sort-circles-container">
            {/* Patient Name (A-Z) */}
            <div 
              className={`viv-hhah-sort-circle ${activeSorts.includes('name') ? 'viv-hhah-active' : ''}`}
              onClick={() => toggleSort('name')}
              title="Patient Name (A-Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 6h6M16 12h6M16 18h6M4 6h6v12H4V6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="viv-hhah-tooltip">Patient Name (A-Z)</span>
            </div>

            {/* PG (A-Z) */}
            <div 
              className={`viv-hhah-sort-circle ${activeSorts.includes('pg') ? 'viv-hhah-active' : ''}`}
              onClick={() => toggleSort('pg')}
              title="PG (A-Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="viv-hhah-tooltip">PG (A-Z)</span>
            </div>

            {/* Physician (A-Z) */}
            <div 
              className={`viv-hhah-sort-circle ${activeSorts.includes('physician') ? 'viv-hhah-active' : ''}`}
              onClick={() => toggleSort('physician')}
              title="Physician (A-Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="viv-hhah-tooltip">Physician (A-Z)</span>
            </div>

            {/* Docs to Sign (Low-High) */}
            <div 
              className={`viv-hhah-sort-circle ${activeSorts.includes('docs') ? 'viv-hhah-active' : ''}`}
              onClick={() => toggleSort('docs')}
              title="Docs to Sign (Low-High)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className="viv-hhah-tooltip">Docs to Sign (Low-High)</span>
            </div>

            {/* Days Left (Low-High) */}
            <div 
              className={`viv-hhah-sort-circle ${activeSorts.includes('days') ? 'viv-hhah-active' : ''}`}
              onClick={() => toggleSort('days')}
              title="Days Left (Low-High)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="viv-hhah-tooltip">Days Left (Low-High)</span>
            </div>
          </div>
          
          <button className="viv-hhah-action-button" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </header>
      
      <main className="viv-hhah-main-content">
        <div className="viv-hhah-content-card">
          <ServicesTable data={data} />
        </div>
      </main>
    </div>
  );
};

export default HHAHServicesView;