import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getAvailableCategories, getConfig } from '../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: 'SI-2024-',
    category: ''
  });
  
  // Categories with availability status
  const [categories] = useState([
    // Web Development - Core (Available)
    { 
      value: 'html', 
      label: 'HTML', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
      description: 'HyperText Markup Language',
      bgColor: '#FFFFFF',
      available: true
    },
    { 
      value: 'css', 
      label: 'CSS', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
      description: 'Cascading Style Sheets',
      bgColor: '#FFFFFF',
      available: true
    },
    { 
      value: 'javascript', 
      label: 'JavaScript', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      description: 'Programming Language',
      bgColor: '#FFFFFF',
      available: true
    },
    
    // Frontend Frameworks (React available, Next.js not available)
    { 
      value: 'react', 
      label: 'React.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      description: 'JavaScript Library for UI',
      bgColor: '#FFFFFF',
      available: true
    },
    { 
      value: 'nextjs', 
      label: 'Next.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
      description: 'React Framework',
      bgColor: '#FFFFFF',
      available: false // Not available
    },
    
    // Backend Technologies (Node available, Express not available, Python available)
    { 
      value: 'express', 
      label: 'Express.js', 
      logo: 'data:image/png;base64,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',
      description: 'Web Framework for Node.js',
      bgColor: '#FFFFFF',
      available: false // Not available
    },
    { 
      value: 'node', 
      label: 'Node.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      description: 'JavaScript Runtime',
      bgColor: '#FFFFFF',
      available: true
    },
    { 
      value: 'python', 
      label: 'Python', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      description: 'Programming Language',
      bgColor: '#FFFFFF',
      available: true
    },
    
    // Database (MongoDB available)
    { 
      value: 'mongodb', 
      label: 'MongoDB', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      description: 'NoSQL Database',
      bgColor: '#FFFFFF',
      available: true
    },
    
    // Full Stack (MERN available, Full Stack not available)
    { 
      value: 'mern', 
      label: 'MERN Stack', 
      logo: 'https://miro.medium.com/v2/resize:fit:1400/1*DnCplmvHp4VfE6eKyxDm8A.png',
      description: 'MongoDB + Express + React + Node',
      bgColor: '#FFFFFF',
      available: true
    },
    { 
      value: 'fullstack', 
      label: 'Full Stack', 
      logo: 'https://cdn-icons-png.flaticon.com/512/2282/2282188.png',
      description: 'Complete Web Development',
      bgColor: '#FFFFFF',
      available: false // Not available
    }
  ]);
  
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 50
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configResponse = await getConfig();
      if (configResponse.data?.success) {
        setConfig(configResponse.data.config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleCategorySelect = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue);
    if (category && category.available) {
      setFormData({...formData, category: categoryValue});
      setSelectedCategory(category);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rollNumber || !formData.category) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData);
      
      if (response.data.success) {
        localStorage.setItem('quizConfig', JSON.stringify(config));
        alert('✅ Registration successful! Redirecting to quiz...');
        navigate('/quiz');
      } else {
        alert('❌ Registration failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('❌ Error: ' + (error.response?.data?.message || error.message || 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoError = (e, category) => {
    console.log(`Failed to load logo for ${category.label}`);
    e.target.style.display = 'none';
    
    // Create fallback with initial letter and colored background
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'logo-fallback';
    
    // Original colors for fallback
    const fallbackColors = {
      html: '#E34F26',
      css: '#1572B6',
      javascript: '#F7DF1E',
      react: '#61DAFB',
      nextjs: '#000000',
      express: '#000000',
      node: '#339933',
      python: '#3776AB',
      mongodb: '#47A248',
      mern: '#00C853',
      fullstack: '#667eea'
    };
    
    fallbackDiv.style.cssText = `
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${category.value === 'javascript' ? '#000000' : 'white'};
      font-size: 20px;
      font-weight: bold;
      border-radius: 8px;
      background: ${fallbackColors[category.value] || '#667eea'};
      border: 1px solid #e2e8f0;
    `;
    fallbackDiv.textContent = category.label.charAt(0);
    e.target.parentElement.appendChild(fallbackDiv);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="header-section">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <h1>Shamsi Institute</h1>
            <p className="subtitle">Technical Skills Assessment</p>
          </div>
          <p className="tagline">Select your technology stack and start the assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rollNumber">Roll Number *</label>
            <input
              type="text"
              id="rollNumber"
              placeholder="SI-2024-001"
              value={formData.rollNumber}
              onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Select Technology Stack *</label>
            <div className="categories-grid">
              {categories.map((category) => (
                <div 
                  key={category.value}
                  className={`category-card ${formData.category === category.value ? 'selected' : ''} ${!category.available ? 'not-available' : ''}`}
                  onClick={() => handleCategorySelect(category.value)}
                  title={category.description}
                >
                  <div 
                    className="category-icon white-box"
                    style={{ 
                      backgroundColor: category.bgColor,
                      border: '1px solid #e2e8f0',
                      opacity: !category.available ? 0.6 : 1
                    }}
                  >
                    <img 
                      src={category.logo} 
                      alt={`${category.label} logo`}
                      className="category-logo-img"
                      onError={(e) => handleLogoError(e, category)}
                    />
                  </div>
                  <div className="category-info">
                    <h4>{category.label}</h4>
                    <p className="category-description">
                      {category.description}
                    </p>
                    <div className={`status ${!category.available ? 'not-available-status' : 'available-status'}`}>
                      {category.available ? (
                        <span className="available">✅ Available</span>
                      ) : (
                        <span className="not-available">⛔ Not Available</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedCategory && (
              <div className="selected-category-info">
                <p>
                  <span className="selected-icon">
                    <img 
                      src={selectedCategory.logo} 
                      alt="Selected icon"
                      className="selected-logo-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallbackColors = {
                          html: '#E34F26',
                          css: '#1572B6',
                          javascript: '#F7DF1E',
                          react: '#61DAFB',
                          nextjs: '#000000',
                          express: '#000000',
                          node: '#339933',
                          python: '#3776AB',
                          mongodb: '#47A248',
                          mern: '#00C853',
                          fullstack: '#667eea'
                        };
                        
                        const fallbackSpan = document.createElement('span');
                        fallbackSpan.style.cssText = `
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          width: 30px;
                          height: 30px;
                          background-color: ${fallbackColors[selectedCategory.value] || '#667eea'};
                          color: ${selectedCategory.value === 'javascript' ? '#000000' : 'white'};
                          border-radius: 8px;
                          margin-right: 10px;
                          font-weight: bold;
                          font-size: 16px;
                        `;
                        fallbackSpan.textContent = selectedCategory.label?.charAt(0) || '?';
                        e.target.parentElement.appendChild(fallbackSpan);
                      }}
                    />
                  </span>
                  <strong>{selectedCategory.label}</strong>
                  <span className="selected-description">
                    - {selectedCategory.description}
                  </span>
                </p>
              </div>
            )}
            
            <div className="category-note">
              <p>
                <strong>📢 Note:</strong> Only available technology stacks can be selected for assessment.
              </p>
            </div>
          </div>

          <div className="assessment-info">
            <h3>📋 Assessment Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">{config.quizTime} minutes</span>
              </div>
              <div className="info-item">
                <span className="info-label">Format:</span>
                <span className="info-value">MCQs</span>
              </div>
              <div className="info-item">
                <span className="info-label">Passing Score:</span>
                <span className="info-value">{config.passingPercentage}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">Technology:</span>
                <span className="info-value tech-badge">
                  {selectedCategory ? (
                    <>
                      <span className="tech-logo">
                        <img 
                          src={selectedCategory.logo} 
                          alt="Tech logo"
                          className="tech-logo-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallbackColors = {
                              html: '#E34F26',
                              css: '#1572B6',
                              javascript: '#F7DF1E',
                              react: '#61DAFB',
                              nextjs: '#000000',
                              express: '#000000',
                              node: '#339933',
                              python: '#3776AB',
                              mongodb: '#47A248',
                              mern: '#00C853',
                              fullstack: '#667eea'
                            };
                            
                            const fallbackSpan = document.createElement('span');
                            fallbackSpan.style.cssText = `
                              display: inline-flex;
                              align-items: center;
                              justify-content: center;
                              width: 20px;
                              height: 20px;
                              background-color: ${fallbackColors[selectedCategory.value] || '#667eea'};
                              color: ${selectedCategory.value === 'javascript' ? '#000000' : 'white'};
                              border-radius: 50%;
                              margin-right: 5px;
                              font-weight: bold;
                              font-size: 12px;
                            `;
                            fallbackSpan.textContent = selectedCategory.label?.charAt(0) || '?';
                            e.target.parentElement.appendChild(fallbackSpan);
                          }}
                        />
                      </span>
                      {selectedCategory.label}
                    </>
                  ) : 'Select One'}
                </span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || !formData.category}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Registering...
              </>
            ) : (
              <>
                <span>🚀</span>
                Start Assessment
              </>
            )}
          </button>

          <button 
            type="button" 
            className="admin-login-btn"
            onClick={() => navigate('/admin/login')}
          >
            <span>🔐</span>
            Admin Login
          </button>
        </form>

        <div className="instructor-info">
          <p className="instructor-text">
            <strong>💡 Need help?</strong> Contact your instructor for any questions about the assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;