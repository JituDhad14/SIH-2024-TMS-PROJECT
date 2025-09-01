import React from 'react';
import MainCard from '../components/MainCard';
import { Link } from 'react-router-dom';
// Import images from the src/images directory
import videoImage from '../images/video.jpg';
import overviewImage from '../images/overview2.png';
import trendsImage from '../images/trends1.png';

const MainPage = () => {
  const cardsData = [
    { 
      title: 'Video Analytics', 
      description: 'Traffic analysis and reports', 
      link: '/VideoAnalysis', 
      image: videoImage, 
    },
    { 
      title: 'Overview', 
      description: 'View  traffic', 
      link: '/Overview', 
      image: overviewImage, 
    },
    { 
      title: 'Traffic Data Trends', 
      description: 'Traffic analysis and reports', 
      link: '/DataTrends', 
      image: trendsImage, 
    },
  ];

  return (
    <div style={styles.container}>
      {/* Content Section */}
      <div style={styles.content}>
        {cardsData.map((card, index) => (
          <MainCard key={index} {...card} />
        ))}
      </div>

      {/* Footer Section */}
      <footer style={styles.footer}>
        <Link to="/Settings">Settings</Link>
        <Link to="/Support">Support</Link>
        <Link to="/Contact">Contact</Link>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '200vh',
    //width:"2px",
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem',
    justifyContent: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0,5rem',
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #ccc',
  },
};

export default MainPage;
