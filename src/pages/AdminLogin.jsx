// AdminLogin.jsx - Clean Professional UI
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
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
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminLogin(formData);
      
      if (response.data?.success) {
        localStorage.setItem('adminToken', response.data.token || 'admin-authenticated');
        localStorage.setItem('adminUser', JSON.stringify(response.data.user || { username: 'admin' }));
        
        alert('✅ Login successful! Redirecting to dashboard...');
        navigate('/admin/dashboard');
      } else {
        setError(response.data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials or server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBackToRegister = () => {
    navigate('/register');
  };

  const handleQuickLogin = () => {
    setFormData({ username: 'admin', password: 'admin123' });
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      document.querySelector('.login-form').dispatchEvent(submitEvent);
    }, 100);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🔐</span>
          </div>
          <h1>Admin Login</h1>
          <p>Enter credentials to access dashboard</p>
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
              disabled={loading}
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
              disabled={loading}
            >
              <span>⚡</span>
              Quick Login
            </button>
          </div>

          <div className="login-footer">
            <button 
              type="button" 
              className="back-btn"
              onClick={handleBackToRegister}
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