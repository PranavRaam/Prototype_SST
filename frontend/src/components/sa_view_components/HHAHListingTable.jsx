import React, { useContext } from 'react';
import { FunnelDataContext } from './FunnelDataContext';
import '../sa_view_css/HHAHListingTable.css';

const HHAHListingTable = () => {
  const { hhahData } = useContext(FunnelDataContext);
  
  return (
    <div className="table-container">
      <table className="hhah-table">
        <thead>
          <tr>
            <th>HHAH Name</th>
            <th>Total Patients</th>
            <th>Unbilled Episodes</th>
            <th>Active/Reactive Outcomes</th>
          </tr>
        </thead>
        <tbody>
          {hhahData && hhahData.map((hhah, index) => (
            <tr key={index} className="clickable-row">
              <td>{hhah.name}</td>
              <td>{hhah.patients}</td>
              <td>{hhah.unbilled}</td>
              <td>{hhah.outcomes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HHAHListingTable;
