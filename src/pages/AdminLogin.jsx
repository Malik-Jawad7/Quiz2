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
    const [backendUrl] = useState('https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app');
    const [error, setError] = useState('');
    const [healthData, setHealthData] = useState(null);

    useEffect(() => {
        checkBackendConnection();
    }, []);

    const checkBackendConnection = async () => {
        try {
            setBackendStatus('checking');
            setError('');
            
            const response = await checkHealth();
            console.log('Health response:', response.data);
            
            if (response.data && response.data.success) {
                setBackendStatus('connected');
                setHealthData(response.data);
                localStorage.setItem('backendHealth', JSON.stringify(response.data));
            } else {
                setBackendStatus('disconnected');
                setError('Backend responded but with unexpected format');
            }
        } catch (error) {
            console.error('Backend check failed:', error);
            setBackendStatus('disconnected');
            setError('Connection failed. Backend might be down.');
            
            // Try direct fetch as fallback
            tryDirectConnection();
        }
    };

    const tryDirectConnection = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/health`);
            const data = await response.json();
            if (data && data.status === "OK") {
                setBackendStatus('connected');
                setHealthData(data);
                setError('');
            }
        } catch (err) {
            console.log('Direct connection also failed');
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
            setError(error.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setLoading(true);
        try {
            const response = await testDatabase();
            if (response.data.success) {
                alert(`✅ Connection Test Successful!\n\nMode: ${response.data.mode}\nUsers: ${response.data.counts?.users || 0}\nQuestions: ${response.data.counts?.questions || 0}`);
            } else {
                alert(`❌ ${response.data.message || 'Connection test failed'}`);
            }
        } catch (error) {
            alert(`❌ Test Error: ${error.message}\n\nBackend URL: ${backendUrl}`);
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

    const openBackendInNewTab = () => {
        window.open(backendUrl, '_blank');
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
                    
                    {healthData && (
                        <div className="health-info">
                            <small>
                                Mode: {healthData.database === 'Connected' ? 'Database' : 'Memory'} • 
                                Environment: {healthData.environment}
                            </small>
                        </div>
                    )}
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
                            🔧 Test Connection
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
                    
                    <button 
                        onClick={openBackendInNewTab}
                        className="backend-btn"
                    >
                        🌐 Open Backend
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

                {/* Connection Info */}
                <div className="connection-info">
                    <h4>Connection Status:</h4>
                    <div className="status-details">
                        <div className="status-item">
                            <span>Backend:</span>
                            <span className={backendStatus === 'connected' ? 'text-success' : 'text-danger'}>
                                {backendStatus === 'connected' ? '✅ Online' : '❌ Offline'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span>Database:</span>
                            <span className={healthData?.database === 'Connected' ? 'text-success' : 'text-warning'}>
                                {healthData?.database === 'Connected' ? '✅ Connected' : '⚠️ Memory Mode'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span>Environment:</span>
                            <span>{healthData?.environment || 'Unknown'}</span>
                        </div>
                    </div>
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
                        Admin Panel v2.0 • Backend: {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;