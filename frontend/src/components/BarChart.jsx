import React, { useEffect, useRef } from 'react';
import './BarChart.css';

const BarChart = ({ data, metric, label, color, onBarClick }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Find max value to scale the chart
    const maxValue = Math.max(...data.map(item => item[metric]));
    const chartHeight = 300; // Pixels
    
    // Clear any previous chart
    const chart = chartRef.current;
    if (!chart) return;
    
    chart.innerHTML = '';
    
    // Create bars
    data.forEach((item) => {
      const barHeight = (item[metric] / maxValue) * chartHeight;
      const barContainer = document.createElement('div');
      barContainer.className = 'bar-container';
      
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${barHeight}px`;
      bar.style.backgroundColor = color || '#4F46E5';
      
      const tooltip = document.createElement('div');
      tooltip.className = 'bar-tooltip';
      tooltip.textContent = `${item.name}: ${item[metric].toLocaleString()}`;
      
      const label = document.createElement('div');
      label.className = 'bar-label';
      label.textContent = item.name.split(',')[0]; // Show only the first part of the area name
      
      const value = document.createElement('div');
      value.className = 'bar-value';
      value.textContent = item[metric].toLocaleString();
      
      barContainer.appendChild(bar);
      barContainer.appendChild(tooltip);
      barContainer.appendChild(label);
      barContainer.appendChild(value);
      
      // Add click event listener
      if (onBarClick) {
        barContainer.addEventListener('click', () => onBarClick(item.name));
        barContainer.style.cursor = 'pointer';
      }
      
      chart.appendChild(barContainer);
    });
  }, [data, metric, color, onBarClick]);

  return (
    <div className="barchart-wrapper">
      <h3 className="chart-title">{label} by Statistical Area</h3>
      <div className="chart-container">
        <div className="bar-chart" ref={chartRef}></div>
      </div>
    </div>
  );
};

export default BarChart; 