from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import os
import main
import threading
import time
import urllib.parse
import logging
from statistical_area_zoom import generate_statistical_area_map

app = Flask(__name__)
# Update CORS configuration to allow both domains and be more permissive
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins for simplicity
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Cache-Control", "X-Requested-With", "Pragma", "Expires"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "X-Frame-Options", "Content-Security-Policy", "Access-Control-Allow-Origin"]
    }
})

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

MAP_FILE = "us_20regions_map.html"
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
map_generation_lock = threading.Lock()
map_generation_in_progress = False
map_data = None

# Ensure cache directory exists
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
    logger.info(f"Created cache directory: {CACHE_DIR}")

@app.route('/api/generate-map', methods=['GET', 'OPTIONS'])
def generate_map():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.response_class(
            response='',
            status=200
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
        
    global map_generation_in_progress
    
    # Check if force parameter is provided
    force = request.args.get('force', 'false').lower() == 'true'
    
    # Check if map already exists and force is not specified
    if os.path.exists(MAP_FILE) and not force:
        logger.info(f"Map already exists at {MAP_FILE}")
        response = jsonify({
            "success": True,
            "mapPath": "/api/map",
            "message": "Map already exists"
        })
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    
    # If force is specified or map doesn't exist, delete existing map
    if os.path.exists(MAP_FILE) and force:
        try:
            os.remove(MAP_FILE)
            logger.info(f"Removed existing map for forced regeneration")
        except Exception as e:
            logger.error(f"Failed to remove existing map: {str(e)}")
    
    # Start map generation in background thread if not already in progress
    if not map_generation_in_progress:
        with map_generation_lock:
            map_generation_in_progress = True
        
        def generate_map_task():
            global map_generation_in_progress, map_data
            try:
                logger.info("Starting map generation...")
                map_data = main.main()
                logger.info("Map generation completed successfully")
            except Exception as e:
                logger.error(f"Error generating map: {str(e)}")
            finally:
                with map_generation_lock:
                    map_generation_in_progress = False
        
        thread = threading.Thread(target=generate_map_task)
        thread.start()
        
        response = jsonify({
            "success": True,
            "message": "Map generation started"
        })
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    
    response = jsonify({
        "success": False,
        "message": "Map generation already in progress"
    })
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/api/map-status', methods=['GET', 'OPTIONS'])
def map_status():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.response_class(
            response='',
            status=200
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
        
    try:
        response = jsonify({
            "success": True,
            "mapExists": os.path.exists(MAP_FILE),
            "generationInProgress": map_generation_in_progress
        })
        
        # Add explicit CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        
        return response
    except Exception as e:
        logger.error(f"Error checking map status: {str(e)}")
        error_response = jsonify({
            "success": False,
            "message": str(e)
        })
        
        # Add CORS headers to error response as well
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        error_response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        error_response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        
        return error_response, 500

@app.route('/api/map', methods=['GET', 'OPTIONS'])
def get_map():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.response_class(
            response='',
            status=200
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
        
    try:
        if not os.path.exists(MAP_FILE):
            error_response = jsonify({
                "success": False,
                "message": "Map not found"
            })
            # Add CORS headers to error response
            error_response.headers['Access-Control-Allow-Origin'] = '*'
            return error_response, 404
        
        # Get configuration from query parameters
        base_map = request.args.get('baseMap', 'light')
        show_states = request.args.get('states', 'true').lower() == 'true'
        show_counties = request.args.get('counties', 'true').lower() == 'true'
        show_msas = request.args.get('msas', 'true').lower() == 'true'
        
        # Read the map HTML content
        with open(MAP_FILE, 'r') as f:
            map_html = f.read()
        
        # Inject configuration scripts
        # 1. Initial configuration script
        init_config_script = f"""
        <script>
        // Initial map configuration from query parameters
        window.addEventListener('load', function() {{
            console.log('Applying initial map configuration');
            
            // Find the map instance
            let leafletMap = null;
            let baseMaps = {{}};
            let overlayMaps = {{}};
            
            // Find the Leaflet map
            for (let key in window) {{
                if (key.startsWith('map_') && window[key] && typeof window[key].addLayer === 'function') {{
                    leafletMap = window[key];
                    console.log('Found Leaflet map:', key);
                    break;
                }}
            }}
            
            // Find layer controls
            for (let key in window) {{
                if (key.startsWith('layer_control_') && window[key + '_layers']) {{
                    const layers = window[key + '_layers'];
                    
                    if (layers.base_layers) {{
                        baseMaps = layers.base_layers;
                        console.log('Found base layers:', Object.keys(baseMaps));
                    }}
                    
                    if (layers.overlays) {{
                        overlayMaps = layers.overlays;
                        console.log('Found overlay layers:', Object.keys(overlayMaps));
                    }}
                    
                    break;
                }}
            }}
            
            if (!leafletMap) {{
                console.error('Map instance not found');
                return;
            }}
            
            // Save references globally for postMessage handler
            window.mapComponents = {{
                leafletMap: leafletMap,
                baseMaps: baseMaps,
                overlayMaps: overlayMaps
            }};
            
            // Set initial base map
            try {{
                const baseMapLabels = {{
                    'light': 'Light Map',
                    'dark': 'Dark Map',
                    'street': 'Street Map'
                }};
                
                const targetLabel = baseMapLabels['{base_map}'] || 'Light Map';
                
                // Find the layer
                let targetLayer = null;
                for (const label in baseMaps) {{
                    if (label === targetLabel) {{
                        targetLayer = baseMaps[label];
                        break;
                    }}
                }}
                
                if (targetLayer) {{
                    // Remove all base layers
                    for (const label in baseMaps) {{
                        const layer = baseMaps[label];
                        if (leafletMap.hasLayer(layer)) {{
                            leafletMap.removeLayer(layer);
                        }}
                    }}
                    
                    // Add the target base layer
                    leafletMap.addLayer(targetLayer);
                    console.log('Set base map to:', targetLabel);
                }}
            }} catch (e) {{
                console.error('Error setting base map:', e);
            }}
            
            // Set initial overlay layers
            try {{
                const layerConfig = {{
                    'State Boundaries': {show_states},
                    'All Counties by Region': {show_counties},
                    'Metropolitan Statistical Areas': {show_msas}
                }};
                
                for (const label in overlayMaps) {{
                    const layer = overlayMaps[label];
                    const visible = layerConfig[label];
                    
                    if (visible === false) {{
                        if (leafletMap.hasLayer(layer)) {{
                            leafletMap.removeLayer(layer);
                            console.log('Hiding layer:', label);
                        }}
                    }} else if (visible === true) {{
                        if (!leafletMap.hasLayer(layer)) {{
                            leafletMap.addLayer(layer);
                            console.log('Showing layer:', label);
                        }}
                    }}
                }}
            }} catch (e) {{
                console.error('Error toggling layers:', e);
            }}
        }});
        </script>
        """
        
        # 2. Message handler script for dynamic updates
        message_handler_script = """
        <script>
        // Handle postMessage events for dynamic map updates
        window.addEventListener('message', function(event) {
            // Security check
            if (!event.data || !event.data.type) return;
            
            console.log('Map received message:', event.data);
            
            // Check if map components are available
            if (!window.mapComponents) {
                console.error('Map components not available yet');
                return;
            }
            
            const { leafletMap, baseMaps, overlayMaps } = window.mapComponents;
            
            // Handle different message types
            switch(event.data.type) {
                case 'TEST_ACCESS':
                    console.log('Access test received');
                    // Respond that map is accessible
                    window.parent.postMessage({ type: 'ACCESS_CONFIRMED' }, '*');
                    break;
                    
                case 'setBaseMap':
                    try {
                        const mapType = event.data.value;
                        const baseMapLabels = {
                            'light': 'Light Map',
                            'dark': 'Dark Map',
                            'street': 'Street Map'
                        };
                        
                        const targetLabel = baseMapLabels[mapType] || 'Light Map';
                        
                        // Find the layer
                        let targetLayer = null;
                        for (const label in baseMaps) {
                            if (label === targetLabel) {
                                targetLayer = baseMaps[label];
                                break;
                            }
                        }
                        
                        if (targetLayer) {
                            // Remove all base layers
                            for (const label in baseMaps) {
                                const layer = baseMaps[label];
                                if (leafletMap.hasLayer(layer)) {
                                    leafletMap.removeLayer(layer);
                                }
                            }
                            
                            // Add the target base layer
                            leafletMap.addLayer(targetLayer);
                            console.log('Set base map to:', targetLabel);
                        }
                    } catch (e) {
                        console.error('Error setting base map:', e);
                    }
                    break;
                    
                case 'toggleLayer':
                    try {
                        const { layer, visible } = event.data;
                        
                        // Map layer names to labels
                        const layerToLabel = {
                            'stateBoundaries': 'State Boundaries',
                            'countiesByRegion': 'All Counties by Region',
                            'msaAreas': 'Metropolitan Statistical Areas'
                        };
                        
                        const targetLabel = layerToLabel[layer];
                        
                        if (!targetLabel) {
                            console.error('Unknown layer name:', layer);
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
                    } catch (e) {
                        console.error('Error toggling layer:', e);
                    }
                    break;
                    
                default:
                    console.log('Unknown message type:', event.data.type);
            }
        });
        </script>
        """
        
        # 3. Add CSS to ensure layer controls are visible and properly positioned
        layer_control_css = """
        <style>
        /* Make layer control more prominent */
        .leaflet-control-layers {
            font-size: 14px !important;
            background-color: white !important;
            padding: 8px 10px !important;
            border-radius: 5px !important;
            box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
            border: 2px solid rgba(0,0,0,0.2) !important;
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 1000 !important;
            opacity: 0.95 !important;
        }
        
        /* Make sure the layer control is expanded by default */
        .leaflet-control-layers-expanded {
            display: block !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
        }
        
        /* Make checkboxes and labels more visible */
        .leaflet-control-layers label {
            margin-bottom: 5px !important;
            display: block !important;
            font-weight: 500 !important;
        }
        
        /* Add a noticeable border between base maps and overlays */
        .leaflet-control-layers-separator {
            height: 2px !important;
            background-color: #888 !important;
            margin: 8px 0 !important;
        }
        </style>
        """
        
        # Add script to ensure the layer control is expanded on page load
        layer_control_script = """
        <script>
        // Ensure layer control is visible
        window.addEventListener('load', function() {
            console.log("Ensuring layer control is visible");
            
            // Force expand all layer controls
            setTimeout(function() {
                try {
                    // Try to expand any layer control elements
                    const controls = document.querySelectorAll('.leaflet-control-layers');
                    console.log("Found " + controls.length + " layer controls");
                    
                    controls.forEach(function(control) {
                        // Add expanded class
                        control.classList.add('leaflet-control-layers-expanded');
                        console.log("Expanded a layer control");
                        
                        // Make sure it's visible
                        control.style.display = 'block';
                    });
                } catch (e) {
                    console.error("Error expanding layer controls:", e);
                }
            }, 1000);
        });
        </script>
        """
        
        # Inject all scripts and CSS before </body>
        modified_html = map_html.replace('</head>', f'{layer_control_css}</head>')
        modified_html = modified_html.replace('</body>', f'{init_config_script}\n{message_handler_script}\n{layer_control_script}\n</body>')
        
        # Return the modified HTML content
        response = app.response_class(
            response=modified_html,
            status=200,
            mimetype='text/html'
        )
        
        # Add headers to allow iframe embedding and CORS
        response.headers['X-Frame-Options'] = 'ALLOWALL'
        response.headers['Content-Security-Policy'] = "frame-ancestors *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://code.jquery.com; connect-src 'self' *"
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
    except Exception as e:
        logger.error(f"Error serving map: {str(e)}")
        error_response = jsonify({
            "success": False,
            "message": str(e)
        })
        # Add CORS headers to error response
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        return error_response, 500

@app.route('/api/regions', methods=['GET', 'OPTIONS'])
def get_regions():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.response_class(
            response='',
            status=200
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
        
    try:
        # Fetch region data
        _, _, _, regions = main.define_regions()
        
        # Convert region data to a format suitable for frontend
        region_data = {
            region: {
                "states": data["states"],
                "color": data["color"]
            } for region, data in regions.items()
        }
        
        response = jsonify(region_data)
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
    except Exception as e:
        logger.error(f"Error fetching regions: {str(e)}")
        error_response = jsonify({
            "success": False,
            "message": str(e)
        })
        # Add CORS headers to error response
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        error_response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        error_response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return error_response, 500

@app.route('/api/statistical-area-map', methods=['GET', 'OPTIONS'])
def get_statistical_area_map():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.response_class(
            response='',
            status=200
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
        
    try:
        # Get parameters from query string
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))
        zoom = float(request.args.get('zoom', 10))
        
        # Generate the map
        map_html = generate_statistical_area_map(lat, lon, zoom)
        
        # Add headers to allow iframe embedding for both domains
        response = app.response_class(
            response=map_html,
            status=200,
            mimetype='text/html'
        )
        response.headers['X-Frame-Options'] = 'ALLOWALL'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
    except Exception as e:
        logger.error(f"Error generating statistical area map: {str(e)}")
        error_response = jsonify({
            "success": False,
            "message": str(e)
        })
        # Add CORS headers
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        error_response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        error_response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return error_response, 500

@app.route('/api/statistical-area-map/<area_name>', methods=['GET', 'OPTIONS'])
def get_statistical_area_map_by_name(area_name):
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.response_class(
            response='',
            status=200
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response

    try:
        logger.info(f"Received request for map of area: {area_name}")
        # Generate the map by area name
        decoded_area_name = urllib.parse.unquote(area_name)
        logger.info(f"Decoded area name: {decoded_area_name}")
        
        # Extract parameters
        cache_buster = request.args.get('t', '')
        random_param = request.args.get('r', '')
        force_detailed = request.args.get('detailed', 'false').lower() == 'true'
        exact_boundary = request.args.get('exact_boundary', 'false').lower() == 'true'
        zoom_level = int(request.args.get('zoom', '10'))
        # Get display parameters for PGs and HHAHs
        display_pgs = request.args.get('display_pgs', 'false').lower() == 'true'
        display_hhahs = request.args.get('display_hhahs', 'false').lower() == 'true'
        
        logger.info(f"Request params: cache_buster={cache_buster}, random={random_param}, "
                    f"force_detailed={force_detailed}, exact_boundary={exact_boundary}, zoom={zoom_level}, "
                    f"display_pgs={display_pgs}, display_hhahs={display_hhahs}")
        
        # Check for Fiona issues and log diagnostic information
        try:
            import fiona
            if hasattr(fiona, 'path'):
                logger.info("Fiona path attribute is available, using standard loading")
                use_alternative = False
            else:
                logger.info("Fiona path attribute not available, will use alternative loading")
                use_alternative = True
        except ImportError:
            logger.info("Fiona import error, will use alternative loading")
            use_alternative = True
            
        # Always force regeneration and detailed boundaries in production
        override_cached = True
        force_detailed = True
        logger.info(f"Forcing regeneration with detailed boundaries for {decoded_area_name}")
        
        # Generate the map content with special handling for known problem cases
        map_html = generate_statistical_area_map(
            decoded_area_name, 
            force_detailed=True, 
            use_cached=False,
            zoom=zoom_level,
            exact_boundary=exact_boundary,
            use_alternative_loading=use_alternative,
            display_pgs=display_pgs,
            display_hhahs=display_hhahs
        )
        
        if not map_html:
            logger.error(f"Empty map HTML generated for {decoded_area_name}")
            return jsonify({
                "success": False,
                "message": "Failed to generate map content",
                "area": decoded_area_name
            }), 500
            
        logger.info(f"Generated map HTML for {decoded_area_name} (length: {len(map_html) if map_html else 0})")
        
        # Create the response with appropriate headers
        response = app.response_class(
            response=map_html,
            status=200,
            mimetype='text/html'
        )
        
        # Add headers to allow iframe embedding
        response.headers['X-Frame-Options'] = 'ALLOWALL'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        
        # Add CORS headers for good measure
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        
        # Add cache control headers
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        logger.info(f"Returning response for {area_name} with headers: {dict(response.headers)}")
        return response
    except Exception as e:
        logger.error(f"Error generating statistical area map for {area_name}: {str(e)}")
        logger.exception("Detailed error:")
        return jsonify({
            "success": False,
            "message": str(e),
            "area": area_name
        }), 500

@app.route('/api/map-test', methods=['GET', 'OPTIONS'])
def get_map_test():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.response_class(
            response='',
            status=200
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
        
    try:
        # Check if the main.html file exists
        if not os.path.exists('main.html'):
            error_response = jsonify({
                "success": False,
                "message": "Map test page not found"
            })
            # Add CORS headers to error response
            error_response.headers['Access-Control-Allow-Origin'] = '*'
            return error_response, 404
        
        response = send_file('main.html', mimetype='text/html')
        # Add headers to allow iframe embedding and CORS
        response.headers['X-Frame-Options'] = 'ALLOWALL'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Cache-Control, X-Requested-With, Pragma, Expires'
        return response
    except Exception as e:
        logger.error(f"Error serving map test page: {str(e)}")
        error_response = jsonify({
            "success": False,
            "message": str(e)
        })
        # Add CORS headers to error response
        error_response.headers['Access-Control-Allow-Origin'] = '*'
        return error_response, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
