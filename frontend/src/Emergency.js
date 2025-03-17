import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Emergency.css';

const App = () => {
    const [videos, setVideos] = useState([]);
    const [emergencyData, setEmergencyData] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [shownNotifications, setShownNotifications] = useState(new Set()); // Track shown notifications
    const videoRefs = useRef([]); // To hold references to video elements

    // Fetch videos and emergency data
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/videos');
                setVideos(data);
            } catch (err) {
                console.error('Error fetching videos:', err);
            }
        };

        const fetchEmergencyData = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/emergency-data');
                setEmergencyData(data);
            } catch (err) {
                console.error('Error fetching emergency data:', err);
            }
        };

        fetchVideos();
        fetchEmergencyData();
    }, []);

    // Handle notifications based on emergency data
    useEffect(() => {
        emergencyData.forEach((data) => {
            if (data.emergency && !shownNotifications.has(data.index)) {
                setNotifications((prev) => [
                    ...prev,
                    `{ message: Emergency vehicle detected in ${data.index}!,  id: Date.now() }`
                ]);
                setShownNotifications((prev) => new Set(prev).add(data.index));
            }
        });
    }, [emergencyData, shownNotifications]);

    // Automatically hide notifications after 10 seconds
    useEffect(() => {
        if (notifications.length > 0) {
            const lastNotification = notifications[notifications.length - 1];
            const timer = setTimeout(() => {
                setNotifications((prev) => prev.filter((notif) => notif.id !== lastNotification.id));
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [notifications]);

    // Function to handle video play in sequence
    const playVideosSequentially = async () => {
        const videoOrder = [1, 0, 2, 3]; // This is the order in which videos should play: [2, 1, 3, 4]

        for (let i = 0; i < videoOrder.length; i++) {
            const videoIndex = videoOrder[i];
            const currentVideo = videoRefs.current[videoIndex];

            // Pause all other videos
            videoRefs.current.forEach((video, index) => {
                if (index !== videoIndex) {
                    video.pause();
                    video.currentTime = 0;
                }
            });

            // Play the current video
            currentVideo.play();

            // Wait for the video to finish before starting the next
            await new Promise((resolve) => {
                currentVideo.onended = () => {
                    if (videoIndex === 1) { // If the second video has ended
                        handleSecondVideoEnd(); // Handle the 2nd video's end
                    }
                    resolve(); // Resolve the promise when the video ends
                };
            });
        }
    };

    const handleSecondVideoEnd = () => {
        // Update the emergency status for the second video (Road 2) to 'No' and remove the detected message
        setEmergencyData((prevData) => {
            return prevData.map((item) => {
                if (item.index === 'Road 2') {
                    return { ...item, emergency: false };
                }
                return item;
            });
        });
    };

    // Start playing videos when the component mounts
    useEffect(() => {
        if (videos.length > 0) {
            playVideosSequentially(); // Start playing videos in the defined order
        }
    }, [videos]);

    return (
        <div>
            <h1>Emergency Vehicle Detection</h1>
            <div className="notifications">
                {notifications.map((notif) => (
                    <div key={notif.id} className="notification">
                        <p>{notif.message}</p>
                    </div>
                ))}
            </div>
            <div className="video-grid">
                {videos.map((video, index) => {
                    const data = emergencyData.find(item => item.index === Road `${index + 1}`) || {};
                    return (
                        <div key={index} className="video-container">
                            <video
                                ref={(el) => (videoRefs.current[index] = el)}
                                src={`http://localhost:5000/video/${video}`} // Ensure the path is correct
                                controls={false} // No controls (you can make this true if you want)
                                muted={true} // Mute all videos by default
                                loop={false} // No looping
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