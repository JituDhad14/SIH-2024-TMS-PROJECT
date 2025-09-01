import React, { useState } from 'react';

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationSetting, setNotificationSetting] = useState('Enabled');

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleNotificationChange = (event) => {
    setNotificationSetting(event.target.value);
  };

  return (
    <div style={{ ...styles.container, backgroundColor: isDarkMode ? '#333' : '#f9f9f9' }}>
      <h1 style={styles.title}>Settings</h1>
      <div style={styles.setting}>
        <label style={styles.label}>Dark Mode:</label>
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={handleDarkModeToggle}
          style={styles.checkbox}
        />
      </div>
      <div style={styles.setting}>
        <label style={styles.label}>Notifications:</label>
        <select value={notificationSetting} onChange={handleNotificationChange} style={styles.select}>
          <option value="Enabled">Enabled</option>
          <option value="Disabled">Disabled</option>
        </select>
      </div>
      <div style={styles.setting}>
        <button style={styles.saveButton}>Save Changes</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
    minHeight: '100vh',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  setting: {
    margin: '1.5rem 0',
    fontSize: '1.2rem',
  },
  label: {
    marginRight: '1rem',
  },
  checkbox: {
    width: '20px',
    height: '20px',
  },
  select: {
    padding: '0.5rem',
    fontSize: '1rem',
  },
  saveButton: {
    padding: '0.8rem 2rem',
    fontSize: '1.1rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Settings;
