import React from 'react';
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav style={styles.nav}>
      <h1 style={styles.title}>Swarm Traffic Manager</h1>
      <div style={styles.linkContainer}>
      
        <NavLink to="/" style={styles.link} activeStyle={styles.activeLink} end>Home</NavLink>
        <NavLink to="/Overview" style={styles.link} activeStyle={styles.activeLink}>Overview</NavLink>
        
        <NavLink to="/DataTrends" style={styles.link} activeStyle={styles.activeLink}>Traffic Data Trends</NavLink>
        <NavLink to="/VideoAnalysis" style={styles.link} activeStyle={styles.activeLink}>Video Analytics</NavLink>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#333',
    padding: '0.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position:"sticky",//these 2 lines make navbar visible even if you scroll down on the page
    top:0,//with above line
  },
  title: {
    color: '#fff',
    margin: '0 0 1rem 0',
    fontSize:"40px",
  },
  linkContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.2rem',
    padding: '0.5rem 3rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  activeLink: {
    backgroundColor: '#0056b3',
    color: '#fff',
  },
};

export default NavBar;