import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import Papa from "papaparse";
import { useNavigate } from 'react-router-dom'; // For navigation
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LengthVsSpeed = () => {
  const [trafficData, setTrafficData] = useState({
    North: [],
    South: [],
    East: [],
    West: [],
  });

  const navigate = useNavigate(); // Hook for navigation
  const [selectedPage, setSelectedPage] = useState('');

  useEffect(() => {
    const directions = ["North", "South", "East", "West"];
    const fetchData = async () => {
      const data = {};
      for (const direction of directions) {
        const response = await fetch(
          `http://localhost:3000/data/metrics_${direction.toLowerCase()}.csv`
        );
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

  const renderChart = (direction) => {
    const data = trafficData[direction];
    const chartData = {
      labels: data.map((_, index) => `Point ${index + 1}`),
      datasets: [
        {
          label: "Queue Length (m)",
          data: data.map((item) => parseFloat(item.Queue_Length_meters) || 0),
          backgroundColor: "rgba(54, 162, 235, 0.7)", // Blue
        },
        {
          label: "Average Speed (km/h)",
          data: data.map((item) => parseFloat(item.Average_Speed_kmph) || 0),
          backgroundColor: "rgba(255, 99, 132, 0.7)", // Pink
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
      },
      scales: {
        x: { title: { display: true, text: "Data Points" } },
        y: { title: { display: true, text: "Value" }, beginAtZero: true },
      },
    };

    return (
      <div key={direction} style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>{direction} Direction</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
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
        {Object.keys(trafficData).map((direction) => renderChart(direction))}
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
    gap: "0.5rem",
    padding: "2rem",
  },
  chartContainer: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    height: "400px",
    width: "800px",
  },
};

export default LengthVsSpeed;
