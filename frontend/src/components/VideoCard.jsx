import React from "react";
import { Link } from "react-router-dom";

const VideoCard = ({ direction, videoSrc, videoId }) => {
  return (
    <div className="video-card" style={styles.card}>
      <Link to={`/video/${videoId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3>{direction}</h3>
        <video
          src={videoSrc}
          controls
          autoPlay
          muted
          loop
          style={styles.video}
        ></video>
      </Link>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
  },
  video: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
};

export default VideoCard;
