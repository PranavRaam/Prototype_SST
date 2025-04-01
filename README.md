# Healthcare Services Dashboard

This project provides an interactive visualization of the United States divided into 20 regions with Metropolitan Statistical Areas (MSAs) boundaries, designed with a healthcare services focus.

## Project Structure

```
Prototype_1/
├── backend/
│   ├── app.py             # Flask API server with background processing
│   ├── main.py            # Map generation logic
│   └── requirements.txt   # Python dependencies
└── frontend/
    ├── public/            # Static assets
    ├── src/
    │   ├── assets/        # Frontend assets
    │   ├── components/    # React components
    │   │   ├── MapViewer.jsx      # Map display component
    │   │   ├── ControlPanel.jsx   # UI controls for map settings
    │   ├── App.jsx        # Main React component
    │   ├── App.css        # App component styles
    │   ├── main.jsx       # React entry point
    │   └── index.css      # Global styles
    ├── index.html         # HTML entry point
    ├── package.json       # Frontend dependencies
    └── vite.config.js     # Vite configuration
```

## Features

- **Optimized Map Loading**: Map generation happens in the background, allowing the UI to remain responsive
- **Modern Healthcare Dashboard UI**: Clean interface styled like a healthcare services dashboard
- **Interactive Controls**: Toggle different map layers and change base map styles
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd Prototype_1/backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```
   python app.py
   ```
   The server will start on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd Prototype_1/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```
   The frontend will be available at http://localhost:3000

## How to Use

1. Start both the backend and frontend servers.
2. Open http://localhost:3000 in your browser.
3. Click "Generate Map" button to start the map generation process.
4. While the map generates in the background, you'll see a progress indicator.
5. Once the map is ready, it will display the United States divided into 20 regions with Metropolitan Statistical Areas (MSAs) highlighted.
6. Use the control panel to:
   - Switch between light, dark, and street map styles
   - Toggle visibility of state boundaries
   - Toggle visibility of counties by region
   - Toggle visibility of Metropolitan Statistical Areas

## Performance Optimizations

- Asynchronous map generation using background threads
- Status polling with efficient intervals
- Pre-cached map data when available
- Optimized UI rendering with React

## Data Sources

- US Census TIGER/Line Shapefiles 2023
- Metropolitan Statistical Areas (MSAs) delineation files 