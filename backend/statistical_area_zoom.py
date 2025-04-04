# Try importing from our wrapper first, fall back to direct import
try:
    from folium_wrapper import folium
    import logging
    logging.getLogger(__name__).info("Using optimized folium wrapper")
except ImportError:
    import folium
    
import geopandas as gpd
import numpy as np
import os
import tempfile
import random
from branca.element import Figure, MacroElement
from jinja2 import Template
import main  # Import the main module to reuse existing functions
import traceback
from folium import plugins
from folium.plugins import MousePosition, Draw, Fullscreen, MiniMap, Search
from branca.element import Figure, JavascriptLink, CssLink
from shapely.geometry import shape, Point
from functools import lru_cache
import time
from datetime import datetime

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

def create_fallback_map(area_name, output_path):
    """Create a lightweight fallback map for a specific area"""
    logger = logging.getLogger(__name__)
    logger.info(f"Creating optimized fallback map for {area_name} at {output_path}")
    
    # Ensure the cache directory exists
    cache_dir = os.path.dirname(output_path)
    if not os.path.exists(cache_dir):
        os.makedirs(cache_dir)
        logger.info(f"Created cache directory: {cache_dir}")
    
    fig = Figure(width=650, height=400)  # Smaller figure for better performance
    
    # Default coordinates if area not recognized
    coords = [40.7128, -74.0060]  # NYC default
    zoom_level = 9
    title = "New York Metro Area"
    
    # Special handling for some known areas
    if "New York" in area_name or "Newark" in area_name or "Jersey City" in area_name:
        coords = [40.7128, -74.0060]  # NYC coordinates
        zoom_level = 9
        title = "New York Metro Area"
    elif "Los Angeles" in area_name or "Anaheim" in area_name or "Long Beach" in area_name:
        coords = [34.0522, -118.2437]  # LA coordinates
        zoom_level = 9
        title = "Los Angeles Metro Area"
    elif "Chicago" in area_name:
        coords = [41.8781, -87.6298]  # Chicago coordinates
        zoom_level = 9
        title = "Chicago Metro Area"
    elif "San Francisco" in area_name or "Oakland" in area_name or "San Jose" in area_name:
        coords = [37.7749, -122.4194]  # SF coordinates
        zoom_level = 9
        title = "San Francisco Bay Area"
    elif "Florida" in area_name or "Tampa" in area_name or "Orlando" in area_name or "Miami" in area_name or "Jacksonville" in area_name:
        coords = [28.0000, -82.4800]  # Florida coordinates
        zoom_level = 8
        title = "Florida Metro Area"
    elif "Lakeland" in area_name or "Winter Haven" in area_name:
        coords = [28.0395, -81.9498]  # Lakeland coordinates
        zoom_level = 9
        title = "Lakeland-Winter Haven Area"
    elif "Norwich" in area_name or "New London" in area_name or "Westerly" in area_name:
        coords = [41.3557, -72.0995]  # Norwich-New London area
        zoom_level = 9
        title = "Norwich-New London Area"
    
    # Create a lightweight map with minimal features
    folium_map = folium.Map(
        location=coords,
        zoom_start=zoom_level,
        tiles='cartodbpositron',
        prefer_canvas=True,  # Use canvas for better performance
        disable_3d=True      # Disable 3D effects
    )
    
    # Explicitly include FontAwesome for icons
    font_awesome = CssLink("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css")
    folium_map.get_root().header.add_child(font_awesome)
    
    # Add a simple circle to represent the general metro area - faster than complex shapes
    circle = folium.Circle(
        location=coords,
        radius=20000,  # 20km radius
        color='#4F46E5',
        fill=True,
        fill_color='#4F46E5',
        fill_opacity=0.15,
        weight=2.5,
        opacity=0.8
    ).add_to(folium_map)
    
    # Create limited number of mock PGs and HHAHs for better performance
    num_pgs = 3  # Reduced number
    num_hhahs = 4  # Reduced number
    
    # Create PG feature group
    pg_group = folium.FeatureGroup(name="Physician Groups (PGs)")
    
    # Generate simplified mock PGs around the center point
    for i in range(num_pgs):
        # Generate a random angle and distance within the circle radius
        angle = random.uniform(0, 2 * np.pi)
        # Scale distance to ensure points are within the circle
        distance = random.uniform(5000, 15000)  # 5-15km from center
        
        # Calculate the coordinates (remember folium uses [lat, lng])
        lat = coords[0] + (distance / 111000) * np.cos(angle)  # 111000 meters is roughly 1 degree of latitude
        lng = coords[1] + (distance / (111000 * np.cos(np.radians(coords[0])))) * np.sin(angle)
        
        # Simple PG data
        pg_data = {
            "name": f"Physician Group {i+1}",
            "location": [lat, lng]
        }
        
        # Create simplified marker with FontAwesome icon
        folium.Marker(
            location=pg_data['location'],
            tooltip=f"PG: {pg_data['name']}",
            icon=folium.Icon(color='blue', icon="user-md", prefix="fa")
        ).add_to(pg_group)
    
    # Add PG group to map
    pg_group.add_to(folium_map)
    
    # Create HHAH feature group
    hhah_group = folium.FeatureGroup(name="Home Health At Home (HHAHs)")
    
    # Generate simplified mock HHAHs
    for i in range(num_hhahs):
        # Generate a random angle and distance within the circle radius
        angle = random.uniform(0, 2 * np.pi)
        # Scale distance to ensure points are within the circle
        distance = random.uniform(5000, 15000)  # 5-15km from center
        
        # Calculate the coordinates (remember folium uses [lat, lng])
        lat = coords[0] + (distance / 111000) * np.cos(angle)
        lng = coords[1] + (distance / (111000 * np.cos(np.radians(coords[0])))) * np.sin(angle)
        
        # Simple HHAH data
        hhah_data = {
            "name": f"Home Health Service {i+1}",
            "location": [lat, lng]
        }
        
        # Create simplified marker with FontAwesome icon
        folium.Marker(
            location=hhah_data['location'],
            tooltip=f"HHAH: {hhah_data['name']}",
            icon=folium.Icon(color='green', icon="home", prefix="fa")
        ).add_to(hhah_group)
    
    # Add HHAH group to map
    hhah_group.add_to(folium_map)
    
    # Add a simple legend for better performance
    legend_html = '''
    <div style="position: fixed; 
        bottom: 50px; right: 50px; 
        background-color: white;
        border: 2px solid grey; z-index: 9999; 
        font-size: 14px; padding: 10px;
        border-radius: 6px;">
    <p><strong>Legend</strong></p>
    <p>
      <i class="fa fa-user-md" style="color:blue"></i> Physician Groups<br>
      <i class="fa fa-home" style="color:green"></i> Home Health At Home<br>
      <span style="background-color:#4F46E520; border:2px solid #312E81;">&nbsp;&nbsp;&nbsp;&nbsp;</span> Statistical Area
    </p>
    </div>
    '''
    folium_map.get_root().html.add_child(folium.Element(legend_html))
    
    # Add essential controls but minimize for performance
    folium.LayerControl().add_to(folium_map)
    
    # Add a simple title with minimal styling
    title_html = f'''
    <div style="position: fixed; 
              top: 10px; left: 50px; width: 250px;
              background-color: white; border-radius: 4px;
              border: 1px solid #4F46E5; z-index: 999; padding: 5px;
              font-family: Arial;">
        <h4 style="margin: 0px; font-size: 14px;">{title}</h4>
        <p style="margin: 4px 0 0 0; font-size: 12px;">
            Showing {num_pgs} PGs and {num_hhahs} HHAHs
        </p>
    </div>
    '''
    folium_map.get_root().html.add_child(folium.Element(title_html))
    
    # Add simple notification script for the parent window
    notification_script = '''
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
                }
            } catch (e) {
                console.error('Communication error:', e);
            }
        }, 100);
    });
    </script>
    '''
    folium_map.get_root().html.add_child(folium.Element(notification_script))
    
    # Add the map to the figure and save
    fig.add_child(folium_map)
    fig.save(output_path)
    logger.info(f"Fallback map saved to {output_path}")
    
    return output_path

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
            
        # Use different simplification levels based on geometry complexity
        msa_data['geometry'] = msa_data.geometry.simplify(0.01)
        county_data['geometry'] = county_data.geometry.simplify(0.01)
        # Use less simplification for states to preserve coastal boundaries
        states_data['geometry'] = states_data.geometry.simplify(0.001)
        
        return msa_data, county_data, states_data, county_to_msa
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        logger.error(traceback.format_exc())
        return None, None, None, {}

def generate_mock_pgs_hhahs(area_geometry, area_name=None, num_pgs=None, num_hhahs=None):
    """
    Generate mock Physician Groups (PGs) and Home Health At Home (HHAHs) within 
    a statistical area boundary. Optimized for performance with complex boundaries.
    
    Parameters:
    - area_geometry: The Shapely geometry of the statistical area
    - area_name: Name of the statistical area (for naming)
    - num_pgs: Number of PGs to generate (if None, will use a random number)
    - num_hhahs: Number of HHAHs to generate (if None, will use a random number)
    
    Returns:
    - (pg_data, hhah_data): Lists of dictionaries with PG and HHAH data
    """
    logger = logging.getLogger(__name__)
    
    # Get the bounds of the geometry to generate points inside
    min_x, min_y, max_x, max_y = area_geometry.bounds
    
    # Get simplified geometry for faster point-in-polygon testing
    try:
        # Use a higher tolerance for faster computation (0.01 is a good balance)
        simplified_geom = area_geometry.simplify(0.01, preserve_topology=True)
        # Fallback to original if simplification fails
        if not simplified_geom.is_valid or simplified_geom.is_empty:
            simplified_geom = area_geometry
    except Exception as e:
        logger.warning(f"Geometry simplification failed: {e}. Using original geometry.")
        simplified_geom = area_geometry
    
    # Determine number of PGs and HHAHs to generate
    if num_pgs is None:
        # Default is 5-10 PGs, scaled by area size (larger areas get more)
        area_factor = min(1.0, area_geometry.area / 10)  # Normalize area
        num_pgs = min(12, max(3, int(5 + 5 * area_factor)))
    
    if num_hhahs is None:
        # Default is 8-15 HHAHs, scaled by area size
        area_factor = min(1.0, area_geometry.area / 10)  # Normalize area
        num_hhahs = min(15, max(5, int(8 + 7 * area_factor)))
    
    # Logging
    logger.info(f"Generating {num_pgs} PGs and {num_hhahs} HHAHs for this area")
    
    # Generate PGs
    pg_data = []
    pg_attempts = 0
    max_attempts = num_pgs * 10  # Limit attempts to avoid infinite loops
    
    # Cache city names for faster operation
    city_names = [
        "Central", "Downtown", "Uptown", "Riverside", "Lakeside", 
        "Westside", "Eastside", "Northside", "Southside", "Metro"
    ]
    
    # Cache group names
    group_names = ["Alpha Health", "Beta Medical", "Gamma Physicians", 
                  "Delta Wellness", "Epsilon Care", "Omega Health"]
    
    # Performance optimization: For very complex geometries, we'll use the rectangle
    # defined by the bounds and then verify points lie within the actual geometry
    
    # Generate points using efficient points_within_polygon method
    pg_points = generate_points_within_area(simplified_geom, num_pgs * 2)
    
    for i in range(min(num_pgs, len(pg_points))):
        pt = pg_points[i]
        city_prefix = random.choice(city_names)
        
        pg_data.append({
            'id': i + 1,
            'name': f"{city_prefix} Physicians {i+1}",
            'location': [pt.y, pt.x],  # Folium uses [lat, lng]
            'lat': pt.y,
            'lng': pt.x,
            'group': random.choice(group_names),
            'physicians': random.randint(3, 20),
            'patients': random.randint(50, 500),
            'status': random.choice(["Active", "Onboarding", "Expanding"]),
            'address': f"{random.randint(100, 999)} Medical Parkway",
            'contact': f"contact@{city_prefix.lower()}physicians.example"
        })
    
    # Generate HHAHs using the same approach
    hhah_data = []
    hhah_points = generate_points_within_area(simplified_geom, num_hhahs * 2)
    
    hhah_name_prefixes = ["HomeHealth", "CaringHands", "ComfortCare", "Elite", 
                        "Premier", "Wellness", "Guardian"]
    hhah_name_suffixes = ["Services", "Agency", "Associates", "Partners", "Network"]
    
    for i in range(min(num_hhahs, len(hhah_points))):
        pt = hhah_points[i]
        prefix = random.choice(hhah_name_prefixes)
        suffix = random.choice(hhah_name_suffixes)
        
        hhah_data.append({
            'id': i + 1,
            'name': f"{prefix} {suffix}",
            'location': [pt.y, pt.x],  # Folium uses [lat, lng]
            'lat': pt.y,
            'lng': pt.x,
            'services': random.randint(3, 8),
            'patients': random.randint(30, 300),
            'status': random.choice(["Active", "Expanding", "New"]),
            'address': f"{random.randint(100, 999)} Wellness Blvd",
            'contact': f"info@{prefix.lower()}{suffix.lower()}.example"
        })
    
    return pg_data, hhah_data

def generate_points_within_area(geometry, num_points):
    """
    Efficiently generate points within a geometry.
    This is much faster than the naive approach for complex geometries.
    
    Parameters:
    - geometry: The shapely geometry
    - num_points: Number of points to try to generate
    
    Returns:
    - List of Point objects within the geometry
    """
    min_x, min_y, max_x, max_y = geometry.bounds
    width = max_x - min_x
    height = max_y - min_y
    
    # Simple buffer strategy: For simple geometries, just generate within bounds
    if geometry.area > (width * height * 0.5):
        # Wide geometry - use basic bounds-based generation
        return generate_points_within_bounds(geometry, num_points)
    
    # For more complex shapes, we need a different approach
    # Create a simplified grid of points and check which ones fall within the geometry
    
    # First create a grid covering the area
    grid_density = max(10, min(20, int(num_points/2)))  # Adjust grid based on points needed
    
    x_points = np.linspace(min_x, max_x, grid_density)
    y_points = np.linspace(min_y, max_y, grid_density)
    
    points_within = []
    
    # Check each grid point
    for x in x_points:
        for y in y_points:
            # Create point and test
            pt = Point(x, y)
            if geometry.contains(pt):
                points_within.append(pt)
                
                # Also add some slight random offsets to produce more points
                if len(points_within) < num_points:
                    # Add nearby jittered point
                    jitter_x = x + (random.random() - 0.5) * width * 0.05
                    jitter_y = y + (random.random() - 0.5) * height * 0.05
                    jitter_pt = Point(jitter_x, jitter_y)
                    if geometry.contains(jitter_pt):
                        points_within.append(jitter_pt)
                
            # If we have enough points, stop
            if len(points_within) >= num_points:
                break
        
        # If we have enough points, stop        
        if len(points_within) >= num_points:
            break
    
    # If we don't have enough points, supplement with completely random points
    if len(points_within) < num_points:
        extra_points = generate_points_within_bounds(geometry, num_points - len(points_within))
        points_within.extend(extra_points)
    
    # Shuffle to randomize
    random.shuffle(points_within)
    
    return points_within[:num_points]

def generate_points_within_bounds(geometry, num_points, max_attempts=1000):
    """Generate random points within the bounds of a geometry and check containment"""
    min_x, min_y, max_x, max_y = geometry.bounds
    width = max_x - min_x
    height = max_y - min_y
    
    points_within = []
    attempts = 0
    
    while len(points_within) < num_points and attempts < max_attempts:
        # Generate a random point within the bounding box
        x = min_x + random.random() * width
        y = min_y + random.random() * height
        pt = Point(x, y)
        
        # Check if it's within the geometry
        if geometry.contains(pt):
            points_within.append(pt)
        
        attempts += 1
    
    return points_within

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
        
        # Always use blue for PGs for better distinction
        folium.Marker(
            location=pg['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"PG: {pg['name']}",
            icon=folium.Icon(color='blue', icon="user-md", prefix="fa")
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
        
        # Always use green for HHAHs for better distinction
        folium.Marker(
            location=hhah['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"HHAH: {hhah['name']}",
            icon=folium.Icon(color='green', icon="home", prefix="fa")
        ).add_to(hhah_group)
    
    # Add the HHAH group to the map
    hhah_group.add_to(m)
    logger.info("Added PGs and HHAHs to map")
    
    # Add legend for PGs and HHAHs
    legend_colors = {
        "Physician Groups (PGs)": "blue",
        "Home Health At Home (HHAHs)": "green",
        "Metro Area": "#4F46E5"
    }
    
    legend = LegendControl(
        title="Map Legend",
        color_dict=legend_colors,
        position="bottomright"
    )
    m.add_child(legend)

def generate_simplified_map(area_name, zoom=9):
    """
    Generate a simplified map for hosting environments like Render
    with resource constraints
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Generating simplified map for area: {area_name}")
    
    # Generate cache filename
    cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
    if not os.path.exists(cache_dir):
        os.makedirs(cache_dir)
        
    cache_file = os.path.join(cache_dir, f"simplified_{area_name.replace(' ', '_').replace(',', '').replace('-', '_')}.html")
    
    # Try to generate a simple map with minimal features
    try:
        # Use a fixed location based on the area name (deterministic but not accurate)
        area_hash = sum(ord(c) for c in area_name)
        lat = 30 + (area_hash % 15)  # Between 30 and 45 degrees
        lng = -100 + (area_hash % 40) - 20  # Between -120 and -80 degrees
        
        # Create a minimal map
        m = folium.Map(
            location=[lat, lng],
            zoom_start=zoom,
            tiles='cartodbpositron',
            prefer_canvas=True
        )
        
        # Add a simple circle to represent the area
        folium.Circle(
            location=[lat, lng],
            radius=20000,  # 20km radius
            color='#4F46E5',
            fill=True,
            fill_color='#4F46E5',
            fill_opacity=0.2,
            popup=f"{area_name} Area"
        ).add_to(m)
        
        # Add a few random points to represent PGs
        pg_count = min(3, random.randint(2, 3))
        for i in range(pg_count):
            # Create points within the circle
            point_lat = lat + random.uniform(-0.1, 0.1)
            point_lng = lng + random.uniform(-0.1, 0.1)
            folium.CircleMarker(
                location=[point_lat, point_lng],
                radius=5,
                color='blue',
                fill=True,
                fill_color='blue',
                fill_opacity=0.7,
                popup=f"PG {i+1}"
            ).add_to(m)
        
        # Add a few random points to represent HHAHs
        hhah_count = min(4, random.randint(2, 4))
        for i in range(hhah_count):
            # Create points within the circle
            point_lat = lat + random.uniform(-0.1, 0.1)
            point_lng = lng + random.uniform(-0.1, 0.1)
            folium.CircleMarker(
                location=[point_lat, point_lng],
                radius=5,
                color='green',
                fill=True,
                fill_color='green',
                fill_opacity=0.7,
                popup=f"HHAH {i+1}"
            ).add_to(m)
        
        # Add title
        title_html = f'''
            <div style="position: fixed; 
                        top: 10px; left: 50px; width: 300px; height: auto;
                        background-color: white; border-radius: 8px;
                        border: 2px solid #4F46E5; z-index: 9999; padding: 10px;
                        font-family: Arial; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
                <h4 style="margin-top: 0; color: #1F2937;">Map View of {area_name}</h4>
                <p style="font-size: 12px; margin-bottom: 0;">
                    Showing {pg_count} PGs and {hhah_count} HHAHs in this area.
                </p>
            </div>
        '''
        m.get_root().html.add_child(folium.Element(title_html))
        
        # Add notification script
        notification_script = """
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Notify parent that map is loaded
            setTimeout(function() {
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
                    }
                } catch(e) {
                    console.error('Error in cross-origin communication:', e);
                }
            }, 300);
        });
        </script>
        """
        m.get_root().html.add_child(folium.Element(notification_script))
        
        # Save the map
        m.save(cache_file)
        logger.info(f"Simplified map saved to {cache_file}")
        
        return cache_file
    
    except Exception as e:
        logger.error(f"Error generating simplified map: {str(e)}")
        return None

def generate_statistical_area_map(area_name, zoom=9, exact_boundary=True, detailed=True, use_cached=True, force_regen=False, lightweight=False):
    """
    Generate a map zoomed in on a specific statistical area (MSA)
    
    Parameters:
    - area_name: Name of the statistical area/MSA
    - zoom: Initial zoom level (default: 9)
    - exact_boundary: Whether to show exact boundaries (default: True)
    - detailed: Whether to show detailed features (default: True)
    - use_cached: Whether to use cached maps if available (default: True) 
    - force_regen: Whether to force regeneration of the map (default: False)
    - lightweight: Whether to generate a lightweight version for faster loading (default: False)
    """
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Always use detailed map generation, regardless of environment or settings
    logger.info(f"Generating optimized map for statistical area: {area_name}")
    
    # Generate cache filename
    cache_file = os.path.join(CACHE_DIR, f"statistical_area_{area_name.replace(' ', '_').replace(',', '').replace('-', '_')}.html")
    
    # Check cache first if use_cached is True and force_regen is False
    if use_cached and not force_regen and os.path.exists(cache_file):
        file_age = time.time() - os.path.getmtime(cache_file)
        # Use cache if file exists and is less than 24 hours old
        if file_age < 86400:  # 24 hours in seconds
            logger.info(f"Using cached map from {cache_file} (age: {file_age/3600:.1f} hours)")
            return cache_file
        else:
            logger.info(f"Cached map is {file_age/3600:.1f} hours old, regenerating...")
    
    # Get pre-processed data
    msa_data, county_data, states_data, county_to_msa = get_processed_data()
    if msa_data is None or len(msa_data) == 0:
        logger.error("Failed to load MSA data or MSA data is empty")
        return create_fallback_map(area_name, cache_file)
    
    try:
        # Normalize the area name for comparison
        normalized_area_name = area_name.lower().strip()
        logger.info(f"Normalized area name: {normalized_area_name}")
        
        # Create normalized versions of MSA names
        msa_data['normalized_name'] = msa_data['NAME'].str.lower().str.strip()
        
        # Try exact match first
        target_area = None
        exact_matches = msa_data[msa_data['normalized_name'] == normalized_area_name]
        if not exact_matches.empty:
            target_area = exact_matches.iloc[0]
            logger.info(f"Found exact match: {target_area['NAME']}")
        
        # If no exact match, try matching main city name
        if target_area is None:
            city_name = normalized_area_name.split(',')[0].split('-')[0].strip()
            logger.info(f"Trying to match city name: {city_name}")
            
            # Try exact city match first
            city_matches = msa_data[msa_data['normalized_name'].str.startswith(city_name + ',', na=False)]
            if not city_matches.empty:
                target_area = city_matches.iloc[0]
                logger.info(f"Found exact city match: {target_area['NAME']}")
            else:
                # Try fuzzy city match
                city_matches = msa_data[msa_data['normalized_name'].str.contains(f"^{city_name}", regex=True, case=False, na=False)]
                if not city_matches.empty:
                    target_area = city_matches.iloc[0]
                    logger.info(f"Found fuzzy city match: {target_area['NAME']}")
        
        # If still no match, try partial match
        if target_area is None:
            partial_matches = msa_data[msa_data['normalized_name'].str.contains(normalized_area_name, case=False, na=False)]
            if not partial_matches.empty:
                target_area = partial_matches.iloc[0]
                logger.info(f"Found partial match: {target_area['NAME']}")
        
        if target_area is None:
            logger.error(f"Could not find any matching MSA for: {area_name}")
            fallback_file = create_fallback_map(area_name, cache_file)
            logger.info(f"Created fallback map at: {fallback_file}")
            return fallback_file
        
        # Verify geometry
        if not hasattr(target_area, 'geometry') or target_area.geometry is None:
            logger.error(f"No geometry data for MSA: {target_area['NAME']}")
            fallback_file = create_fallback_map(area_name, cache_file)
            logger.info(f"Created fallback map at: {fallback_file}")
            return fallback_file
        
        # Validate and fix geometry if needed
        logger.info("Validating geometry...")
        if not target_area.geometry.is_valid:
            try:
                logger.info("Attempting to fix invalid geometry...")
                target_area.geometry = target_area.geometry.buffer(0)
                if not target_area.geometry.is_valid:
                    logger.error("Failed to fix invalid geometry")
                    fallback_file = create_fallback_map(area_name, cache_file)
                    logger.info(f"Created fallback map at: {fallback_file}")
                    return fallback_file
            except Exception as e:
                logger.error(f"Error fixing geometry: {str(e)}")
                fallback_file = create_fallback_map(area_name, cache_file)
                logger.info(f"Created fallback map at: {fallback_file}")
                return fallback_file
        
        # Simplify the geometry to improve performance
        try:
            # Simplify the geometry for faster rendering
            # The tolerance parameter controls the level of simplification - higher value = more simplification
            tolerance = 0.005  # Adjust this value based on your needs
            simplified_geometry = target_area.geometry.simplify(tolerance, preserve_topology=True)
            logger.info(f"Simplified geometry from {len(str(target_area.geometry))} to {len(str(simplified_geometry))} chars")
            
            # Replace the original geometry with the simplified version
            target_area.geometry = simplified_geometry
        except Exception as e:
            logger.warning(f"Failed to simplify geometry: {str(e)}. Using original geometry.")
        
        # Get centroid and bounds
        try:
            center_lng, center_lat = target_area.geometry.centroid.x, target_area.geometry.centroid.y
            min_x, min_y, max_x, max_y = target_area.geometry.bounds
            
            # Generate optimized PGs and HHAHs data - reduce count for better performance
            num_pgs = min(5, random.randint(3, 6))  # Limited PGs
            num_hhahs = min(7, random.randint(4, 8))  # Limited HHAHs
            pgs_data, hhahs_data = generate_mock_pgs_hhahs(
                area_geometry=target_area.geometry, 
                area_name=area_name, 
                num_pgs=num_pgs, 
                num_hhahs=num_hhahs
            )
            
            logger.info(f"Center: {center_lat}, {center_lng}")
            logger.info(f"Bounds: {min_x}, {min_y}, {max_x}, {max_y}")
            logger.info(f"Generated {len(pgs_data)} PGs and {len(hhahs_data)} HHAHs")
        except Exception as e:
            logger.error(f"Error calculating centroid or bounds: {str(e)}")
            fallback_file = create_fallback_map(area_name, cache_file)
            logger.info(f"Created fallback map at: {fallback_file}")
            return fallback_file
        
        # Create figure to hold the map
        fig = Figure(width=800, height=600)
        
        # Create base map with performance-oriented options
        m = folium.Map(
            location=[center_lat, center_lng],
            zoom_start=zoom,
            tiles='cartodbpositron',  # Lightweight tiles
            prefer_canvas=True,  # Use canvas for better performance
            disable_3d=True,  # Disable 3D effects
            control_scale=True
        )
        
        # Explicitly include FontAwesome for icons
        font_awesome = CssLink("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css")
        m.get_root().header.add_child(font_awesome)
        
        # For state boundaries, use a simplified version
        # Get only the states that intersect with our MSA to reduce the amount of data
        states_in_view = states_data[
            (states_data.geometry.bounds.maxx >= min_x) & 
            (states_data.geometry.bounds.minx <= max_x) & 
            (states_data.geometry.bounds.maxy >= min_y) & 
            (states_data.geometry.bounds.miny <= max_y)
        ]
        
        # Simplify the state geometries for better performance
        if not states_in_view.empty:
            simplified_states = states_in_view.copy()
            simplified_states.geometry = simplified_states.geometry.simplify(0.01, preserve_topology=True)
            
            folium.GeoJson(
                simplified_states.__geo_interface__,
                style_function=lambda x: {
                    'fillColor': 'transparent',
                    'color': '#6B7280',
                    'weight': 1,  # Thinner lines for better performance
                    'opacity': 0.6,  # Reduced opacity for better performance
                    'fillOpacity': 0,
                    'dashArray': '3,3'
                },
                name='State Boundaries'
            ).add_to(m)
        
        # Add MSA boundary with optimized style
        style_params = {
            'fillColor': '#4F46E5',
            'color': '#312E81',
            'weight': 2.5,
            'fillOpacity': 0.15,
            'opacity': 0.8
        }
        
        # Add MSA boundary with more explicit rendering approach
        boundary_geojson = folium.GeoJson(
            target_area.geometry.__geo_interface__,
            style_function=lambda x: style_params,
            name=f"{target_area['NAME']} Boundary",
            tooltip=folium.GeoJsonTooltip(
                fields=["NAME"] if hasattr(target_area, "NAME") else None,
                aliases=["Area:"] if hasattr(target_area, "NAME") else None,
                style=("background-color: white; color: #333333; font-family: arial; font-size: 12px; padding: 10px;")
            ),
            highlight_function=lambda x: {'weight': 4, 'color': '#0000FF', 'fillOpacity': 0.25},
            embed=False,  # Don't embed the GeoJSON in the HTML to reduce size
            overlay=True,  # Make sure it's an overlay
            control=True,  # Show in layer control
            smooth_factor=1.5  # Higher smooth factor for better performance
        )
        boundary_geojson.add_to(m)
        
        # Create feature group for PGs
        pg_group = folium.FeatureGroup(name="Physician Groups (PGs)")
        
        # Add PG markers with FontAwesome icons
        for pg in pgs_data:
            # Simplified popup for better performance
            popup_html = f"""
            <div style="min-width: 150px;">
                <h4 style="margin: 4px 0; color: #1F2937;">{pg['name']}</h4>
                <p style="margin: 2px 0;"><strong>Group:</strong> {pg['group']}</p>
                <p style="margin: 2px 0;"><strong>Physicians:</strong> {pg['physicians']}</p>
            </div>
            """
            
            # Always use blue for PGs for better distinction
            folium.Marker(
                location=pg['location'],
                popup=folium.Popup(popup_html, max_width=250),
                tooltip=f"PG: {pg['name']}",
                icon=folium.Icon(color='blue', icon="user-md", prefix="fa")
            ).add_to(pg_group)
        
        # Add the PG group to the map
        pg_group.add_to(m)
        
        # Create feature group for HHAHs
        hhah_group = folium.FeatureGroup(name="Home Health At Home (HHAHs)")
        
        # Add HHAH markers with FontAwesome icons - simplified for performance
        for hhah in hhahs_data:
            # Simplified popup for better performance
            popup_html = f"""
            <div style="min-width: 150px;">
                <h4 style="margin: 4px 0; color: #1F2937;">{hhah['name']}</h4>
                <p style="margin: 2px 0;"><strong>Services:</strong> {hhah['services']}</p>
                <p style="margin: 2px 0;"><strong>Patients:</strong> {hhah['patients']}</p>
            </div>
            """
            
            # Always use green for HHAHs for better distinction
            folium.Marker(
                location=hhah['location'],
                popup=folium.Popup(popup_html, max_width=250),
                tooltip=f"HHAH: {hhah['name']}",
                icon=folium.Icon(color='green', icon="home", prefix="fa")
            ).add_to(hhah_group)
        
        # Add the HHAH group to the map
        hhah_group.add_to(m)
        
        # Add simple legend for PGs and HHAHs
        legend_colors = {
            "Physician Groups (PGs)": "blue",
            "Home Health At Home (HHAHs)": "green",
            "Metro Area": "#4F46E5"
        }
        
        # Use a simpler legend control
        legend_html = '''
        <div style="position: fixed; 
            bottom: 50px; right: 50px; 
            background-color: white;
            border: 2px solid grey; z-index: 9999; 
            font-size: 14px; padding: 10px;
            border-radius: 6px;">
        <p><strong>Legend</strong></p>
        <p>
          <i class="fa fa-user-md" style="color:blue"></i> Physician Groups (PGs)<br>
          <i class="fa fa-home" style="color:green"></i> Home Health At Home (HHAHs)<br>
          <span style="background-color:#4F46E520; border:2px solid #312E81;">&nbsp;&nbsp;&nbsp;&nbsp;</span> Statistical Area
        </p>
        </div>
        '''
        m.get_root().html.add_child(folium.Element(legend_html))
        
        # Add essential controls but minimize for performance
        folium.plugins.Fullscreen(position='topright').add_to(m)
        folium.LayerControl().add_to(m)
        
        # Set bounds
        m.fit_bounds([[min_y, min_x], [max_y, max_x]])
        
        # Add simplified title - less CSS for better performance
        title_html = f'''
            <div style="position: fixed; 
                        top: 10px; left: 50px; width: 300px;
                        background-color: white; border-radius: 4px;
                        border: 1px solid #4F46E5; z-index: 9999; padding: 8px;
                        font-family: Arial; box-shadow: 0 0 5px rgba(0,0,0,0.1);">
                <h4 style="margin: 2px 0; color: #1F2937;">Map View of {target_area['NAME']}</h4>
                <p style="font-size: 12px; margin: 2px 0;">
                    Showing {len(pgs_data)} PGs and {len(hhahs_data)} HHAHs in this area.
                </p>
            </div>
        '''
        m.get_root().html.add_child(folium.Element(title_html))
        
        # Add safe script for cross-origin communication and boundary fix
        safe_script = """
        <script>
        // Safe cross-origin communication
        document.addEventListener('DOMContentLoaded', function() {
            // Deferred execution for better performance
            setTimeout(function() {
                console.log('Map loaded, sending message to parent');
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
                    }
                } catch (e) {
                    console.error('Error in cross-origin communication:', e);
                }
            }, 100);
        });
        </script>
        """
        m.get_root().html.add_child(folium.Element(safe_script))
        
        # Ensure the cache directory exists
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR)
        
        # Add the map to the figure and save
        fig.add_child(m)
        fig.save(cache_file)
        logger.info(f"Map saved to {cache_file}")
        
        return cache_file
        
    except Exception as e:
        logger.error(f"Error generating map: {str(e)}")
        fallback_file = create_fallback_map(area_name, cache_file)
        logger.info(f"Created fallback map at: {fallback_file}")
        return fallback_file 