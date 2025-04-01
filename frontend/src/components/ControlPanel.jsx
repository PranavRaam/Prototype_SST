import { useState } from 'react';
import { sendMessageToMap } from '../utils/mapInteraction';
import './ControlPanel.css';

const ControlPanel = () => {
  const [layerOptions, setLayerOptions] = useState({
    baseMap: 'light',  // 'light', 'dark', or 'street'
    stateBoundaries: true,
    countiesByRegion: true,
    msaAreas: true
  });

  const handleBaseMapChange = (value) => {
    setLayerOptions({
      ...layerOptions,
      baseMap: value
    });
    
    // Send message to map iframe
    sendMessageToMap({
      type: 'setBaseMap',
      value
    });
  };

  const handleLayerToggle = (layer) => {
    const newOptions = {
      ...layerOptions,
      [layer]: !layerOptions[layer]
    };
    
    setLayerOptions(newOptions);
    
    // Send message to map iframe
    sendMessageToMap({
      type: 'toggleLayer',
      layer,
      visible: newOptions[layer]
    });
  };

  return (
    <div className="control-panel">
      <div className="control-section">
        <h3>Base Map</h3>
        <div className="radio-options">
          <label className="radio-option">
            <input
              type="radio"
              name="baseMap"
              checked={layerOptions.baseMap === 'light'}
              onChange={() => handleBaseMapChange('light')}
            />
            <span>Light Map</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="baseMap"
              checked={layerOptions.baseMap === 'dark'}
              onChange={() => handleBaseMapChange('dark')}
            />
            <span>Dark Map</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="baseMap"
              checked={layerOptions.baseMap === 'street'}
              onChange={() => handleBaseMapChange('street')}
            />
            <span>Street Map</span>
          </label>
        </div>
      </div>

      <div className="control-section">
        <h3>Layers</h3>
        <div className="checkbox-options">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={layerOptions.stateBoundaries}
              onChange={() => handleLayerToggle('stateBoundaries')}
            />
            <span>State Boundaries</span>
          </label>
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={layerOptions.countiesByRegion}
              onChange={() => handleLayerToggle('countiesByRegion')}
            />
            <span>All Counties by Region</span>
          </label>
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={layerOptions.msaAreas}
              onChange={() => handleLayerToggle('msaAreas')}
            />
            <span>Metropolitan Statistical Areas</span>
          </label>
        </div>
      </div>

      <div className="legend-panel">
        <h3>Metropolitan Statistical Areas</h3>
        <div className="legend-item">
          <div className="legend-line"></div>
          <span>MSA Boundary</span>
        </div>
        <div className="legend-item">
          <div className="legend-area"></div>
          <span>MSA Area</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 