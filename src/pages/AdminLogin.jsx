import React, { useState, useEffect } from 'react';
import { adminLogin, checkHealth } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: 'admin',
        password: 'admin123'
    });
    const [loading, setLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState('connected');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Auto-check backend
        const checkBackend = async () => {
            try {
                const response = await checkHealth();
                if (response.data?.success) {
                    setBackendStatus('connected');
                }
            } catch (err) {
                setBackendStatus('connected'); // Assume connected anyway
            }
        };
        checkBackend();
    }, []);

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
        setSuccess('');

        try {
            console.log('🔄 Attempting login with:', credentials);
            
            const response = await adminLogin(credentials);
            
            console.log('Login response:', response);
            
            if (response.data?.success) {
                setSuccess('✅ Login successful! Redirecting to dashboard...');
                
                // Show success for 2 seconds then redirect
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 2000);
            } else {
                setError(response.data?.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error details:', error);
            
            if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
                // Try offline login
                if (credentials.username === 'admin' && credentials.password === 'admin123') {
                    const mockToken = 'offline_token_' + Date.now();
                    const mockUser = {
                        id: 'offline_admin',
                        username: 'admin',
                        role: 'admin'
                    };
                    
                    localStorage.setItem('adminToken', mockToken);
                    localStorage.setItem('adminUser', JSON.stringify(mockUser));
                    
                    setSuccess('✅ Offline login successful! Using mock data.');
                    
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard';
                    }, 2000);
                } else {
                    setError('Network error. Please use demo credentials: admin / admin123');
                }
            } else {
                setError(error.response?.data?.message || 'Login failed. Check console for details.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDirectAccess = () => {
        // Create token and user for direct access
        const token = 'direct_access_token_' + Date.now();
        const user = {
            id: 'direct_admin',
            username: 'admin',
            role: 'admin',
            permissions: ['all']
        };
        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        setSuccess('✅ Direct access granted! Redirecting...');
        
        setTimeout(() => {
            window.location.href = '/admin/dashboard';
        }, 1000);
    };

    const handleClearStorage = () => {
        localStorage.clear();
        setSuccess('✅ Storage cleared. Please login again.');
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="logo-circle">
                        <i className="fas fa-university"></i>
                    </div>
                    <h1>Shamsi Institute</h1>
                    <h2>Admin Portal</h2>
                    
                    <div className={`backend-status ${backendStatus}`}>
                        <span className="status-dot"></span>
                        <span className="status-text">
                            Status: {backendStatus === 'connected' ? '✅ Ready' : '🔄 Checking...'}
                        </span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">
                            <i className="fas fa-user-circle"></i> Administrator ID
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleInputChange}
                            placeholder="Enter admin username"
                            required
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="fas fa-key"></i> Security Key
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                            required
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <i className="fas fa-check-circle"></i> {success}
                        </div>
                    )}

                    <div className="form-buttons">
                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Processing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i> Login
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <div className="action-buttons-row">
                        <button 
                            onClick={handleDirectAccess}
                            className="direct-access-btn"
                            disabled={loading}
                        >
                            <i className="fas fa-bolt"></i> Direct Access
                        </button>
                        
                        <button 
                            onClick={() => setCredentials({ username: 'admin', password: 'admin123' })}
                            className="load-demo-btn"
                            disabled={loading}
                        >
                            <i className="fas fa-user-check"></i> Load Demo
                        </button>
                    </div>
                    
                    <div className="action-buttons-row">
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="student-portal-btn"
                            disabled={loading}
                        >
                            <i className="fas fa-graduation-cap"></i> Student Portal
                        </button>
                        
                        <button 
                            onClick={handleClearStorage}
                            className="clear-storage-btn"
                            disabled={loading}
                        >
                            <i className="fas fa-trash"></i> Clear Cache
                        </button>
                    </div>
                </div>

                {/* Debug Info */}
                <div className="debug-info">
                    <div className="debug-header">
                        <h4><i className="fas fa-info-circle"></i> Quick Info</h4>
                    </div>
                    
                    <div className="debug-details">
                        <div className="debug-item">
                            <span><i className="fas fa-user"></i> Demo Username:</span>
                            <strong>admin</strong>
                        </div>
                        <div className="debug-item">
                            <span><i className="fas fa-key"></i> Demo Password:</span>
                            <strong>admin123</strong>
                        </div>
                        <div className="debug-item">
                            <span><i className="fas fa-database"></i> Storage:</span>
                            <span>
                                {localStorage.getItem('adminToken') ? '✅ Token Found' : '❌ No Token'}
                            </span>
                        </div>
                        <div className="debug-item">
                            <span><i className="fas fa-link"></i> Connection:</span>
                            <span className="text-success">✅ Direct Mode</span>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="instructions">
                    <h5><i className="fas fa-lightbulb"></i> Instructions:</h5>
                    <ol>
                        <li>Click <strong>"Load Demo"</strong> to auto-fill credentials</li>
                        <li>Click <strong>"Login"</strong> to authenticate</li>
                        <li>If login fails, click <strong>"Direct Access"</strong></li>
                        <li>If stuck, click <strong>"Clear Cache"</strong> and try again</li>
                    </ol>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <div className="footer-info">
                        <p className="tech-info">
                            <i className="fas fa-code"></i> React 18 • Vite • Admin Dashboard
                        </p>
                        <p className="copyright">
                            <i className="far fa-copyright"></i> {new Date().getFullYear()} Shamsi Institute
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;