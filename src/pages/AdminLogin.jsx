// pages/AdminLogin.jsx
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting admin login with:', credentials);
            const response = await adminLogin(credentials);
            
            if (response.data.success) {
                console.log('Login successful, token received');
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.user));
                
                // ✅ CORRECT PATH - matches App.js route
                navigate('/admin/dashboard');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
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
                        />
                    </div>

                    {error && (
                        <div className="vip-error-message">
                            <i className="fas fa-exclamation-circle"></i>
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
                                <i className="fas fa-shield-alt"></i>
                                Secured by AES-256 encryption
                            </p>
                        </div>
                    </div>
                </form>

                <div className="login-footer">
                    <p>© 2024 Shamsi Institute of Technology</p>
                    <p className="version">Version 2.0</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;