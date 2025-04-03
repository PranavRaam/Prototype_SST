export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (path) => {
  // For development
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5000${path}`;
  }
  
  // For production
  return `/api${path}`;
};

// Add map parameters to prevent caching and improve stability
export const getMapApiUrl = (path, options = {}) => {
  const baseUrl = getApiUrl(path);
  const timestamp = new Date().getTime();
  const params = new URLSearchParams({
    t: timestamp,
    noCache: 'true',
    stableView: 'true',
    ...options
  });
  
  return `${baseUrl}?${params.toString()}`;
}; 