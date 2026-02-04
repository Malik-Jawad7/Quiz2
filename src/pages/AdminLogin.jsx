import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, testServerConnection } from '../services/api';
import { 
  FaUser, 
  FaLock, 
  FaSignInAlt, 
  FaSync,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
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
  const [showPassword, setShowPassword] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    const result = await testServerConnection();
    if (result.success) {
      setServerStatus('connected');
    } else {
      setServerStatus('disconnected');
      setError('Cannot connect to server. Please ensure backend is running on port 5000.');
    }
  };

  useEffect(() => {
    const isValid = formData.username.trim() !== '' && formData.password.trim() !== '';
    setFormValid(isValid);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formValid) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    // If server is disconnected, show error
    if (serverStatus === 'disconnected') {
      setError('Cannot connect to server. Please start the backend server first.');
      setLoading(false);
      return;
    }

    try {
      // Try direct fetch first
      console.log('Attempting login...');
      
      // Try /admin/login endpoint
      let response;
      try {
        response = await fetch('http://localhost:5000/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          // If /admin/login fails, try /api/admin/login
          response = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
        }
      } catch (fetchError) {
        console.log('Fetch failed, trying apiService...');
        // If fetch fails, use apiService
        const loginData = await adminLogin(formData);
        
        if (loginData.success && loginData.token) {
          localStorage.setItem('adminToken', loginData.token);
          localStorage.setItem('adminUser', JSON.stringify(loginData.user || {}));
          
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500);
          return;
        } else {
          setError(loginData.message || 'Invalid credentials');
          setLoading(false);
          return;
        }
      }

      // Handle fetch response
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || `Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user || {}));
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
        setError('Cannot connect to server. Please ensure backend is running on port 5000.');
      } else if (error.message?.includes('credentials') || error.status === 401) {
        setError('Invalid username or password');
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  const handleRetryConnection = async () => {
    setLoading(true);
    await checkServerStatus();
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      {/* Server Status Banner */}
      <div className={`server-status-banner ${serverStatus}`}>
        <div className="status-content">
          {serverStatus === 'connected' ? (
            <>
              <FaCheckCircle className="status-icon" />
              <span>Server Connected</span>
            </>
          ) : serverStatus === 'disconnected' ? (
            <>
              <FaExclamationTriangle className="status-icon" />
              <span>Server Disconnected</span>
              <button 
                className="retry-connection-btn"
                onClick={handleRetryConnection}
                disabled={loading}
              >
                <FaSync className={loading ? 'spinning' : ''} />
                Retry
              </button>
            </>
          ) : (
            <>
              <FaSync className="status-icon spinning" />
              <span>Checking server connection...</span>
            </>
          )}
        </div>
      </div>
      
      <div className="admin-login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="header-content">
            <div className="logo-wrapper">
              <img 
                src={shamsiLogo} 
                alt="Shamsi Institute Logo" 
                className="institute-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%232563eb'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E";
                }}
              />
              <div className="institute-info">
                <h1 className="institute-name">Shamsi Institute</h1>
                <div className="admin-portal-tag">
                  <MdAdminPanelSettings className="admin-icon" />
                  <span className="admin-tagline">Secure Admin Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="login-form-section">
          <div className="form-title">
            <FaShieldAlt className="form-title-icon" />
            <h2>Administrator Login</h2>
          </div>
          
          {/* Test Credentials Banner */}
          <div className="test-credentials-banner">
            <FaExclamationTriangle className="test-icon" />
            <div className="test-info">
              <strong>Test Credentials:</strong> username: <code>admin</code>, password: <code>admin123</code>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-section">
              <div className="input-group">
                <label className="input-label">
                  <FaUser className="input-icon" />
                  Admin Username
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter admin username"
                    required
                    autoComplete="username"
                    disabled={loading || serverStatus === 'disconnected'}
                    className="credential-input"
                    autoFocus
                  />
                  <div className="input-underline"></div>
                </div>
                <div className="input-hint">Enter "admin" for testing</div>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <FaLock className="input-icon" />
                  Password
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    disabled={loading || serverStatus === 'disconnected'}
                    className="credential-input"
                  />
                  <div className="input-underline"></div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loading || serverStatus === 'disconnected'}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="input-hint">Enter "admin123" for testing</div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="error-display">
                  <div className="error-content">
                    <FaExclamationTriangle className="error-icon" />
                    <span className="error-message">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading || !formValid || serverStatus === 'disconnected'}
              >
                {loading ? (
                  <>
                    <FaSync className="loading-spinner" />
                    <span className="btn-text">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="btn-icon" />
                    <span className="btn-text">Sign In to Dashboard</span>
                  </>
                )}
              </button>

              {/* Register Button */}
              <div className="action-buttons">
                <button 
                  type="button" 
                  className="register-btn"
                  onClick={handleGoToRegister}
                  disabled={loading}
                >
                  <FaUserPlus className="register-icon" />
                  <span>Go to Registration Portal</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">
            © {new Date().getFullYear()} Shamsi Institute. All rights reserved.
          </p>
          <p className="footer-subtext">
            For authorized personnel only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;