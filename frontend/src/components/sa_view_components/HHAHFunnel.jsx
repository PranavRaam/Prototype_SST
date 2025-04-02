import React, { useState, useContext } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/HHAHFunnel.css"; // Import the CSS file

// Updated data with larger numbers to match the example image
const initialData = [
  { name: "Total Patient Base", value: 800, fill: "#C0392B" },
  { name: "Eligible Patients", value: 650, fill: "#E74C3C" },
  { name: "Assessment Ready", value: 500, fill: "#9B59B6" },
  { name: "Service Ready", value: 350, fill: "#F1C40F" },
  { name: "In Treatment", value: 200, fill: "#2ECC71" },
  { name: "Near Completion", value: 100, fill: "#16A085" },
  { name: "Complete", value: 50, fill: "#3498DB" }
];

const hhahNames = [
  "HHAH Alpha", "HHAH Beta", "HHAH Gamma", "HHAH Delta", "HHAH Epsilon",
  "HHAH Zeta", "HHAH Eta", "HHAH Theta", "HHAH Iota", "HHAH Kappa",
  "HHAH Lambda", "HHAH Mu", "HHAH Nu", "HHAH Xi", "HHAH Omicron"
];

// Custom shape renderer for the trapezoid
const renderCustomizedShape = (props) => {
  const { x, y, width, height, fill } = props;
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={2}
      ry={2}
      className="custom-funnel-block"
    />
  );
};

const HHAHFunnel = () => {
  const { hhahFunnelData, hhahAssignments, moveHhahToStage } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedHHAH, setSelectedHHAH] = useState(null);

  if (!hhahFunnelData || !hhahAssignments) {
    return <div className="hhah-funnel-container">Loading HHAH funnel data...</div>;
  }

  // Transform the funnel data to show HHAH counts instead of patient values
  const transformedFunnelData = hhahFunnelData.map(stage => ({
    ...stage,
    value: hhahAssignments[stage.name]?.length || 0
  }));

  const handleFunnelClick = (entry) => {
    if (entry.value === 0) return;
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const handleMoveHHAH = (hhah, currentStage) => {
    setSelectedHHAH(hhah);
    setShowMoveOptions(true);
  };

  const handleMoveToStage = (targetStage) => {
    if (!selectedHHAH || !targetStage || !moveHhahToStage) return;
    moveHhahToStage(selectedHHAH, expandedStage, targetStage);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const handleBack = () => {
    setExpandedStage(null);
    setShowMoveOptions(false);
    setSelectedHHAH(null);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const stageName = payload[0].payload.name;
      const hhahCount = hhahAssignments[stageName]?.length || 0;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{stageName}</p>
          <p className="tooltip-value">HHAHs: {hhahCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hhah-funnel-container">
      <h3 className="funnel-title">HHAH Funnel</h3>

      {expandedStage ? (
        <div className="expanded-list">
          <div className="expanded-header">
            <h4>{expandedStage}</h4>
            <button className="back-button" onClick={handleBack}>
              ← Back to Funnel
            </button>
          </div>
          {hhahAssignments[expandedStage]?.map((hhah, index) => (
            <div key={index} className="hhah-entry">
              {hhah}
              {!showMoveOptions && (
                <button onClick={() => handleMoveHHAH(hhah, expandedStage)}>Move</button>
              )}
            </div>
          ))}
          {showMoveOptions && (
            <div className="move-options">
              <h5>Move {selectedHHAH} to:</h5>
              {transformedFunnelData
                .filter(stage => stage.name !== expandedStage)
                .map((stage, index) => (
                  <button
                    key={index}
                    onClick={() => handleMoveToStage(stage.name)}
                  >
                    {stage.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="funnel-chart-wrapper">
          <FunnelChart width={600} height={500}>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="value"
              data={transformedFunnelData}
              isAnimationActive={false}
              onClick={handleFunnelClick}
              width={520}
              shape={renderCustomizedShape}
              trapezoidHeight={45}
              trapezoidsSpace={15}
            >
              <LabelList 
                dataKey="value" 
                position="center" 
                fill="#fff" 
                stroke="none" 
                fontSize={20} 
                fontWeight="bold"
              />
            </Funnel>
          </FunnelChart>
        </div>
      )}
    </div>
  );
};

export default HHAHFunnel;