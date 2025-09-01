import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse'; // CSV parser

const Login = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load users from CSV on component mount
  useEffect(() => {
    const csvFilePath = './data/users.csv'; // Path to CSV file in the public folder
    fetch(csvFilePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch users.csv');
        }
        return response.text();
      })
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true, // Parses CSV with headers (userID, password)
          complete: (result) => {
            if (result.errors.length === 0) {
              setUsers(result.data);
            } else {
              console.error('CSV Parsing Error:', result.errors);
              setError('Error loading user data. Please try again later.');
            }
          },
        });
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load user data.');
      });
  }, []);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (user) => user.userID === username && user.password === password
    );

    if (user) {
      setIsLoggedIn(true);
      navigate('/MainPage'); // Navigate to the dashboard
    } else {
      setError('Invalid userID or password');
    }
  };

  return (
    <div className="login-card">
      <div className="login-container">
        <div className="login-form">
          {!isLoggedIn ? (
            <>
              <h1>Smart Swayam</h1>
              <h2>Login</h2>
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="UserID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit">Login</button>
              </form>
            </>
          ) : (
            <p>Redirecting to dashboard...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
