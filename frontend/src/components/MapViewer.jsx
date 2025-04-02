import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '../config';
import './MapViewer.css';

const MAX_RETRIES = 5;
const RETRY_DELAY = 1500; // 1.5 seconds
const POLLING_INTERVAL = 1000; // 1 second

const MapViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mapVisible, setMapVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  
  const iframeRef = useRef(null);
  const mapStatusCheckRef = useRef(null);

  // Show fullscreen tip after map is loaded
  useEffect(() => {
    if (mapVisible && !isFullScreen) {
      const timer = setTimeout(() => {
        setShowTip(true);
      }, 2000);
      
      const hideTimer = setTimeout(() => {
        setShowTip(false);
      }, 8000); // Auto-hide after 6 seconds of being shown
      
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [mapVisible, isFullScreen]);

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
    setIsLoading(true);
    setMapVisible(false);
    try {
      const response = await fetch(getApiUrl('/api/generate-map?force=true'));
      if (!response.ok) {
        throw new Error('Failed to generate map');
      }
      const data = await response.json();
      
      // Start polling to check when map is ready
      startPolling();
      
      return data;
    } catch (err) {
      console.error('Error generating map:', err);
      setIsLoading(false);
      setError('Failed to generate map. Please try again.');
      return null;
    }
  }, []);

  const startPolling = useCallback(() => {
    // Clear any existing polling
    if (mapStatusCheckRef.current) {
      clearInterval(mapStatusCheckRef.current);
    }
    
    // Start new polling
    mapStatusCheckRef.current = setInterval(async () => {
      try {
        const status = await checkMapStatus();
        console.log('Map status:', status);
        
        if (status && status.mapExists) {
          clearInterval(mapStatusCheckRef.current);
          setIsLoading(false);
          setMapVisible(true);
          
          // Reload the iframe to show the new map
          if (iframeRef.current) {
            loadMapInIframe();
          }
        } else if (status && !status.generationInProgress) {
          // Map generation completed but no map exists - error
          clearInterval(mapStatusCheckRef.current);
          setIsLoading(false);
          setError('Map generation completed but no map was found.');
        }
      } catch (err) {
        console.error('Error during polling:', err);
      }
    }, POLLING_INTERVAL);
  }, [checkMapStatus]);

  const loadMapInIframe = useCallback(() => {
    if (!iframeRef.current) return;
    
    // Add a timestamp to bust cache
    const timestamp = new Date().getTime();
    iframeRef.current.src = `${getApiUrl('/api/map')}?t=${timestamp}`;
  }, []);

  const loadMap = useCallback(async () => {
    try {
      // First check if map exists
      const status = await checkMapStatus();
      
      if (!status) {
        throw new Error('Failed to check map status');
      }
      
      if (status.mapExists) {
        // Map exists, display it
        setIsLoading(false);
        setMapVisible(true);
        return true;
      }
      
      if (status.generationInProgress) {
        // Map is being generated, start polling
        startPolling();
        return true;
      }
      
      // Map doesn't exist and isn't being generated
      // Auto-generate the map
      console.log('Map does not exist, auto-generating...');
      await generateMap();
      return true;
      
    } catch (err) {
      console.error('Error loading map:', err);
      setIsLoading(false);
      setError('Failed to load map. Please refresh the page.');
      return false;
    }
  }, [checkMapStatus, startPolling, generateMap]);

  useEffect(() => {
    let mounted = true;

    const initializeMapLoading = async () => {
      if (retryCount >= MAX_RETRIES) {
        setError('Failed to load map after multiple attempts. Please refresh the page.');
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

    return () => {
      mounted = false;
      if (mapStatusCheckRef.current) {
        clearInterval(mapStatusCheckRef.current);
      }
    };
  }, [loadMap, retryCount]);

  // Add event listener for ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  const handleIframeLoad = useCallback(() => {
    console.log('Iframe loaded');
    setIsLoading(false);
    // We can't access iframe content due to cross-origin restrictions
    // The MSA legend hiding is handled in the backend (main.py)
  }, []);

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    setMapVisible(false);
    loadMap();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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
    <div className={`map-container ${isFullScreen ? 'fullscreen' : ''}`}>
      {isLoading ? (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading map...{retryCount > 0 ? ` (Attempt ${retryCount + 1}/${MAX_RETRIES})` : ''}</p>
        </div>
      ) : !mapVisible ? (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Generating map visualization...</p>
        </div>
      ) : (
        <>
          <div className="map-controls">
            <button 
              className="fullscreen-button" 
              onClick={toggleFullScreen}
              title={isFullScreen ? "Exit Full Screen" : "View Full Screen"}
            >
              {isFullScreen ? "Exit Full Screen" : "View Full Screen"}
            </button>
          </div>
          
          {showTip && (
            <div className="fullscreen-tip">
              <div className="tip-content">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
                <span>For best experience, view in full screen to access all filters and controls</span>
                <button onClick={() => setShowTip(false)} className="close-tip">×</button>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={`${getApiUrl('/api/map')}?t=${new Date().getTime()}`}
            title="US 20-Region Classification Map"
            className="map-frame"
            onLoad={handleIframeLoad}
            allowFullScreen
            loading="eager"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            importance="high"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </>
      )}
    </div>
  );
};

export default MapViewer; 