import React, { useEffect, useState } from 'react';
import './TrafficSignal.css'; // For styling (optional)

const TrafficSignal = () => {
    const [timings, setTimings] = useState(null);

    // Fetch traffic timings from backend
    useEffect(() => {
        fetch('http://localhost:5000/api/traffic-timings')
            .then((response) => response.json())
            .then((data) => setTimings(data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    if (!timings) {
        return <div>Loading traffic signal data...</div>;
    }

    return (
        <div className="traffic-signal-container">
            <h1>Y-Junction Traffic Signal Timings</h1>
            <div className="traffic-signal">
                {Object.entries(timings).map(([direction, times]) => (
                    <div key={direction} className="signal-card">
                        <h2>{direction}</h2>
                        <p><b>Green:</b> {times["Green Time (sec)"]} sec</p>
                        <p><b>Red:</b> {times["Red Time (sec)"]} sec</p>
                        <p><b>Orange:</b> {times["Orange Time (sec)"]} sec</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrafficSignal;
