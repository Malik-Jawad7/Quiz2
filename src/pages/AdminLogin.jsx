import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, checkDashboardAccess } from '../services/api';
import { 
  FaUser, 
  FaLock, 
  FaSignInAlt, 
  FaSync,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaShieldAlt
} from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
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

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      checkDashboardAccess().then(result => {
        if (result.success) {
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 100);
        } else {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      });
    }
  }, [navigate]);

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

    try {
      const directResponse = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const directData = await directResponse.json();
      
      if (directData.success) {
        if (directData.token) {
          localStorage.setItem('adminToken', directData.token);
          localStorage.setItem('adminUser', JSON.stringify(directData.user || {}));
          
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 500);
          return;
        }
      } else {
        setError(directData.message || 'Login failed');
        setLoading(false);
        return;
      }
    } catch (fetchError) {
      try {
        const loginData = await adminLogin(formData);
        
        if (loginData.success) {
          if (loginData.token) {
            localStorage.setItem('adminToken', loginData.token);
            localStorage.setItem('adminUser', JSON.stringify(loginData.user || {}));
            
            setTimeout(() => {
              navigate('/admin/dashboard');
            }, 500);
          } else {
            setError('Login succeeded but no token received');
            setLoading(false);
          }
        } else {
          setError(loginData.message || 'Invalid credentials');
          setLoading(false);
        }
      } catch (error) {
        if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
          setError('Cannot connect to server. Please ensure backend is running.');
        } else if (error.status === 401 || error.message?.includes('credentials')) {
          setError('Invalid username or password');
        } else {
          setError(error.message || 'An error occurred. Please try again.');
        }
        setLoading(false);
      }
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
                    placeholder="Enter your admin username"
                    required
                    autoComplete="username"
                    disabled={loading}
                    className="credential-input"
                    autoFocus
                  />
                  <div className="input-underline"></div>
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
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="credential-input"
                  />
                  <div className="input-underline"></div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="error-display">
                  <div className="error-content">
                    <FiAlertCircle className="error-icon" />
                    <span className="error-message">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading || !formValid}
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