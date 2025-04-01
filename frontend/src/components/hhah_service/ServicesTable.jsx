// servicestable.jsx

import React, { useState } from 'react';
import './ServicesTable.css';

const ServicesTable = ({ data, onSort }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'daysLeftForBilling',
    direction: 'asc'
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
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
              <td>{row.daysLeftForBilling}</td>
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