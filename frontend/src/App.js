import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Add some CSS for the grid layout

const App = () => {
    const [videos, setVideos] = useState([]);
    const [emergencyData, setEmergencyData] = useState([]);

    useEffect(() => {
        // Fetch available videos
        const fetchVideos = async () => {
            try {
                const response = await axios.get('http://localhost:5000/videos');
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        // Fetch emergency data
        const fetchEmergencyData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/emergency-data');
                setEmergencyData(response.data);
            } catch (error) {
                console.error('Error fetching emergency data:', error);
            }
        };

        fetchVideos();
        fetchEmergencyData();
    }, []);

    return (
        <div>
            <h1>Emergency Vehicle Detection</h1>
            <div className="video-grid">
                {videos.map((video, index) => {
                    // Get corresponding emergency data for this video
                    const data = emergencyData.find(item => item.index === `Road ${index + 1}`) || {};

                    return (
                        <div key={index} className="video-container">
                            <video
                                src={`http://localhost:5000/video/${video}`}
                                controls
                                autoPlay
                                muted
                                loop
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <div className="overlay">
                                <p>{`Vehicles: ${data.vehicles || 'N/A'}`}</p>
                                <p>{`Emergency: ${data.emergency ? 'Yes' : 'No'}`}</p>
                                {data.emergency && (
                                    <p className="alert">🚨 Emergency Vehicle Detected!</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default App;
