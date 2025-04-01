import React from "react";
import PieChart from "./PieChart";
import PGFunnel from "./PGFunnel";
import HHAHFunnel from "./HHAHFunnel";
import "../sa_view_css/ChartsSection.css"; // Importing CSS

const ChartsSection = () => {
  return (
    <div className="charts-section">
      <PieChart />
      <PGFunnel />
      <HHAHFunnel />
    </div>
  );
};

export default ChartsSection;
