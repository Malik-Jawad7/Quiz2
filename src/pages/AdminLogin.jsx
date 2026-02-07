import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, testServerConnection, resetAdmin } from '../services/api';
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaShieldAlt,
  FaPlug,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaServer,
  FaNetworkWired,
  FaInfoCircle
} from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import shamsiLogo from '../assets/shamsi-logo.jpg';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [connectionTested, setConnectionTested] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    checkServerStatus();
    
    // Auto-retry after 5 seconds if disconnected
    const interval = setInterval(() => {
      if (serverStatus === 'disconnected' && !loading) {
        checkServerStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [serverStatus]);

  const checkServerStatus = async () => {
    console.log('🔄 Checking server status...');
    setConnectionTested(false);
    
    const result = await testServerConnection();
    console.log('Server check result:', result);
    
    if (result.success) {
      setServerStatus('connected');
      setDebugInfo({
        url: result.url,
        database: result.data?.database,
        message: result.message
      });
    } else {
      setServerStatus('disconnected');
      setDebugInfo({
        url: result.url,
        error: result.error,
        details: result.details
      });
    }
    
    setConnectionTested(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResetOption(false);

    try {
      const loginData = {
        username: formData.username.trim(),
        password: formData.password
      };

      console.log('🔄 Attempting login...');
      
      const response = await adminLogin(loginData);

      if (response.success && response.token) {
        localStorage.setItem('adminToken', response.token);
        console.log('✅ Login successful');
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setError(response.message || 'Invalid credentials');
        setShowResetOption(true);
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Starting offline mode...');
        
        // Try offline mode
        if (formData.username === 'admin' && formData.password === 'admin123') {
          const fallbackToken = 'offline_token_' + Date.now();
          localStorage.setItem('adminToken', fallbackToken);
          
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 1000);
        }
      } else {
        setError(error.message || 'Login failed');
        setShowResetOption(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    setShowResetOption(false);
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

  const handleResetAdmin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await resetAdmin();
      setError('✅ Admin reset successfully! Try logging in again.');
      setShowResetOption(false);
      
      setFormData({
        username: 'admin',
        password: 'admin123'
      });
      
    } catch (error) {
      setError('❌ Failed to reset admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Header */}
        <div className="login-header">
          <div className="header-content">
            <div className="logo-wrapper">
              <img
                src={shamsiLogo}
                alt="Shamsi Institute Logo"
                className="institute-logo"
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

        {/* Connection Status */}
        <div className="connection-status-bar">
          <div className={`status-indicator ${serverStatus}`}>
            <div className="status-icon">
              {serverStatus === 'connected' ? <FaCheckCircle /> : 
               serverStatus === 'checking' ? <FaSync className="spinning" /> : 
               <FaTimesCircle />}
            </div>
            <span className="status-text">
              Server: {serverStatus === 'connected' ? 'Online' : 
                      serverStatus === 'checking' ? 'Checking...' : 'Offline'}
            </span>
            <button
              type="button"
              className="retry-connection-btn"
              onClick={handleRetryConnection}
              disabled={loading}
            >
              <FaSync /> Retry
            </button>
          </div>
          
          {debugInfo && (
            <div className="debug-info">
              <div className="debug-item">
                <FaNetworkWired /> URL: {debugInfo.url}
              </div>
              {debugInfo.database && (
                <div className="debug-item">
                  <FaServer /> Database: {debugInfo.database}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="login-form-section">
          <div className="form-title">
            <FaShieldAlt className="form-title-icon" />
            <h2>Administrator Login</h2>
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
                    disabled={loading}
                    className="credential-input"
                    autoFocus
                  />
                </div>
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
                    disabled={loading}
                    className="credential-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className={`error-display ${error.includes('✅') ? 'success' : ''}`}>
                  <div className="error-content">
                    <FaExclamationTriangle className="error-icon" />
                    <span className="error-message">{error}</span>
                  </div>
                </div>
              )}

              {/* Reset Admin Option */}
              {showResetOption && (
                <div className="reset-admin-section">
                  <button
                    type="button"
                    className="reset-admin-btn"
                    onClick={handleResetAdmin}
                    disabled={loading}
                  >
                    <FaSync className="reset-icon" />
                    <span>Reset Admin Credentials</span>
                  </button>
                  <p className="reset-note">
                    This will reset admin to default: admin / admin123
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
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
              
              {/* Connection Help */}
              {serverStatus === 'disconnected' && (
                <div className="connection-help">
                  <FaInfoCircle className="help-icon" />
                  <p className="help-text">
                    If server is offline, try:
                    <br />1. Make sure backend is running on port 5000
                    <br />2. Check if http://localhost:5000 is accessible
                    <br />3. Try using default credentials: admin / admin123
                  </p>
                </div>
              )}
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