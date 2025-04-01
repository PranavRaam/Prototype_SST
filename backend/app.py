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
        
        return jsonify({
            "success": True,
            "message": "Map generation started"
        })
    
    return jsonify({
        "success": False,
        "message": "Map generation already in progress"
    })

@app.route('/api/map-status', methods=['GET'])
def map_status():
    return jsonify({
        "success": True,
        "mapExists": os.path.exists(MAP_FILE),
        "generationInProgress": map_generation_in_progress
    })

@app.route('/api/map', methods=['GET'])
def get_map():
    if not os.path.exists(MAP_FILE):
        return jsonify({
            "success": False,
            "message": "Map not found"
        }), 404
    
    return send_file(MAP_FILE, mimetype='text/html')

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

@app.route('/api/statistical-area-map', methods=['GET'])
def get_statistical_area_map():
    try:
        # Get parameters from query string
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))
        zoom = float(request.args.get('zoom', 10))
        
        # Generate the map
        map_html = generate_statistical_area_map(lat, lon, zoom)
        
        # Return the map HTML
        return map_html
    except Exception as e:
        logger.error(f"Error generating statistical area map: {str(e)}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
