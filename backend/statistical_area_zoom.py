import folium
import geopandas as gpd
import numpy as np
import os
import tempfile
import random
from branca.element import Figure, MacroElement
from jinja2 import Template
import main  # Import the main module to reuse existing functions
import logging
import traceback
from folium import plugins
from folium.plugins import MousePosition, Draw, Fullscreen, MiniMap, Search
from branca.element import Figure, JavascriptLink, CssLink
from shapely.geometry import shape, Point
from functools import lru_cache
from difflib import get_close_matches
from geopy.geocoders import Nominatim
import time
import re

# Create a subclass of MacroElement to add legend to map
class LegendControl(MacroElement):
    def __init__(self, title, color_dict, position='bottomright'):
        super(LegendControl, self).__init__()
        self._name = 'LegendControl'
        self.title = title
        self.color_dict = color_dict
        self.position = position
        
        self.template = Template("""
            {% macro script(this, kwargs) %}
            var legend = L.control({position: "{{this.position}}"});
            legend.onAdd = function (map) {
                var div = L.DomUtil.create("div", "legend");
                div.innerHTML = `
                    <div style="background-color: white; padding: 10px; border-radius: 5px; border: 2px solid gray;">
                        <div style="text-align: center; margin-bottom: 5px; font-weight: bold;">{{this.title}}</div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            {% for name, color in this.color_dict.items() %}
                                <div style="display: flex; align-items: center;">
                                    <span style="background: {{color}}; width: 20px; height: 15px; display: inline-block;"></span>
                                    <span style="margin-left: 5px; font-size: 12px;">{{name}}</span>
                                </div>
                            {% endfor %}
                        </div>
                    </div>
                `;
                return div;
            };
            legend.addTo({{this._parent.get_name()}});
            {% endmacro %}
        """)

def create_fallback_map(area_name, output_path=None):
    """Create a fallback map for a specific area"""
    logger = logging.getLogger(__name__)
    logger.info(f"Creating fallback map for {area_name}")
    
    # First attempt to geocode the area to get coordinates
    geolocator = Nominatim(user_agent="stat_area_mapper")
    
    # Try to get the approximate coordinates for the area
    logger.info(f"Geocoding area: {area_name}")
    
    try:
        # Add 'USA' to improve geocoding accuracy
        search_term = f"{area_name}, USA" if "USA" not in area_name and "US" not in area_name else area_name
        location = geolocator.geocode(search_term, timeout=10)
        
        # If failed, try again with just the city name (if there's a comma)
        if location is None and ',' in area_name:
            city = area_name.split(',')[0].strip()
            logger.info(f"Retrying with city name only: {city}")
            location = geolocator.geocode(f"{city}, USA", timeout=10)
        
        if location:
            coords = [location.latitude, location.longitude]
            logger.info(f"Found coordinates for {area_name}: {coords}")
        else:
            # Default to US center if geocoding fails
            logger.warning(f"Could not geocode {area_name}, using default US coordinates")
            coords = [39.8283, -98.5795]  # Center of the USA
    except Exception as e:
        logger.error(f"Error geocoding {area_name}: {str(e)}")
        logger.error(traceback.format_exc())
        # Default to US center
        coords = [39.8283, -98.5795]  # Center of the USA
    
    # Create the map
    folium_map = folium.Map(
        location=coords,
        zoom_start=10,
        tiles="CartoDB positron",
        prefer_canvas=True
    )
    
    # Add a larger title with distinctive box
    title_html = f'''
    <div style="position: fixed; 
                top: 10px; left: 50%; transform: translateX(-50%); 
                width: auto; min-width: 300px; height: auto;
                background-color: white; border-radius: 8px;
                border: 2px solid #4F46E5; z-index: 9999; padding: 10px;
                font-family: Arial; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
        <h4 style="margin: 0; color: #1F2937; text-align: center;">Map View of {area_name}</h4>
        <p style="font-size: 12px; margin: 5px 0 0 0; text-align: center;">
            Showing estimated location with sample data.
        </p>
    </div>
    '''
    folium_map.get_root().html.add_child(folium.Element(title_html))
    
    # Add mouse position and fullscreen control
    folium.plugins.MousePosition().add_to(folium_map)
    folium.plugins.Fullscreen().add_to(folium_map)
    
    # Add a circle to represent the general metro area
    circle = folium.Circle(
        location=coords,
        radius=20000,  # 20km radius
        color='#4F46E5',
        fill=True,
        fill_color='#4F46E5',
        fill_opacity=0.2,
        weight=3,
        dash_array='5, 5'
    ).add_to(folium_map)
    
    # Create mock PGs and HHAHs within the circle
    # For fallback map, we'll create a fixed number of PGs and HHAHs
    pg_groups = ["Group A", "Group B", "Group C", "Group D"]
    num_pgs = 5
    num_hhahs = 7
    
    # Create PG feature group
    pg_group = folium.FeatureGroup(name="Physician Groups (PGs)")
    
    # Generate mock PGs
    for i in range(num_pgs):
        # Generate a random angle and distance within the circle radius
        angle = random.uniform(0, 2 * np.pi)
        # Scale distance to ensure points are within the circle
        distance = random.uniform(2000, 18000)  # Between 2km and 18km from center
        
        # Calculate the coordinates (remember folium uses [lat, lng])
        lat = coords[0] + (distance / 111000) * np.cos(angle)  # 111000 meters is roughly 1 degree of latitude
        lng = coords[1] + (distance / (111000 * np.cos(np.radians(coords[0])))) * np.sin(angle)
        
        pg_data = {
            "id": i + 1,
            "name": f"PG-{pg_groups[i % len(pg_groups)]}-{area_name[:3] if area_name else 'LOC'}{i+1}",
            "location": [lat, lng],
            "group": pg_groups[i % len(pg_groups)],
            "physicians": random.randint(3, 15),
            "patients": random.randint(50, 300),
            "status": random.choice(["Active", "Onboarding", "Inactive"]),
            "address": f"{random.randint(100, 999)} Healthcare Ave, {area_name.split(',')[0] if area_name else 'Local'} Area",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        }
        
        # Create popup with PG details
        popup_html = f"""
        <div style="min-width: 180px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #1F2937;">{pg_data['name']}</h4>
            <p style="margin: 4px 0;"><strong>Group:</strong> {pg_data['group']}</p>
            <p style="margin: 4px 0;"><strong>Physicians:</strong> {pg_data['physicians']}</p>
            <p style="margin: 4px 0;"><strong>Patients:</strong> {pg_data['patients']}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> {pg_data['status']}</p>
            <p style="margin: 4px 0;"><strong>Address:</strong> {pg_data['address']}</p>
            <p style="margin: 4px 0;"><strong>Contact:</strong> {pg_data['contact']}</p>
        </div>
        """
        
        # Create marker
        color = "blue"  # Default color
        if pg_data['status'] == "Onboarding":
            color = "orange"
        elif pg_data['status'] == "Inactive":
            color = "gray"
            
        folium.Marker(
            location=pg_data['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"PG: {pg_data['name']}",
            icon=folium.Icon(color=color, icon="user-md", prefix="fa")
        ).add_to(pg_group)
    
    # Add PG group to map
    pg_group.add_to(folium_map)
    
    # Add essential controls
    folium.plugins.Fullscreen().add_to(folium_map)
    folium.plugins.MousePosition().add_to(folium_map)
    folium.LayerControl().add_to(folium_map)
    
    # Create a temporary file if no output path is provided
    if output_path is None:
        fd, temp_path = tempfile.mkstemp(suffix='.html', prefix='fallback_map_', dir=CACHE_DIR)
        os.close(fd)
        output_path = temp_path
    
    # Save map to the output path
    folium_map.save(output_path)
    logger.info(f"Fallback map saved to {output_path}")
    
    # Return the HTML content
    with open(output_path, 'r') as f:
        map_html = f.read()
    
    return map_html

# Cache directory setup
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

# Cache for processed data
@lru_cache(maxsize=1)
def get_processed_data():
    """Cache the processed MSA, county, and state data"""
    logger = logging.getLogger(__name__)
    try:
        logger.info("Loading MSA, county, and state data...")
        msa_data = main.get_msa_data()
        logger.info(f"Loaded MSA data with {len(msa_data)} entries")
        logger.info(f"Sample MSA names: {', '.join(msa_data['NAME'].head().tolist())}")
        
        county_data = main.get_county_data()
        states_data = main.get_states_data()
        county_to_msa = main.get_county_msa_relationships()
        
        # Pre-process and simplify geometries
        logger.info("Pre-processing and simplifying geometries...")
        if 'geometry' not in msa_data.columns:
            logger.error("No geometry column found in MSA data!")
            return None, None, None, {}
            
        msa_data['geometry'] = msa_data.geometry.simplify(0.01)
        county_data['geometry'] = county_data.geometry.simplify(0.01)
        states_data['geometry'] = states_data.geometry.simplify(0.01)
        
        return msa_data, county_data, states_data, county_to_msa
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        logger.error(traceback.format_exc())
        return None, None, None, {}

def generate_mock_pgs_hhahs(area_name, target_area_geometry):
    """Generate mock PGs and HHAHs for the given statistical area"""
    logger = logging.getLogger(__name__)
    logger.info(f"Generating mock PGs and HHAHs for {area_name}")
    
    # Get the bounds of the area geometry
    minx, miny, maxx, maxy = target_area_geometry.bounds
    
    # PG Groups to be used in mock data
    pg_groups = ["Group A", "Group B", "Group C", "Group D"]
    
    # Mock PGs data
    num_pgs = random.randint(3, 8)  # Random number of PGs
    pgs_data = []
    
    for i in range(num_pgs):
        # Generate random point within the area bounds
        while True:
            # Add some random variation to ensure points are within the area
            lng = random.uniform(minx + (maxx - minx) * 0.1, maxx - (maxx - minx) * 0.1)
            lat = random.uniform(miny + (maxy - miny) * 0.1, maxy - (maxy - miny) * 0.1)
            point = Point(lng, lat)
            
            # Only use points that are within the geometry
            if target_area_geometry.contains(point):
                break
        
        pg_data = {
            "id": i + 1,
            "name": f"PG-{pg_groups[i % len(pg_groups)]}-{area_name[:3]}{i+1}",
            "location": [lat, lng],  # Folium uses [lat, lng] format
            "group": pg_groups[i % len(pg_groups)],
            "physicians": random.randint(3, 15),
            "patients": random.randint(50, 300),
            "status": random.choice(["Active", "Onboarding", "Inactive"]),
            "address": f"{random.randint(100, 999)} Healthcare Ave, {area_name.split(',')[0]}",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        }
        pgs_data.append(pg_data)
    
    # Mock HHAHs data
    num_hhahs = random.randint(4, 10)  # Random number of HHAHs
    hhahs_data = []
    
    hhah_name_prefixes = ["HomeHealth", "CaringHands", "ComfortCare", "Elite", "Premier", "Wellness", "Guardian"]
    hhah_name_suffixes = ["Services", "Agency", "Associates", "Partners", "Network", "Group", "Care"]
    
    for i in range(num_hhahs):
        # Generate random point within the area bounds
        while True:
            lng = random.uniform(minx + (maxx - minx) * 0.1, maxx - (maxx - minx) * 0.1)
            lat = random.uniform(miny + (maxy - miny) * 0.1, maxy - (maxy - miny) * 0.1)
            point = Point(lng, lat)
            
            # Only use points that are within the geometry
            if target_area_geometry.contains(point):
                break
        
        prefix = random.choice(hhah_name_prefixes)
        suffix = random.choice(hhah_name_suffixes)
        
        hhah_data = {
            "id": i + 1,
            "name": f"{prefix} {suffix}",
            "location": [lat, lng],  # Folium uses [lat, lng] format
            "services": random.randint(2, 8),
            "patients": random.randint(20, 150),
            "status": random.choice(["Active", "Onboarding", "Inactive"]),
            "address": f"{random.randint(100, 999)} Medical Blvd, {area_name.split(',')[0]}",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        }
        hhahs_data.append(hhah_data)
    
    logger.info(f"Generated {len(pgs_data)} mock PGs and {len(hhahs_data)} mock HHAHs")
    return pgs_data, hhahs_data

def add_pgs_hhahs_to_map(m, pgs_data, hhahs_data):
    """Add PGs and HHAHs markers to the map"""
    logger = logging.getLogger(__name__)
    
    # Create a feature group for PGs
    pg_group = folium.FeatureGroup(name="Physician Groups (PGs)")
    
    # Add PG markers
    for pg in pgs_data:
        # Create popup with PG details
        popup_html = f"""
        <div style="min-width: 180px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #1F2937;">{pg['name']}</h4>
            <p style="margin: 4px 0;"><strong>Group:</strong> {pg['group']}</p>
            <p style="margin: 4px 0;"><strong>Physicians:</strong> {pg['physicians']}</p>
            <p style="margin: 4px 0;"><strong>Patients:</strong> {pg['patients']}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> {pg['status']}</p>
            <p style="margin: 4px 0;"><strong>Address:</strong> {pg['address']}</p>
            <p style="margin: 4px 0;"><strong>Contact:</strong> {pg['contact']}</p>
        </div>
        """
        
        # Create marker
        color = "blue"  # Default color
        if pg['status'] == "Onboarding":
            color = "orange"
        elif pg['status'] == "Inactive":
            color = "gray"
            
        folium.Marker(
            location=pg['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"PG: {pg['name']}",
            icon=folium.Icon(color=color, icon="user-md", prefix="fa")
        ).add_to(pg_group)
    
    # Add the PG group to the map
    pg_group.add_to(m)
    
    # Create a feature group for HHAHs
    hhah_group = folium.FeatureGroup(name="Home Health At Home (HHAHs)")
    
    # Add HHAH markers
    for hhah in hhahs_data:
        # Create popup with HHAH details
        popup_html = f"""
        <div style="min-width: 180px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #1F2937;">{hhah['name']}</h4>
            <p style="margin: 4px 0;"><strong>Services:</strong> {hhah['services']}</p>
            <p style="margin: 4px 0;"><strong>Patients:</strong> {hhah['patients']}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> {hhah['status']}</p>
            <p style="margin: 4px 0;"><strong>Address:</strong> {hhah['address']}</p>
            <p style="margin: 4px 0;"><strong>Contact:</strong> {hhah['contact']}</p>
        </div>
        """
        
        # Create marker
        color = "green"  # Default color
        if hhah['status'] == "Onboarding":
            color = "orange"
        elif hhah['status'] == "Inactive":
            color = "gray"
            
        folium.Marker(
            location=hhah['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"HHAH: {hhah['name']}",
            icon=folium.Icon(color=color, icon="home", prefix="fa")
        ).add_to(hhah_group)
    
    # Add the HHAH group to the map
    hhah_group.add_to(m)
    logger.info("Added PGs and HHAHs to map")
    
    # Add legend for PGs and HHAHs
    legend_colors = {
        "PG - Active": "blue",
        "PG - Onboarding": "orange",
        "PG - Inactive": "gray",
        "HHAH - Active": "green",
        "HHAH - Onboarding": "orange",
        "HHAH - Inactive": "gray"
    }
    
    legend = LegendControl(
        title="Map Legend",
        color_dict=legend_colors,
        position="bottomright"
    )
    m.add_child(legend)

# Special function to directly handle cities that might not be in standard MSAs
def handle_special_cities(area_name):
    """Handle special cases for cities that might not be proper MSAs"""
    logger = logging.getLogger(__name__)
    logger.info(f"Checking if {area_name} is a special case")
    
    # Define patterns to match certain cities
    flagstaff_pattern = re.compile(r'flagstaff', re.IGNORECASE)
    fairbanks_pattern = re.compile(r'fairbanks', re.IGNORECASE)
    # Add more patterns as needed
    
    # Check for Fairbanks, AK
    if fairbanks_pattern.search(area_name):
        logger.info(f"Matched special case: Fairbanks")
        try:
            # Create a custom GeoDataFrame with Fairbanks MSA definition
            import geopandas as gpd
            from shapely.geometry import Point
            import pandas as pd
            
            # Create a basic area around Fairbanks coordinates
            fairbanks_coords = [64.8378, -147.7164]  # Fairbanks, AK coordinates
            fairbanks_point = Point(fairbanks_coords[1], fairbanks_coords[0])
            
            # Use a buffer to create a circular area
            buffer_degrees = 0.3  # Create a slightly larger buffer for Fairbanks
            fairbanks_geometry = fairbanks_point.buffer(buffer_degrees)
            
            # Create a simple GeoDataFrame
            fairbanks_gdf = gpd.GeoDataFrame(
                {
                    'NAME': ['Fairbanks, AK Metro Area'],
                    'CBSAFP': ['99998'],  # Placeholder ID
                    'normalized_name': ['fairbanks, ak metro area'],
                    'geometry': [fairbanks_geometry]
                }, 
                crs="EPSG:4326"
            )
            
            logger.info(f"Created custom definition for Fairbanks, AK")
            return fairbanks_gdf.iloc[0]
        except Exception as e:
            logger.error(f"Error creating custom definition for Fairbanks: {str(e)}")
            logger.error(traceback.format_exc())
            return None
    
    # Check for Flagstaff, AZ
    if flagstaff_pattern.search(area_name):
        logger.info(f"Matched special case: Flagstaff")
        try:
            # Create a custom GeoDataFrame with Flagstaff MSA definition
            import geopandas as gpd
            from shapely.geometry import Point
            import pandas as pd
            
            # Create a basic circular area around Flagstaff coordinates
            flagstaff_coords = [35.1983, -111.6513]  # Flagstaff, AZ coordinates
            flagstaff_point = Point(flagstaff_coords[1], flagstaff_coords[0])
            
            # Use a buffer to create a circular area (about 25km radius)
            # Note: this is not a proper MSA boundary but a simplified representation
            buffer_degrees = 0.25  # Roughly 25km at this latitude
            flagstaff_geometry = flagstaff_point.buffer(buffer_degrees)
            
            # Create a simple GeoDataFrame
            flagstaff_gdf = gpd.GeoDataFrame(
                {
                    'NAME': ['Flagstaff, AZ Metro Area'],
                    'CBSAFP': ['99999'],  # Placeholder ID
                    'normalized_name': ['flagstaff, az metro area'],
                    'geometry': [flagstaff_geometry]
                }, 
                crs="EPSG:4326"
            )
            
            logger.info(f"Created custom definition for Flagstaff, AZ")
            
            return flagstaff_gdf.iloc[0]
        except Exception as e:
            logger.error(f"Error creating custom definition for Flagstaff: {str(e)}")
            logger.error(traceback.format_exc())
            return None
            
    # No special case matched
    return None

def generate_statistical_area_map(area_name=None, lat=None, lon=None, zoom=10, force_detailed=False, use_cached=True):
    """
    Generate a map zoomed in on a specific statistical area (MSA) or coordinates
    
    Can be called with either:
    - area_name: Name of the statistical area (MSA)
    - lat, lon, zoom: Coordinates and zoom level
    
    Parameters:
    - force_detailed: If True, will try harder to generate a detailed map with boundaries
    - use_cached: If False, will regenerate the map even if cached
    """
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Force detailed boundary for specific city names
    force_special_handling = False
    special_cities = ['fairbanks', 'flagstaff', 'sedona', 'prescott']
    if area_name and any(city in area_name.lower() for city in special_cities):
        logger.info(f"Forcing special handling for {area_name} as it's in the special cities list")
        force_special_handling = True
        use_cached = False  # Don't use cached for special cities
    
    # If coordinates are provided and area_name is not, generate map by coordinates
    if area_name is None and lat is not None and lon is not None:
        logger.info(f"Generating map for coordinates: lat={lat}, lon={lon}, zoom={zoom}")
        try:
            # Create a map centered on the specified coordinates
            m = folium.Map(
                location=[lat, lon],
                zoom_start=zoom,
                tiles='cartodbpositron',
                prefer_canvas=True
            )
            
            # Add a marker at the specified location
            folium.Marker(
                [lat, lon],
                popup="Selected Location",
                icon=folium.Icon(color='blue')
            ).add_to(m)
            
            # Add essential controls
            folium.plugins.Fullscreen().add_to(m)
            folium.plugins.MousePosition().add_to(m)
            
            # Create temporary file for the map
            fd, temp_path = tempfile.mkstemp(suffix='.html', prefix='coord_map_', dir=CACHE_DIR)
            os.close(fd)
            
            # Save map to the temporary file
            m.save(temp_path)
            
            # Read the content of the file
            with open(temp_path, 'r') as f:
                map_html = f.read()
                
            return map_html
            
        except Exception as e:
            logger.error(f"Error generating map by coordinates: {str(e)}")
            logger.error(traceback.format_exc())
            # Create a fallback map
            return create_fallback_map("Custom Location", None)
    
    # If area_name is provided, generate map by area name
    if area_name:
        logger.info(f"Generating map for statistical area: {area_name}")
        
        # Generate cache filename
        sanitized_name = area_name.replace(' ', '_').replace(',', '').replace('-', '_')
        cache_file = os.path.join(CACHE_DIR, f"statistical_area_{sanitized_name}.html")
        
        # For special cities, use a different cache file to avoid conflicts
        if force_special_handling:
            cache_file = os.path.join(CACHE_DIR, f"special_area_{sanitized_name}_{int(time.time())}.html")
            logger.info(f"Using special cache file: {cache_file}")
        
        # Check cache first if use_cached is True
        if use_cached and os.path.exists(cache_file):
            logger.info(f"Using cached map from {cache_file}")
            with open(cache_file, 'r') as f:
                return f.read()
            
        # If we made it here, we need to generate a new map
        # Get pre-processed data
        msa_data, county_data, states_data, county_to_msa = get_processed_data()
        if msa_data is None or len(msa_data) == 0:
            logger.error("Failed to load MSA data or MSA data is empty")
            if force_detailed:
                # Try harder to get the MSA data
                logger.info("Forcing detailed map - trying to fetch MSA data directly")
                try:
                    from main import get_msa_data as get_msa_data_main
                    msa_data = get_msa_data_main()
                    if msa_data is None or len(msa_data) == 0:
                        logger.error("Still failed to load MSA data after direct fetch")
                        return create_fallback_map(area_name, cache_file)
                except Exception as e:
                    logger.error(f"Error fetching MSA data directly: {str(e)}")
                    return create_fallback_map(area_name, cache_file)
            else:
                return create_fallback_map(area_name, cache_file)
        
        try:
            # Check if this is a special city that needs custom handling
            special_city_area = handle_special_cities(area_name)
            if special_city_area is not None:
                logger.info(f"Using special city handler for {area_name}")
                target_area = special_city_area
            else:
                # Normal area matching logic
                # Normalize the area name for comparison
                normalized_area_name = area_name.lower().strip()
                logger.info(f"Normalized area name: {normalized_area_name}")
                
                # Log available MSA names for debugging
                logger.info("Available MSA names:")
                for name in msa_data['NAME'].head(10).tolist():
                    logger.info(f"  - {name}")
                
                # Create normalized versions of MSA names
                msa_data['normalized_name'] = msa_data['NAME'].str.lower().str.strip()
                
                # First, try to extract the city name to improve matching
                if ',' in area_name:
                    city_part = area_name.split(',')[0].strip()
                    state_part = area_name.split(',')[1].strip() if len(area_name.split(',')) > 1 else ""
                    logger.info(f"City part: {city_part}, State part: {state_part}")
                else:
                    city_part = area_name
                    state_part = ""
                
                # Try exact match first
                target_area = None
                exact_matches = msa_data[msa_data['normalized_name'] == normalized_area_name]
                if not exact_matches.empty:
                    target_area = exact_matches.iloc[0]
                    logger.info(f"Found exact match: {target_area['NAME']}")
                
                # If no exact match, try matching with city and state parts
                if target_area is None and city_part and state_part:
                    logger.info(f"Trying city and state match for {city_part}, {state_part}")
                    # Try to find MSAs that contain both the city and state
                    city_state_matches = msa_data[
                        msa_data['normalized_name'].str.contains(city_part.lower(), case=False, na=False) & 
                        msa_data['normalized_name'].str.contains(state_part.lower(), case=False, na=False)
                    ]
                    if not city_state_matches.empty:
                        target_area = city_state_matches.iloc[0]
                        logger.info(f"Found city+state match: {target_area['NAME']}")
                
                # If still no match, try matching on city name only
                if target_area is None and city_part:
                    # Extract city name, handling various formats
                    city_name = city_part.lower()
                    logger.info(f"Trying to match city name: {city_name}")
                    
                    # Try exact city match first (at the beginning of the name)
                    city_matches = msa_data[msa_data['normalized_name'].str.startswith(city_name + ',', na=False)]
                    if not city_matches.empty:
                        target_area = city_matches.iloc[0]
                        logger.info(f"Found exact city match: {target_area['NAME']}")
                    else:
                        # Try fuzzy city match with word boundaries
                        city_matches = msa_data[msa_data['normalized_name'].str.contains(r'\b' + city_name + r'\b', regex=True, case=False, na=False)]
                        if not city_matches.empty:
                            target_area = city_matches.iloc[0]
                            logger.info(f"Found fuzzy city match: {target_area['NAME']}")
                
                # If still no match, try partial match with word boundaries
                if target_area is None:
                    partial_matches = msa_data[msa_data['normalized_name'].str.contains(r'\b' + normalized_area_name + r'\b', regex=True, case=False, na=False)]
                    if not partial_matches.empty:
                        target_area = partial_matches.iloc[0]
                        logger.info(f"Found partial match: {target_area['NAME']}")
                
                # If still no match, try fuzzy matching with the entire name or city name
                if target_area is None:
                    from difflib import get_close_matches
                    # Try with the full name first
                    available_names = msa_data['normalized_name'].tolist()
                    close_matches = get_close_matches(normalized_area_name, available_names, n=3, cutoff=0.6)
                    
                    # If we have close matches, use the first one
                    if close_matches:
                        target_area = msa_data[msa_data['normalized_name'] == close_matches[0]].iloc[0]
                        logger.info(f"Found fuzzy match: {target_area['NAME']}")
                    # If no close matches with the full name, try with just the city part
                    elif city_part:
                        close_matches = get_close_matches(city_part.lower(), available_names, n=3, cutoff=0.6)
                        if close_matches:
                            target_area = msa_data[msa_data['normalized_name'] == close_matches[0]].iloc[0]
                            logger.info(f"Found fuzzy match with city part: {target_area['NAME']}")
                
                # Last resort: look for any MSA in the same state (if we have a state part)
                if target_area is None and state_part:
                    state_matches = msa_data[msa_data['normalized_name'].str.contains(state_part.lower(), case=False, na=False)]
                    if not state_matches.empty:
                        # Find the largest MSA in that state (likely to be more recognizable)
                        target_area = state_matches.iloc[0]
                        logger.info(f"Using state match as last resort: {target_area['NAME']}")
                
                if target_area is None:
                    logger.error(f"Could not find any matching MSA for: {area_name}")
                    return create_fallback_map(area_name, cache_file)
                
                # Verify geometry
                if not hasattr(target_area, 'geometry') or target_area.geometry is None:
                    logger.error(f"No geometry data for MSA: {target_area['NAME']}")
                    return create_fallback_map(area_name, cache_file)
                
                # Validate and fix geometry if needed
                logger.info("Validating geometry...")
                if not target_area.geometry.is_valid:
                    try:
                        logger.info("Attempting to fix invalid geometry...")
                        target_area.geometry = target_area.geometry.buffer(0)
                        if not target_area.geometry.is_valid:
                            logger.error("Failed to fix invalid geometry")
                            return create_fallback_map(area_name, cache_file)
                    except Exception as e:
                        logger.error(f"Error fixing geometry: {str(e)}")
                        return create_fallback_map(area_name, cache_file)
                
                # Get centroid and bounds with error handling
                try:
                    center_lng, center_lat = target_area.geometry.centroid.x, target_area.geometry.centroid.y
                    min_x, min_y, max_x, max_y = target_area.geometry.bounds
                    
                    # Validate coordinates
                    if not (-180 <= center_lng <= 180 and -90 <= center_lat <= 90):
                        logger.error(f"Invalid coordinates: {center_lat}, {center_lng}")
                        return create_fallback_map(area_name, cache_file)
                    
                    # Generate mock PGs and HHAHs data for this statistical area
                    pgs_data, hhahs_data = generate_mock_pgs_hhahs(area_name, target_area.geometry)
                    
                    logger.info(f"Center: {center_lat}, {center_lng}")
                    logger.info(f"Bounds: {min_x}, {min_y}, {max_x}, {max_y}")
                except Exception as e:
                    logger.error(f"Error calculating centroid or bounds: {str(e)}")
                    return create_fallback_map(area_name, cache_file)
                
                # Create base map with error handling
                try:
                    m = folium.Map(
                        location=[center_lat, center_lng],
                        zoom_start=9,
                        tiles='cartodbpositron',
                        prefer_canvas=True
                    )
                except Exception as e:
                    logger.error(f"Error creating base map: {str(e)}")
                    return create_fallback_map(area_name, cache_file)
                
                # Add state boundaries with error handling
                try:
                    states_in_view = states_data[
                        (states_data.geometry.bounds.maxx >= min_x) & 
                        (states_data.geometry.bounds.minx <= max_x) & 
                        (states_data.geometry.bounds.maxy >= min_y) & 
                        (states_data.geometry.bounds.miny <= max_y)
                    ]
                    
                    if not states_in_view.empty:
                        folium.GeoJson(
                            states_in_view.__geo_interface__,
                            style_function=lambda x: {
                                'fillColor': 'transparent',
                                'color': '#6B7280',
                                'weight': 1.5,
                                'fillOpacity': 0
                            },
                            name='State Boundaries'
                        ).add_to(m)
                except Exception as e:
                    logger.error(f"Error adding state boundaries: {str(e)}")
                
                # Add MSA boundary with error handling
                try:
                    # Add more visible and distinct boundary
                    folium.GeoJson(
                        target_area.geometry.__geo_interface__,
                        style_function=lambda x: {
                            'fillColor': '#4F46E5',
                            'color': '#312E81',
                            'weight': 5,
                            'fillOpacity': 0.35,
                            'dashArray': '5, 5'
                        },
                        highlight_function=lambda x: {
                            'weight': 6,
                            'fillColor': '#6366F1',
                            'color': '#1E1B4B',
                            'fillOpacity': 0.6,
                            'dashArray': ''
                        },
                        tooltip=folium.Tooltip(f"{target_area['NAME']} Boundary"),
                        name=f"{target_area['NAME']} Boundary"
                    ).add_to(m)
                    
                    # Add a more precise boundary outline on top
                    folium.GeoJson(
                        target_area.geometry.__geo_interface__,
                        style_function=lambda x: {
                            'fillColor': 'transparent',
                            'color': '#1E1B4B',
                            'weight': 1.5,
                            'fillOpacity': 0,
                            'dashArray': ''
                        },
                        name=f"{target_area['NAME']} Outline"
                    ).add_to(m)
                except Exception as e:
                    logger.error(f"Error adding MSA boundary: {str(e)}")
                    logger.error(traceback.format_exc())
                
                # Add PGs and HHAHs to the map with error handling
                try:
                    add_pgs_hhahs_to_map(m, pgs_data, hhahs_data)
                except Exception as e:
                    logger.error(f"Error adding PGs and HHAHs: {str(e)}")
                
                # Add essential controls with error handling
                try:
                    folium.plugins.Fullscreen().add_to(m)
                    folium.plugins.MousePosition().add_to(m)
                    folium.LayerControl().add_to(m)
                except Exception as e:
                    logger.error(f"Error adding controls: {str(e)}")
                
                # Set bounds with error handling
                try:
                    m.fit_bounds([[min_y, min_x], [max_y, max_x]])
                except Exception as e:
                    logger.error(f"Error setting bounds: {str(e)}")
                
                # Add title with error handling
                try:
                    title_html = f'''
                        <div style="position: fixed; 
                                    top: 10px; left: 50px; width: 300px; height: auto;
                                    background-color: white; border-radius: 8px;
                                    border: 2px solid #4F46E5; z-index: 9999; padding: 10px;
                                    font-family: Arial; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
                            <h4 style="margin-top: 0; color: #1F2937;">Map View of {target_area['NAME']}</h4>
                            <p style="font-size: 12px; margin-bottom: 0;">
                                Showing {len(pgs_data)} PGs and {len(hhahs_data)} HHAHs in this area.
                            </p>
                        </div>
                    '''
                    m.get_root().html.add_child(folium.Element(title_html))
                except Exception as e:
                    logger.error(f"Error adding title: {str(e)}")
                
                # Save map with error handling
                try:
                    m.save(cache_file)
                    logger.info(f"Map saved to {cache_file}")
                    with open(cache_file, 'r') as f:
                        return f.read()
                except Exception as e:
                    logger.error(f"Error saving map: {str(e)}")
                    return create_fallback_map(area_name, cache_file)
                
        except Exception as e:
            logger.error(f"Error generating map: {e}")
            logger.error(traceback.format_exc())
            return create_fallback_map(area_name, cache_file)
    
    # If neither area_name nor coordinates are provided, return a default map
    logger.error("No area name or coordinates provided")
    return create_fallback_map("Unknown Location", None) 