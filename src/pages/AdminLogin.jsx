import React, { useState, useEffect } from 'react';
import { adminLogin, checkHealth, testDatabase } from '../services/api';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: 'admin',
        password: 'admin123'
    });
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [backendUrl] = useState('https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app');
    const [error, setError] = useState('');
    const [backendResponse, setBackendResponse] = useState(null);

    useEffect(() => {
        // Check backend connection on load
        checkBackendConnection();
    }, []);

    const checkBackendConnection = async () => {
        try {
            setBackendStatus('checking');
            setError('');
            
            // Direct axios call to health endpoint
            const response = await axios.get(`${backendUrl}/api/health`, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('Backend health response:', response.data);
            setBackendResponse(response.data);
            
            if (response.data && response.data.status === "OK") {
                setBackendStatus('connected');
            } else {
                setBackendStatus('disconnected');
                setError('Backend responded but status is not OK');
            }
        } catch (error) {
            console.error('Backend connection error:', error);
            setBackendStatus('disconnected');
            setError(`Connection failed: ${error.message}`);
            setBackendResponse(null);
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
            setError(error.response?.data?.message || 'Login failed. Check credentials or backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setLoading(true);
        try {
            const response = await testDatabase();
            if (response.data.success) {
                alert(`✅ Database Connected!\n\nUsers: ${response.data.counts?.users || 0}\nQuestions: ${response.data.counts?.questions || 0}\nAdmins: ${response.data.counts?.admins || 0}`);
            } else {
                alert(`❌ ${response.data.message || 'Database test failed'}`);
            }
        } catch (error) {
            alert(`❌ Connection Error: ${error.message}\n\nPlease check:\n1. Backend URL\n2. MongoDB connection\n3. Network access`);
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
        alert('Demo credentials loaded. Click "Access Dashboard" to login.');
    };

    const testBackendDirectly = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/api/test-db`);
            if (response.data.success) {
                alert(`✅ Backend Test Successful!\n\n${JSON.stringify(response.data, null, 2)}`);
            } else {
                alert(`❌ ${response.data.message}`);
            }
        } catch (error) {
            alert(`❌ Direct Test Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
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
                        <button 
                            onClick={checkBackendConnection}
                            className="refresh-status-btn"
                            title="Refresh Status"
                        >
                            🔄
                        </button>
                    </div>
                </div>

                {/* Backend Info */}
                {backendResponse && (
                    <div className="backend-info">
                        <h4>Backend Response:</h4>
                        <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
                    </div>
                )}

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
                            disabled={loading || backendStatus === 'disconnected'}
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
                        
                        <button 
                            type="button" 
                            className="direct-test-btn"
                            onClick={testBackendDirectly}
                            disabled={loading}
                        >
                            ⚡ Direct Backend Test
                        </button>
                    </div>
                </form>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button 
                        onClick={handleAccessDashboard}
                        className="dashboard-btn"
                        disabled={!localStorage.getItem('adminToken')}
                    >
                        {localStorage.getItem('adminToken') ? '📊 Go to Dashboard' : '📊 Access Dashboard (Login Required)'}
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
                    <div className="credential-actions">
                        <button 
                            onClick={handleDemoLogin}
                            className="demo-btn"
                        >
                            Load Demo Credentials
                        </button>
                        <button 
                            onClick={() => window.open(`${backendUrl}/api/health`, '_blank')}
                            className="open-btn"
                        >
                            Open Backend in New Tab
                        </button>
                    </div>
                </div>

                {/* Connection Troubleshooting */}
                <div className="troubleshooting">
                    <h4>⚠️ Connection Issues?</h4>
                    <ol>
                        <li>Check if backend is running: <a href={`${backendUrl}/api/health`} target="_blank" rel="noopener noreferrer">Click here</a></li>
                        <li>Verify MongoDB connection</li>
                        <li>Check browser console for errors (F12)</li>
                        <li>Try different browser or clear cache</li>
                    </ol>
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