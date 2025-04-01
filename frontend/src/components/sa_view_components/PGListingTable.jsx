import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/PGListingTable.css';

const PGListingTable = () => {
  const navigate = useNavigate();
  const { pgData } = useContext(FunnelDataContext);

  const handlePGClick = (pg) => {
    navigate(`/pg-view/${pg.name.replace(/\s+/g, '-').toLowerCase()}`);
  };

  return (
    <div className="table-container">
      <table className="pg-table">
        <thead>
          <tr>
            <th>PG Name</th>
            <th>Total patients</th>
            <th>Patients remaining (30 CPO)</th>
            <th>Active/Reactive Outcomes</th>
          </tr>
        </thead>
        <tbody>
          {pgData && pgData.map((pg, index) => (
            <tr key={index} className="clickable-row" onClick={() => handlePGClick(pg)}>
              <td>{pg.name}</td>
              <td>{pg.patients}</td>
              <td>{pg.remaining}</td>
              <td>{pg.outcomes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PGListingTable;
