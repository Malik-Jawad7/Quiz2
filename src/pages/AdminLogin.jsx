// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!credentials.username.trim() || !credentials.password.trim()) {
            setError('Please enter both username and password');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            console.log('🌐 Sending login request...');
            console.log('📤 Credentials:', credentials);
            console.log('🚀 Backend URL: https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app');
            
            const response = await adminLogin(credentials);
            console.log('✅ Login response:', response.data);
            
            if (response.data.success) {
                console.log('🎉 Login successful!');
                console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
                console.log('👤 User data:', response.data.user);
                
                // Store token and user data
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.user));
                
                // Show success message
                setError('✅ Login successful! Redirecting...');
                
                // Redirect after short delay
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1000);
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error('❌ Login error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config
            });
            
            // Show user-friendly error messages
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                switch (err.response.status) {
                    case 401:
                        setError('Invalid username or password');
                        break;
                    case 404:
                        setError('Backend server not found. Please check if backend is running.');
                        break;
                    case 500:
                        setError('Server error. Please try again later.');
                        break;
                    default:
                        setError(err.response.data?.message || 'Login failed');
                }
            } else if (err.request) {
                // The request was made but no response was received
                console.log('❌ No response received. Check backend URL:', err.config?.url);
                setError('Cannot connect to server. Please check your internet connection or backend URL.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('Login failed: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Test backend connection
    const testBackendConnection = async () => {
        try {
            setError('Testing connection...');
            const response = await fetch('https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app/api/health');
            const data = await response.json();
            setError(`✅ Backend is running! Status: ${data.message}`);
            console.log('Backend health check:', data);
        } catch (error) {
            setError(`❌ Cannot connect to backend: ${error.message}`);
            console.error('Backend test failed:', error);
        }
    };

    return (
        <div className="vip-admin-login-container">
            <div className="vip-admin-login-card">
                
                <div className="login-header">
                    <div className="institute-logo">
                        <div className="logo-circle">
                            <i className="fas fa-university"></i>
                        </div>
                        <h2>Shamsi Institute</h2>
                        <p>Admin Portal</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="vip-login-form">
                    <div className="vip-form-group">
                        <label htmlFor="username">
                            <i className="fas fa-user-shield"></i>
                            Administrator ID
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="Enter admin username"
                            required
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <div className="vip-form-group">
                        <label htmlFor="password">
                            <i className="fas fa-key"></i>
                            Security Key
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter secure password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className={`vip-error-message ${error.includes('✅') ? 'success' : ''}`}>
                            <i className={`fas ${error.includes('✅') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="vip-login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="vip-loading-spinner"></span>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                Access Dashboard
                            </>
                        )}
                    </button>

                    {/* Connection Test Button */}
                    <button
                        type="button"
                        className="vip-test-connection-btn"
                        onClick={testBackendConnection}
                        disabled={loading}
                    >
                        <i className="fas fa-wifi"></i>
                        Test Backend Connection
                    </button>

                    {/* Back to Main Site */}
                    <button
                        type="button"
                        className="vip-back-to-site-btn"
                        onClick={() => navigate('/')}
                        disabled={loading}
                    >
                        <i className="fas fa-arrow-left"></i>
                        Back to Student Portal
                    </button>

                    <div className="vip-login-info">
                        <div className="demo-credentials">
                            <h4><i className="fas fa-key"></i> Demo Credentials:</h4>
                            <div className="credential-item">
                                <span className="label">Username:</span>
                                <code>admin</code>
                            </div>
                            <div className="credential-item">
                                <span className="label">Password:</span>
                                <code>admin123</code>
                            </div>
                        </div>
                        
                        <div className="security-info">
                            <p>
                                <i className="fas fa-server"></i>
                                Backend URL: backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app
                            </p>
                            <p>
                                <i className="fas fa-shield-alt"></i>
                                Secured by JWT Authentication
                            </p>
                        </div>
                    </div>
                </form>

                <div className="login-footer">
                    <p>© 2024 Shamsi Institute of Technology</p>
                    <p className="version">Admin Panel v2.0</p>
                    <p className="backend-status">
                        <i className="fas fa-circle"></i> 
                        Backend Status: <span id="backendStatus">Checking...</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;