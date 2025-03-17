import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TrafficMetrics = () => {
  const [trafficData, setTrafficData] = useState({
    North: {},
    South: {},
    East: {},
    West: {},
  });

  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const directions = ['North', 'South', 'East', 'West'];
      const data = {};

      for (const direction of directions) {
        const response = await fetch(`http://localhost:3000/data/combined_traffic_data.csv`);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const directionData = result.data.find(item => item.Direction === direction);
            if (directionData) {
              data[direction] = directionData;
              if (Object.keys(data).length === directions.length) {
                setTrafficData(data);
              }
            }
          },
        });
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (event) => {
    setSelectedPage(event.target.value);
    navigate(event.target.value);
  };

  const normalizeData = (directionData) => {
    const trafficVolume = parseFloat(directionData.Traffic_Volume);
    const averageSpeed = parseFloat(directionData.Average_Speed_kmph);
    const queueLength = parseFloat(directionData.Queue_Length_meters);
    const trafficDensity = parseFloat(directionData.Traffic_Density_vehicles_per_meter);

    const maxTrafficVolume = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Traffic_Volume) || 1));
    const maxAverageSpeed = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Average_Speed_kmph) || 1));
    const maxQueueLength = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Queue_Length_meters) || 1));
    const maxTrafficDensity = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Traffic_Density_vehicles_per_meter) || 1));

    return [
      (trafficVolume / maxTrafficVolume) * 100,
      (averageSpeed / maxAverageSpeed) * 100,
      (queueLength / maxQueueLength) * 100,
      (trafficDensity / maxTrafficDensity) * 100,
    ];
  };

  const renderPieChart = (direction) => {
    const data = trafficData[direction];

    if (!data) return null;

    const chartData = {
      labels: ['Traffic Volume', 'Average Speed', 'Queue Length', 'Traffic Density'],
      datasets: [
        {
          label: 'Traffic Metrics',
          data: normalizeData(data),
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
        },
      ],
    };

    return (
      <div className="chart-container" style={styles.chartContainer} key={direction}>
        <h3>{`${direction} Direction`}</h3>
        <Pie data={chartData} />
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ color: 'black', fontSize: '2rem', textAlign: 'left', marginLeft: '2rem' }}>
        Traffic Data Trends
      </h2>
      <select value={selectedPage} onChange={handlePageChange} style={styles.dropdown}>
        <option value="/TrafficMetrics">Traffic Metrics</option>
        <option value="/Performance">Performance</option>
        <option value="/LengthVsSpeed">LengthVsSpeed</option>
        <option value="/TrafficVolume"> TrafficVolume</option>
      </select>
      <h1 style={{ color: 'black', fontSize: '1.5rem', textAlign: 'center' }}>
        Traffic Metrics (Normalized 0-100)
      </h1>
      <div style={styles.chartsGrid}>
        {['North', 'South', 'East', 'West'].map((direction) => renderPieChart(direction))}
      </div>
    </div>
  );
};

const styles = {
  dropdown: {
    padding: '0.5rem',
    fontSize: '1rem',
    marginTop: '1rem',
    marginLeft: '3rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 charts per row
    gap: '1rem',
    padding: '3rem',
    justifyItems: 'center', // Ensure charts are centered horizontally in grid
  },
  chartContainer: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: '400px',
    width: '90%', // Ensure it doesn't take full width of container
    display: 'flex',
    justifyContent: 'center', // Center content horizontally
    alignItems: 'center', // Center content vertically
    margin: 'auto', // Automatically center the container
  },
  pieChart: {
    width: '100%', // Ensure the chart takes up full width within the container
    maxWidth: '350px', // Set max width for the chart (optional, adjust as needed)
  },
};


export default TrafficMetrics;
