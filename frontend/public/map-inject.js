// Direct injection script for map variables
(() => {
  console.log('[MapInject] Starting direct variable injection');
  
  // Define global variables
  window.show_states = true;
  window.show_counties = true;
  window.show_msas = true;
  window.True = true;
  window.False = false;
  
  // Function to inject variables into iframes
  function injectIntoIframes() {
    try {
      // Find all iframes in the document
      const iframes = document.querySelectorAll('iframe');
      
      iframes.forEach((iframe, index) => {
        try {
          if (iframe.contentWindow) {
            // Directly patch the contentWindow object
            iframe.contentWindow.show_states = true;
            iframe.contentWindow.show_counties = true;
            iframe.contentWindow.show_msas = true;
            iframe.contentWindow.True = true;
            iframe.contentWindow.False = false;
            
            // Also inject our own handler for future errors
            const script = document.createElement('script');
            script.textContent = `
              // Error safety
              window.show_states = true;
              window.show_counties = true;
              window.show_msas = true;
              window.True = true;
              window.False = false;
              
              // Override toggleLayer if it exists
              if (window.toggleLayer && !window.toggleLayer._fixed) {
                const orig = window.toggleLayer;
                window.toggleLayer = function(name, visible) {
                  // Ensure states variables exist
                  if (typeof window.show_states === 'undefined') window.show_states = true;
                  if (typeof window.show_counties === 'undefined') window.show_counties = true;
                  if (typeof window.show_msas === 'undefined') window.show_msas = true;
                  
                  // Safe call
                  try {
                    return orig(name, visible);
                  } catch(e) {
                    console.error('Error in toggleLayer:', e);
                    return false;
                  }
                };
                window.toggleLayer._fixed = true;
              }
            `;
            
            // Try to inject script into iframe
            try {
              if (iframe.contentDocument && iframe.contentDocument.body) {
                iframe.contentDocument.body.appendChild(script);
                console.log(`[MapInject] Script injected into iframe ${index}`);
              }
            } catch (e) {
              console.warn(`[MapInject] Failed to inject script into iframe ${index}:`, e);
            }
            
            console.log(`[MapInject] Variables injected into iframe ${index}`);
          }
        } catch (frameErr) {
          console.warn(`[MapInject] Failed to access iframe ${index}:`, frameErr);
        }
      });
    } catch (err) {
      console.error('[MapInject] Error injecting into iframes:', err);
    }
  }
  
  // Create a MutationObserver to watch for new iframes
  const observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'IFRAME' || 
              (node.nodeType === 1 && node.querySelector('iframe'))) {
            shouldInject = true;
          }
        });
      }
    });
    
    if (shouldInject) {
      console.log('[MapInject] New iframe detected, injecting variables');
      setTimeout(injectIntoIframes, 500); // Delay to ensure iframe is loaded
    }
  });
  
  // Observe the entire document
  observer.observe(document.documentElement, { 
    childList: true,
    subtree: true 
  });
  
  // Initial injection and periodic re-injection
  injectIntoIframes();
  
  // Also inject on window load
  window.addEventListener('load', () => {
    console.log('[MapInject] Window loaded, injecting variables');
    injectIntoIframes();
    
    // Additional injection after a delay to catch late iframes
    setTimeout(injectIntoIframes, 2000);
  });
  
  // Set up periodic re-injection every 5 seconds for the first minute
  let intervalCount = 0;
  const intervalId = setInterval(() => {
    console.log('[MapInject] Periodic re-injection');
    injectIntoIframes();
    
    intervalCount++;
    if (intervalCount >= 12) { // After 1 minute (12 * 5s)
      clearInterval(intervalId);
    }
  }, 5000);
  
  console.log('[MapInject] Direct variable injection script initialized');
})(); 