import React, { useState } from 'react';
import PGListingTable from './PGListingTable';
import HHAHListingTable from './HHAHListingTable';
import AddPGForm from './AddPGForm';
import AddHHAHForm from './AddHHAHForm';
import '../sa_view_css/Listings.css';

const Listings = () => {
  const [showAddPGForm, setShowAddPGForm] = useState(false);
  const [showAddHHAHForm, setShowAddHHAHForm] = useState(false);

  return (
    <div className="listings-container">
      <div className="pg-section">
        <div className="section-header">
          <h2 className="table-title">PG Listing</h2>
          <button 
            className="add-button"
            onClick={() => setShowAddPGForm(true)}
          >
            + Add New PG
          </button>
        </div>
        <PGListingTable />
        {showAddPGForm && (
          <AddPGForm onClose={() => setShowAddPGForm(false)} />
        )}
      </div>
      
      <div className="hhah-section">
        <div className="section-header">
          <h2 className="table-title">HHAH Listing</h2>
          <button 
            className="add-button"
            onClick={() => setShowAddHHAHForm(true)}
          >
            + Add New HHAH
          </button>
        </div>
        <HHAHListingTable />
        {showAddHHAHForm && (
          <AddHHAHForm onClose={() => setShowAddHHAHForm(false)} />
        )}
      </div>
    </div>
  );
};

export default Listings;
