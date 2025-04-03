/**
 * Console warning suppression for map visualization
 * This script prevents excessive console logging from map-related scripts
 */

(function() {
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  // Patterns to suppress
  const suppressPatterns = [
    /\[DirectMapFix\]/,
    /DirectMapViewer/,
    /cross-origin frame/,
    /SecurityError:/,
    /Map components not found/,
    /No Leaflet containers found/,
    /\[MapCheck\]/,
    /\[MapInject\]/,
    /\[IframePatch\]/,
    /\[MapStateFix\]/,
    /Found Leaflet map:/,
    /Found MSA legend/,
    /Could not initialize custom controls/,
    /Failed to find map components/,
    /Map iframe loaded/,
    /Found 1 layer controls/,
    /Expanded a layer control/,
    /^attemptToFindMapComponents @/,
    /^attemptInitialization @/
  ];

  // Override console.log
  console.log = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string') {
      for (const pattern of suppressPatterns) {
        if (pattern.test(args[0])) {
          return; // Suppress this message
        }
      }
    }
    originalConsoleLog.apply(console, args);
  };

  // Override console.warn
  console.warn = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string') {
      for (const pattern of suppressPatterns) {
        if (pattern.test(args[0])) {
          return; // Suppress this message
        }
      }
    }
    originalConsoleWarn.apply(console, args);
  };

  // Override console.error
  console.error = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string') {
      for (const pattern of suppressPatterns) {
        if (pattern.test(args[0])) {
          return; // Suppress this message
        }
      }
    }
    originalConsoleError.apply(console, args);
  };
})(); 