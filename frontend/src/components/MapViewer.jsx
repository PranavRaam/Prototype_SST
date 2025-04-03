import { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../config';
import './MapViewer.css';

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const checkMap = async () => {
      try {
        const response = await fetch(getApiUrl('/api/map'));
        if (!response.ok) {
          throw new Error('Map could not be loaded');
        }
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    checkMap();
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
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
        src={`${getApiUrl('/api/map')}?t=${Date.now()}`}
        title="US 20-Region Classification Map"
        className="map-frame"
        onLoad={handleIframeLoad}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default MapViewer; 