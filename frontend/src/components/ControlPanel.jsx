import './ControlPanel.css';

const ControlPanel = () => {
  return (
    <div className="control-panel">
      <div className="legend-panel">
        <h3>Metropolitan Statistical Areas</h3>
        <div className="legend-item">
          <div className="legend-line"></div>
          <span>MSA Boundary</span>
        </div>
        <div className="legend-item">
          <div className="legend-area"></div>
          <span>MSA Area</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 