import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MetricsDisplay = () => {
    const [northMetrics, setNorthMetrics] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNorthMetrics = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/north-metrics');
                setNorthMetrics(response.data);
            } catch (err) {
                setError('Unable to fetch North metrics. Please try again later.');
            }
        };

        fetchNorthMetrics();
    }, []);

    return (
        <div>
            <h1>North Traffic Metrics</h1>
            {error && <p>{error}</p>}
            {northMetrics ? (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Traffic Volume</td>
                            <td>{parseFloat(northMetrics.Traffic_Volume).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Average Speed (km/h)</td>
                            <td>{parseFloat(northMetrics.Average_Speed_kmph).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Queue Length (meters)</td>
                            <td>{parseFloat(northMetrics.Queue_Length_meters).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Traffic Density (vehicles/meter)</td>
                            <td>{parseFloat(northMetrics.Traffic_Density_vehicles_per_meter).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            ) : (
                !error && <p>Loading...</p>
            )}
        </div>
    );
};

export default MetricsDisplay;
