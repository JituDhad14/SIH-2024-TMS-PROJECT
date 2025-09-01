import React from 'react';
import { useNavigate } from 'react-router-dom';

const DataTrends = () => {
  const navigate = useNavigate();

  const handlePageChange = (event) => {
    navigate(event.target.value); // Navigate to the selected route
  };

  return (
    <select onChange={handlePageChange} style={styles.dropdown}>
      <option value="/TrafficVolume">Traffic Volume</option>
      <option value="/TrafficChart">Traffic Chart</option>
      <option value="/AverageSpeed">Average Speed</option>
      <option value="/QueueLength">Queue Length</option>
    </select>
  );
};

const styles = {
  dropdown: {
    padding: '0.5rem',
    fontSize: '1rem',
    margin: '1rem 0',
  },
};

export default DataTrends;
