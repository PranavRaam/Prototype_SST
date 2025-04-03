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
  // Clean up any previous instance
  cleanupMap();
  
  // Store reference to new iframe
  mapIframe = iframe;
  
  // We don't need to try to find map components anymore
  // Just set up the basic message handling
  
  // Create a message listener
  messageListener = (event) => {
    // Basic message handling
    if (mapIframe && event.data && event.data.type) {
      // Simple event handling - no component finding
    }
  };
  
  // Add the message listener
  window.addEventListener('message', messageListener);
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
  if (!mapIframe) {
    // Just update internal state
    updateInternalState(message);
    return;
  }
  
  // Update current settings based on the message
  updateInternalState(message);
  
  // Clear any existing timeout
  clearPendingRefresh();
  
  // Send the message to the iframe via postMessage
  try {
    // Simplified message sending without component finding
    mapIframe.contentWindow.postMessage(message, '*');
  } catch (e) {
    // Silently handle errors
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
        // Silently ignore unknown layers
        break;
    }
  }
}

/**
 * Refresh the iframe by updating the URL with current settings
 */
function refreshIframe() {
  if (!mapIframe) {
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
    // Silently handle errors
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