/**
 * Utility functions for map interaction via direct iframe DOM manipulation
 */

// Keep track of current map settings
let currentMapSettings = {
  baseMap: 'light',
  states: true,
  counties: true,
  msas: true
};

// Reference to the iframe element
let mapIframe = null;
let messageListener = null;
let pendingRefreshTimeout = null;

/**
 * Initialize the map interaction
 * @param {HTMLIFrameElement} iframe - The map iframe element 
 */
export const initializeMap = (iframe) => {
  console.log('Initializing map interaction...');
  
  // Clean up any previous instance
  cleanupMap();
  
  // Store reference to new iframe
  mapIframe = iframe;
  
  // Wait for iframe to fully load
  setTimeout(() => {
    // Try to access the iframe's content window
    try {
      // Check if we can directly manipulate the iframe content
      if (mapIframe && mapIframe.contentWindow) {
        console.log('Iframe content window accessible, sending test message');
        
        // Create a message listener
        messageListener = (event) => {
          // Verify the message is from our iframe
          if (!mapIframe || event.source !== mapIframe.contentWindow) return;
          
          console.log('Received message from map:', event.data);
          
          // Handle responses
          if (event.data.type === 'mapReady' || event.data.type === 'ACCESS_CONFIRMED') {
            console.log('Map confirmed ready for interaction');
          } else if (event.data.type === 'layerToggled' && event.data.success) {
            console.log(`Layer ${event.data.layer} toggled successfully to ${event.data.visible}`);
            // Clear any pending timeout for this layer since it was confirmed
            clearPendingRefresh();
          } else if (event.data.type === 'baseMapSet' && event.data.success) {
            console.log(`Base map set successfully to ${event.data.value}`);
            // Clear any pending timeout for this action since it was confirmed
            clearPendingRefresh();
          } else if (event.data.type === 'layerToggleError' || event.data.type === 'baseMapError') {
            console.error('Error from map:', event.data);
            // Force refresh as fallback
            refreshIframe();
          }
        };
        
        // Add the message listener
        window.addEventListener('message', messageListener);
        
        // Try to run a test function in the iframe to verify access
        mapIframe.contentWindow.postMessage({
          type: 'checkReady'
        }, '*');
      }
    } catch (e) {
      console.error('Cannot access iframe content window:', e);
    }
    
    console.log('Map initialization complete');
  }, 1000);
};

/**
 * Clean up map resources
 */
export const cleanupMap = () => {
  // Remove message listener if exists
  if (messageListener) {
    window.removeEventListener('message', messageListener);
    messageListener = null;
  }
  
  // Clear iframe reference
  mapIframe = null;
};

/**
 * Send a message to the map iframe
 */
export const sendMessageToMap = (message) => {
  console.log('Sending message to map:', message);
  
  if (!mapIframe) {
    // Just update internal state without showing errors
    // since we're using direct HTML approach now
    updateInternalState(message);
    return;
  }
  
  // Update current settings based on the message
  updateInternalState(message);
  
  // Clear any existing timeout
  clearPendingRefresh();
  
  // Send the message to the iframe via postMessage
  try {
    // For Folium maps, we need to use specific layer names
    let updatedMessage = { ...message };
    
    if (message.type === 'toggleLayer') {
      // Map our frontend layer names to the actual Folium layer names
      const layerMappings = {
        'stateBoundaries': 'State Boundaries',
        'countiesByRegion': 'All Counties by Region',
        'msaAreas': 'Metropolitan Statistical Areas'
      };
      
      updatedMessage.layer = layerMappings[message.layer] || message.layer;
    }
    
    mapIframe.contentWindow.postMessage(updatedMessage, '*');
    console.log('Message sent to iframe:', updatedMessage);
    
    // As a fallback, we'll still refresh the iframe after a short delay
    // if we don't get a confirmation back
    pendingRefreshTimeout = setTimeout(() => {
      console.log('No confirmation received, using URL fallback');
      if (mapIframe) {
        refreshIframe();
      }
      pendingRefreshTimeout = null;
    }, 1000); // Increased timeout to allow more time for response
  } catch (e) {
    console.error('Error sending message to iframe:', e);
    // Fall back to refreshing the iframe with new URL parameters
    refreshIframe();
  }
};

/**
 * Update the internal state based on the message
 */
function updateInternalState(message) {
  // Update current settings based on the message
  if (message.type === 'setBaseMap') {
    currentMapSettings.baseMap = message.value;
  } else if (message.type === 'toggleLayer') {
    switch (message.layer) {
      case 'stateBoundaries':
        currentMapSettings.states = message.visible;
        break;
      case 'countiesByRegion':
        currentMapSettings.counties = message.visible;
        break;
      case 'msaAreas':
        currentMapSettings.msas = message.visible;
        break;
      default:
        console.warn('Unknown layer:', message.layer);
    }
  }
}

/**
 * Refresh the iframe by updating the URL with current settings
 */
function refreshIframe() {
  if (!mapIframe) {
    console.error('Cannot refresh iframe: not found');
    return;
  }
  
  try {
    // Get the base URL without query parameters
    const baseUrl = mapIframe.src.split('?')[0];
    
    // Build the query parameters
    const params = new URLSearchParams();
    params.append('baseMap', currentMapSettings.baseMap);
    params.append('states', currentMapSettings.states);
    params.append('counties', currentMapSettings.counties);
    params.append('msas', currentMapSettings.msas);
    params.append('t', new Date().getTime()); // Cache-busting timestamp
    
    // Update the iframe src
    mapIframe.src = `${baseUrl}?${params.toString()}`;
  } catch (err) {
    console.error('Error refreshing iframe:', err);
  }
}

/**
 * Clear any pending refresh timeouts
 */
function clearPendingRefresh() {
  if (pendingRefreshTimeout) {
    clearTimeout(pendingRefreshTimeout);
    pendingRefreshTimeout = null;
  }
}