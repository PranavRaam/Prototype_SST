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
CORS(app)  # Enable CORS for all routes

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
        return send_file(MAP_FILE)
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

@app.route('/api/statistical-area-map/<area_name>', methods=['GET'])
def get_statistical_area_map(area_name):
    try:
        # Decode the URL-encoded area name
        decoded_area_name = urllib.parse.unquote(area_name)
        logger.info(f"Requested statistical area map for: {decoded_area_name}")
        
        # Force regeneration for testing by deleting any existing file
        cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
        cache_file = os.path.join(cache_dir, f"statistical_area_{decoded_area_name.replace(' ', '_').replace(',', '').replace('-', '_')}.html")
        
        # Uncomment to force regeneration for debugging
        # if os.path.exists(cache_file):
        #     os.remove(cache_file)
        #     logger.info(f"Deleted existing cache file: {cache_file}")
        
        # Generate or retrieve the map for this statistical area
        map_file = generate_statistical_area_map(decoded_area_name)
        
        # Serve the generated HTML file
        logger.info(f"Serving statistical area map from {map_file}")
        return send_file(map_file)
    except Exception as e:
        logger.error(f"Error generating statistical area map for {area_name}: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "message": f"Error generating map for {area_name}: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
