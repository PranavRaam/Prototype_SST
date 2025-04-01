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
  const iframeRef = useRef(null);
  const stats = statisticalAreaStatistics[statisticalArea] || {};

  useEffect(() => {
    // Check if the API for the zoomed map is accessible
    const checkMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Encode the statistical area name for URL
        const encodedArea = encodeURIComponent(statisticalArea);
        console.log(`Requesting map for ${encodedArea}`);
        
        // Get the full backend URL and log it for debugging
        const apiUrl = getApiUrl(`/api/statistical-area-map/${encodedArea}`);
        console.log(`Full request URL: ${apiUrl}`);
        
        // Use the full backend URL with specific options
        const response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors', 
          credentials: 'omit',
          headers: {
            'Accept': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          // Try to get the error message from the response
          const errorText = await response.text();
          console.error(`Map request failed: ${errorText}`);
          throw new Error(`Failed to load statistical area map: ${response.status} ${response.statusText}`);
        }
        
        // Map was successfully accessed - add cache buster
        const finalMapUrl = `${apiUrl}?t=${Date.now()}`;
        console.log(`Setting map URL to: ${finalMapUrl}`);
        setMapUrl(finalMapUrl);
        setIsLoading(false);
      } catch (err) {
        console.error(`Error loading map: ${err.message}`);
        setError(err.message);
        setIsLoading(false);
      }
    };

    checkMap();
  }, [statisticalArea, retryCount]);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('Map iframe loaded successfully');
  };

  const handleIframeError = () => {
    console.error('Map iframe failed to load');
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
              <p>Loading detailed map...</p>
            </div>
          )}
          {/* Replace the iframe with MapPlaceholder component when loading fails or no mapUrl */}
          {(!mapUrl || error) ? (
            <MapPlaceholder />
          ) : (
            <iframe
              ref={iframeRef}
              src={mapUrl}
              title={`Map of ${statisticalArea}`}
              className="area-map-frame"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
              loading="lazy"
              importance="high"
              referrerpolicy="no-referrer-when-downgrade"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </div>
        <div className="area-map-info">
          <p>The highlighted area shows the boundaries of {statisticalArea}. Use the zoom controls to explore further.</p>
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