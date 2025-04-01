import { useState, useEffect, useRef } from 'react';
import { initializeMap } from '../utils/mapInteraction';
import './MapViewer.css';

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    // Check if the map is accessible
    const checkMap = async () => {
      try {
        const response = await fetch('/api/map');
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

    // Setup message listener for control panel actions
    const handleMapMessages = (event) => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      // Messages from control panel to map
      if (event.data && event.data.type) {
        iframe.contentWindow.postMessage(event.data, '*');
      }
    };

    window.addEventListener('message', handleMapMessages);

    return () => {
      window.removeEventListener('message', handleMapMessages);
    };
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Initialize map interactions
    if (iframeRef.current) {
      initializeMap(iframeRef.current);
    }
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
      {isLoading && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/api/map"
        title="US 20-Region Classification Map"
        className="map-frame"
        onLoad={handleIframeLoad}
        allowFullScreen
      />
    </div>
  );
};

export default MapViewer; 