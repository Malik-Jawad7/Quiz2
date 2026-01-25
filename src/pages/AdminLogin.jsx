import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link import करें
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

    // Register form पर navigate करने का function
    const goToRegister = () => {
        navigate('/register');
    };

    return (
        <div className="vip-admin-login-container">
            <div className="vip-admin-login-card">
                
                <div className="login-header">
                    <h2>Admin Portal</h2>
                    <p>Shamsi Institute Quiz System</p>
                </div>

                <form onSubmit={handleSubmit} className="vip-login-form">
                    <div className="vip-form-group">
                        <label htmlFor="username">Administrator ID</label>
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
                        <label htmlFor="password">Security Key</label>
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
                            ⚠️ {error}
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
                        ) : 'Access Dashboard'}
                    </button>

                    {/* Back to Register Button */}
                    <button
                        type="button"
                        className="vip-back-to-register-btn"
                        onClick={goToRegister}
                        disabled={loading}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginRight: '8px'}}>
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Back to Registration Form
                    </button>

                    <div className="vip-login-info">
                        <p><strong>🔐 Demo Credentials:</strong></p>
                        <p>Username: <code>admin</code></p>
                        <p>Password: <code>admin123</code></p>
                        <p style={{fontSize: '12px', marginTop: '15px', color: 'rgba(255,255,255,0.5)'}}>
                            Secured by AES-256 encryption
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;