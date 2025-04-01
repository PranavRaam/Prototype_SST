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
        
        {/* Simulated boundary outline */}
        <div className="simulated-boundary"></div>
        
        {/* Mock markers for PGs and HHAHs */}
        <div className="mock-markers">
          {/* PG markers */}
          <div className="mock-marker pg-marker" style={{ top: '30%', left: '40%' }}>
            <div className="marker-dot"></div>
            <div className="marker-label">PG</div>
          </div>
          <div className="mock-marker pg-marker" style={{ top: '45%', left: '55%' }}>
            <div className="marker-dot"></div>
            <div className="marker-label">PG</div>
          </div>
          <div className="mock-marker pg-marker" style={{ top: '60%', left: '35%' }}>
            <div className="marker-dot"></div>
            <div className="marker-label">PG</div>
          </div>
          
          {/* HHAH markers */}
          <div className="mock-marker hhah-marker" style={{ top: '35%', left: '60%' }}>
            <div className="marker-dot"></div>
            <div className="marker-label">HHAH</div>
          </div>
          <div className="mock-marker hhah-marker" style={{ top: '50%', left: '30%' }}>
            <div className="marker-dot"></div>
            <div className="marker-label">HHAH</div>
          </div>
          <div className="mock-marker hhah-marker" style={{ top: '65%', left: '50%' }}>
            <div className="marker-dot"></div>
            <div className="marker-label">HHAH</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;