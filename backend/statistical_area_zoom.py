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
    """Create a fallback map for a specific area"""
    logger = logging.getLogger(__name__)
    logger.info(f"Creating fallback map for {area_name} at {output_path}")
    
    # Ensure the cache directory exists
    cache_dir = os.path.dirname(output_path)
    if not os.path.exists(cache_dir):
        os.makedirs(cache_dir)
        logger.info(f"Created cache directory: {cache_dir}")
    
    fig = Figure(width=800, height=600)
    
    # Default coordinates if area not recognized
    coords = [40.7128, -74.0060]  # NYC default
    zoom_level = 10
    title = "New York Metro Area"
    
    # Special handling for some known areas
    if "New York" in area_name or "Newark" in area_name or "Jersey City" in area_name:
        coords = [40.7128, -74.0060]  # NYC coordinates
        zoom_level = 10
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
    
    folium_map = folium.Map(
        location=coords,
        zoom_start=zoom_level,
        tiles='cartodbpositron'
    )
    
    # Add marker for the center
    folium.Marker(
        coords,
        popup=title,
        icon=folium.Icon(color='blue')
    ).add_to(folium_map)
    
    # Add a circle to represent the general metro area
    circle = folium.Circle(
        location=coords,
        radius=20000,  # 20km radius
        color='#4F46E5',
        fill=True,
        fill_color='#4F46E5',
        fill_opacity=0.2,
        weight=3,
        opacity=0.9
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
            "name": f"PG-{pg_groups[i % len(pg_groups)]}-{area_name[:3]}{i+1}",
            "location": [lat, lng],
            "group": pg_groups[i % len(pg_groups)],
            "physicians": random.randint(3, 15),
            "patients": random.randint(50, 300),
            "status": random.choice(["Active", "Onboarding", "Inactive"]),
            "address": f"{random.randint(100, 999)} Healthcare Ave, {area_name.split(',')[0]}",
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
        folium.Marker(
            location=pg_data['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"PG: {pg_data['name']}",
            icon=folium.Icon(color='blue', icon="user-md", prefix="fa")
        ).add_to(pg_group)
    
    # Add PG group to map
    pg_group.add_to(folium_map)
    
    # Create HHAH feature group
    hhah_group = folium.FeatureGroup(name="Home Health At Home (HHAHs)")
    
    # HHAH name components
    hhah_name_prefixes = ["HomeHealth", "CaringHands", "ComfortCare", "Elite", "Premier", "Wellness", "Guardian"]
    hhah_name_suffixes = ["Services", "Agency", "Associates", "Partners", "Network", "Group", "Care"]
    
    # Generate mock HHAHs
    for i in range(num_hhahs):
        # Generate a random angle and distance within the circle radius
        angle = random.uniform(0, 2 * np.pi)
        # Scale distance to ensure points are within the circle
        distance = random.uniform(2000, 18000)  # Between 2km and 18km from center
        
        # Calculate the coordinates (remember folium uses [lat, lng])
        lat = coords[0] + (distance / 111000) * np.cos(angle)  # 111000 meters is roughly 1 degree of latitude
        lng = coords[1] + (distance / (111000 * np.cos(np.radians(coords[0])))) * np.sin(angle)
        
        prefix = random.choice(hhah_name_prefixes)
        suffix = random.choice(hhah_name_suffixes)
        
        hhah_data = {
            "id": i + 1,
            "name": f"{prefix} {suffix}",
            "location": [lat, lng],
            "services": random.randint(2, 8),
            "patients": random.randint(20, 150),
            "status": random.choice(["Active", "Onboarding", "Inactive"]),
            "address": f"{random.randint(100, 999)} Medical Blvd, {area_name.split(',')[0]}",
            "contact": f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}"
        }
        
        # Create popup with HHAH details
        popup_html = f"""
        <div style="min-width: 180px;">
            <h4 style="margin-top: 0; margin-bottom: 8px; color: #1F2937;">{hhah_data['name']}</h4>
            <p style="margin: 4px 0;"><strong>Services:</strong> {hhah_data['services']}</p>
            <p style="margin: 4px 0;"><strong>Patients:</strong> {hhah_data['patients']}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> {hhah_data['status']}</p>
            <p style="margin: 4px 0;"><strong>Address:</strong> {hhah_data['address']}</p>
            <p style="margin: 4px 0;"><strong>Contact:</strong> {hhah_data['contact']}</p>
        </div>
        """
        
        # Create marker
        folium.Marker(
            location=hhah_data['location'],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"HHAH: {hhah_data['name']}",
            icon=folium.Icon(color='green', icon="home", prefix="fa")
        ).add_to(hhah_group)
    
    # Add HHAH group to map
    hhah_group.add_to(folium_map)
    
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
    folium_map.add_child(legend)
    
    # Add description box
    title_html = f'''
        <div style="position: fixed; 
                    top: 10px; left: 50px; width: 300px; height: auto;
                    background-color: white; border-radius: 8px;
                    border: 2px solid #4F46E5; z-index: 9999; padding: 10px;
                    font-family: Arial; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
            <h4 style="margin-top: 0; color: #1F2937;">{title}</h4>
            <p style="font-size: 12px; margin-bottom: 0;">
                Showing approximate location of {area_name}. The highlighted region shows the general area.
            </p>
            <p style="font-size: 12px; margin-bottom: 0;">
                Showing {num_pgs} PGs and {num_hhahs} HHAHs in this area.
            </p>
        </div>
    '''
    folium_map.get_root().html.add_child(folium.Element(title_html))
    
    # Add map controls
    folium.plugins.Fullscreen().add_to(folium_map)
    folium.plugins.MousePosition().add_to(folium_map)
    folium.plugins.Draw(export=True).add_to(folium_map)
    folium.plugins.MeasureControl(primary_length_unit='miles').add_to(folium_map)
    folium_map.add_child(folium.LayerControl())
    
    # Add safe script for cross-origin communication
    safe_script = """
    <script>
    // Safe cross-origin communication
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for map to fully render
        setTimeout(function() {
            console.log('Fallback map fully loaded and safe for cross-origin access');
            
            // Add protection for Leaflet objects to prevent cross-origin issues
            try {
                // Safely handle resize to avoid security errors
                window.addEventListener('resize', function() {
                    // Find map containers without accessing unsafe properties
                    var mapContainers = document.querySelectorAll('.leaflet-container');
                    if (mapContainers.length > 0) {
                        // Trigger visible resize
                        mapContainers.forEach(function(container) {
                            // This is a safe way to trigger a resize
                            var evt = document.createEvent('UIEvents');
                            evt.initUIEvent('resize', true, false, window, 0);
                            window.dispatchEvent(evt);
                        });
                    }
                });
            } catch (e) {
                console.log('Continuing without advanced map handling');
            }
        }, 1000);
    });
    </script>
    """
    folium_map.get_root().html.add_child(folium.Element(safe_script))
    
    # Save to file
    fig.add_child(folium_map)
    folium_map.save(output_path)
    
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

def generate_mock_pgs_hhahs(area_name, target_area_geometry, num_pgs=5, num_hhahs=7):
    """Generate mock PGs and HHAHs for the given statistical area"""
    logger = logging.getLogger(__name__)
    logger.info(f"Generating mock PGs and HHAHs for {area_name}")
    
    # Get the bounds of the area geometry
    minx, miny, maxx, maxy = target_area_geometry.bounds
    
    # PG Groups to be used in mock data
    pg_groups = ["Group A", "Group B", "Group C", "Group D"]
    
    # Mock PGs data
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
    logger.info(f"Generating detailed map for statistical area: {area_name}")
    
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
        
        # Get centroid and bounds
        try:
            center_lng, center_lat = target_area.geometry.centroid.x, target_area.geometry.centroid.y
            min_x, min_y, max_x, max_y = target_area.geometry.bounds
            
            # Generate mock PGs and HHAHs data for this statistical area - reduce count for lightweight version
            if lightweight:
                num_pgs = min(3, random.randint(2, 4))  # Reduced number of PGs
                num_hhahs = min(5, random.randint(3, 6))  # Reduced number of HHAHs
                pgs_data, hhahs_data = generate_mock_pgs_hhahs(area_name, target_area.geometry, num_pgs=num_pgs, num_hhahs=num_hhahs)
            else:
                pgs_data, hhahs_data = generate_mock_pgs_hhahs(area_name, target_area.geometry)
            
            logger.info(f"Center: {center_lat}, {center_lng}")
            logger.info(f"Bounds: {min_x}, {min_y}, {max_x}, {max_y}")
        except Exception as e:
            logger.error(f"Error calculating centroid or bounds: {str(e)}")
            fallback_file = create_fallback_map(area_name, cache_file)
            logger.info(f"Created fallback map at: {fallback_file}")
            return fallback_file
        
        # Create base map
        m = folium.Map(
            location=[center_lat, center_lng],
            zoom_start=zoom,
            tiles='cartodbpositron',
            prefer_canvas=True,
            control_scale=True
        )
        
        # Add state boundaries (only if not lightweight or if detailed is True)
        if not lightweight or detailed:
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
                        'opacity': 0.8,
                        'fillOpacity': 0,
                        'dashArray': '3,3'
                    },
                    name='State Boundaries'
                ).add_to(m)
        
        # Add MSA boundary (simpler style for lightweight version)
        style_params = {
            'fillColor': '#4F46E5',
            'color': '#312E81',
            'weight': 3 if not lightweight else 2,
            'fillOpacity': 0.2 if not lightweight else 0.15,
            'opacity': 0.9 if not lightweight else 0.8
        }
        
        folium.GeoJson(
            target_area.geometry.__geo_interface__,
            style_function=lambda x: style_params,
            name=f"{target_area['NAME']} Boundary"
        ).add_to(m)
        
        # Add PGs and HHAHs to the map - use simplified markers for lightweight version
        if lightweight:
            # Simplified markers for lightweight version
            for i, pg in enumerate(pgs_data):
                folium.CircleMarker(
                    location=[pg['lat'], pg['lng']],
                    radius=5,
                    color='blue',
                    fill=True,
                    fill_color='blue',
                    fill_opacity=0.7,
                    popup=f"PG: {pg['name']}",
                    name=f"PG_{i+1}"
                ).add_to(m)
            
            for i, hhah in enumerate(hhahs_data):
                folium.CircleMarker(
                    location=[hhah['lat'], hhah['lng']],
                    radius=5,
                    color='green',
                    fill=True,
                    fill_color='green',
                    fill_opacity=0.7,
                    popup=f"HHAH: {hhah['name']}",
                    name=f"HHAH_{i+1}"
                ).add_to(m)
        else:
            # Detailed markers for full version
            add_pgs_hhahs_to_map(m, pgs_data, hhahs_data)
        
        # Add essential controls - minimal for lightweight
        if not lightweight:
            folium.plugins.Fullscreen().add_to(m)
            folium.plugins.MousePosition().add_to(m)
        folium.LayerControl().add_to(m)
        
        # Set bounds
        m.fit_bounds([[min_y, min_x], [max_y, max_x]])
        
        # Add title - simpler version for lightweight
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
        
        # Add safe script for cross-origin communication - simplified for lightweight
        safe_script = """
        <script>
        // Safe cross-origin communication
        document.addEventListener('DOMContentLoaded', function() {
            // Notify parent when map is loaded
            setTimeout(function() {
                try {
                    console.log('Map loaded, sending message to parent');
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({type: 'mapLoaded', status: 'success'}, '*');
                    }
                } catch (e) {
                    console.error('Error in cross-origin communication:', e);
                }
            }, 500);
        });
        </script>
        """
        m.get_root().html.add_child(folium.Element(safe_script))
        
        # Ensure the cache directory exists
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR)
        
        # Save the map
        m.save(cache_file)
        logger.info(f"Map saved to {cache_file}")
        
        return cache_file
        
    except Exception as e:
        logger.error(f"Error generating map: {str(e)}")
        fallback_file = create_fallback_map(area_name, cache_file)
        logger.info(f"Created fallback map at: {fallback_file}")
        return fallback_file 