// src/pages/AdminLogin.jsx (اپڈیٹڈ)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, healthCheck, quickSetup } from '../services/api';
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
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    checkServerStatus();
    
    // Check if already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      console.log('✅ Found existing token, redirecting...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);
    }
  }, [navigate]);

  const checkServerStatus = async () => {
    try {
      console.log('🔍 Checking server status...');
      const health = await healthCheck();
      
      if (health.success) {
        setServerStatus('online');
        setDbStatus(health.database || 'Unknown');
        
        console.log('✅ Server is online');
        console.log('📊 Database status:', health.database);
        console.log('🌐 Environment:', health.environment);
        
        // Log the health response for debugging
        console.log('Health response:', {
          message: health.message,
          database: health.database,
          timestamp: health.timestamp
        });
      } else {
        setServerStatus('offline');
        console.warn('⚠️ Server responded but not healthy:', health.message);
      }
    } catch (error) {
      console.error('❌ Server check failed:', error.message);
      setServerStatus('offline');
      setDbStatus('error');
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
      console.log('🔐 Attempting login...');
      const response = await adminLogin(formData);
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const token = `admin-token-${Date.now()}`;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        
        console.log('✅ Login successful!');
        console.log('Token saved, user:', response.data.user);
        
        // Show success and redirect
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
        
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        setError('Invalid username or password');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.message.includes('Network Error') || error.message.includes('timeout')) {
        setError('Cannot connect to server. Please check if backend is running.');
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

  const handleRetryServer = () => {
    setServerStatus('checking');
    checkServerStatus();
  };

  const handleQuickSetup = async () => {
    if (window.confirm('This will setup admin with username: admin, password: admin123. Continue?')) {
      try {
        setLoading(true);
        const response = await quickSetup();
        
        if (response.data.success) {
          alert('✅ Admin setup successful!\n\nUsername: admin\nPassword: admin123\n\nTry logging in now.');
          setFormData({ username: 'admin', password: 'admin123' });
          setError('');
          // Auto-fill the form
        } else {
          alert('Setup failed: ' + response.data.message);
        }
      } catch (error) {
        alert('Setup error: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToRegister = () => {
    navigate('/register');
  };

  // Simple test function
  const handleTestBackend = async () => {
    try {
      const response = await fetch('https://backend-one-taupe-14.vercel.app/api/health');
      const data = await response.json();
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      alert('Test failed: ' + error.message);
    }
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
          
          <div className="status-info">
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
            
            {dbStatus && serverStatus === 'online' && (
              <div className={`db-status ${dbStatus.includes('✅') ? 'online' : dbStatus.includes('❌') ? 'offline' : 'checking'}`}>
                {dbStatus}
              </div>
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
                disabled={loading}
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
                disabled={loading}
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
            disabled={loading}
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

          <div className="helper-buttons">
            <button 
              type="button" 
              className="helper-btn test-btn"
              onClick={handleTestBackend}
              disabled={loading}
            >
              🔍 Test Backend
            </button>
            
            <button 
              type="button" 
              className="helper-btn setup-btn"
              onClick={handleQuickSetup}
              disabled={loading}
            >
              🔧 Setup Admin
            </button>
          </div>

          <div className="login-footer">
            <button 
              type="button" 
              className="back-btn"
              onClick={handleBackToRegister}
              disabled={loading}
            >
              ← Back to Registration
            </button>
            
            <div className="debug-info">
              <p className="debug-text">
                Backend URL: backend-one-taupe-14.vercel.app
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;