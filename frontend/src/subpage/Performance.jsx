import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom'; // For navigation
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register components globally
ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const Performance= () => {
  const [trafficData, setTrafficData] = useState({
    North: [],
    South: [],
    East: [],
    West: [],
  });

  const navigate = useNavigate(); // Hook for navigation
  const [selectedPage, setSelectedPage] = useState('');

  useEffect(() => {
    const directions = ['North', 'South', 'East', 'West'];
    const fetchData = async () => {
      const data = {};
      for (const direction of directions) {
        const response = await fetch(`http://localhost:3000/data/metrics_${direction.toLowerCase()}.csv`);
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            data[direction] = result.data;
            if (Object.keys(data).length === directions.length) {
              setTrafficData(data);
            }
          },
        });
      }
    };
    fetchData();
  }, []);

  const handlePageChange = (event) => {
    setSelectedPage(event.target.value);
    navigate(event.target.value); // Navigate to selected page
  };

  const renderLineChart = (direction) => {
    const data = trafficData[direction];
    const chartData = {
      labels: data.map((_, index) => `Point ${index + 1}`),
      datasets: [
        {
          label: 'Average Speed (km/h)',
          data: data.map((item) => parseFloat(item.Average_Speed_kmph) || 0),
          borderColor: 'rgba(75, 192, 192, 1)', // Green color
          fill: false,
          tension: 0.1,
        },
        {
          label: 'Queue Length (m)',
          data: data.map((item) => parseFloat(item.Queue_Length_meters) || 0),
          borderColor: 'rgba(153, 102, 255, 1)', // Purple color
          fill: false,
          tension: 0.1,
        },
        {
          label: 'Vehicle Count',
          data: data.map((item) => parseInt(item.Vehicle_Count, 10) || 0),
          borderColor: 'rgba(54, 162, 235, 1)', // Blue color
          fill: false,
          tension: 0.1,
        },
      ],
    };

    return (
      <div className="chart-container" style={styles.chartContainer} key={direction}>
        <h3>{`${direction} Direction`}</h3>
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Data Points',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  
  return (
    <div>
      <h2 style={{ color: 'black', fontSize: '2rem', textAlign: 'left',marginLeft:"2rem" }}>Traffic Data Trends</h2>
      <select value={selectedPage} onChange={handlePageChange} style={styles.dropdown}>
        <option value="/TrafficVolume">Traffic Volume</option>
        <option value="/Performance">Performance</option>
        <option value="/TrafficMetrics">TrafficMetrics</option>
        <option value="/LengthVsSpeed">LengthVsSpeed</option>
      </select>
      <h1 style={{ color: 'black', fontSize: '1.5rem', textAlign: 'center' }}>TrafficVolume,Queue Length & Vehicle Count</h1>
      <div style={styles.chartsGrid}>
        {Object.keys(trafficData).map((direction) => renderLineChart(direction))}
      </div>
    </div>
  );
};


const styles = {
  dropdown: {
    padding: "0.5rem",
    fontSize: "1rem",
    marginTop: "1rem",
    marginLeft:"2rem",
    
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "3rem",
    padding: "1rem",
  },
  chartContainer: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    height: "400px",
    width: "100%",
  },
};

export default Performance;