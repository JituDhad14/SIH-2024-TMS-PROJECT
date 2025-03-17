import React, { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import axios from "axios";

const VideoPage = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch the list of videos from the backend
    axios
      .get("http://localhost:5000/api/videos")
      .then((response) => {
        setVideos(response.data); // response.data should be an array of video filenames
      })
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  return (
    <div className="video-page" style={styles.videoPage}>
      {videos.map((video, index) => (
        <VideoCard
          key={index} // Assuming each video name is unique, use it as the key
          //videoId={Video ${index + 1}} // Assign video label (e.g., Video 1, Video 2)
          direction={`Road  ${index + 1}`} // Dynamically set direction (e.g., Road 1, Road 2)
          videoSrc={`http://localhost:5000/videos/${video}`} // Construct the video URL
        />
      ))}
    </div>
  );
};

const styles = {
  videoPage: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // Adjust layout
    gap: "1rem",
    padding: "2rem",
  },
};

export default VideoPage;