import React, { useState, useEffect, useRef } from 'react';
import { statisticalAreaStatistics } from '../utils/regionMapping';
import { getApiUrl } from '../config'; // Import the API URL helper
import './StatisticalAreaDetailView.css';
// Import components from local sa_view_components
import MapPlaceholder from './sa_view_components/MapPlaceholder';
import NavigationButtons from './sa_view_components/NavigationButtons';
import Listings from './sa_view_components/Listings';
import ChartsSection from './sa_view_components/ChartsSection';
import { FunnelDataProvider } from './sa_view_components/FunnelDataContext';
// Import CSS files
import './sa_view_css/MapPlaceholder.css';
import './sa_view_css/NavigationButtons.css';
import './sa_view_css/Listings.css';
import './sa_view_css/PGListingTable.css';
import './sa_view_css/HHAHListingTable.css';
import './sa_view_css/ChartsSection.css';
import './sa_view_css/PieChart.css';
import './sa_view_css/PGFunnel.css';
import './sa_view_css/HHAHFunnel.css';

const StatisticalAreaDetailView = ({ statisticalArea, divisionalGroup, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mapUrl, setMapUrl] = useState('');
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const iframeRef = useRef(null);
  const stats = statisticalAreaStatistics[statisticalArea] || {};

  useEffect(() => {
    // Check if the API for the zoomed map is accessible
    const checkMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setUseFallbackMap(false);
        
        // Encode the statistical area name for URL
        const encodedArea = encodeURIComponent(statisticalArea);
        console.log(`Requesting map for ${encodedArea}`);
        
        // Set high-quality parameters for all environments
        const apiUrl = getApiUrl(`/api/statistical-area-map/${encodedArea}`) +
          `?force_regen=false&use_cached=true&detailed=true&zoom=11&exact_boundary=true&display_pgs=true&display_hhahs=true&t=${Date.now()}`;
        console.log(`Full request URL: ${apiUrl}`);
        
        // Just set the map URL and let it load however long it takes
        setMapUrl(apiUrl);
        
        // Don't set isLoading to false here - we'll let the iframe onLoad handler manage that
      } catch (err) {
        console.error(`Error loading map: ${err.message}`);
        setError(err.message);
        setIsLoading(false);
      }
    };

    // Start loading map
    checkMap();
    
    // Setup event listener for cross-origin messaging from the map iframe
    const handleMapMessage = (event) => {
      // Check for mapLoaded message from iframe
      if (event.data && event.data.type === 'mapLoaded') {
        console.log('Received map loaded message from iframe:', event.data);
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', handleMapMessage);
    
    return () => {
      window.removeEventListener('message', handleMapMessage);
    };
  }, [statisticalArea, retryCount]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('Map iframe loaded successfully');
  };

  const handleIframeError = (e) => {
    console.error('Map iframe failed to load', e);
    setError('The map could not be loaded. Please try again.');
    setIsLoading(false);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Get color for metric cards
  const getMetricColor = (metric) => {
    const colors = {
      patients: '#4F46E5',
      physicianGroups: '#0EA5E9',
      agencies: '#10B981',
      activeOutcomes: '#F59E0B'
    };
    return colors[metric] || '#6B7280';
  };

  // Labels for the metrics
  const metricLabels = {
    patients: 'Patients',
    physicianGroups: 'Physician Groups',
    agencies: 'Agencies',
    activeOutcomes: 'Active Outcomes'
  };

  if (error) {
    return (
      <div className="statistical-area-view">
        <div className="detail-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Region View
          </button>
          <h2>{statisticalArea}</h2>
          <div className="area-divisional-group">
            <span>Part of {divisionalGroup} Division</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="metric-cards">
          {Object.entries(stats).map(([key, value]) => (
            <div 
              key={key} 
              className="metric-card"
              style={{ borderColor: getMetricColor(key) }}
            >
              <div className="metric-icon" style={{ backgroundColor: getMetricColor(key) }}>
                {key === 'patients' && '👥'}
                {key === 'physicianGroups' && '👨‍⚕️'}
                {key === 'agencies' && '🏢'}
                {key === 'activeOutcomes' && '📈'}
              </div>
              <div className="metric-content">
                <h3>{metricLabels[key]}</h3>
                <p className="metric-value">{formatNumber(value)}</p>
                <p className="metric-subtext">Total in {statisticalArea}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map container with MapPlaceholder for error state */}
        <div className="area-map-container">
          <h3>Map View of {statisticalArea}</h3>
          <div className="area-map-wrapper" style={{ position: 'relative' }}>
            <MapPlaceholder />
            <div className="map-error-overlay">
              <button className="retry-button" onClick={handleRetry}>
                Retry Loading Map
              </button>
            </div>
          </div>
          <div className="area-map-info">
            <p>The highlighted area shows the boundaries of {statisticalArea}. Use the zoom controls to explore further.</p>
          </div>
        </div>
        
        {/* Integration of sa_view_page components */}
        <FunnelDataProvider>
          <div className="sa-view-integration">
            <NavigationButtons />
            <Listings />
            <ChartsSection />
          </div>
        </FunnelDataProvider>
      </div>
    );
  }

  return (
    <div className="statistical-area-view">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Region View
        </button>
        <h2>{statisticalArea}</h2>
        <div className="area-divisional-group">
          <span>Part of {divisionalGroup} Division</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="metric-cards">
        {Object.entries(stats).map(([key, value]) => (
          <div 
            key={key} 
            className="metric-card"
            style={{ borderColor: getMetricColor(key) }}
          >
            <div className="metric-icon" style={{ backgroundColor: getMetricColor(key) }}>
              {key === 'patients' && '👥'}
              {key === 'physicianGroups' && '👨‍⚕️'}
              {key === 'agencies' && '🏢'}
              {key === 'activeOutcomes' && '📈'}
            </div>
            <div className="metric-content">
              <h3>{metricLabels[key]}</h3>
              <p className="metric-value">{formatNumber(value)}</p>
              <p className="metric-subtext">Total in {statisticalArea}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div className="area-map-container">
        <h3>Map View of {statisticalArea}</h3>
        <div className="area-map-wrapper">
          {isLoading && (
            <div className="map-loading">
              <div className="spinner"></div>
              <p>Loading map of {statisticalArea}...</p>
              <p className="map-loading-info">This may take a few seconds</p>
            </div>
          )}
          {/* Only show iframe when mapUrl is available */}
          {mapUrl && (
            <iframe
              ref={iframeRef}
              src={mapUrl}
              title={`Map of ${statisticalArea}`}
              className="area-map-frame"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups"
              loading="eager"
              importance="high"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </div>
        <div className="area-map-info">
          <p>The highlighted area shows the exact boundaries of {statisticalArea}. Use the zoom controls to explore further.</p>
          <div className="map-info-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)', border: '2px solid #312E81' }}></span>
              <span className="legend-label">Statistical Area Boundary</span>
            </div>
            <div className="legend-item">
              <span className="legend-color marker-circle" style={{ backgroundColor: 'blue' }}></span>
              <span className="legend-label">Physician Groups (PGs)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color marker-circle" style={{ backgroundColor: 'green' }}></span>
              <span className="legend-label">Home Health At Home (HHAHs)</span>
            </div>
          </div>
          <p className="map-controls-info">
            <strong>Map Controls:</strong> You can toggle layers on/off using the layers control icon <span style={{ backgroundColor: '#fff', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '4px' }}><b>⊞</b></span> in the top-right corner. The "Statistical Area Boundary" checkbox toggles the highlighted region, and the "Exact Border" checkbox (if present) controls state/county borders.
          </p>
        </div>
      </div>
      
      {/* Integration of sa_view_page components */}
      <FunnelDataProvider>
        <div className="sa-view-integration">
          {/* Navigation buttons for PG and HHAH services */}
          <NavigationButtons />
          
          {/* Listings section with tables */}
          <Listings />
          
          {/* Charts section with PieChart, PGFunnel, and HHAHFunnel */}
          <ChartsSection />
        </div>
      </FunnelDataProvider>
    </div>
  );
};

export default StatisticalAreaDetailView; 