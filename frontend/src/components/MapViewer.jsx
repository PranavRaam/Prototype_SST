import { useState, useEffect, useRef } from 'react';
import { getApiUrl, getMapApiUrl } from '../config';
import './MapViewer.css';

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const checkMap = async () => {
      try {
        const response = await fetch(getApiUrl('/api/map-status'));
        if (!response.ok) {
          throw new Error('Map could not be loaded');
        }
        
        const data = await response.json();
        if (!data.exists) {
          throw new Error('Map has not been generated yet');
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    checkMap();
    
    // Add window message event listener for iframe communication
    const handleIframeMessage = (event) => {
      // Check if message comes from our map
      if (event.data && event.data.type === 'mapLoaded') {
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load the map. Please try refreshing the page.');
  };

  if (error) {
    return (
      <div className="map-error">
        <div className="content-card">
          <h2>Error Loading Map</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-banner">
        <h2>US Healthcare Regional Distribution</h2>
      </div>
      
      {isLoading && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={`${getMapApiUrl('/api/map')}`}
        title="US 20-Region Classification Map"
        className="map-frame"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allowFullScreen
        crossOrigin="anonymous"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default MapViewer; 