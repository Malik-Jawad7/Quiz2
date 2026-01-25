// src/components/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getQuizConfig } from '../services/api';
import './Register.css';

// Technology logos as SVG components
const TechLogos = {
    html: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 28L4 3H28L26 28L16 31L6 28Z" fill="#E44D26"/>
            <path d="M26 5H16V29.5L24 27L26 5Z" fill="#F16529"/>
            <path d="M9.5 17.5L8.5 8H24L23.5 11H11.5L12 14.5H23L22 24L16 26L10 24L9.5 19H12.5L13 21.5L16 22.5L19 21.5L19.5 17.5H9.5Z" fill="white"/>
        </svg>
    ),
    css: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 28L4 3H28L26 28L16 31L6 28Z" fill="#1572B6"/>
            <path d="M26 5H16V29.5L24 27L26 5Z" fill="#33AADD"/>
            <path d="M19.5 17.5H9.5L9 21L16 23L23 21L22.5 14H12L11.5 11H22.5L22 8H9L8.5 5H24L23.5 10L19.5 17.5Z" fill="white"/>
        </svg>
    ),
    javascript: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 28L4 3H28L26 28L16 31L6 28Z" fill="#F7DF1E"/>
            <path d="M26 5H16V29.5L24 27L26 5Z" fill="#F7DF1E"/>
            <path d="M17.6 23.6C18.4 24.8 19.4 25.6 20.9 25.6C22.1 25.6 22.9 25 22.9 24.2C22.9 23.3 22.3 22.9 21.1 22.4L20.3 22.1C18.5 21.3 17.3 20.3 17.3 18.2C17.3 16.2 18.9 14.7 21 14.7C22.7 14.7 23.9 15.3 24.8 16.8L22.5 18.4C22 17.6 21.4 17.2 20.8 17.2C20.1 17.2 19.7 17.6 19.7 18.4C19.7 19.2 20.1 19.6 21.2 20.1L22 20.4C24.1 21.3 25.3 22.3 25.3 24.4C25.3 26.7 23.5 28 21 28C18.6 28 17 26.9 16.2 25.4L17.6 23.6ZM11.3 23.9C12 24.9 12.6 25.6 13.5 25.6C14.4 25.6 15 25.2 15 23.8V14.3H18V23.9C18 26.8 16.3 28 14.2 28C12.2 28 10.9 26.9 10.2 25.7L11.3 23.9Z" fill="#000000"/>
        </svg>
    ),
    react: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="15.8" r="2.8" fill="#61DAFB"/>
            <path d="M16 23.4C20.9706 23.4 25 19.3706 25 15.4C25 11.4294 20.9706 7.4 16 7.4C11.0294 7.4 7 11.4294 7 15.4C7 19.3706 11.0294 23.4 16 23.4Z" stroke="#61DAFB" strokeWidth="2.8"/>
            <path d="M10.6 12.8C13.7614 8.2 18.2386 8.2 21.4 12.8" stroke="#61DAFB" strokeWidth="2.8"/>
            <path d="M10.6 18C13.7614 22.6 18.2386 22.6 21.4 18" stroke="#61DAFB" strokeWidth="2.8"/>
            <path d="M7.5 15.4H24.5" stroke="#61DAFB" strokeWidth="2.8"/>
            <path d="M16 7.4V23.4" stroke="#61DAFB" strokeWidth="2.8"/>
        </svg>
    ),
    nextjs: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="black"/>
            <path d="M22 16L12 26V6L22 16Z" fill="white"/>
            <path d="M24 10V22H22V10H24Z" fill="white"/>
        </svg>
    ),
    mern: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.4 4 4 9.4 4 16C4 22.6 9.4 28 16 28C22.6 28 28 22.6 28 16C28 9.4 22.6 4 16 4Z" fill="#10B981"/>
            <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#10B981"/>
            <path d="M12 12L20 20M20 12L12 20" stroke="white" strokeWidth="2"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
    ),
    node: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.4 4 4 9.4 4 16C4 22.6 9.4 28 16 28C22.6 28 28 22.6 28 16C28 9.4 22.6 4 16 4Z" fill="#339933"/>
            <path d="M19 24L15 26V22L12 20V14L15 12V8L19 10V24Z" fill="white"/>
            <path d="M23 14V18L21 20V24L19 26V10L21 12V16L23 14Z" fill="white"/>
        </svg>
    ),
    express: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.4 4 4 9.4 4 16C4 22.6 9.4 28 16 28C22.6 28 28 22.6 28 16C28 9.4 22.6 4 16 4Z" fill="#000000"/>
            <path d="M10 12H22V14H10V12ZM10 16H22V18H10V16ZM10 20H22V22H10V20Z" fill="white"/>
        </svg>
    ),
    mongodb: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.4 4 4 9.4 4 16C4 22.6 9.4 28 16 28C22.6 28 28 22.6 28 16C28 9.4 22.6 4 16 4Z" fill="#47A248"/>
            <path d="M16 6C18.5 6 20.5 10 20.5 15C20.5 20 18.5 24 16 24C13.5 24 11.5 20 11.5 15C11.5 10 13.5 6 16 6Z" fill="#47A248"/>
            <path d="M16 8C17.5 8 18.5 11 18.5 15C18.5 19 17.5 22 16 22C14.5 22 13.5 19 13.5 15C13.5 11 14.5 8 16 8Z" fill="white"/>
            <ellipse cx="16" cy="15" rx="2" ry="1" fill="#47A248"/>
        </svg>
    ),
    python: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M15.885 2C9.115 2 8 3.924 8 7.636V10.91h7.636v1.273H8.727c-3.712 0-6.545 2.218-6.545 6.545v5.818c0 4.327 2.218 6.545 6.545 6.545h1.273v-4.364c0-4.327 2.836-7.636 7.636-7.636h7.636c3.712 0 5.636-1.924 5.636-5.636V7.636C30.77 3.924 28.846 2 25.134 2h-9.25zM11.636 5.455a1.273 1.273 0 1 1 0 2.546 1.273 1.273 0 0 1 0-2.546z" fill="#3776AB"/>
            <path d="M24.364 30c6.77 0 7.885-1.924 7.885-5.636v-3.273h-7.636v-1.273h7.636c3.712 0 6.545-2.218 6.545-6.545v-5.818c0-4.327-2.218-6.545-6.545-6.545h-1.273v4.364c0 4.327-2.836 7.636-7.636 7.636h-7.636c-3.712 0-5.636 1.924-5.636 5.636v5.818c0 3.712 1.924 5.636 5.636 5.636h9.25zM20.364 26.545a1.273 1.273 0 1 1 0-2.546 1.273 1.273 0 0 1 0 2.546z" fill="#FFD43B"/>
        </svg>
    ),
    fullstack: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.4 4 4 9.4 4 16C4 22.6 9.4 28 16 28C22.6 28 28 22.6 28 16C28 9.4 22.6 4 16 4Z" fill="#667eea"/>
            <path d="M16 8L8 16L16 24L24 16L16 8Z" fill="#667eea"/>
            <path d="M12 12L20 20M20 12L12 20" stroke="white" strokeWidth="2"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
    )
};

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        category: 'html'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [quizConfig, setQuizConfig] = useState({
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
    });
    
    useEffect(() => {
        loadQuizConfig();
    }, []);
    
    const loadQuizConfig = async () => {
        try {
            const response = await getQuizConfig();
            if (response.data.success) {
                setQuizConfig(response.data.config);
            }
        } catch (error) {
            console.error('Error loading quiz config:', error);
        }
    };
    
    // Categories with proper logos
    const categories = [
        { 
            value: 'html', 
            label: 'HTML5', 
            description: 'HyperText Markup Language',
            logo: TechLogos.html,
            color: '#E34F26'
        },
        { 
            value: 'css', 
            label: 'CSS3', 
            description: 'Cascading Style Sheets',
            logo: TechLogos.css,
            color: '#1572B6'
        },
        { 
            value: 'javascript', 
            label: 'JavaScript', 
            description: 'Programming Language',
            logo: TechLogos.javascript,
            color: '#F7DF1E'
        },
        { 
            value: 'react', 
            label: 'React JS', 
            description: 'Frontend Library',
            logo: TechLogos.react,
            color: '#61DAFB'
        },
        { 
            value: 'nextjs', 
            label: 'Next.js', 
            description: 'React Framework',
            logo: TechLogos.nextjs,
            color: '#000000'
        },
        { 
            value: 'mern', 
            label: 'MERN Stack', 
            description: 'Full Stack Development',
            logo: TechLogos.mern,
            color: '#10B981'
        },
        { 
            value: 'node', 
            label: 'Node.js', 
            description: 'Backend Runtime',
            logo: TechLogos.node,
            color: '#339933'
        },
        { 
            value: 'express', 
            label: 'Express.js', 
            description: 'Web Framework',
            logo: TechLogos.express,
            color: '#000000'
        },
        { 
            value: 'mongodb', 
            label: 'MongoDB', 
            description: 'NoSQL Database',
            logo: TechLogos.mongodb,
            color: '#47A248'
        },
        { 
            value: 'python', 
            label: 'Python', 
            description: 'Programming Language',
            logo: TechLogos.python,
            color: '#3776AB'
        },
        { 
            value: 'fullstack', 
            label: 'Full Stack', 
            description: 'Complete Development',
            logo: TechLogos.fullstack,
            color: '#667EEA'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await registerUser(formData);
            
            if (response.data.success) {
                setSuccess('Registration successful! Redirecting to assessment...');
                
                localStorage.setItem('userId', response.data.user._id);
                localStorage.setItem('userName', formData.name);
                localStorage.setItem('rollNumber', formData.rollNumber);
                localStorage.setItem('category', formData.category);
                
                setTimeout(() => {
                    navigate('/quiz');
                }, 2000);
            } else {
                setError(response.data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="register-container">
            <div className="register-wrapper">
                {/* Left Panel - Tech Display */}
                <div className="register-left-panel">
                    <div className="left-panel-content">
                        <div className="institute-badge">
                            <div className="badge-icon">
                                <svg viewBox="0 0 48 48" fill="none">
                                    <circle cx="24" cy="24" r="22" fill="white" fillOpacity="0.1"/>
                                    <path d="M24 8L40 16V32L24 40L8 32V16L24 8Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                                    <path d="M24 16L32 20V28L24 32L16 28V20L24 16Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                                    <path d="M24 24V32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="24" cy="24" r="2" fill="white"/>
                                </svg>
                            </div>
                            <div className="badge-text">
                                <div className="badge-title">Shamsi Institute</div>
                                <div className="badge-subtitle">Technology Certification</div>
                            </div>
                        </div>

                        <div className="tech-highlight">
                            <h3>Technology Stack</h3>
                            <div className="tech-icons-grid">
                                {categories.map((tech, index) => (
                                    <div 
                                        key={tech.value}
                                        className="tech-icon-item"
                                        style={{ 
                                            animationDelay: `${index * 0.1}s`,
                                            borderColor: tech.color,
                                            backgroundColor: formData.category === tech.value ? tech.color + '20' : 'transparent'
                                        }}
                                    >
                                        <div className="tech-logo" style={{ color: tech.color }}>
                                            {tech.logo}
                                        </div>
                                        <span className="tech-label">{tech.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="certificate-preview">
                            <div className="certificate-card">
                                <div className="certificate-header">
                                    <div className="certificate-badge">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor"/>
                                            <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                    <div className="certificate-title">
                                        <h4>Digital Certificate</h4>
                                        <p>Issued upon successful completion</p>
                                    </div>
                                </div>
                                <div className="certificate-details">
                                    <div className="certificate-info">
                                        <div className="info-item">
                                            <span className="info-label">Validated</span>
                                            <span className="info-value">✓ Industry Standard</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Duration</span>
                                            <span className="info-value">{quizConfig.quizTime} Minutes</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Format</span>
                                            <span className="info-value">Digital & Printable</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="left-panel-footer">
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-number">1000+</div>
                                    <div className="stat-label">Students Certified</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">98%</div>
                                    <div className="stat-label">Success Rate</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">24/7</div>
                                    <div className="stat-label">Support Available</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Registration Form */}
                <div className="register-right-panel">
                    <div className="register-form-container">
                        <div className="form-header">
                            <div className="form-title">
                                <h2>Technology Assessment Registration</h2>
                                <p>Register for your professional certification test</p>
                            </div>
                            <div className="form-progress">
                                <div className="progress-step active">
                                    <div className="step-indicator">1</div>
                                    <div className="step-label">Details</div>
                                </div>
                                <div className="progress-connector"></div>
                                <div className="progress-step">
                                    <div className="step-indicator">2</div>
                                    <div className="step-label">Assessment</div>
                                </div>
                                <div className="progress-connector"></div>
                                <div className="progress-step">
                                    <div className="step-indicator">3</div>
                                    <div className="step-label">Certificate</div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="register-form">
                            {/* Personal Information Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div className="section-icon">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#3B82F6"/>
                                        </svg>
                                    </div>
                                    <h3>Student Information</h3>
                                </div>

                                <div className="form-fields">
                                    <div className="field-group">
                                        <label className="field-label">
                                            Full Name *
                                        </label>
                                        <div className="input-container">
                                            <div className="input-icon">
                                                <svg viewBox="0 0 20 20" fill="none">
                                                    <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10ZM10 12.5C6.6625 12.5 0 14.175 0 17.5V20H20V17.5C20 14.175 13.3375 12.5 10 12.5Z" fill="#94A3B8"/>
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label className="field-label">
                                            Roll Number *
                                        </label>
                                        <div className="input-container">
                                            <div className="input-icon">
                                                <svg viewBox="0 0 20 20" fill="none">
                                                    <path d="M15 0H5C3.89543 0 3 0.89543 3 2V18C3 19.1046 3.89543 20 5 20H15C16.1046 20 17 19.1046 17 18V2C17 0.89543 16.1046 0 15 0ZM5 2H15V4H5V2ZM15 18H5V6H15V18ZM10 17C10.5523 17 11 16.5523 11 16C11 15.4477 10.5523 15 10 15C9.44772 15 9 15.4477 9 16C9 16.5523 9.44772 17 10 17Z" fill="#94A3B8"/>
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                name="rollNumber"
                                                value={formData.rollNumber}
                                                onChange={handleChange}
                                                placeholder="SI-2024-001"
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technology Selection Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div className="section-icon">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#3B82F6"/>
                                        </svg>
                                    </div>
                                    <h3>Select Technology</h3>
                                    <p className="section-subtitle">Choose your assessment category</p>
                                </div>

                                <div className="tech-selection-grid">
                                    {categories.map((tech) => (
                                        <div 
                                            key={tech.value}
                                            className={`tech-option ${formData.category === tech.value ? 'selected' : ''}`}
                                            onClick={() => setFormData({...formData, category: tech.value})}
                                            style={{ borderColor: tech.color }}
                                        >
                                            <div className="tech-option-header">
                                                <div className="tech-logo-large">
                                                    {tech.logo}
                                                </div>
                                                <div className="tech-option-info">
                                                    <h4 className="tech-name">{tech.label}</h4>
                                                    <p className="tech-description">{tech.description}</p>
                                                </div>
                                            </div>
                                            {formData.category === tech.value && (
                                                <div className="tech-selected-indicator">
                                                    <svg viewBox="0 0 16 16" fill="none">
                                                        <circle cx="8" cy="8" r="8" fill={tech.color}/>
                                                        <path d="M11.3333 5.5L6.99996 9.83333L4.66663 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="hidden-select"
                                    required
                                >
                                    {categories.map((tech) => (
                                        <option key={tech.value} value={tech.value}>
                                            {tech.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Test Details */}
                            <div className="test-details-section">
                                <div className="details-grid">
                                    <div className="detail-card">
                                        <div className="detail-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#3B82F6"/>
                                                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="#3B82F6"/>
                                            </svg>
                                        </div>
                                        <div className="detail-content">
                                            <div className="detail-label">Duration</div>
                                            <div className="detail-value">{quizConfig.quizTime} Minutes</div>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <div className="detail-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="#3B82F6"/>
                                            </svg>
                                        </div>
                                        <div className="detail-content">
                                            <div className="detail-label">Questions</div>
                                            <div className="detail-value">{quizConfig.totalQuestions} MCQs</div>
                                        </div>
                                    </div>
                                    <div className="detail-card">
                                        <div className="detail-icon">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#3B82F6"/>
                                            </svg>
                                        </div>
                                        <div className="detail-content">
                                            <div className="detail-label">Passing</div>
                                            <div className="detail-value">{quizConfig.passingPercentage}% Score</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            {error && (
                                <div className="alert-message error">
                                    <div className="alert-icon">
                                        <svg viewBox="0 0 20 20" fill="none">
                                            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#DC2626"/>
                                        </svg>
                                    </div>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            {success && (
                                <div className="alert-message success">
                                    <div className="alert-icon">
                                        <svg viewBox="0 0 20 20" fill="none">
                                            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#16A34A"/>
                                        </svg>
                                    </div>
                                    <span>{success}</span>
                                </div>
                            )}

                            {/* Terms and Submit */}
                            <div className="terms-section">
                                <label className="terms-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        required 
                                        className="terms-checkbox"
                                    />
                                    <span className="checkmark"></span>
                                    <span className="terms-text">
                                        I agree to the <span className="terms-link">Terms & Conditions</span> and confirm that all information provided is accurate.
                                    </span>
                                </label>
                            </div>

                            <div className="submit-section">
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Start Assessment
                                            <svg viewBox="0 0 20 20" fill="none">
                                                <path d="M10.75 4.25L16.5 10L10.75 15.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M3.5 10H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="form-footer">
                                <p className="footer-text">
                                    Already registered? <a href="/quiz" className="footer-link">Continue Assessment</a>
                                </p>
                                <div className="admin-link">
                                    <a href="/admin" className="footer-link">
                                        <svg viewBox="0 0 20 20" fill="none">
                                            <path d="M10 12C12.21 12 14 10.21 14 8C14 5.79 12.21 4 10 4C7.79 4 6 5.79 6 8C6 10.21 7.79 12 10 12ZM10 14C7.33 14 2 15.34 2 18V20H18V18C18 15.34 12.67 14 10 14Z" fill="#64748B"/>
                                        </svg>
                                        Admin Dashboard
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;