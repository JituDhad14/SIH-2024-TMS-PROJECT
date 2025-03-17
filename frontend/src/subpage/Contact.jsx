import React from 'react';

const Contact = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact Us</h1>
      <p style={styles.infoText}>We'd love to hear from you! Reach out to us via the following methods:</p>
      <div style={styles.contactInfo}>
        <h3 style={styles.contactTitle}>Email</h3>
        <p style={styles.contactText}>contact@trafficapp.com</p>
      </div>
      <div style={styles.contactInfo}>
        <h3 style={styles.contactTitle}>Phone</h3>
        <p style={styles.contactText}>+1 (555) 123-4567</p>
      </div>
      <div style={styles.contactInfo}>
        <h3 style={styles.contactTitle}>Address</h3>
        <p style={styles.contactText}>123 Traffic St., City, Country</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: '#e8f5e9',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  infoText: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
  },
  contactInfo: {
    marginBottom: '1.5rem',
  },
  contactTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  contactText: {
    fontSize: '1.2rem',
    margin: '0.5rem 0',
  },
};

export default Contact;
