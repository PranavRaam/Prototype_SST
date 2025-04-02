// servicestable.jsx

import React, { useState, useEffect } from 'react';
import './ServicesTable.css';

const ServicesTable = ({ data, onSort }) => {
  const [sortConfig, setSortConfig] = useState({
    primaryKey: 'daysLeftForBilling',
    primaryDirection: 'asc',
    secondaryKey: 'docsToBeSignedCount',
    secondaryDirection: 'desc'
  });

  useEffect(() => {
    // Apply initial sorting when component mounts
    const sortedData = [...data].sort((a, b) => {
      // Primary sort: Days left (ascending)
      if (a.daysLeftForBilling !== b.daysLeftForBilling) {
        return a.daysLeftForBilling - b.daysLeftForBilling;
      }
      // Secondary sort: Docs to be signed (descending)
      return b.docsToBeSignedCount - a.docsToBeSignedCount;
    });
    onSort(sortedData);
  }, [data, onSort]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.primaryKey === key && sortConfig.primaryDirection === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ 
      primaryKey: key,
      primaryDirection: direction,
      secondaryKey: key === 'daysLeftForBilling' ? 'docsToBeSignedCount' : null,
      secondaryDirection: key === 'daysLeftForBilling' ? 'desc' : null
    });
    
    const sortedData = [...data].sort((a, b) => {
      if (key === 'daysLeftForBilling') {
        // Primary sort: Days left
        if (a.daysLeftForBilling !== b.daysLeftForBilling) {
          return direction === 'asc' 
            ? a.daysLeftForBilling - b.daysLeftForBilling
            : b.daysLeftForBilling - a.daysLeftForBilling;
        }
        // Secondary sort: Docs to be signed (descending)
        return b.docsToBeSignedCount - a.docsToBeSignedCount;
      }
      // For other columns, simple sort
      return direction === 'asc'
        ? (a[key] > b[key] ? 1 : -1)
        : (a[key] < b[key] ? 1 : -1);
    });
    
    onSort(sortedData);
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.primaryKey === columnName) {
      return sortConfig.primaryDirection === 'asc' ? '↑' : '↓';
    }
    if (sortConfig.secondaryKey === columnName) {
      return sortConfig.secondaryDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <div className="hhah-services-table-container">
      <table className="hhah-services-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('ptName')}>
              Pt.Name {getSortIcon('ptName')}
            </th>
            <th>DOB</th>
            <th>SOC</th>
            <th>From - To date</th>
            <th>485 SIGNED</th>
            <th onClick={() => handleSort('docsToBeSignedCount')}>
              Doc to be signed {getSortIcon('docsToBeSignedCount')}
            </th>
            <th onClick={() => handleSort('daysLeftForBilling')}>
              Days left (to be billed) {getSortIcon('daysLeftForBilling')}
            </th>
            <th onClick={() => handleSort('pg')}>
              PG {getSortIcon('pg')}
            </th>
            <th onClick={() => handleSort('physician')}>
              Physician {getSortIcon('physician')}
            </th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.ptName}</td>
              <td>{row.dob}</td>
              <td>{row.soc}</td>
              <td>{row.fromToDate}</td>
              <td>{row.is485Signed ? '✓' : '✗'}</td>
              <td>{row.docsToBeSignedCount}</td>
              <td className={row.daysLeftForBilling <= 7 ? 'urgent' : ''}>{row.daysLeftForBilling}</td>
              <td>{row.pg}</td>
              <td>{row.physician}</td>
              <td>{row.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable; 