import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/projects');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Submitting credentials:', credentials);
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      if (response.access_token) {
        console.log('Login successful, navigating to projects');
        // Force a small delay to ensure storage is complete
        setTimeout(() => {
          navigate('/projects', { replace: true });
        }, 100);
      } else {
        console.error('No access token in response');
        setError('Login failed: No access token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
        </div>
        <button type="submit">Login</button>
        <div className="form-footer">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} className="link">
            Register here
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login; 