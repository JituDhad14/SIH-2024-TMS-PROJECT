import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaCar, FaTachometerAlt, FaTrafficLight, FaTint } from 'react-icons/fa';
import 'react-circular-progressbar/dist/styles.css';
import Papa from 'papaparse';
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Overview = () => {
  const [trafficData, setTrafficData] = useState({
    North: {},
    South: {},
    East: {},
    West: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      const directions = ['North', 'South', 'East', 'West'];
      const data = {};

      for (const direction of directions) {
        const response = await fetch('http://localhost:3000/data/combined_traffic_data.csv');
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

  const normalizeData = (directionData) => {
    const trafficVolume = parseFloat(directionData.Traffic_Volume);
    const averageSpeed = parseFloat(directionData.Average_Speed_kmph);
    const queueLength = parseFloat(directionData.Queue_Length_meters);
    const trafficDensity = parseFloat(directionData.Traffic_Density_vehicles_per_meter);

    const maxTrafficVolume = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Traffic_Volume) || 1));
    const maxAverageSpeed = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Average_Speed_kmph) || 1));
    const maxQueueLength = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Queue_Length_meters) || 1));
    const maxTrafficDensity = Math.max(...Object.values(trafficData).map(data => parseFloat(data.Traffic_Density_vehicles_per_meter) || 1));

    return {
      trafficVolume: (trafficVolume / maxTrafficVolume) * 100,
      averageSpeed: (averageSpeed / maxAverageSpeed) * 100,
      queueLength: (queueLength / maxQueueLength) * 100,
      trafficDensity: (trafficDensity / maxTrafficDensity) * 100,
    };
  };

  const renderIcon = (type, value) => {
    const color = value > 70 ? '#D0312D' : value > 40 ? 'ED7014' : '32612D';
    switch (type) {
      case 'trafficVolume':
        return <FaCar style={{ color }} size={50} />;
      case 'averageSpeed':
        return <FaTachometerAlt style={{ color }} size={50} />;
      case 'queueLength':
        return <FaTrafficLight style={{ color }} size={50} />;
      case 'trafficDensity':
        return <FaTint style={{ color }} size={50} />;
      default:
        return null;
    }
  };

  const renderCard = (direction) => {
    const data = trafficData[direction];
    if (!data) return null;

    const { trafficVolume, averageSpeed, queueLength, trafficDensity } = normalizeData(data);

    return (
      <Col md={6} key={direction} style={styles.chartContainer}>
        <Card>
          <Card.Body>
            <h5 className="text-center">{direction} Direction</h5>
            <div style={styles.iconGrid}>
              <div style={styles.iconItem}>
                {renderIcon('trafficVolume', trafficVolume)}
                <p>Traffic Volume: {Math.round(trafficVolume)}%</p>
              </div>
              <div style={styles.iconItem}>
                {renderIcon('averageSpeed', averageSpeed)}
                <p>Avg Speed: {Math.round(averageSpeed)}%</p>
              </div>
              <div style={styles.iconItem}>
                {renderIcon('queueLength', queueLength)}
                <p>Queue Length: {Math.round(queueLength)}%</p>
              </div>
              <div style={styles.iconItem}>
                {renderIcon('trafficDensity', trafficDensity)}
                <p>Density: {Math.round(trafficDensity)}%</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };
  return (
    <Container>
      <h2 className="my-4 text-center" style={{ fontSize: '2rem' ,textAlign:'center'}}>
             Overview of Traffic Data
      </h2>
      <Row style={styles.chartsGrid}>
        {['North', 'South', 'East', 'West'].map(direction => renderCard(direction))}
      </Row>
    </Container>
  );
/*  
  return (
    <Container>
      <h2 className="my-4 text-center">Overview of Traffic Data</h2>
      <Row style={styles.chartsGrid}>
        {['North', 'South', 'East', 'West'].map(direction => renderCard(direction))}
      </Row>
    </Container>
  );*/
};

const styles = {
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 cards per row
    gap: '3rem',
    padding: '1rem',
    fontSize:'2rem',
  },
  chartContainer: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    height: '600px',
    width: '100%',
    
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 icons per row
    gap: '1rem',
    justifyItems: 'center',
    alignItems: 'center',
  },
  iconItem: {
    textAlign: 'center',
  },
};

export default Overview;
