import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onSignedFilter, onUrgencyFilter, signedFilter, urgencyFilter }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    onSearch(text);
  };

  const handleSignedFilterChange = (e) => {
    onSignedFilter(e.target.value);
  };

  const handleUrgencyFilterChange = (e) => {
    onUrgencyFilter(e.target.value);
  };

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <i className="search-icon">🔍</i>
        <input
          type="text"
          className="search-input"
          placeholder="Search patients, physicians, or remarks..."
          value={searchText}
          onChange={handleSearchChange}
        />
        {searchText && (
          <button className="clear-search" onClick={() => { setSearchText(''); onSearch(''); }}>
            ✕
          </button>
        )}
      </div>
      
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="signed-filter">485 Signed:</label>
          <select 
            id="signed-filter" 
            className="filter-select"
            value={signedFilter}
            onChange={handleSignedFilterChange}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="urgency-filter">Urgency:</label>
          <select 
            id="urgency-filter" 
            className="filter-select"
            value={urgencyFilter}
            onChange={handleUrgencyFilterChange}
          >
            <option value="all">All</option>
            <option value="critical">Critical (≤ 7 days)</option>
            <option value="urgent">Urgent (8-30 days)</option>
            <option value="normal">Normal (> 30 days)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 