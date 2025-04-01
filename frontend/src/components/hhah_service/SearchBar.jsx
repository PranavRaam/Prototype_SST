// searchbar.jsx
import React from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search by Patient, PG, or Physician..."
        onChange={handleSearch}
      />
    </div>
  );
};

export default SearchBar; 