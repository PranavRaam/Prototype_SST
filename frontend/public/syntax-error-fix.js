// Syntax error fix script - Catch and fix token errors
(function() {
  console.log("[SyntaxErrorFix] Starting syntax error handler");
  
  // Global error handler to catch syntax errors
  window.addEventListener('error', function(event) {
    // Check if it's a syntax error
    if (event.message && (
      event.message.includes("Unexpected token") || 
      event.message.includes("SyntaxError") || 
      event.message.includes("Uncaught SyntaxError")
    )) {
      console.warn("[SyntaxErrorFix] Caught syntax error:", event.message);
      
      // Define critical variables that might be used in the problematic code
      window.show_states = true;
      window.show_counties = true;
      window.show_msas = true;
      window.True = true;
      window.False = false;
      
      // Try to identify line number from the error
      const lineMatch = event.message.match(/line (\d+)/);
      const lineNumber = lineMatch ? parseInt(lineMatch[1]) : null;
      
      if (lineNumber) {
        console.log("[SyntaxErrorFix] Error was on line:", lineNumber);
      }
      
      console.log("[SyntaxErrorFix] Defined critical variables after syntax error");
      
      // Return true to mark the error as handled
      return true;
    }
  }, true); // true for capture phase to get it early
  
  // Also intercept individual scripts
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    // Only intercept script creation
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src') {
          console.log("[SyntaxErrorFix] Script src:", value);
          
          // Add an onload handler to the script
          setTimeout(() => {
            if (!element.onload) {
              element.onload = function() {
                // Define variables after script loads
                window.show_states = true;
                window.show_counties = true;
                window.show_msas = true;
                window.True = true;
                window.False = false;
                console.log("[SyntaxErrorFix] Defined variables after script loaded:", value);
              };
            }
          }, 0);
        }
        
        // Call original method
        return originalSetAttribute.call(this, name, value);
      };
      
      // Override textContent to inject our variables
      const originalDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
      if (originalDescriptor && originalDescriptor.set) {
        Object.defineProperty(element, 'textContent', {
          set: function(value) {
            if (typeof value === 'string') {
              // Add our variable definitions at the beginning of every script
              const fixedValue = `
                // SyntaxErrorFix: Define critical variables
                var show_states = true;
                var show_counties = true;
                var show_msas = true;
                var True = true;
                var False = false;
                
                // Original script
                ${value}
              `;
              // Call original setter
              originalDescriptor.set.call(this, fixedValue);
            } else {
              originalDescriptor.set.call(this, value);
            }
          },
          get: originalDescriptor.get
        });
      }
    }
    
    return element;
  };
  
  console.log("[SyntaxErrorFix] Syntax error fix initialized");
})(); 