import React, { useState, useEffect } from 'react';
import { adminLogin, checkHealth, testDatabase } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: 'admin',
        password: 'admin123'
    });
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [backendUrl, setBackendUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Get backend URL from environment
        const url = import.meta.env.PROD 
            ? 'https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app'
            : 'http://localhost:5000';
        setBackendUrl(url);
        
        // Check backend connection on load
        checkBackendConnection();
    }, []);

    const checkBackendConnection = async () => {
        try {
            setBackendStatus('checking');
            const response = await checkHealth();
            if (response.data.success) {
                setBackendStatus('connected');
            } else {
                setBackendStatus('disconnected');
            }
        } catch (error) {
            console.error('Backend check failed:', error);
            setBackendStatus('disconnected');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await adminLogin(credentials);
            
            if (response.data.success) {
                // Save token and user info
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.user));
                
                // Redirect to dashboard
                window.location.href = '/admin/dashboard';
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || 'Connection failed. Check backend URL.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setLoading(true);
        try {
            const response = await testDatabase();
            if (response.data.success) {
                alert(`✅ Database connected successfully!\n\nUsers: ${response.data.counts?.users}\nQuestions: ${response.data.counts?.questions}\nAdmins: ${response.data.counts?.admins}`);
            } else {
                alert(`❌ ${response.data.message || 'Database connection failed'}`);
            }
        } catch (error) {
            alert(`❌ Connection failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAccessDashboard = () => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            window.location.href = '/admin/dashboard';
        } else {
            setError('Please login first');
        }
    };

    const handleDemoLogin = () => {
        setCredentials({
            username: 'admin',
            password: 'admin123'
        });
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                {/* Header */}
                <div className="login-header">
                    <img src="/images.jpg" alt="Shamsi Institute Logo" className="login-logo" />
                    <h1>Shamsi Institute</h1>
                    <h2>Admin Portal</h2>
                    <div className={`backend-status ${backendStatus}`}>
                        <span className="status-dot"></span>
                        <span className="status-text">
                            Backend Status: {backendStatus === 'connected' ? '✅ Connected' : 
                                           backendStatus === 'checking' ? '🔄 Checking...' : 
                                           '❌ Disconnected'}
                        </span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Administrator ID</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleInputChange}
                            placeholder="Enter admin username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Security Key</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-buttons">
                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? '🔐 Logging in...' : '🔓 Access Dashboard'}
                        </button>

                        <button 
                            type="button" 
                            className="test-btn"
                            onClick={handleTestConnection}
                            disabled={loading}
                        >
                            🔧 Test Backend Connection
                        </button>
                    </div>
                </form>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button 
                        onClick={handleAccessDashboard}
                        className="dashboard-btn"
                    >
                        📊 Access Dashboard
                    </button>
                    
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="back-btn"
                    >
                        ← Back to Student Portal
                    </button>
                </div>

                {/* Demo Credentials */}
                <div className="demo-credentials">
                    <h3>Demo Credentials:</h3>
                    <div className="credential-item">
                        <span>Username:</span>
                        <strong>admin</strong>
                    </div>
                    <div className="credential-item">
                        <span>Password:</span>
                        <strong>admin123</strong>
                    </div>
                    <div className="credential-item">
                        <span>Backend URL:</span>
                        <code>{backendUrl}</code>
                    </div>
                    <button 
                        onClick={handleDemoLogin}
                        className="demo-btn"
                    >
                        Use Demo Credentials
                    </button>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <p className="security-note">
                        🔒 Secured by JWT Authentication
                    </p>
                    <p className="copyright">
                        © 2024 Shamsi Institute of Technology
                    </p>
                    <p className="version">
                        Admin Panel v2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;