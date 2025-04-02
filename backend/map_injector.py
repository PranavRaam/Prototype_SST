"""
Map interaction code injector - adds JavaScript to the map HTML file to support
interaction with the parent window via the postMessage API.
"""

import os
import re
import sys
import argparse

# The script to inject into the map HTML - this enables direct layer manipulation
INTERACTION_SCRIPT = """
// Map interaction script for parent window communication
window.addEventListener('load', function() {
    console.log('Map iframe loaded, initializing interaction handlers');
    
    // Store references to important map objects
    let leafletMap = null;
    let baseMaps = {};
    let overlayMaps = {};
    
    // Try to find the Leaflet map instance and layer controls
    function findMapComponents() {
        try {
            // Look for map variable in global scope - Folium maps use names like map_123abc
            for (let key in window) {
                if (key.startsWith('map_') && window[key] && typeof window[key].addLayer === 'function') {
                    leafletMap = window[key];
                    console.log('Found Leaflet map:', key);
                    break;
                }
            }
            
            // Find layer control objects 
            for (let key in window) {
                if (key.startsWith('layer_control_') && window[key + '_layers']) {
                    const layers = window[key + '_layers'];
                    
                    if (layers.base_layers) {
                        baseMaps = layers.base_layers;
                        console.log('Found base layers:', Object.keys(baseMaps));
                    }
                    
                    if (layers.overlays) {
                        overlayMaps = layers.overlays;
                        console.log('Found overlay layers:', Object.keys(overlayMaps));
                    }
                    
                    break;
                }
            }
            
            return leafletMap && (Object.keys(baseMaps).length > 0 || Object.keys(overlayMaps).length > 0);
        } catch (e) {
            console.error('Error finding map components:', e);
            return false;
        }
    }
    
    // Try to find map components, with retries
    let findAttempts = 0;
    const maxAttempts = 10;
    
    function attemptToFindMapComponents() {
        if (findMapComponents()) {
            console.log('Map components found successfully');
            setupMessageHandlers();
        } else if (findAttempts < maxAttempts) {
            findAttempts++;
            console.log('Map components not found yet, retrying... (attempt ' + findAttempts + ')');
            setTimeout(attemptToFindMapComponents, 500);
        } else {
            console.warn('Failed to find map components after ' + maxAttempts + ' attempts');
        }
    }
    
    // Start looking for map components
    attemptToFindMapComponents();
    
    // Set up message handlers once we have map components
    function setupMessageHandlers() {
        // Listen for messages from parent window
        window.addEventListener('message', function(event) {
            // Security check
            if (!event.data || !event.data.type) return;
            
            console.log('Map received message:', event.data);
            
            // Process different message types
            switch(event.data.type) {
                case 'setBaseMap':
                    setBaseMap(event.data.value);
                    break;
                case 'toggleLayer':
                    toggleLayer(event.data.layer, event.data.visible);
                    break;
                case 'checkReady':
                    // Respond that we're ready
                    window.parent.postMessage({ type: 'mapReady', success: true }, '*');
                    break;
                default:
                    console.log('Unknown message type:', event.data.type);
            }
        });
        
        // Let the parent know the map is ready
        window.parent.postMessage({ type: 'mapReady', success: true }, '*');
    }
    
    // Function to change the base map
    function setBaseMap(mapType) {
        try {
            if (!leafletMap) {
                console.error('Cannot set base map: map not found');
                return;
            }
            
            console.log('Setting base map to:', mapType);
            
            // Map the requested type to the available base maps
            const mapTypeToLabel = {
                'light': 'Light Map',
                'dark': 'Dark Map',
                'street': 'Street Map'
            };
            
            const targetLabel = mapTypeToLabel[mapType] || 'Light Map';
            
            // Find the matching base layer
            let targetLayer = null;
            for (const label in baseMaps) {
                if (label === targetLabel) {
                    targetLayer = baseMaps[label];
                    break;
                }
            }
            
            if (!targetLayer) {
                console.warn('Base map not found:', targetLabel);
                return;
            }
            
            // Remove all base layers and add the selected one
            for (const label in baseMaps) {
                const layer = baseMaps[label];
                if (leafletMap.hasLayer(layer)) {
                    leafletMap.removeLayer(layer);
                }
            }
            
            leafletMap.addLayer(targetLayer);
            console.log('Base map set to:', targetLabel);
            
            // Send confirmation back to parent
            window.parent.postMessage({
                type: 'baseMapSet',
                value: mapType,
                success: true
            }, '*');
            
        } catch (err) {
            console.error('Error setting base map:', err);
            
            // Send error to parent
            window.parent.postMessage({
                type: 'baseMapError',
                value: mapType,
                error: err.message
            }, '*');
        }
    }
    
    // Function to toggle overlay layers
    function toggleLayer(layerName, visible) {
        try {
            if (!leafletMap) {
                console.error('Cannot toggle layer: map not found');
                return;
            }
            
            console.log('Toggling layer:', layerName, visible);
            
            // Check if we already have the exact layer name
            let isExactMatch = false;
            for (const label in overlayMaps) {
                if (label === layerName) {
                    isExactMatch = true;
                    break;
                }
            }
            
            // Map layer names to labels in the overlay maps
            const layerToLabel = {
                'stateBoundaries': 'State Boundaries',
                'countiesByRegion': 'All Counties by Region',
                'msaAreas': 'Metropolitan Statistical Areas'
            };
            
            // Use the provided layer name if it's an exact match,
            // otherwise try to map it
            const targetLabel = isExactMatch ? layerName : layerToLabel[layerName];
            
            if (!targetLabel) {
                console.error('Unknown layer name:', layerName);
                return;
            }
            
            // Find the matching overlay layer
            let targetLayer = null;
            for (const label in overlayMaps) {
                if (label === targetLabel) {
                    targetLayer = overlayMaps[label];
                    break;
                }
            }
            
            if (!targetLayer) {
                console.warn('Layer not found:', targetLabel);
                return;
            }
            
            // Add or remove the layer based on visibility
            if (visible) {
                if (!leafletMap.hasLayer(targetLayer)) {
                    leafletMap.addLayer(targetLayer);
                }
            } else {
                if (leafletMap.hasLayer(targetLayer)) {
                    leafletMap.removeLayer(targetLayer);
                }
            }
            
            console.log('Layer', targetLabel, 'is now', visible ? 'visible' : 'hidden');
            
            // Send confirmation back to parent
            window.parent.postMessage({
                type: 'layerToggled',
                layer: layerName,
                visible: visible,
                success: true
            }, '*');
            
        } catch (err) {
            console.error('Error toggling layer:', err);
            
            // Send error to parent
            window.parent.postMessage({
                type: 'layerToggleError',
                layer: layerName,
                error: err.message
            }, '*');
        }
    }
});
"""

def inject_script_into_map(map_file_path):
    """Inject the interaction script into the map HTML file."""
    if not os.path.exists(map_file_path):
        print(f"Error: Map file not found at {map_file_path}")
        return False
    
    with open(map_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if script is already injected
    if "Map interaction script for parent window communication" in content:
        print("Existing script found, replacing with updated version")
        # Find and remove the existing script
        start_marker = "// Map interaction script for parent window communication"
        end_marker = "});"
        
        start_idx = content.find(start_marker)
        if start_idx != -1:
            # Look for the script tag that contains our code
            script_start = content.rfind("<script>", 0, start_idx)
            if script_start != -1:
                script_end = content.find("</script>", start_idx + len(start_marker))
                if script_end != -1:
                    # Remove the entire script tag and its content
                    content = content[:script_start] + content[script_end + 9:]  # +9 to include "</script>"
                    print("Successfully removed existing script")
    
    # Find where to inject the script (right before </body>)
    if '</body>' not in content:
        print("Error: Could not find </body> tag in HTML")
        return False
    
    # Create script tag with our interaction code
    script_tag = f"<script>{INTERACTION_SCRIPT}</script>"
    
    # Insert the script right before </body>
    modified_content = content.replace('</body>', f'{script_tag}\n</body>')
    
    # Write the modified content back to the file
    with open(map_file_path, 'w', encoding='utf-8') as f:
        f.write(modified_content)
    
    print(f"Successfully injected interaction script into {map_file_path}")
    return True

def main():
    parser = argparse.ArgumentParser(description='Inject map interaction JavaScript into HTML map files')
    parser.add_argument('--map-file', default='us_20regions_map.html', help='Path to the map HTML file')
    args = parser.parse_args()
    
    result = inject_script_into_map(args.map_file)
    sys.exit(0 if result else 1)

if __name__ == '__main__':
    main() 