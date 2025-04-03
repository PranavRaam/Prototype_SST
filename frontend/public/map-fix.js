// Map error fix script - Immediate fix for Python True/False conversion

// Fix Python True/False vs JavaScript true/false - RUN IMMEDIATELY
(function initializeGlobalPythonValues() {
  // Force define True/False consistently
  window.True = true;
  window.False = false;
  
  // Also define them as non-enumerable properties to prevent overwrites
  try {
    // Try to define as non-writable properties
    Object.defineProperty(window, 'True', {
      value: true,
      writable: false,
      configurable: false
    });
    
    Object.defineProperty(window, 'False', {
      value: false,
      writable: false,
      configurable: false
    });
  } catch (e) {
    // Fallback if defineProperty fails
    console.warn('[MapFix] Failed to define non-writable True/False:', e);
    window.True = true;
    window.False = false;
  }
  
  // Create global Python truth checker functions
  window.isPythonTrue = function(val) {
    return val === true || val === window.True;
  };
  
  window.isPythonFalse = function(val) {
    return val === false || val === window.False;
  };
  
  console.log('[MapFix] Added True/False compatibility - IMMEDIATE');
})();

// Find and fix map layers immediately 
function fixMapLayers() {
  try {
    // Ensure True/False are defined
    window.True = true;
    window.False = false;
    
    // Patch toggleLayer function using a more robust approach
    if (window.toggleLayer && !window.toggleLayer._patched) {
      const originalToggleLayer = window.toggleLayer;
      window.toggleLayer = function safeToggleLayer(layerName, visible) {
        // Force define True/False in this function scope
        if (typeof True === 'undefined') window.True = true;
        if (typeof False === 'undefined') window.False = false;
        
        // Convert any Python True/False to JavaScript true/false
        if (visible === window.True) visible = true;
        if (visible === window.False) visible = false;
        
        // Add safety check for undefined
        if (visible === undefined && typeof layerName === 'string') {
          visible = true; // Default to true if undefined
          console.log('[MapFix] Using default visibility (true) for layer:', layerName);
        }
        
        // Extra safety for the layerName parameter
        if (typeof layerName !== 'string') {
          console.error('[MapFix] Invalid layer name:', layerName);
          return false;
        }
        
        try {
          return originalToggleLayer(layerName, visible);
        } catch (err) {
          console.error('[MapFix] Error toggling layer:', layerName, visible, err);
          
          // Recovery attempt
          try {
            // Try direct map manipulation as fallback
            let mapElement = document.querySelector('.folium-map');
            if (mapElement && mapElement.id && window[mapElement.id]) {
              let leafletMap = window[mapElement.id];
              
              // Find the layer by searching through overlays
              // This works with Folium's layer naming convention
              let targetLayer = null;
              
              // Try to find the layer control and extract overlay maps
              for (let key in window) {
                if (key.startsWith('layer_control_') && window[key + '_layers'] && window[key + '_layers'].overlays) {
                  const overlayMaps = window[key + '_layers'].overlays;
                  
                  // Look for exact match first
                  if (overlayMaps[layerName]) {
                    targetLayer = overlayMaps[layerName];
                    break;
                  }
                  
                  // If no exact match, try partial match
                  for (const label in overlayMaps) {
                    if (label.includes(layerName) || layerName.includes(label)) {
                      targetLayer = overlayMaps[label];
                      console.log('[MapFix] Found layer through partial match:', label);
                      break;
                    }
                  }
                  
                  if (targetLayer) break;
                }
              }
              
              if (targetLayer) {
                if (visible) {
                  leafletMap.addLayer(targetLayer);
                } else {
                  leafletMap.removeLayer(targetLayer);
                }
                console.log('[MapFix] Recovery successful - toggled layer directly:', layerName, visible);
                return true;
              }
            }
          } catch (recoveryErr) {
            console.error('[MapFix] Recovery attempt failed:', recoveryErr);
          }
          
          return false;
        }
      };
      window.toggleLayer._patched = true;
      console.log('[MapFix] Patched toggleLayer function with robust error handling');
    }
    
    // Make sure layer controls are visible
    document.querySelectorAll('.leaflet-control-layers, .leaflet-control-layers-expanded, .leaflet-control, .leaflet-control-layers-selector').forEach(el => {
      if (el && el.style) {
        el.style.display = '';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        
        // Also ensure parent elements are visible
        if (el.parentElement) {
          el.parentElement.style.display = '';
          el.parentElement.style.visibility = 'visible';
          el.parentElement.style.opacity = '1';
        }
      }
    });
  } catch (e) {
    console.error('[MapFix] Error fixing map layers:', e);
  }
}

// Run fix functions as soon as possible
fixMapLayers();

// Wait for the map to load completely
window.addEventListener('load', function() {
  console.log('[MapFix] Map page loaded, applying fixes');
  
  // Define a more robust way to find map components
  function findLeafletMap() {
    // Method 1: Look for map_ variables in window
    for (let key in window) {
      if (key.startsWith('map_') && window[key] && typeof window[key].addLayer === 'function') {
        console.log('[MapFix] Found Leaflet map variable:', key);
        return window[key];
      }
    }
    
    // Method 2: Look for map elements in DOM
    let mapElements = document.querySelectorAll('.folium-map');
    for (let i = 0; i < mapElements.length; i++) {
      let mapId = mapElements[i].id;
      if (mapId && window[mapId] && typeof window[mapId].addLayer === 'function') {
        console.log('[MapFix] Found Leaflet map by DOM element ID:', mapId);
        return window[mapId];
      }
    }
    
    // Method 3: Check _leaflet_id_map
    if (window._leaflet_id_map) {
      for (let id in window._leaflet_id_map) {
        let map = window._leaflet_id_map[id];
        if (map && typeof map.addLayer === 'function') {
          console.log('[MapFix] Found Leaflet map in _leaflet_id_map');
          return map;
        }
      }
    }
    
    console.warn('[MapFix] Could not find Leaflet map');
    return null;
  }
  
  // Fix missing map components with improved reliability
  function ensureMapComponents() {
    // Always make sure True/False are defined (multiple approaches for redundancy)
    window.True = true;
    window.False = false;
    
    // Force evaluate True/False definitions in all code by creating properties with getters
    if (typeof True === 'undefined') {
      Object.defineProperty(window, 'True', {
        get: function() { return true; }
      });
    }
    
    if (typeof False === 'undefined') {
      Object.defineProperty(window, 'False', {
        get: function() { return false; }
      });
    }
    
    // Improve toggleLayer function immediately with multiple safety checks
    if (window.toggleLayer && !window.toggleLayer._robust_patched) {
      const originalToggleLayer = window.toggleLayer._patched ? window.toggleLayer : window.toggleLayer;
      
      window.toggleLayer = function robustToggleLayer(layerName, visible) {
        // Local True/False definitions for this function scope
        const localTrue = true;
        const localFalse = false;
        
        // Ensure global definitions exist
        window.True = localTrue;
        window.False = localFalse;
        
        // Convert Python True/False to JavaScript true/false
        if (visible === window.True || visible === True) visible = localTrue;
        if (visible === window.False || visible === False) visible = localFalse;
        
        // Safety check for undefined with sensible default
        if (visible === undefined && typeof layerName === 'string') {
          visible = localTrue; // Default to true if undefined
        }
        
        console.log('[MapFix] Robust toggle layer called:', layerName, visible);
        
        try {
          // Find the map if needed
          let leafletMap = findLeafletMap();
          if (!leafletMap) {
            console.warn('[MapFix] Toggle failed - could not find map');
            return false;
          }
          
          // Try to manually toggle using the map API if possible
          let foundLayer = false;
          
          // Search for layer controls in the typical Folium pattern
          for (let key in window) {
            if (key.startsWith('layer_control_') && window[key + '_layers']) {
              let overlays = window[key + '_layers'].overlays || {};
              
              // Check if we have an exact match
              if (overlays[layerName]) {
                if (visible) {
                  leafletMap.addLayer(overlays[layerName]);
                } else {
                  leafletMap.removeLayer(overlays[layerName]);
                }
                console.log('[MapFix] Direct layer toggle successful for:', layerName);
                foundLayer = true;
                break;
              }
            }
          }
          
          // Fall back to original function if we couldn't handle it directly
          if (!foundLayer) {
            return originalToggleLayer(layerName, visible);
          }
          
          return true;
        } catch (e) {
          console.error('[MapFix] Error in robust toggleLayer:', e);
          // Try one last fallback - using the original function
          try {
            return originalToggleLayer(layerName, visible);
          } catch (lastError) {
            console.error('[MapFix] Final fallback failed:', lastError);
            return false;
          }
        }
      };
      
      window.toggleLayer._robust_patched = true;
      window.toggleLayer._patched = true;
      console.log('[MapFix] Applied robust patch to toggleLayer function');
    }
    
    // Fix map visibility with multiple approaches
    try {
      // Approach 1: Direct style manipulation
      document.querySelectorAll('.folium-map, .leaflet-container, .leaflet-control-container, .leaflet-control-layers')
        .forEach(el => {
          if (el && el.style) {
            el.style.display = el.tagName === 'DIV' ? 'block' : '';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          }
        });
      
      // Approach 2: Try to properly size the map
      let leafletMap = findLeafletMap();
      if (leafletMap && typeof leafletMap.invalidateSize === 'function') {
        leafletMap.invalidateSize(true);
        console.log('[MapFix] Invalidated map size');
      }
      
      // Approach 3: Remove any problematic CSS
      let mapStyleTag = document.createElement('style');
      mapStyleTag.textContent = `
        .folium-map, .leaflet-container, .leaflet-control-container, 
        .leaflet-control-layers, .leaflet-control { 
          display: block !important; 
          visibility: visible !important; 
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(mapStyleTag);
      
    } catch (e) {
      console.error('[MapFix] Error fixing map visibility:', e);
    }

    // Fix any hidden map layers using our improved function
    fixMapLayers();

    // Ensure layer control is visible
    console.log('[MapFix] Ensuring layer control is visible');
    var layerControls = document.querySelectorAll('.leaflet-control-layers');
    if (layerControls.length > 0) {
      console.log('[MapFix] Found ' + layerControls.length + ' layer controls');
      layerControls.forEach(control => {
        control.style.display = '';
        control.classList.add('leaflet-control-layers-expanded');
        console.log('[MapFix] Expanded a layer control');
      });
    }

    // Notify parent when map is ready
    try {
      window.parent.postMessage({
        type: 'MAP_LOADED',
        success: true
      }, '*');
    } catch (e) {
      console.error('[MapFix] Error sending ready message to parent:', e);
    }
  }

  // Handle all messages from parent with improved reliability
  function handleParentMessage(event) {
    // Extra safety: Always ensure True/False are defined before handling any message
    window.True = true;
    window.False = false;
    
    if (!event.data || !event.data.type) {
      return; // Ignore messages without proper type
    }
    
    console.log('[MapFix] Received message:', event.data.type);
    
    try {
      switch(event.data.type) {
        case 'FIX_TRUE_ERROR':
          console.log('[MapFix] Processing fix script from parent');
          
          // Ensure True/False are defined before running fix script
          window.True = true;
          window.False = false;
          
          // Apply the fix script if provided
          if (event.data.payload && event.data.payload.fixScript) {
            try {
              eval(event.data.payload.fixScript);
              console.log('[MapFix] Applied fix script via eval');
            } catch (scriptErr) {
              console.error('[MapFix] Error applying fix script:', scriptErr);
            }
          }
          
          // Always run ensureMapComponents after fix attempts
          ensureMapComponents();
          break;
          
        case 'DIRECT_FIX':
          console.log('[MapFix] Processing direct fix from parent');
          
          // Apply direct code fix if provided
          if (event.data.payload && event.data.payload.code) {
            try {
              eval(event.data.payload.code);
              console.log('[MapFix] Applied direct fix via eval');
            } catch (codeErr) {
              console.error('[MapFix] Error applying direct fix code:', codeErr);
            }
          }
          
          // Patch toggleLayer specifically for True/False handling
          if (window.toggleLayer && !window.toggleLayer._robust_patched) {
            ensureMapComponents(); // Will apply the robust patch
          }
          break;
          
        case 'FIX_TOGGLE_LAYER':
          console.log('[MapFix] Received toggle layer fix request');
          
          // First ensure True/False are defined
          window.True = true;
          window.False = false;
          
          // Then directly patch the toggleLayer function
          if (window.toggleLayer && !window.toggleLayer._fixed) {
            try {
              const originalToggle = window.toggleLayer;
              window.toggleLayer = function fixedToggleLayer(layerName, visible) {
                // Ensure True/False are defined within function scope
                window.True = true;
                window.False = false;
                
                // Fix the visible parameter
                if (visible === window.True) visible = true;
                if (visible === window.False) visible = false;
                if (visible === undefined) visible = true;
                
                console.log('[MapFix] Fixed toggleLayer called with:', layerName, visible);
                
                try {
                  // Call original function with fixed parameters
                  return originalToggle(layerName, visible);
                } catch (toggleErr) {
                  console.error('[MapFix] Error in toggleLayer:', toggleErr);
                  
                  // Try direct layer manipulation as fallback
                  try {
                    // Find the map
                    let map = null;
                    for (let key in window) {
                      if (key.startsWith('map_') && window[key] && 
                          typeof window[key].addLayer === 'function') {
                        map = window[key];
                        break;
                      }
                    }
                    
                    if (!map) {
                      throw new Error('Map not found');
                    }
                    
                    // Find the layer
                    let layer = null;
                    for (let key in window) {
                      if (key.startsWith('layer_control_') && 
                          window[key + '_layers'] && 
                          window[key + '_layers'].overlays) {
                        const overlays = window[key + '_layers'].overlays;
                        if (overlays[layerName]) {
                          layer = overlays[layerName];
                          break;
                        }
                      }
                    }
                    
                    if (!layer) {
                      throw new Error('Layer not found: ' + layerName);
                    }
                    
                    // Toggle the layer directly
                    if (visible) {
                      map.addLayer(layer);
                    } else {
                      map.removeLayer(layer);
                    }
                    
                    console.log('[MapFix] Direct layer manipulation succeeded');
                    return true;
                  } catch (fallbackErr) {
                    console.error('[MapFix] Fallback also failed:', fallbackErr);
                    return false;
                  }
                }
              };
              
              window.toggleLayer._fixed = true;
              window.toggleLayer._patched = true;
              console.log('[MapFix] Successfully applied specialized fix to toggleLayer');
              
              // Run fixMapLayers as well to complete the fix
              fixMapLayers();
            } catch (patchErr) {
              console.error('[MapFix] Error applying toggle layer fix:', patchErr);
            }
          } else {
            console.log('[MapFix] toggleLayer already fixed or not available');
          }
          break;
          
        case 'SELECTEXT_URL_RESPONSE':
          // This is a keep-alive message, ensure True/False are defined
          window.True = true;
          window.False = false;
          
          // Also take the opportunity to fix any issues
          fixMapLayers();
          break;
          
        case 'toggleLayer':
          // Handle toggle layer command directly
          if (typeof event.data.layer === 'string') {
            window.True = true; // Ensure True is defined
            window.False = false; // Ensure False is defined
            
            console.log('[MapFix] Direct toggle layer command:', event.data.layer, event.data.visible);
            
            // Call our robust toggleLayer implementation
            if (window.toggleLayer && typeof window.toggleLayer === 'function') {
              try {
                window.toggleLayer(event.data.layer, event.data.visible);
              } catch (toggleErr) {
                console.error('[MapFix] Error handling toggle command:', toggleErr);
              }
            }
          }
          break;
          
        default:
          console.log('[MapFix] Received unhandled message type:', event.data.type);
      }
    } catch (e) {
      console.error('[MapFix] Error processing message:', e);
    }
  }

  // Remove any existing message listeners to avoid duplicates
  window.removeEventListener('message', handleParentMessage);
  
  // Add our improved message handler
  window.addEventListener('message', handleParentMessage);
  
  // Apply fixes at different times to ensure they work
  setTimeout(ensureMapComponents, 100);
  setTimeout(ensureMapComponents, 1000);
  setTimeout(ensureMapComponents, 3000);
  
  // Set up interval to keep fixing any issues
  const fixInterval = setInterval(function() {
    // Always ensure True/False are defined
    window.True = true;
    window.False = false;
    
    // Check if we need to reapply fixes
    if (typeof True === 'undefined' || typeof False === 'undefined') {
      console.warn('[MapFix] True/False became undefined, reapplying fixes');
      ensureMapComponents();
    }
    
    // Fix layers periodically
    fixMapLayers();
  }, 2000);
  
  // Clean up interval after 5 minutes to avoid memory leaks
  setTimeout(() => {
    clearInterval(fixInterval);
    console.log('[MapFix] Cleared maintenance interval after timeout');
  }, 5 * 60 * 1000);
}); 