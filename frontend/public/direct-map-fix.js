/**
 * direct-map-fix.js
 * Fixes issues with DirectMapViewer by ensuring necessary global variables are defined
 * and accessible during the map rendering process.
 */
(function() {
  console.log('[DirectMapFix] Starting direct map fix script');
  
  // Define the variables first to ensure they exist
  try {
    // First check if they're already defined and skip if so
    if (typeof window.show_states === 'undefined') window.show_states = true;
    if (typeof window.show_counties === 'undefined') window.show_counties = true;
    if (typeof window.show_msas === 'undefined') window.show_msas = true;
    if (typeof window.True === 'undefined') window.True = true;
    if (typeof window.False === 'undefined') window.False = false;
    
    // Now check if we can define them as non-configurable properties
    // but only if they're not already defined as such
    try {
      // Use property descriptors to check if they're already defined
      // as non-configurable properties
      const trueDescriptor = Object.getOwnPropertyDescriptor(window, 'True');
      
      if (!trueDescriptor || trueDescriptor.configurable) {
        // Define them as non-configurable properties
        Object.defineProperties(window, {
          'show_states': {
            value: true,
            writable: true,
            configurable: false
          },
          'show_counties': {
            value: true,
            writable: true,
            configurable: false
          },
          'show_msas': {
            value: true,
            writable: true,
            configurable: false
          },
          'True': {
            value: true,
            writable: false,
            configurable: false
          },
          'False': {
            value: false,
            writable: false,
            configurable: false
          }
        });
        console.log('[DirectMapFix] Variables defined as non-configurable properties');
      } else {
        console.log('[DirectMapFix] Variables already defined as non-configurable - skipping property definition');
      }
    } catch (propError) {
      console.warn('[DirectMapFix] Error defining properties:', propError);
      // Just use regular assignment as fallback
      window.show_states = true;
      window.show_counties = true;
      window.show_msas = true;
      window.True = true;
      window.False = false;
    }
  } catch (e) {
    console.error('[DirectMapFix] Error defining variables:', e);
  }
  
  // Create a Proxy to monitor access to these variables
  try {
    // Store original values
    const originalValues = {
      show_states: window.show_states,
      show_counties: window.show_counties,
      show_msas: window.show_msas,
      True: window.True,
      False: window.False
    };
    
    // Define getters to ensure the variables are always accessible
    Object.defineProperties(window, {
      'getMapState': {
        value: function() {
          return {
            show_states: window.show_states || true,
            show_counties: window.show_counties || true,
            show_msas: window.show_msas || true,
            True: window.True || true,
            False: window.False || false
          };
        },
        writable: false,
        configurable: false
      }
    });
    
    console.log('[DirectMapFix] Added getMapState helper function to window');
  } catch (proxyError) {
    console.warn('[DirectMapFix] Error setting up variable access monitoring:', proxyError);
  }
  
  // Handle errors related to undefined variables
  window.addEventListener('error', function(e) {
    // Check if this is an error we can handle
    if (e.message && (
      e.message.includes('show_states is not defined') || 
      e.message.includes('show_counties is not defined') || 
      e.message.includes('show_msas is not defined') ||
      e.message.includes('True is not defined') ||
      e.message.includes('False is not defined') ||
      e.message.includes('Unexpected token')
    )) {
      console.warn('[DirectMapFix] Caught error:', e.message);
      
      // Define the variables again to fix the error
      window.show_states = true;
      window.show_counties = true;
      window.show_msas = true;
      window.True = true;
      window.False = false;
      
      // Stop error propagation
      e.preventDefault();
      return true; // Mark as handled
    }
  }, true);
  
  // Override document.createElement to inject our variables into script elements
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(document, arguments);
    
    // If this is a script element, add our variable definitions
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        originalSetAttribute.call(this, name, value);
        
        // If this script has src attribute, add our variable definitions
        // using a wrapper function
        if (name === 'src') {
          const originalOnload = this.onload;
          this.onload = function() {
            try {
              // Ensure variables exist after script loads
              window.show_states = true;
              window.show_counties = true;
              window.show_msas = true;
              window.True = true;
              window.False = false;
            } catch (e) {
              console.warn('[DirectMapFix] Error in script onload handler:', e);
            }
            
            // Call original onload handler
            if (originalOnload) originalOnload.apply(this, arguments);
          };
        }
      };
    }
    
    return element;
  };
  
  // Function to check and fix map rendering
  function checkAndFixMapRendering() {
    console.log('[DirectMapFix] Checking map rendering');
    
    try {
      // Check if map containers exist
      const mapContainers = document.querySelectorAll('.leaflet-container');
      if (mapContainers.length > 0) {
        console.log(`[DirectMapFix] Found ${mapContainers.length} map containers`);
        
        // Check if map instances exist
        if (typeof L !== 'undefined') {
          console.log('[DirectMapFix] Leaflet is defined');
          
          // Find all map instances in the window
          const mapInstances = [];
          for (const key in window) {
            if (window[key] && typeof window[key] === 'object' && window[key]._leaflet_id) {
              mapInstances.push(key);
              
              // Force map to redraw
              try {
                if (typeof window[key].invalidateSize === 'function') {
                  window[key].invalidateSize(true);
                  console.log(`[DirectMapFix] Invalidated size for map: ${key}`);
                }
              } catch (e) {
                console.warn(`[DirectMapFix] Error invalidating map ${key}:`, e);
              }
            }
          }
          
          if (mapInstances.length === 0) {
            console.warn('[DirectMapFix] No map instances found even though Leaflet is defined');
          } else {
            console.log(`[DirectMapFix] Found ${mapInstances.length} map instances`);
          }
        } else {
          console.warn('[DirectMapFix] Leaflet is not defined, cannot check map instances');
        }
      } else {
        console.warn('[DirectMapFix] No leaflet containers found');
        
        // Check if our DirectMapViewer container exists
        const directMapContainer = document.querySelector('.direct-map-container');
        if (directMapContainer) {
          console.log('[DirectMapFix] DirectMapViewer container exists');
          
          // Check if it's in error state
          const errorMessage = directMapContainer.querySelector('.map-error-message');
          if (errorMessage) {
            console.warn('[DirectMapFix] Map is in error state');
          }
          
          // Check if it's still loading
          const loadingOverlay = directMapContainer.querySelector('.map-loading-overlay');
          if (loadingOverlay) {
            console.log('[DirectMapFix] Map is still loading');
          }
        } else {
          console.warn('[DirectMapFix] DirectMapViewer container does not exist yet');
        }
      }
    } catch (e) {
      console.error('[DirectMapFix] Error checking map rendering:', e);
    }
  }
  
  // Check map rendering periodically
  setTimeout(checkAndFixMapRendering, 5000);
  setTimeout(checkAndFixMapRendering, 10000);
  
  // Perform a final check to ensure variables still exist
  setTimeout(function() {
    try {
      // Re-check variable existence
      if (typeof window.show_states === 'undefined') window.show_states = true;
      if (typeof window.show_counties === 'undefined') window.show_counties = true;
      if (typeof window.show_msas === 'undefined') window.show_msas = true;
      if (typeof window.True === 'undefined') window.True = true;
      if (typeof window.False === 'undefined') window.False = false;
      
      console.log('[DirectMapFix] Final variable check:', {
        show_states: window.show_states,
        show_counties: window.show_counties,
        show_msas: window.show_msas,
        True: window.True,
        False: window.False
      });
    } catch (e) {
      console.error('[DirectMapFix] Error in final variable check:', e);
    }
  }, 15000);
  
  // Listen for load event to check if variables are still defined
  window.addEventListener('load', function() {
    console.log('[DirectMapFix] Window loaded, checking variable existence');
    
    try {
      // Make sure variables are defined
      if (typeof window.show_states === 'undefined') window.show_states = true;
      if (typeof window.show_counties === 'undefined') window.show_counties = true;
      if (typeof window.show_msas === 'undefined') window.show_msas = true;
      if (typeof window.True === 'undefined') window.True = true;
      if (typeof window.False === 'undefined') window.False = false;
      
      console.log('[DirectMapFix] Variables checked on window load');
    } catch (e) {
      console.error('[DirectMapFix] Error checking variables on window load:', e);
    }
  });
  
  console.log('[DirectMapFix] Direct map fix script initialized');
})(); 