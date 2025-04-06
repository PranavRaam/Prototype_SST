import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, Label } from "recharts";
import "../sa_view_css/PieChart.css"; // Importing CSS

// Raw numbers for the data (actual patient counts, aligning with platform data)
const rawData = [
  { name: "Remaining Patients", value: 3750, color: "#e0e6ed" },
  { name: "Patients Acquired", value: 1250, color: "#2c3e50" }
];

// Calculate total for percentages
const total = rawData.reduce((sum, entry) => sum + entry.value, 0);

// Create data with percentage values for display
const data = rawData.map(item => ({
  ...item,
  percentage: Math.round((item.value / total) * 100)
}));

const CustomPieChart = () => {
  const CustomTooltip = ({ active, payload, coordinate }) => {
    if (active && payload && payload.length) {
      const { x, y } = coordinate || {};
      const style = {
        left: x,
        top: y - 60, // Offset above the cursor
        transform: 'translateX(-50%)', // Center horizontally
      };

      // Format numbers with commas
      const formattedValue = payload[0].payload.value.toLocaleString();

      return (
        <div className="custom-tooltip" style={style}>
          <p>{payload[0].name}</p>
          <p className="tooltip-value">{formattedValue} patients</p>
          <p className="tooltip-percentage">{payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie segments showing both number and percentage
  const renderCustomizedLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, percentage } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label for segments with enough space
    if (percentage < 5) return null;
    
    // Format large numbers with commas
    const formattedValue = value.toLocaleString();

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        style={{ fontWeight: 'bold', fontSize: '16px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
      >
        {formattedValue} ({percentage}%)
      </text>
    );
  };

  // Custom legend that shows both raw numbers and percentages
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="custom-legend">
        {payload.map((entry, index) => {
          // Format numbers with commas
          const formattedValue = entry.payload.value.toLocaleString();
          
          return (
            <li key={`legend-item-${index}`} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: entry.color }} />
              <span className="legend-label">{entry.value}: {formattedValue} ({entry.payload.percentage}%)</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="piechart-container">
      <h3 className="chart-title">Patient Distribution</h3>
      <PieChart width={500} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          paddingAngle={5}
          dataKey="value"
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1000}
          animationEasing="ease-out"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip />}
          position={{ x: 0, y: 0 }}
          cursor={false}
        />
        <Legend 
          content={<CustomLegend />}
          verticalAlign="bottom" 
          height={50}
        />
      </PieChart>
    </div>
  );
};

export default CustomPieChart;
