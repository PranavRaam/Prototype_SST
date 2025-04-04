import React from 'react';

// Simple static map component that displays a blue area to represent the statistical area
const MapPlaceholder = ({ areaName }) => {
  // Default placeholder with area name if provided
  const displayName = areaName || 'Statistical Area';
  
  return (
    <div className="map-placeholder">
      <div className="static-map-container">
        <div className="static-map">
          <div className="static-boundary">
            {/* SVG representing a simplified map outline */}
            <svg width="100%" height="100%" viewBox="0 0 400 300">
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0f9ff" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
              </defs>
              
              {/* Background */}
              <rect x="0" y="0" width="400" height="300" fill="url(#mapGradient)" />
              
              {/* State boundaries (simplified) */}
              <path d="M50,50 L350,50 L350,250 L50,250 Z" 
                   fill="none" 
                   stroke="#9ca3af" 
                   strokeWidth="1" 
                   strokeDasharray="5,5" />
              
              {/* Statistical area boundary */}
              <path d="M100,100 C120,80 200,70 250,90 C300,110 320,180 280,220 C240,260 160,250 120,200 C80,150 80,120 100,100 Z" 
                   fill="#4F46E520" 
                   stroke="#312E81" 
                   strokeWidth="3" />
              
              {/* Sample points for PGs */}
              <circle cx="150" cy="150" r="5" fill="#0000FF" />
              <circle cx="200" cy="130" r="5" fill="#0000FF" />
              <circle cx="220" cy="180" r="5" fill="#0000FF" />
              
              {/* Sample points for HHAHs */}
              <circle cx="180" cy="160" r="5" fill="#008000" />
              <circle cx="240" cy="140" r="5" fill="#008000" />
              <circle cx="210" cy="200" r="5" fill="#008000" />
              <circle cx="160" cy="190" r="5" fill="#008000" />
            </svg>
          </div>
        </div>
        <div className="static-map-info">
          <div className="static-map-title">
            Map View of {displayName}
          </div>
          <div className="static-map-legend">
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: "rgba(79, 70, 229, 0.2)", border: "2px solid #312E81"}}></div>
              <div className="legend-text">Statistical Area</div>
            </div>
            <div className="legend-item">
              <div className="legend-color-dot" style={{backgroundColor: "#0000FF"}}></div>
              <div className="legend-text">Physician Groups</div>
            </div>
            <div className="legend-item">
              <div className="legend-color-dot" style={{backgroundColor: "#008000"}}></div>
              <div className="legend-text">Home Health At Home</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;