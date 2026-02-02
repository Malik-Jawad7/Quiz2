// src/pages/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, checkDashboardAccess } from '../services/api';
import { 
  FaUser, 
  FaLock, 
  FaSignInAlt, 
  FaSync
} from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import shamsiLogo from '../assets/shamsi-logo.jpg';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      console.log('✅ Found existing token, checking access...');
      
      // Check if we can access dashboard with current token
      checkDashboardAccess().then(result => {
        if (result.success) {
          console.log('✅ Token still valid, redirecting...');
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 100);
        } else {
          console.log('❌ Token expired or invalid:', result.message);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      });
    }
  }, [navigate]);

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
      console.log('🔐 Attempting login with:', formData);
      const response = await adminLogin(formData);
      
      console.log('📥 Full login response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (response.data?.success) {
        // 🔍 DEBUG: Check what token backend sends
        console.log('🔍 Searching for token in response...');
        
        // Check response data for token
        const responseData = response.data;
        let actualToken = null;
        
        // Look for token in various possible locations
        if (responseData.token) {
          actualToken = responseData.token;
          console.log('✅ Found token in response.data.token');
        } else if (responseData.accessToken) {
          actualToken = responseData.accessToken;
          console.log('✅ Found token in response.data.accessToken');
        } else if (responseData.authToken) {
          actualToken = responseData.authToken;
          console.log('✅ Found token in response.data.authToken');
        } else if (responseData.data?.token) {
          actualToken = responseData.data.token;
          console.log('✅ Found token in response.data.data.token');
        } else if (response.headers['authorization']) {
          actualToken = response.headers['authorization'];
          console.log('✅ Found token in response.headers.authorization');
        } else if (response.headers['Authorization']) {
          actualToken = response.headers['Authorization'];
          console.log('✅ Found token in response.headers.Authorization');
        }
        
        // Use found token or generate fallback
        const tokenToUse = actualToken || `admin-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('💾 Saving token:', tokenToUse);
        localStorage.setItem('adminToken', tokenToUse);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user || {}));
        
        console.log('✅ Login successful!');
        console.log('📋 User data:', response.data.user);
        
        // Test if dashboard is accessible with this token
        console.log('🔍 Testing dashboard access...');
        const accessCheck = await checkDashboardAccess();
        
        if (accessCheck.success) {
          console.log('🎉 Dashboard accessible! Redirecting...');
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500);
        } else {
          console.log('⚠️ Dashboard not accessible:', accessCheck.message);
          
          // Still redirect but show warning
          alert('Login successful! Some dashboard features may require additional permissions.');
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500);
        }
        
      } else {
        console.log('❌ Login failed:', response.data?.message);
        setError(response.data?.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
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

  const handleBackToRegister = () => {
    navigate('/register');
  };

  // Auto-fill for testing
  const handleTestCredentials = () => {
    setFormData({ 
      username: 'admin', 
      password: 'admin123' 
    });
    setError('');
    alert('Test credentials filled. Click Login button.');
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-image">
              <img 
                src={shamsiLogo} 
                alt="Shamsi Institute Logo" 
                className="shamsi-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23667eea'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="logo-text">
              <h1>Shamsi Institute</h1>
              <p>of Technology</p>
            </div>
          </div>
          
          <h2 className="welcome-text">Admin Login Portal</h2>
          <p className="subtitle">Secure access to management system</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">
              <FaUser className="label-icon" />
              Username
            </label>
            <div className="input-with-icon">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                autoComplete="username"
                disabled={loading}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaLock className="label-icon" />
              Password
            </label>
            <div className="input-with-icon">
              {/* <FaLock className="input-icon" /> */}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
                className="form-input"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FiAlertCircle className="error-icon" />
              <span className="error-text">{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSync className="spinner-icon" />
                <span className="btn-text">Authenticating...</span>
              </>
            ) : (
              <>
                <FaSignInAlt className="btn-icon" />
                <span className="btn-text">Login to Dashboard</span>
              </>
            )}
          </button>

          <div className="login-footer">
            <div className="button-group">
              <button 
                type="button" 
                className="back-btn"
                onClick={handleBackToRegister}
                disabled={loading}
              >
                <span className="back-text">← Back to Registration</span>
              </button>
              
              {/* <button 
                type="button" 
                className="test-btn"
                onClick={handleTestCredentials}
                disabled={loading}
              >
                <span className="test-text">Fill Test Credentials</span>
              </button> */}
            </div>
            
            {/* <div className="debug-info">
              <p className="debug-text">
                <small>Backend: localhost:5000/api</small>
              </p>
            </div> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;