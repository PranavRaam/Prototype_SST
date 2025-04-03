/**
 * map-check.js
 * Utility script to check if maps are properly rendered and attempt to fix issues
 */
(function() {
  console.log('[MapCheck] Starting map verification script');
  
  // Define critical variables to ensure they exist
  try {
    if (typeof window.show_states === 'undefined') window.show_states = true;
    if (typeof window.show_counties === 'undefined') window.show_counties = true;
    if (typeof window.show_msas === 'undefined') window.show_msas = true;
    if (typeof window.True === 'undefined') window.True = true;
    if (typeof window.False === 'undefined') window.False = false;
    
    console.log('[MapCheck] Critical variables defined:', {
      show_states: window.show_states,
      show_counties: window.show_counties,
      show_msas: window.show_msas,
      True: window.True,
      False: window.False
    });
  } catch (e) {
    console.error('[MapCheck] Error defining variables:', e);
  }
  
  // Function to check if maps are rendered
  function checkMaps() {
    console.log('[MapCheck] Checking if maps are rendered');
    
    // Check for Leaflet map containers
    const mapContainers = document.querySelectorAll('.leaflet-container');
    if (mapContainers.length > 0) {
      console.log(`[MapCheck] Found ${mapContainers.length} Leaflet containers`);
      
      // Check map dimensions
      mapContainers.forEach((container, index) => {
        const rect = container.getBoundingClientRect();
        console.log(`[MapCheck] Map ${index + 1} dimensions:`, {
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0
        });
        
        // Check for map controls
        const controls = container.querySelectorAll('.leaflet-control-container');
        console.log(`[MapCheck] Map ${index + 1} has ${controls.length} control containers`);
        
        // Check for map tiles
        const tiles = container.querySelectorAll('.leaflet-tile');
        console.log(`[MapCheck] Map ${index + 1} has ${tiles.length} tiles`);
        
        if (tiles.length === 0) {
          console.warn(`[MapCheck] Map ${index + 1} has no tiles - attempting to fix`);
          fixMapRendering(container);
        }
      });
    } else {
      console.warn('[MapCheck] No Leaflet containers found - checking for DirectMapViewer');
      
      // Check for our DirectMapViewer container
      const directMapContainer = document.querySelector('.direct-map-container');
      if (directMapContainer) {
        console.log('[MapCheck] Found DirectMapViewer container');
        
        // Check if it's in loading state
        const loadingOverlay = directMapContainer.querySelector('.map-loading-overlay');
        if (loadingOverlay) {
          console.log('[MapCheck] Map is still in loading state');
        } else {
          console.warn('[MapCheck] Map container exists but no Leaflet containers found - attempting to fix');
          attemptMapFix();
        }
      } else {
        console.warn('[MapCheck] No DirectMapViewer container found');
      }
    }
  }
  
  // Function to attempt to fix map rendering issues
  function fixMapRendering(container) {
    try {
      console.log('[MapCheck] Attempting to fix map rendering');
      
      // Force resize event to trigger map redraw
      if (window.dispatchEvent) {
        console.log('[MapCheck] Dispatching resize event');
        window.dispatchEvent(new Event('resize'));
      }
      
      // Check if Leaflet is defined
      if (typeof L !== 'undefined') {
        console.log('[MapCheck] Leaflet is defined, checking for map instances');
        
        // Look for map instances
        const mapInstances = [];
        for (const key in window) {
          if (window[key] && typeof window[key] === 'object' && window[key]._leaflet_id) {
            mapInstances.push(key);
          }
        }
        
        console.log('[MapCheck] Found map instances:', mapInstances);
        
        // Force map invalidation and redraw if we found any instances
        if (mapInstances.length > 0) {
          mapInstances.forEach(key => {
            try {
              if (window[key] && typeof window[key].invalidateSize === 'function') {
                console.log(`[MapCheck] Invalidating size for map: ${key}`);
                window[key].invalidateSize(true);
              }
            } catch (e) {
              console.error(`[MapCheck] Error invalidating map ${key}:`, e);
            }
          });
        }
      } else {
        console.warn('[MapCheck] Leaflet is not defined');
      }
    } catch (e) {
      console.error('[MapCheck] Error in fixMapRendering:', e);
    }
  }
  
  // Function to attempt broader fixes if no map containers are found
  function attemptMapFix() {
    console.log('[MapCheck] Attempting broader fixes');
    
    // Try to find the map content container
    const mapContent = document.querySelector('.map-content-container');
    if (mapContent) {
      console.log('[MapCheck] Found map content container - ensuring it is visible');
      
      // Force visibility
      mapContent.style.opacity = '1';
      mapContent.classList.add('loaded');
      
      // Inject a script to initialize map if needed
      const fixScript = document.createElement('script');
      fixScript.textContent = `
        // Attempt to initialize map if it's not already
        setTimeout(function() {
          try {
            console.log('[MapCheck] Running delayed map initialization check');
            
            // If Leaflet is defined but no containers exist, try to find map initialization code
            if (typeof L !== 'undefined' && document.querySelectorAll('.leaflet-container').length === 0) {
              console.log('[MapCheck] Leaflet exists but no containers - checking for init functions');
              
              // Look for map initialization functions
              for (const key in window) {
                if (typeof window[key] === 'function' && 
                    (key.toLowerCase().includes('map') || key.toLowerCase().includes('init'))) {
                  console.log('[MapCheck] Found potential init function:', key);
                  try {
                    window[key]();
                  } catch (e) {
                    console.warn('[MapCheck] Error calling:', key, e);
                  }
                }
              }
              
              // Dispatch load event
              window.dispatchEvent(new Event('load'));
            }
          } catch (e) {
            console.error('[MapCheck] Error in delayed initialization:', e);
          }
        }, 1000);
      `;
      document.body.appendChild(fixScript);
    } else {
      console.warn('[MapCheck] Map content container not found');
    }
  }
  
  // Run the check after a delay to allow the maps to initialize
  setTimeout(checkMaps, 3000);
  
  // Run a second check after a longer delay in case the first check was too early
  setTimeout(checkMaps, 8000);
  
  // Run one final check
  setTimeout(checkMaps, 15000);
  
  // Set up a global helper function to manually trigger checks
  window.checkMapStatus = function() {
    console.log('[MapCheck] Manual check triggered');
    checkMaps();
    return true;
  };
  
  console.log('[MapCheck] Map verification script initialized');
})(); 