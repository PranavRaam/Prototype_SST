/**
 * Utility functions for map interaction via postMessage API
 */

/**
 * Initialize message listeners in the map iframe
 * This code would be injected into the map's HTML
 */
export const mapIframeScript = `
(function() {
  // Listen for messages from the parent window
  window.addEventListener('message', function(event) {
    // Security check - don't use origin check for cross-origin iframes
    // Instead, we verify the message structure
    if (!event.data || !event.data.type) return;

    // Process different message types
    switch(event.data.type) {
      case 'setBaseMap':
        setBaseMap(event.data.value);
        break;
      case 'toggleLayer':
        toggleLayer(event.data.layer, event.data.visible);
        break;
      default:
        console.log('Unknown message type:', event.data.type);
    }
  });

  // Function to change the base map
  function setBaseMap(mapType) {
    try {
      // Get all tile layers
      const tileLayers = Object.values(window.document.querySelectorAll('.leaflet-tile-pane .leaflet-layer'));
      
      // Hide all layers first
      tileLayers.forEach(layer => {
        layer.style.zIndex = 0;
        layer.style.opacity = 0;
      });
      
      // Show the selected layer
      // Assuming the order: 0=light, 1=dark, 2=street
      let index = 0;
      switch(mapType) {
        case 'dark': index = 1; break;
        case 'street': index = 2; break;
        default: index = 0; // light
      }
      
      if (tileLayers[index]) {
        tileLayers[index].style.zIndex = 1;
        tileLayers[index].style.opacity = 1;
      }
    } catch (err) {
      console.error('Error setting base map:', err);
    }
  }

  // Function to toggle a layer
  function toggleLayer(layerName, visible) {
    try {
      let selector = '';
      switch(layerName) {
        case 'stateBoundaries':
          selector = '.leaflet-overlay-pane path[fill="transparent"]';
          break;
        case 'countiesByRegion':
          selector = '.leaflet-overlay-pane path:not([fill="transparent"])';
          break;
        case 'msaAreas':
          selector = '.leaflet-overlay-pane path[stroke="#3388FF"]';
          break;
      }
      
      if (selector) {
        const elements = window.document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = visible ? 'block' : 'none';
        });
      }
    } catch (err) {
      console.error('Error toggling layer:', err);
    }
  }
})();
`;

/**
 * Send message to the map iframe
 * @param {Object} message - Message to send
 */
export const sendMessageToMap = (message) => {
  const iframe = document.querySelector('.map-frame');
  if (iframe && iframe.contentWindow) {
    // Send message to any origin (since the iframe is cross-origin)
    iframe.contentWindow.postMessage(message, '*');
  }
};

/**
 * Initialize the map once it's loaded
 * @param {HTMLIFrameElement} iframe - The map iframe element
 */
export const initializeMap = (iframe) => {
  try {
    console.log('Initializing map interaction...');
    
    // For cross-origin iframes, we cannot inject scripts
    // Instead, just setup the message passing
    
    // We'll send a ready message to the iframe to check if it's ready
    setTimeout(() => {
      sendMessageToMap({ type: 'checkReady' });
      console.log('Sent initial ready check to map iframe');
    }, 1000);
  } catch (err) {
    console.error('Error initializing map:', err);
  }
}; 