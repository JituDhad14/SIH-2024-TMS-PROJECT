import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const VideoDetail = () => {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [frameNumber, setFrameNumber] = useState(0);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Fetch video data
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/videos`);
        const video = response.data.find((v) => v.id.toString() === id);
        if (video) setVideoData(video);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();
  }, [id]);

  useEffect(() => {
    // Fetch traffic metrics when videoData is available
    const fetchMetricsData = async () => {
      try {
        if (!videoData) return;

        const response = await axios.get(`http://localhost:5000/api/traffic-data`);
        const metrics = response.data.find(
          (m) => m.direction.toLowerCase() === videoData.direction.toLowerCase()
        );
        console.log(metrics.url)
        if (metrics) {
          const metricsResponse = await axios.get(metrics.url);
          const parsedMetrics = parseAndSortCSV(metricsResponse.data);
          setMetricsData(parsedMetrics);
        }
      } catch (error) {
        console.error("Error fetching traffic metrics:", error);
      }
    };

    fetchMetricsData();
  }, [videoData]);

  const parseAndSortCSV = (data) => {
    const rows = data.split("\n");
    const keys = rows[0].split(",");
    const parsedData = rows.slice(1).map((row) => {
      const values = row.split(",");
      return keys.reduce((obj, key, index) => {
        obj[key.trim()] = values[index]?.trim();
        return obj;
      }, {});
    });

    return parsedData
      .filter((item) => item.Frame) // Filter out empty frames
      .map((item) => ({
        ...item,
        Frame: item.Frame.match(/\d+/) ? parseInt(item.Frame.match(/\d+/)[0], 10) : 0, // Extract numeric frame value
      }))
      .sort((a, b) => a.Frame - b.Frame); // Sort by frame number
  };

  useEffect(() => {
    // Frame number logic
    const frameRate = 1; // Assume 30 FPS for the video
    const interval = setInterval(() => {
      setFrameNumber((prev) => (prev + 10) % metricsData.length);
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [metricsData]);

  useEffect(() => {
    // Countdown logic
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!videoData || metricsData.length === 0) {
    return <h2>Loading...</h2>;
  }

  const currentMetrics = metricsData.find((metric) => metric.Frame === frameNumber) || {};

  return (
    <div style={styles.container}>
      <div style={styles.leftSection}>
        <video
          src={videoData.url}
          controls
          autoPlay
          muted
          loop
          style={styles.video}
        ></video>
        <h2 style={styles.directionLabel}>{videoData.direction}</h2>
      </div>
      <div style={styles.rightSection}>
        <div style={styles.metrics}>
          <p><strong>Frame:</strong> {frameNumber}</p>
          <p><strong>Vehicle Count:</strong> {currentMetrics["Vehicle_Count"] || "N/A"}</p>
          <p><strong>Average Speed (kmph):</strong> {currentMetrics["Average_Speed_kmph"] || "N/A"}</p>
          <p><strong>Queue Length (meters):</strong> {currentMetrics["Queue_Length_meters"] || "N/A"}</p>
          <p><strong>Congestion Level:</strong> {currentMetrics["Congestion_Level"] || "N/A"}</p>
          <p><strong>Traffic Density (vehicles per meter):</strong> {currentMetrics["Traffic_Density_vehicles_per_meter"] || "N/A"}</p>
        </div>
        <div style={styles.countdown}>
          <h3>Countdown:</h3>
          <p>{countdown}</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
  },
  leftSection: {
    flex: 1,
    textAlign: "center",
    marginRight: "40px",
  },
  video: {
    width: "100%",
    maxWidth: "800px",
    borderRadius: "12px",
  },
  directionLabel: {
    marginTop: "20px",
    fontSize: "28px",
    fontWeight: "bold",
  },
  rightSection: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: "10px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  metrics: {
    marginBottom: "60px",
  },
  countdown: {
    textAlign: "center",
  },
};

export default VideoDetail;
