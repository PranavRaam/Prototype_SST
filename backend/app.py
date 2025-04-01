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
    
    # Check if map already exists
    if os.path.exists(MAP_FILE):
        logger.info(f"Map already exists at {MAP_FILE}")
        response = jsonify({
            "success": True,
            "mapPath": "/api/map",
            "message": "Map already exists"
        })
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    
    # Start map generation in background thread if not already in progress
    if not map_generation_in_progress:
        with map_generation_lock:
            map_generation_in_progress = True
        
        def generate_map_task():
            global map_data
            try:
                logger.info("Starting map generation...")
                map_data = main.generate_map()
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
        
        response = send_file(MAP_FILE, mimetype='text/html')
        # Add headers to allow iframe embedding and CORS
        response.headers['X-Frame-Options'] = 'ALLOWALL'
        response.headers['Content-Security-Policy'] = "frame-ancestors *"
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
        logger.info(f"Request params: cache_buster={cache_buster}, random={random_param}, force_detailed={force_detailed}, exact_boundary={exact_boundary}, zoom={zoom_level}")
        
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
            exact_boundary=exact_boundary
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
