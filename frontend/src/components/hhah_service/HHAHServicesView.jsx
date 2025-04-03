import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ServicesTable from './ServicesTable';
import * as XLSX from 'xlsx';  // Import XLSX library for Excel export
import './HHAHServicesView.css';
import { formatDate } from '../../utils/dateUtils';

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

  const handleSort = (sortedData) => {
    setData(sortedData);
  };

  const applyFiltersAndSorts = (dataToFilter, term, signed) => {
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

    // Apply default sorting (days left ascending, docs to be signed descending)
    filteredData.sort((a, b) => {
      if (a.daysLeftForBilling !== b.daysLeftForBilling) {
        return a.daysLeftForBilling - b.daysLeftForBilling;
      }
      return b.docsToBeSignedCount - a.docsToBeSignedCount;
    });

    return filteredData;
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = applyFiltersAndSorts(dummyData, term, signedFilter);
    setData(filtered);
  };

  const handleSignedFilter = (status) => {
    setSignedFilter(status);
    const filtered = applyFiltersAndSorts(dummyData, searchTerm, status);
    setData(filtered);
  };

  const getFormattedData = () => {
    return data.map(item => ({
      ...item,
      dob: formatDate(item.dob),
      soc: formatDate(item.soc),
      fromToDate: item.fromToDate
        .split(' - ')
        .map(formatDate)
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
          <h1 className="viv-hhah-page-title">HHAH Services</h1>
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
          
          <button className="viv-hhah-action-button" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </header>
      
      <main className="viv-hhah-main-content">
        <div className="viv-hhah-content-card">
          <ServicesTable 
            data={applyFiltersAndSorts(data, searchTerm, signedFilter)}
            onSort={handleSort}
          />
        </div>
      </main>
    </div>
  );
};

export default HHAHServicesView;