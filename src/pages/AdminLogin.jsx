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
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    console.log('AdminLogin mounted');
    console.log('Current path:', window.location.pathname);
    console.log('LocalStorage token:', localStorage.getItem('adminToken'));
    
    checkServerStatus();
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminToken && adminUser) {
      console.log('Found existing auth, redirecting to dashboard');
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
    setDebugInfo(null);

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', formData);
      const response = await adminLogin(formData);
      console.log('Full login response:', response);
      
      // FIXED: Check response.data.success instead of response.success
      if (response.data && response.data.success) {
        // Generate a proper token
        const token = `admin-token-${Date.now()}`;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        
        console.log('✅ Login successful! Token saved:', {
          token: token,
          user: response.data.user
        });
        
        // Show success message
        alert('✅ Login successful! Redirecting to dashboard...');
        
        // Add small delay to ensure state updates
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 200);
        
      } else {
        setError(response.data?.message || 'Login failed. Invalid credentials');
        setDebugInfo({
          message: 'Server returned false for success',
          response: response.data
        });
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setDebugInfo({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        setError('Invalid username or password. Try: admin / admin123');
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

  const handleQuickLogin = () => {
    setFormData({ username: 'admin', password: 'admin123' });
    setError('');
  };

  const handleRetryServer = () => {
    setServerStatus('checking');
    checkServerStatus();
  };

  const handleResetAdmin = async () => {
    if (window.confirm('Reset admin password to "admin123"? This will fix login issues.')) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'admin',
            newPassword: 'admin123'
          })
        });
        
        const data = await response.json();
        if (data.success) {
          alert('✅ Admin password reset successfully! Try logging in again.');
          setFormData({ username: 'admin', password: 'admin123' });
          setError('');
        } else {
          alert('❌ Failed to reset admin password: ' + data.message);
        }
      } catch (error) {
        alert('❌ Error resetting admin: ' + error.message);
      }
    }
  };

  const handleCheckAdmin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users/debug');
      const data = await response.json();
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      alert('Error checking admin: ' + error.message);
    }
  };

  // Temporary debug function
  const handleTestNavigation = () => {
    console.log('Testing navigation...');
    console.log('Token:', localStorage.getItem('adminToken'));
    console.log('User:', localStorage.getItem('adminUser'));
    
    // Manually set auth and navigate
    localStorage.setItem('adminToken', 'test-token-' + Date.now());
    localStorage.setItem('adminUser', JSON.stringify({
      username: 'admin',
      role: 'admin',
      email: 'admin@shamsi.edu.pk'
    }));
    
    setTimeout(() => {
      navigate('/admin/dashboard');
    }, 100);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon"></span>
          </div>
          <h1>Admin Login</h1>
          <p>Enter credentials to access dashboard</p>
          
          <div className={`server-status ${serverStatus}`}>
            {serverStatus === 'checking' && 'Checking server...'}
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
              <span className="icon"></span>
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
              <span className="icon"></span>
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

          <div className="login-buttons">
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
                <>
                  <span>→</span>
                  Login
                </>
              )}
            </button>

            <button 
              type="button" 
              className="quick-btn"
              onClick={handleQuickLogin}
              disabled={loading || serverStatus === 'offline'}
            >
              <span>⚡</span>
              Quick Login
            </button>
          </div>

          {debugInfo && (
            <div className="debug-info">
              <details>
                <summary>Debug Information</summary>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </details>
            </div>
          )}

          <div className="login-footer">
            <button 
              type="button" 
              className="back-btn"
              onClick={handleBackToRegister}
              disabled={loading}
            >
              <span>←</span>
              Back to Registration
            </button>
            
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 