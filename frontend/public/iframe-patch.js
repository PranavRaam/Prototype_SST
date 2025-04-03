// iframe-patch.js - Direct patching of iframe content
(() => {
  console.log('[IframePatch] Starting direct iframe patching');
  
  // Store original createElement method
  const originalCreateElement = document.createElement;
  
  // Override createElement to intercept iframe creation
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    // Check if we're creating an iframe
    if (tagName.toLowerCase() === 'iframe') {
      console.log('[IframePatch] Intercepted iframe creation');
      
      // Store the original setAttribute method
      const originalSetAttribute = element.setAttribute;
      
      // Override the src attribute setting
      element.setAttribute = function(name, value) {
        if (name === 'src') {
          console.log('[IframePatch] Intercepted iframe src:', value);
          
          // Add our variables to the URL
          try {
            const url = new URL(value, window.location.href);
            
            // Add our variables to the query string
            url.searchParams.set('_show_states', 'true');
            url.searchParams.set('_show_counties', 'true');
            url.searchParams.set('_show_msas', 'true');
            
            // Add timestamp to bust cache
            url.searchParams.set('_t', Date.now());
            
            // Update the value with our modified URL
            value = url.toString();
            console.log('[IframePatch] Modified iframe src:', value);
          } catch (e) {
            console.warn('[IframePatch] Failed to modify URL:', e);
          }
        }
        
        // Call the original setAttribute with possibly modified value
        return originalSetAttribute.call(this, name, value);
      };
      
      // Also override the src property
      let srcValue = '';
      Object.defineProperty(element, 'src', {
        get: function() {
          return srcValue;
        },
        set: function(value) {
          console.log('[IframePatch] Intercepted iframe src property:', value);
          
          // Add our variables to the URL
          try {
            const url = new URL(value, window.location.href);
            
            // Add our variables to the query string
            url.searchParams.set('_show_states', 'true');
            url.searchParams.set('_show_counties', 'true');
            url.searchParams.set('_show_msas', 'true');
            
            // Add timestamp to bust cache
            url.searchParams.set('_t', Date.now());
            
            // Update the value with our modified URL
            value = url.toString();
            console.log('[IframePatch] Modified iframe src property:', value);
          } catch (e) {
            console.warn('[IframePatch] Failed to modify URL:', e);
          }
          
          srcValue = value;
          
          // Update the attribute as well
          if (this.hasAttribute('src')) {
            originalSetAttribute.call(this, 'src', value);
          }
        }
      });
      
      // Override the onload handler
      const originalAddEventListener = element.addEventListener;
      element.addEventListener = function(type, listener, options) {
        if (type === 'load') {
          // Wrap the listener with our own handler
          const wrappedListener = function(event) {
            console.log('[IframePatch] Iframe loaded, injecting variables');
            
            // Inject our variables
            try {
              if (element.contentWindow) {
                element.contentWindow.show_states = true;
                element.contentWindow.show_counties = true;
                element.contentWindow.show_msas = true;
                element.contentWindow.True = true;
                element.contentWindow.False = false;
                
                // Also inject a script element
                const script = document.createElement('script');
                script.textContent = `
                  window.show_states = true;
                  window.show_counties = true;
                  window.show_msas = true;
                  window.True = true;
                  window.False = false;
                  
                  // Log that we've fixed things
                  console.log('[IframePatch] Variables injected into iframe');
                `;
                
                // Try to inject the script
                try {
                  if (element.contentDocument && element.contentDocument.body) {
                    element.contentDocument.body.appendChild(script);
                  }
                } catch (e) {
                  console.warn('[IframePatch] Failed to inject script:', e);
                }
              }
            } catch (e) {
              console.warn('[IframePatch] Failed to inject variables:', e);
            }
            
            // Call the original listener
            return listener.call(this, event);
          };
          
          // Call the original addEventListener with our wrapped listener
          return originalAddEventListener.call(this, type, wrappedListener, options);
        }
        
        // Call the original addEventListener for other event types
        return originalAddEventListener.call(this, type, listener, options);
      };
    }
    
    return element;
  };
  
  console.log('[IframePatch] Iframe patching initialized');
})(); 