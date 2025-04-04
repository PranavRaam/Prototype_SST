"""
Lightweight Folium wrapper for Render deployment

This wraps some Folium functionality to reduce memory usage
"""
import folium
import os
import logging
import random

logger = logging.getLogger(__name__)

# Check if we're running on Render
is_render = os.environ.get('RENDER', False) or os.environ.get('IS_RENDER', False)

# Override Folium map creation with more memory-efficient version for Render
original_map = folium.Map
if is_render:
    logger.info("Using optimized Map class for Render deployment")
    
    def optimized_map(*args, **kwargs):
        """A more memory-efficient version of folium.Map"""
        # Reduce the default size of the map to save memory
        kwargs.setdefault('width', '100%')
        kwargs.setdefault('height', '100%')
        kwargs.setdefault('prefer_canvas', True)
        
        # Use a simpler tile set
        if 'tiles' not in kwargs or kwargs['tiles'] == 'OpenStreetMap':
            kwargs['tiles'] = 'cartodbpositron'
        
        # Create the map with optimized settings
        m = original_map(*args, **kwargs)
        
        # Disable unnecessary features to reduce memory/CPU usage
        m.options['doubleClickZoom'] = False
        m.options['dragging'] = True
        m.options['touchZoom'] = True
        m.options['boxZoom'] = False
        m.options['keyboard'] = False
        
        return m
    
    # Replace the original Map with our optimized version
    folium.Map = optimized_map
    
    # Also patch other memory-intensive operations if needed
    if hasattr(folium, 'GeoJson'):
        original_geojson = folium.GeoJson
        
        def optimized_geojson(*args, **kwargs):
            """A more memory-efficient version of folium.GeoJson"""
            # Set options to reduce memory usage
            kwargs.setdefault('smooth_factor', 2.0)  # Simplify geometry more
            kwargs.setdefault('highlight', False)    # Disable highlight features
            
            return original_geojson(*args, **kwargs)
        
        # Replace the original GeoJson with our optimized version
        folium.GeoJson = optimized_geojson

# Export the modified folium module
__all__ = ['folium'] 