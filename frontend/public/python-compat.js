/**
 * Python compatibility layer for JavaScript
 * This script provides compatibility for Python True/False values in JavaScript
 * as well as other Python-specific behavior needed in the map.
 */

// Execute immediately as soon as script is loaded
(function initPythonCompat() {
  // Create global True/False values
  window.True = true;
  window.False = false;
  
  // Make them non-writable if possible
  try {
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
    
    console.log('[PythonCompat] Defined True/False as non-writable properties');
  } catch (e) {
    // Fallback if defineProperty fails
    console.warn('[PythonCompat] Could not define non-writable properties:', e);
  }
  
  // Add helper functions
  window.isPythonTrue = function(val) {
    return val === true || val === window.True;
  };
  
  window.isPythonFalse = function(val) {
    return val === false || val === window.False;
  };
  
  // Patch common Leaflet/Folium functions that might use True/False
  window.addEventListener('load', function() {
    // Patch toggleLayer function if it exists
    if (window.toggleLayer && !window.toggleLayer._patched) {
      const originalToggleLayer = window.toggleLayer;
      window.toggleLayer = function(layerName, visible) {
        // Convert Python True/False to JavaScript true/false
        if (visible === window.True) visible = true;
        if (visible === window.False) visible = false;
        // Handle undefined case
        if (visible === undefined && typeof layerName === 'string') {
          visible = true; // Default to true
        }
        
        try {
          return originalToggleLayer(layerName, visible);
        } catch (e) {
          console.error('[PythonCompat] Error in toggleLayer:', e);
          return false;
        }
      };
      window.toggleLayer._patched = true;
      console.log('[PythonCompat] Patched toggleLayer for True/False compatibility');
    }
    
    // Patch layer controls to ensure they're visible
    setTimeout(function() {
      document.querySelectorAll('.leaflet-control-layers').forEach(function(control) {
        control.style.display = '';
        control.style.visibility = 'visible';
        control.style.opacity = '1';
      });
    }, 500);
  });
  
  // Log that we've loaded
  console.log('[PythonCompat] Python compatibility layer initialized');
})();

// Setup a MutationObserver to monitor for script changes
window.addEventListener('load', function() {
  // Monitor for changes to the DOM
  const observer = new MutationObserver(function(mutations) {
    // Check if True or False have been changed
    if (window.True !== true || window.False !== false) {
      console.warn('[PythonCompat] True/False values have been modified, restoring');
      window.True = true;
      window.False = false;
    }
  });
  
  // Start observing
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true 
  });
}); 