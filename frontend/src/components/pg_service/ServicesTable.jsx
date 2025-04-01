import React, { useState } from 'react';
import './ServicesTable.css';

const ServicesTable = ({ data, onSort, onSelectPatient }) => {
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
    onSort?.(key, direction);
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const handleRowClick = (patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    }
  };

  return (
    <div className="pg-docs-table-container">
      <table className="pg-docs-table">
        <thead>
          <tr className="pg-docs-table-header-row">
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('ptName')}
            >
              Pt Name {getSortIcon('ptName')}
            </th>
            <th className="pg-docs-table-header-cell">DOB</th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('pg')}
            >
              PG {getSortIcon('pg')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('hhah')}
            >
              HHAH {getSortIcon('hhah')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('cpoMinsCaptured')}
            >
              CPO mins captured {getSortIcon('cpoMinsCaptured')}
            </th>
            <th className="pg-docs-table-header-cell">Remarks</th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('newDocs')}
            >
              Newdocs {getSortIcon('newDocs')}
            </th>
            <th 
              className="pg-docs-table-header-cell" 
              onClick={() => handleSort('newCPODocsCreated')}
            >
              New CPO Docs Created {getSortIcon('newCPODocsCreated')}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={index} 
              className="pg-docs-table-data-row"
              onClick={() => handleRowClick(row)}
            >
              <td className="pg-docs-table-data-cell">{row.ptName}</td>
              <td className="pg-docs-table-data-cell">{row.dob}</td>
              <td className="pg-docs-table-data-cell">{row.pg}</td>
              <td className="pg-docs-table-data-cell">{row.hhah}</td>
              <td className="pg-docs-table-data-cell">{row.cpoMinsCaptured}</td>
              <td className="pg-docs-table-data-cell">{row.remarks}</td>
              <td className="pg-docs-table-data-cell">{row.newDocs}</td>
              <td className="pg-docs-table-data-cell">{row.newCPODocsCreated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;