from flask import Flask, jsonify, send_file, request, Response
from flask_cors import CORS
import os
import main
import threading
import time
import urllib.parse
import logging
from statistical_area_zoom import generate_statistical_area_map
import re

app = Flask(__name__)
# Enable CORS with specific options for production
CORS(app, 
    resources={r"/api/*": {
        "origins": ["https://sst-frontend-swart.vercel.app", "http://localhost:3000"],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization", "Cache-Control", "X-Requested-With"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "expose_headers": ["Content-Type", "Content-Length", "Content-Disposition", "X-Frame-Options"],
        "max_age": 86400  # Cache preflight requests for 24 hours
    }},
    send_wildcard=True  # This helps with some CORS implementations
)

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

# Custom middleware to handle CORS for HTML responses
@app.after_request
def add_cors_headers(response):
    # Add CORS headers to all responses
    origin = request.headers.get('Origin')
    
    # Allow specific origins only (no wildcard when using credentials)
    if origin in ['https://sst-frontend-swart.vercel.app', 'http://localhost:3000']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours in seconds
    
    # For iframe embedding
    if response.mimetype == 'text/html':
        response.headers['X-Frame-Options'] = 'ALLOW-FROM *'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
    
    return response

# Specific route for handling preflight CORS OPTIONS requests
@app.route('/api/statistical-area-map/<area_name>', methods=['OPTIONS'])
def options_statistical_area_map(area_name):
    response = Response()
    origin = request.headers.get('Origin')
    
    # Allow specific origins only (no wildcard when using credentials)
    if origin in ['https://sst-frontend-swart.vercel.app', 'http://localhost:3000']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'  # 24 hours
    return response

@app.route('/api/generate-map', methods=['GET'])
def generate_map():
    global map_generation_in_progress
    
    # Check if map already exists
    if os.path.exists(MAP_FILE):
        logger.info(f"Map already exists at {MAP_FILE}")
        return jsonify({
            "success": True,
            "mapPath": "/api/map",
            "message": "Map already exists"
        })
    
    # Start map generation in background thread if not already in progress
    if not map_generation_in_progress:
        with map_generation_lock:
            map_generation_in_progress = True
        
        def generate_map_task():
            global map_generation_in_progress
            try:
                # Generate the map using the main.py functions
                start_time = time.time()
                logger.info("Starting map generation")
                main.main()
                elapsed_time = time.time() - start_time
                logger.info(f"Map generation completed in {elapsed_time:.2f} seconds")
            except Exception as e:
                logger.error(f"Error during map generation: {e}")
            finally:
                with map_generation_lock:
                    map_generation_in_progress = False
        
        thread = threading.Thread(target=generate_map_task)
        thread.daemon = True
        thread.start()
        logger.info("Map generation thread started")
    
    return jsonify({
        "success": True,
        "mapPath": "/api/map",
        "status": "Map generation started in background",
        "generationInProgress": True
    })

@app.route('/api/map-status', methods=['GET'])
def map_status():
    return jsonify({
        "exists": os.path.exists(MAP_FILE),
        "generationInProgress": map_generation_in_progress
    })

@app.route('/api/map', methods=['GET'])
def get_map():
    # Serve the generated HTML file
    if os.path.exists(MAP_FILE):
        logger.info(f"Serving map file from {MAP_FILE}")
        
        # Read the HTML file
        with open(MAP_FILE, 'r') as f:
            html_content = f.read()
            
        # Remove control elements completely instead of hiding them with CSS
        
        # Remove control layer HTML elements 
        html_content = re.sub(r'<div class="leaflet-control-layers[^>]*>.*?</div>', '', html_content, flags=re.DOTALL)
        
        # Remove top-right control elements
        html_content = re.sub(r'<div class="leaflet-top leaflet-right[^>]*>.*?</div>', '', html_content, flags=re.DOTALL)
        
        # Remove legend elements
        html_content = re.sub(r'<div class="info legend[^>]*>.*?</div>', '', html_content, flags=re.DOTALL)
        
        # Add script to notify parent when map is loaded and fix cross-origin issues
        notification_script = """
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Fix for cross-origin security issues
            try {
                // Safe way to get leaflet maps without accessing window properties directly
                setTimeout(function() {
                    var maps = document.querySelectorAll('.leaflet-container');
                    if (maps.length > 0) {
                        console.log('Map optimization complete');
                        
                        // Fix map display issues that might occur in iframes
                        maps.forEach(function(mapContainer) {
                            // Force a resize event on the map container
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false, window, 0);
                            window.dispatchEvent(evt);
                        });
                    }
                    
                    // Notify parent safely using postMessage
                    try {
                        if (window.parent && window.parent !== window) {
                            window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
                        }
                    } catch (e) {
                        console.log('Postmessage not available, continuing silently');
                    }
                }, 1000);
            } catch (e) {
                console.log('Map frame initialization complete');
            }
        });
        </script>
        """
        
        # Add the notification script just before the closing body tag
        html_content = html_content.replace('</body>', notification_script + '</body>')
        
        # Set the appropriate headers for cross-origin iframe embedding
        response = Response(html_content, mimetype='text/html')
        
        # Set specific CORS headers
        origin = request.headers.get('Origin')
        if origin in ['https://sst-frontend-swart.vercel.app', 'http://localhost:3000']:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'

        response.headers['X-Frame-Options'] = 'ALLOW-FROM *'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        return response
    else:
        logger.warning("Map file not found")
        return jsonify({
            "success": False,
            "message": "Map not yet generated. Call /api/generate-map first."
        }), 404

@app.route('/api/regions', methods=['GET'])
def get_regions():
    # Fetch region data
    _, _, _, regions = main.define_regions()
    
    # Convert region data to a format suitable for frontend
    region_data = {
        region: {
            "states": data["states"],
            "color": data["color"]
        } for region, data in regions.items()
    }
    
    return jsonify(region_data)

@app.route('/api/static-fallback-map/<area_name>', methods=['GET'])
def get_static_fallback_map(area_name):
    """Provide a simple HTML static map as fallback for areas with CORS/loading issues"""
    try:
        # Decode the URL-encoded area name
        decoded_area_name = urllib.parse.unquote(area_name)
        logger.info(f"Serving static fallback map for: {decoded_area_name}")
        
        # Create a very simple static HTML with minimal dependencies
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Map of {decoded_area_name}</title>
            <style>
                body {{ margin: 0; padding: 0; font-family: Arial, sans-serif; }}
                .map-container {{ 
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100vh;
                    background-color: #f5f5f5;
                    text-align: center;
                }}
                .area-info {{
                    background-color: white;
                    border-radius: 8px;
                    border: 2px solid #4F46E5;
                    padding: 20px;
                    max-width: 80%;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }}
                h2 {{ color: #1F2937; margin-top: 0; }}
                p {{ color: #4B5563; }}
            </style>
        </head>
        <body>
            <div class="map-container">
                <div class="area-info">
                    <h2>Map of {decoded_area_name}</h2>
                    <p>This is a simplified view of the {decoded_area_name} area.</p>
                    <p>This static map is shown when the interactive map cannot be loaded.</p>
                    <script>
                        // Notify parent that the map is loaded
                        document.addEventListener('DOMContentLoaded', function() {{
                            try {{
                                setTimeout(function() {{
                                    if (window.parent && window.parent !== window) {{
                                        window.parent.postMessage({{type: 'mapLoaded', status: 'success'}}, '*');
                                    }}
                                }}, 500);
                            }} catch(e) {{
                                console.error('Error sending message to parent:', e);
                            }}
                        }});
                    </script>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Return the HTML content with appropriate headers
        response = Response(html_content, mimetype='text/html')
        
        # Set CORS headers for this response
        origin = request.headers.get('Origin')
        if origin in ['https://sst-frontend-swart.vercel.app', 'http://localhost:3000']:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            
        response.headers['X-Frame-Options'] = 'ALLOW-FROM *'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
        response.headers['Cache-Control'] = 'max-age=86400'  # Cache for 24h
        
        return response
    except Exception as e:
        logger.error(f"Error generating static fallback map: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "message": f"Error generating static fallback map: {str(e)}"
        }), 500

@app.route('/api/statistical-area-map/<area_name>', methods=['GET'])
def get_statistical_area_map(area_name):
    try:
        # Prevent timeout by increasing gunicorn worker timeout
        from werkzeug.serving import is_running_from_reloader
        if not is_running_from_reloader():
            import signal
            
            # Register no-op handler for SIGALRM to prevent worker timeout
            def timeout_handler(signum, frame):
                print("Processing taking longer than expected, continuing...")
            
            # Set a 5-minute alarm
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(300)  # 5 minutes
        
        # Decode the URL-encoded area name
        decoded_area_name = urllib.parse.unquote(area_name)
        logger.info(f"Requested statistical area map for: {decoded_area_name}")
        
        # Parse URL parameters with defaults for detailed maps
        force_regen = request.args.get('force_regen', 'false').lower() == 'true'
        use_cached = request.args.get('use_cached', 'true').lower() == 'true'
        detailed = request.args.get('detailed', 'true').lower() == 'true'
        lightweight = request.args.get('lightweight', 'false').lower() == 'true'
        
        # Parse zoom level (default to 11 for better detail)
        try:
            zoom = int(request.args.get('zoom', '11'))
        except ValueError:
            zoom = 11
            
        # Parse boundary options
        exact_boundary = request.args.get('exact_boundary', 'true').lower() == 'true'
        
        logger.info(f"Map options: force_regen={force_regen}, use_cached={use_cached}, " 
                    f"detailed={detailed}, lightweight={lightweight}, zoom={zoom}, "
                    f"exact_boundary={exact_boundary}")
        
        # Generate or retrieve the map for this statistical area with the specified options
        map_file = generate_statistical_area_map(
            decoded_area_name,
            zoom=zoom,
            exact_boundary=exact_boundary,
            detailed=detailed,
            use_cached=use_cached,
            force_regen=force_regen,
            lightweight=lightweight
        )
        
        # Cancel the alarm if we got here
        if not is_running_from_reloader():
            signal.alarm(0)
            
        # Verify map file exists
        if not os.path.exists(map_file):
            logger.error(f"Generated map file does not exist: {map_file}")
            return jsonify({
                "success": False,
                "message": f"Error: Generated map file not found for {decoded_area_name}"
            }), 500
        
        # Read the HTML file
        with open(map_file, 'r') as f:
            html_content = f.read()
        
        # Add cross-origin safe script to fix security errors and ensure map loads properly
        # but preserve all FontAwesome and icon-related content
        cross_origin_script = """
        <script>
        // Fix for cross-origin security issues
        document.addEventListener('DOMContentLoaded', function() {
            try {
                // Ensure all FontAwesome icons are loaded correctly
                document.querySelectorAll('i.fa, i.fas, i.far, i.fab').forEach(function(icon) {
                    if (window.getComputedStyle(icon).fontFamily.indexOf('Font Awesome') < 0) {
                        console.log('Fixing FontAwesome icon:', icon);
                        // Force reload of icon font
                        icon.style.fontFamily = 'FontAwesome';
                    }
                });
                
                // Fix GeoJSON boundaries
                var geoJsonLayers = document.querySelectorAll('.leaflet-overlay-pane path');
                if (geoJsonLayers.length > 0) {
                    console.log('Found GeoJSON layers:', geoJsonLayers.length);
                    geoJsonLayers.forEach(function(path) {
                        // Ensure paths are visible with correct styling
                        if (path.getAttribute('stroke') === '#312E81') {
                            // This is our MSA boundary - ensure it's visible and styled correctly
                            path.setAttribute('stroke-opacity', '0.9');
                            path.setAttribute('fill-opacity', '0.2');
                            path.setAttribute('stroke-width', '3');
                        }
                    });
                } else {
                    console.log('No GeoJSON layers found');
                }
                
                // Safe way to get leaflet maps without accessing window properties directly
                setTimeout(function() {
                    var maps = document.querySelectorAll('.leaflet-container');
                    if (maps.length > 0) {
                        console.log('Map optimization complete');
                        
                        // Force a resize to ensure all elements render properly
                        try {
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false, window, 0);
                            window.dispatchEvent(evt);
                        } catch (e) {
                            console.log('Resize event failed, continuing');
                        }
                    }
                    
                    // Notify parent safely using postMessage
                    try {
                        if (window.parent && window.parent !== window) {
                            window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
                        }
                    } catch (e) {
                        console.log('Postmessage not available, continuing silently');
                    }
                }, 1000); // Give FontAwesome time to load
            } catch (e) {
                console.log('Map frame initialization complete');
            }
        });
        </script>
        """
        
        # Insert the script just before the closing body tag if not already present
        if "</script>\n</body>" not in html_content:
            html_content = html_content.replace('</body>', cross_origin_script + '</body>')
        
        # Return the modified HTML content with proper content type and CORS headers
        logger.info(f"Serving modified statistical area map from {map_file}")
        response = Response(html_content, mimetype='text/html')
        
        # Special headers to ensure proper font loading and geojson rendering
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cache-Control, X-Requested-With'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Type, Content-Length, Content-Disposition, X-Frame-Options'
        
        # Set specific CORS headers for this response
        origin = request.headers.get('Origin')
        if origin in ['https://sst-frontend-swart.vercel.app', 'http://localhost:3000']:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            
        response.headers['X-Frame-Options'] = 'ALLOW-FROM *'
        # Update CSP to allow geojson rendering and all needed resources
        response.headers['Content-Security-Policy'] = "frame-ancestors *; font-src * data:; style-src * 'unsafe-inline'; img-src * data:; connect-src *; script-src * 'unsafe-inline'"
        response.headers['Cache-Control'] = 'max-age=86400' if use_cached else 'no-cache'  # Cache for 24h if using cache
        return response
    except Exception as e:
        logger.error(f"Error generating statistical area map for {area_name}: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "message": f"Error generating map for {area_name}: {str(e)}"
        }), 500

@app.route('/api/clear-cache', methods=['GET'])
def clear_cache():
    """Clear the cache directory to force regeneration of maps with improved boundaries and icons"""
    try:
        # Get the cache directory
        cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
        
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
            logger.info(f"Created cache directory: {cache_dir}")
            return jsonify({
                "success": True,
                "message": "Cache directory created, no files to remove."
            })
            
        # Count files before deletion
        files_before = len([f for f in os.listdir(cache_dir) if os.path.isfile(os.path.join(cache_dir, f))])
        
        # Delete all HTML files in the cache directory
        deleted_files = []
        for filename in os.listdir(cache_dir):
            if filename.endswith(".html"):
                file_path = os.path.join(cache_dir, filename)
                try:
                    os.remove(file_path)
                    deleted_files.append(filename)
                    logger.info(f"Deleted cached map: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting file {file_path}: {e}")
        
        # Count files after deletion
        files_after = len([f for f in os.listdir(cache_dir) if os.path.isfile(os.path.join(cache_dir, f))])
        
        # Create a placeholder file indicating when cache was last cleared
        with open(os.path.join(cache_dir, "cache_cleared.txt"), "w") as f:
            f.write(f"Cache cleared at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Maps will be regenerated with improved boundaries and icons\n")
            f.write(f"Files deleted: {', '.join(deleted_files)}\n")
        
        return jsonify({
            "success": True,
            "message": f"Cache cleared. Removed {files_before - files_after} files.",
            "filesRemoved": files_before - files_after,
            "deletedFiles": deleted_files
        })
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return jsonify({
            "success": False,
            "message": f"Error clearing cache: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """A simple health check endpoint to test CORS and server status"""
    if request.method == 'OPTIONS':
        response = Response()
    else:
        response = jsonify({
            "status": "healthy",
            "message": "Backend server is operational",
            "timestamp": time.time(),
            "cors_enabled": True,
            "cache_dir_exists": os.path.exists(CACHE_DIR),
            "cached_maps": len([f for f in os.listdir(CACHE_DIR) if f.endswith('.html')]) if os.path.exists(CACHE_DIR) else 0
        })
    
    # Set CORS headers
    origin = request.headers.get('Origin')
    if origin in ['https://sst-frontend-swart.vercel.app', 'http://localhost:3000']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Max-Age'] = '86400'
    
    return response

@app.route('/', methods=['GET'])
def root():
    """Root endpoint showing server status and providing links to API endpoints"""
    return f"""
    <html>
    <head>
        <title>SST Backend API</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #4F46E5; }}
            h2 {{ color: #4F46E5; margin-top: 20px; }}
            a {{ color: #4F46E5; text-decoration: none; }}
            a:hover {{ text-decoration: underline; }}
            .button {{ display: inline-block; background: #4F46E5; color: white; padding: 10px 15px; border-radius: 4px; margin: 10px 0; }}
            .button:hover {{ background: #312E81; }}
            code {{ background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }}
            .endpoints {{ margin-top: 20px; }}
            .endpoint {{ margin-bottom: 15px; }}
            .timestamp {{ color: #666; font-size: 0.9em; }}
        </style>
    </head>
    <body>
        <h1>SST Backend API</h1>
        <p>Server is running. Current time: <span class="timestamp">{time.strftime('%Y-%m-%d %H:%M:%S')}</span></p>
        
        <div class="actions">
            <h2>Actions</h2>
            <a href="/api/health" class="button">Server Health Check</a>
            <a href="/api/clear-cache" class="button">Clear Map Cache</a>
        </div>
        
        <div class="endpoints">
            <h2>Available Endpoints</h2>
            
            <div class="endpoint">
                <strong>GET /api/health</strong>
                <p>Check server health status</p>
            </div>
            
            <div class="endpoint">
                <strong>GET /api/clear-cache</strong>
                <p>Clear cached maps to force regeneration with latest improvements</p>
            </div>
            
            <div class="endpoint">
                <strong>GET /api/statistical-area-map/:area_name</strong>
                <p>Get an interactive map for a specific statistical area</p>
                <p>Example: <a href="/api/statistical-area-map/Prescott, AZ">/api/statistical-area-map/Prescott, AZ</a></p>
            </div>
            
            <div class="endpoint">
                <strong>GET /api/map</strong>
                <p>Get the national regions map</p>
            </div>
            
            <div class="endpoint">
                <strong>GET /api/regions</strong>
                <p>Get region definitions</p>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
