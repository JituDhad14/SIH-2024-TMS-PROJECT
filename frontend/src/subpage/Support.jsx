import React, { useState } from 'react';

const Support = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Support request submitted! \nEmail: ${email} \nMessage: ${message}`);
    setEmail('');
    setMessage('');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Support</h1>
      <p style={styles.infoText}>Need help? Fill out the form below, and our support team will get back to you shortly.</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="message" style={styles.label}>Your Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question"
            required
            style={styles.textarea}
          />
        </div>
        <button type="submit" style={styles.submitButton}>Submit</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  infoText: {
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: '1rem',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'left',
  },
  label: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  textarea: {
    width: '100%',
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    minHeight: '150px',
  },
  submitButton: {
    padding: '0.8rem 2rem',
    fontSize: '1.1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Support;
