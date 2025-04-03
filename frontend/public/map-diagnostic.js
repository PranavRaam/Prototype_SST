// Map Diagnostic Script - Include this in your HTML to help diagnose map loading issues

(function() {
  console.log('[Map Diagnostic] Script loaded');
  
  // Store original fetch for debugging
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    // Log all API requests
    if (typeof url === 'string' && url.includes('/api/')) {
      console.log(`[Map Diagnostic] Fetch request to: ${url}`);
    }
    
    return originalFetch.apply(this, args)
      .then(response => {
        if (typeof url === 'string' && url.includes('/api/')) {
          console.log(`[Map Diagnostic] Response from ${url}: ${response.status} ${response.statusText}`);
          
          // Clone the response so we can both log it and return it
          const clone = response.clone();
          
          // Only try to log JSON responses
          if (url.includes('/api/map-status') || url.includes('/api/generate-map')) {
            clone.json().then(data => {
              console.log(`[Map Diagnostic] Response data:`, data);
            }).catch(e => {
              console.log(`[Map Diagnostic] Not a JSON response`);
            });
          }
        }
        return response;
      })
      .catch(error => {
        if (typeof url === 'string' && url.includes('/api/')) {
          console.error(`[Map Diagnostic] Error fetching ${url}:`, error);
        }
        throw error;
      });
  };
  
  // Listen for iframe load events
  window.addEventListener('load', function() {
    setTimeout(() => {
      const iframes = document.querySelectorAll('iframe');
      console.log(`[Map Diagnostic] Found ${iframes.length} iframes on the page`);
      
      iframes.forEach((iframe, index) => {
        console.log(`[Map Diagnostic] Iframe #${index}: src=${iframe.src}, width=${iframe.offsetWidth}, height=${iframe.offsetHeight}`);
        
        try {
          // Try to access iframe content - this will fail with cross-origin restrictions
          // but we can at least check if it loaded
          const iframeLoaded = iframe.contentWindow || iframe.contentDocument;
          console.log(`[Map Diagnostic] Iframe #${index} appears to have loaded`);
        } catch (e) {
          console.log(`[Map Diagnostic] Iframe #${index} access error: ${e.message}`);
        }
      });
    }, 3000);
  });
  
  // Listen for messages from the map iframe
  window.addEventListener('message', function(event) {
    console.log('[Map Diagnostic] Received message from iframe:', event.data);
  });
  
  // Environment info
  console.log('[Map Diagnostic] Environment:', {
    nodeEnv: process.env.NODE_ENV,
    apiUrl: import.meta.env.VITE_API_URL,
    isProd: process.env.NODE_ENV === 'production'
  });
  
})(); 