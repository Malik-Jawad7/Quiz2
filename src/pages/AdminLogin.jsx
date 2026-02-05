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
  FaExclamationTriangle
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
  const [formValid, setFormValid] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [connectionTested, setConnectionTested] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    const result = await testServerConnection();
    if (result.success) {
      setServerStatus('connected');
    } else {
      setServerStatus('disconnected');
    }
    setConnectionTested(true);
  };

  useEffect(() => {
    const isValid = formData.username.trim() !== '' && formData.password.trim() !== '';
    setFormValid(isValid);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResetOption(false);

    if (!formValid) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const loginData = {
        username: formData.username.trim(),
        password: formData.password
      };

      console.log('🔄 Attempting login with:', loginData);
      
      const response = await adminLogin(loginData);

      if (response.success && response.token) {
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user || {}));

        console.log('✅ Login successful, redirecting...');
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setError(response.message || 'Invalid credentials');
        setShowResetOption(true);
        setLoading(false);
      }

    } catch (error) {
      console.error('Login error:', error);

      if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
        setError('Cannot connect to server. Please check your connection.');
      } else if (error.message?.includes('credentials') || error.message?.includes('401')) {
        setError('Invalid username or password');
        setShowResetOption(true);
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
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
    setServerStatus('checking');
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
      
      // Update form with default credentials
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
        {/* Header Section */}
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

        {/* Connection Status - ONLY SHOW WHEN DISCONNECTED */}
        {connectionTested && serverStatus === 'disconnected' && (
          <div className="connection-status-bar">
            <div className={`status-indicator ${serverStatus}`}>
              <div className="status-icon">
                <FaTimesCircle />
              </div>
              <span className="status-text">
                Server: Offline
              </span>
              <button
                type="button"
                className="retry-connection-btn"
                onClick={handleRetryConnection}
                disabled={loading}
              >
                <FaPlug /> Retry
              </button>
            </div>
          </div>
        )}

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

              {/* Reset Admin Button (shown on login failure) */}
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
                    This will reset admin to default credentials
                  </p>
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
                    <span className="btn-text">
                      {serverStatus === 'disconnected' ? 'Server Offline' : 'Sign In to Dashboard'}
                    </span>
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