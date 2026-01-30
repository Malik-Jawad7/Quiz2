// src/pages/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, healthCheck } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServerStatus();
    
    // Check if already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);
    }
  }, [navigate]);

  const checkServerStatus = async () => {
    try {
      const health = await healthCheck();
      if (health.success) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      console.error('Server check failed:', error);
      setServerStatus('offline');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const response = await adminLogin(formData);
      
      if (response.data && response.data.success) {
        // Generate a secure token
        const token = `admin-token-${Date.now()}-${Math.random().toString(36).substr(2)}`;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 200);
        
      } else {
        setError(response.data?.message || 'Invalid username or password');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Invalid username or password');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.message === 'Network Error') {
        setError('Cannot connect to server. Check if backend is running.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleBackToRegister = () => {
    navigate('/register');
  };

  const handleRetryServer = () => {
    setServerStatus('checking');
    checkServerStatus();
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
          </div>
          <h1>Admin Login</h1>
          <p>Shamsi Institute of Technology</p>
          
          <div className={`server-status ${serverStatus}`}>
            {serverStatus === 'checking' && '🔍 Checking server...'}
            {serverStatus === 'online' && '✅ Server is online'}
            {serverStatus === 'offline' && '❌ Server is offline'}
            {serverStatus === 'offline' && (
              <button onClick={handleRetryServer} className="retry-btn">
                Retry
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <span className="icon">👤</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                autoComplete="username"
                disabled={loading || serverStatus === 'offline'}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                disabled={loading || serverStatus === 'offline'}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading || serverStatus === 'offline'}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <div className="login-footer">
            <button 
              type="button" 
              className="back-btn"
              onClick={handleBackToRegister}
              disabled={loading}
            >
              ← Back to Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;