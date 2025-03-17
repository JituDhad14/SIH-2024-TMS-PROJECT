import {
  DirectionsBus,
  ElectricRickshaw,
  TimeToLeave,
  TwoWheeler,
} from "@mui/icons-material";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import "./Junction.css"; 

function Junction({ csvFile, mode }) {
  const [trafficData, setTrafficData] = useState({
    north: { queue_length: 0, density: 0 },
    south: { queue_length: 0, density: 0 },
    east: { queue_length: 0, density: 0 },
    west: { queue_length: 0, density: 0 },
  });
  const [vehicles, setVehicles] = useState({
    north: [],
    south: [],
    east: [],
    west: [],
  });
  const [currentGreen, setCurrentGreen] = useState("north");
  const [signalTimes, setSignalTimes] = useState({
    north: 60,
    east: 60,
    south: 60,
    west: 60,
  });
  const [countdown, setCountdown] = useState(signalTimes.north);

  const roads = ["north", "east", "south", "west"];

  // Fetch and parse CSV data
  useEffect(() => {
    Papa.parse(csvFile, {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data.reduce((acc, row) => {
          acc[row.road] = {
            queue_length: parseInt(row.queue_length, 10) || 0,
            density: parseFloat(row.density) || 0,
          };
          return acc;
        }, {});
        setTrafficData(data);

        // Generate vehicles based on initial data
        const initialVehicles = {};
        for (const road of roads) {
          initialVehicles[road] = Array.from(
            { length: data[road]?.queue_length || 0 },
            (_, index) => ({
              id: `${road}-${index}`,
              type: Math.floor(Math.random() * 4), // Random vehicle type
            })
          );
        }
        setVehicles(initialVehicles);
      },
    });
  }, [csvFile]);

  // Update signal timings based on density for adaptive mode
  useEffect(() => {
    if (mode === "adaptive") {
      const newSignalTimes = {};
      for (const road of roads) {
        const density = trafficData[road]?.density || 0;
        newSignalTimes[road] = density >= 0.8 ? 15 : density >= 0.5 ? 10 : 5;
      }
      setSignalTimes(newSignalTimes);
    }
  }, [mode, trafficData]);

  // Handle traffic light transitions and countdown
  useEffect(() => {
    let index = roads.indexOf(currentGreen);
    let timeLeft = signalTimes[roads[index]];

    const interval = setInterval(() => {
      setCountdown(timeLeft);
      timeLeft--;

      if (timeLeft < 0) {
        index = (index + 1) % roads.length;
        setCurrentGreen(roads[index]);
        timeLeft = signalTimes[roads[index]];
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [signalTimes, currentGreen]);

  // Generate vehicle elements
  const renderVehicles = (road) => {
    if (!vehicles[road]) return null;

    const vehicleIcons = [
      <TimeToLeave className="vehicle-icon" />,
      <DirectionsBus className="vehicle-icon" />,
      <TwoWheeler className="vehicle-icon" />,
      <ElectricRickshaw className="vehicle-icon" />,
    ];

    return vehicles[road].map((vehicle, index) => {
      const isMoving = currentGreen === road;
      const delay = index * 0.5;

      return (
        <div
          className={`vehicle vehicle-${road} ${isMoving ? "moving" : ""}`}
          key={vehicle.id}
          style={{
            animationDelay: `${isMoving ? delay : 0}s`,
            top: road === "north" || road === "south" ? `${index * 50}px` : "auto",
            left: road === "east" || road === "west" ? `${index * 50}px` : "auto",
          }}
        >
          {vehicleIcons[vehicle.type]}
        </div>
      );
    });
  };

  // Render traffic signals with countdown
  const renderTrafficSignals = () => (
    <div className="traffic-signal">
      {roads.map((road) => (
        <div key={road} className="signal-container">
          <div className={ `light ${currentGreen === road ? "green" : ""}`}></div>
          {currentGreen === road && (
            <div className="countdown">{countdown}s</div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="junction-container">
      {roads.map((road) => (
        <div
          key={road}
          className={`road road-${road} ${currentGreen === road ? "green-light" : ""}`}
        >
          <div className="density-label">
            Density: {trafficData[road]?.density || 0}
          </div>
          {renderVehicles(road)}
        </div>
      ))}
      {renderTrafficSignals()}
      <div className="intersection"></div>
    </div>
  );
}

export default Junction;