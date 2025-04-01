import React from 'react';
import '../sa_view_css/MapPlaceholder.css';
import mapImage from '../../assets/map-placeholder.jpg';

const MapPlaceholder = () => {
  return (
    <div className="map-wrapper">
      <h2 className="map-title">Statistical Area Map</h2>
      <div className="map-container">
        <img 
          src={mapImage} 
          alt="Statistical Area Map" 
          className="map-image" 
          loading="lazy"
        />
        <div className="map-overlay"></div>
      </div>
    </div>
  );
};

export default MapPlaceholder;