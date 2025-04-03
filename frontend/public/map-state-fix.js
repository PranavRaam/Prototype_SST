// Map State Fix - define show_states and other missing variables
(function mapStateFix() {
  // Define the missing show_states variable and other potential missing variables
  window.show_states = true;
  window.show_counties = true;
  window.show_msas = true;

  // Get URL parameters to override defaults if present
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('states')) {
      window.show_states = urlParams.get('states').toLowerCase() !== 'false';
    }
    if (urlParams.has('counties')) {
      window.show_counties = urlParams.get('counties').toLowerCase() !== 'false';
    }
    if (urlParams.has('msas')) {
      window.show_msas = urlParams.get('msas').toLowerCase() !== 'false';
    }
    console.log('[MapStateFix] Initialized with states=' + window.show_states + 
                ', counties=' + window.show_counties + 
                ', msas=' + window.show_msas);
  } catch (e) {
    console.error('[MapStateFix] Error parsing URL parameters:', e);
  }

  // Also make sure True/False are properly defined
  window.True = true;
  window.False = false;

  // Function to ensure variables exist when needed
  function ensureVariables() {
    // Define show_states if it doesn't exist
    if (typeof window.show_states === 'undefined') {
      console.warn('[MapStateFix] show_states was undefined, setting to true');
      window.show_states = true;
    }
    if (typeof window.show_counties === 'undefined') {
      console.warn('[MapStateFix] show_counties was undefined, setting to true');
      window.show_counties = true;
    }
    if (typeof window.show_msas === 'undefined') {
      console.warn('[MapStateFix] show_msas was undefined, setting to true');
      window.show_msas = true;
    }
  }

  // Fix syntax error handler
  window.addEventListener('error', function(e) {
    if (e.message && (e.message.includes('Unexpected token') || e.message.includes('Syntax'))) {
      console.warn('[MapStateFix] Caught syntax error:', e.message);
      // Ensure our variables are defined even after syntax errors
      ensureVariables();
    }
  }, true);

  // Run immediately
  ensureVariables();

  // Also run after a delay and when the page loads
  setTimeout(ensureVariables, 500);
  window.addEventListener('load', ensureVariables);

  console.log('[MapStateFix] Map state variables have been defined');
})(); 