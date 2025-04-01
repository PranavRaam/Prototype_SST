import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "../sa_view_css/PieChart.css"; // Importing CSS

const data = [
  { name: "Remaining Patients", value: 90, color: "#e0e6ed" },
  { name: "Patients Acquired", value: 10, color: "#2c3e50" }
];

const CustomPieChart = () => {
  const CustomTooltip = ({ active, payload, coordinate }) => {
    if (active && payload && payload.length) {
      const { x, y } = coordinate || {};
      const style = {
        left: x,
        top: y - 60, // Offset above the cursor
        transform: 'translateX(-50%)', // Center horizontally
      };

      return (
        <div className="custom-tooltip" style={style}>
          <p>{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
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
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="legend-text">{value}</span>}
        />
      </PieChart>
    </div>
  );
};

export default CustomPieChart;
