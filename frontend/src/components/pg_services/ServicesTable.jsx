import React, { useState } from 'react';
import './ServicesTable.css';

const ServicesTable = ({ data, onSort }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'newDocs',
    direction: 'desc'
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
    <div className="table-container">
      <table className="services-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('ptName')}>
              Pt Name {getSortIcon('ptName')}
            </th>
            <th>DOB</th>
            <th onClick={() => handleSort('pg')}>
              PG {getSortIcon('pg')}
            </th>
            <th onClick={() => handleSort('hhah')}>
              HHAH {getSortIcon('hhah')}
            </th>
            <th onClick={() => handleSort('cpoMinsCaptured')}>
              CPO mins captured {getSortIcon('cpoMinsCaptured')}
            </th>
            <th>Remarks</th>
            <th onClick={() => handleSort('newDocs')}>
              Newdocs {getSortIcon('newDocs')}
            </th>
            <th onClick={() => handleSort('newCPODocsCreated')}>
              New CPO Docs Created {getSortIcon('newCPODocsCreated')}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.ptName}</td>
              <td>{row.dob}</td>
              <td>{row.pg}</td>
              <td>{row.hhah}</td>
              <td>{row.cpoMinsCaptured}</td>
              <td>{row.remarks}</td>
              <td>{row.newDocs}</td>
              <td>{row.newCPODocsCreated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable; 