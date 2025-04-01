import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeMap } from '../utils/mapInteraction';
import { getApiUrl } from '../config';
import './MapViewer.css';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef(null);
  const mapStatusCheckRef = useRef(null);

  const checkMapStatus = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/map-status'));
      if (!response.ok) {
        throw new Error('Failed to check map status');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error checking map status:', err);
      return null;
    }
  }, []);

  const generateMap = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/generate-map'));
      if (!response.ok) {
        throw new Error('Failed to generate map');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error generating map:', err);
      return null;
    }
  }, []);

  const loadMap = useCallback(async () => {
    try {
      // First check if map exists
      const status = await checkMapStatus();
      if (!status) {
        throw new Error('Failed to check map status');
      }

      if (status.mapExists) {
        // Map exists, try to load it
        const response = await fetch(getApiUrl('/api/map'));
        if (!response.ok) {
          throw new Error('Map could not be loaded');
        }
        setIsLoading(false);
        return true;
      }

      // Map doesn't exist, generate it
      if (!status.generationInProgress) {
        const generateResult = await generateMap();
        if (!generateResult || !generateResult.success) {
          throw new Error('Failed to start map generation');
        }
      }

      // Start polling for map status
      if (mapStatusCheckRef.current) {
        clearInterval(mapStatusCheckRef.current);
      }

      mapStatusCheckRef.current = setInterval(async () => {
        const newStatus = await checkMapStatus();
        if (newStatus && newStatus.mapExists) {
          clearInterval(mapStatusCheckRef.current);
          setIsLoading(false);
        }
      }, 2000);

      return true;
    } catch (err) {
      console.error('Error loading map:', err);
      return false;
    }
  }, [checkMapStatus, generateMap]);

  useEffect(() => {
    let mounted = true;

    const initializeMapLoading = async () => {
      if (retryCount >= MAX_RETRIES) {
        setError('Failed to load map after multiple attempts. Please try again later.');
        setIsLoading(false);
        return;
      }

      const success = await loadMap();
      if (!success && mounted) {
        setRetryCount(prev => prev + 1);
        setTimeout(initializeMapLoading, RETRY_DELAY);
      }
    };

    initializeMapLoading();

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
      mounted = false;
      window.removeEventListener('message', handleMapMessages);
      if (mapStatusCheckRef.current) {
        clearInterval(mapStatusCheckRef.current);
      }
    };
  }, [loadMap, retryCount]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Initialize map interactions
    if (iframeRef.current) {
      initializeMap(iframeRef.current);
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
  };

  if (error) {
    return (
      <div className="map-error">
        <div className="content-card">
          <h2>Error Loading Map</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={handleRetry}>
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
          <p>Loading map...{retryCount > 0 ? ` (Attempt ${retryCount + 1}/${MAX_RETRIES})` : ''}</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={getApiUrl('/api/map')}
        title="US 20-Region Classification Map"
        className="map-frame"
        onLoad={handleIframeLoad}
        allowFullScreen
      />
    </div>
  );
};

export default MapViewer; 