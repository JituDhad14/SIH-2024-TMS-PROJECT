import React from 'react';

const MainCard = ({ title, description, link, image }) => {
  return (
    <div style={styles.card}>
      <img src={image} alt={title} style={styles.cardImage} />
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={link} style={styles.cardLink}>Go to {title}</a>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    width: '300px',  // Fixed width
    height: '350px', // Fixed height for consistency
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',  // Ensure nothing overflows
  },
  cardImage: {
    width: '100%',
    height: '150px',  // Fixed height for the image
    objectFit: 'cover',  // Keep image's aspect ratio
    borderRadius: '8px',
    marginBottom: '1rem', // Space between image and text
  },
  cardLink: {
    textDecoration: 'none',
    color: '#007BFF',
    marginTop: '1rem',
    fontWeight: 'bold',
  },
};

export default MainCard;
