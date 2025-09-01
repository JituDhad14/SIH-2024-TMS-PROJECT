import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,  // Import PointElement
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary elements including PointElement
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const TrafficVolume = () => {
  const [trafficData, setTrafficData] = useState({
    North: [],
    South: [],
    East: [],
    West: [],
  });

  const navigate = useNavigate();
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
            console.log(`Data for ${direction}:`, result.data); // Debug: Log parsed data
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
    navigate(event.target.value);
  };

  const scaleToHundred = (data) => {
    const maxValue = Math.max(...data.map((value) => parseFloat(value) || 0));
    console.log('Max value for scaling:', maxValue); // Debug: Log max value
    return maxValue > 0 ? data.map((value) => ((parseFloat(value) || 0) / maxValue) * 100) : data.map(() => 0);
  };

  const renderLineChart = (direction) => {
    const data = trafficData[direction];

    const vehicleCountData = scaleToHundred(data.map((item) => item.Vehicle_Count));
    const trafficDensityData = scaleToHundred(data.map((item) => item.Traffic_Density_per_Meter));

    console.log(`${direction} Vehicle Count Data (scaled):`, vehicleCountData); // Debug: Log scaled vehicle count
    console.log(`${direction} Traffic Density Data (scaled):`, trafficDensityData); // Debug: Log scaled traffic density

    const chartData = {
      labels: data.map((_, index) => `Point ${index + 1}`),
      datasets: [
        {
          label: 'Vehicle Count (0-100)',
          data: vehicleCountData,
          borderColor: 'rgba(54, 162, 235, 1)', // Blue color
          fill: false,
          tension: 0.1,
          pointRadius: 5, // Add points to the line
          pointBackgroundColor: 'rgba(54, 162, 235, 1)', // Same color as the line
          pointBorderColor: 'rgba(255, 255, 255, 1)', // White border around points
        },
        {
          label: 'Traffic Density per Meter (0-100)',
          data: trafficDensityData,
          borderColor: 'rgba(255, 99, 132, 1)', // Red color
          fill: false,
          tension: 0.1,
          pointRadius: 5, // Add points to the line
          pointBackgroundColor: 'rgba(255, 99, 132, 1)', // Same color as the line
          pointBorderColor: 'rgba(255, 255, 255, 1)', // White border around points
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
            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
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
          text: 'Value (0-100)',
        },
        min: 0,
        max: 100, // Set y-axis scale to 0-100
      },
    },
  };

  return (
    <div>
      <h2 style={{ color: 'black', fontSize: '2rem', textAlign: 'left', marginLeft: '2rem' }}>
        Traffic Data Trends
      </h2>
      <select value={selectedPage} onChange={handlePageChange} style={styles.dropdown}>
        <option value="/TrafficVolume">Traffic Volume</option>
        <option value="/Performance">Performance</option>
        <option value="/TrafficMetrics">TrafficMetrics</option>
        <option value="/LengthVsSpeed">LengthVsSpeed</option>
      </select>
      <h1 style={{ color: 'black', fontSize: '1.5rem', textAlign: 'center' }}>
        Vehicle Count & Traffic Density (0-100)
      </h1>
      <div style={styles.chartsGrid}>
        {Object.keys(trafficData).map((direction) => renderLineChart(direction))}
      </div>
    </div>
  );
};

const styles = {
  dropdown: {
    padding: '0.5rem',
    fontSize: '1rem',
    marginTop: '1rem',
    marginLeft:'3rem',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 charts per row
    gap: '3rem',
    padding: '3rem',
  },
  chartContainer: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: '400px',
    width: '100%',
  },
};

export default TrafficVolume;
