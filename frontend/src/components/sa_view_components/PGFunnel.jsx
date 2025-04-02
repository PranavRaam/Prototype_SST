import React, { useState, useContext } from "react";
import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";
import { FunnelDataContext } from './FunnelDataContext';
import "../sa_view_css/PGFunnel.css"; // Importing CSS

// Updated data with larger numbers to match the example image
const initialData = [
  { name: "Total Potential Patients", value: 1000, fill: "#2980B9" },
  { name: "Active Interest", value: 800, fill: "#45B7D1" },
  { name: "Initial Contact", value: 600, fill: "#F39C12" },
  { name: "In Assessment", value: 400, fill: "#E67E22" },
  { name: "Ready for Service", value: 300, fill: "#E74C3C" },
  { name: "Service Started", value: 200, fill: "#E57373" },
  { name: "Active Treatment", value: 150, fill: "#4CAF50" },
  { name: "Ready for Discharge", value: 100, fill: "#795548" },
  { name: "Discharged", value: 50, fill: "#9C27B0" },
  { name: "Post-Discharge", value: 25, fill: "#F48FB1" }
];

const pgNames = [
  "PG Alpha", "PG Beta", "PG Gamma", "PG Delta", "PG Epsilon",
  "PG Zeta", "PG Eta", "PG Theta", "PG Iota", "PG Kappa",
  "PG Lambda", "PG Mu", "PG Nu", "PG Xi", "PG Omicron"
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

const PGFunnel = () => {
  const { pgFunnelData, pgAssignments, movePgToStage } = useContext(FunnelDataContext) || {};
  const [expandedStage, setExpandedStage] = useState(null);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [selectedPG, setSelectedPG] = useState(null);

  if (!pgFunnelData || !pgAssignments) {
    return <div className="pg-funnel-container">Loading PG funnel data...</div>;
  }

  // Transform the funnel data to show PG counts instead of patient values
  const transformedFunnelData = pgFunnelData.map(stage => ({
    ...stage,
    value: pgAssignments[stage.name]?.length || 0
  }));

  const handleFunnelClick = (entry) => {
    if (entry.value === 0) return;
    setExpandedStage(entry.name);
    setShowMoveOptions(false);
    setSelectedPG(null);
  };

  const handleMovePG = (pg, currentStage) => {
    setSelectedPG(pg);
    setShowMoveOptions(true);
  };

  const handleMoveToStage = (targetStage) => {
    if (!selectedPG || !targetStage || !movePgToStage) return;
    movePgToStage(selectedPG, expandedStage, targetStage);
    setShowMoveOptions(false);
    setSelectedPG(null);
  };

  const handleBack = () => {
    setExpandedStage(null);
    setShowMoveOptions(false);
    setSelectedPG(null);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const stageName = payload[0].payload.name;
      const pgCount = pgAssignments[stageName]?.length || 0;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{stageName}</p>
          <p className="tooltip-value">PGs: {pgCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pg-funnel-container">
      <h3 className="funnel-title">PG Funnel</h3>

      {expandedStage ? (
        <div className="expanded-list">
          <div className="expanded-header">
            <h4>{expandedStage}</h4>
            <button className="back-button" onClick={handleBack}>
              ← Back to Funnel
            </button>
          </div>
          {pgAssignments[expandedStage]?.map((pg, index) => (
            <div key={index} className="pg-entry">
              {pg}
              {!showMoveOptions && (
                <button onClick={() => handleMovePG(pg, expandedStage)}>Move</button>
              )}
            </div>
          ))}
          {showMoveOptions && (
            <div className="move-options">
              <h5>Move {selectedPG} to:</h5>
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

export default PGFunnel;
