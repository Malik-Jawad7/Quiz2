import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getConfig, getCategories } from '../services/api';
import ShamsiLogo from '../assets/shamsi-logo.jpg';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    category: ''
  });
  
  const [categories, setCategories] = useState([
    { 
      value: 'html', 
      label: 'HTML', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
      description: 'HyperText Markup Language',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'css', 
      label: 'CSS', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
      description: 'Cascading Style Sheets',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'javascript', 
      label: 'JavaScript', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      description: 'Programming Language',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'react', 
      label: 'React.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      description: 'JavaScript Library for UI',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'nextjs', 
      label: 'Next.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
      description: 'React Framework',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'vue', 
      label: 'Vue.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
      description: 'JavaScript Framework',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'angular', 
      label: 'Angular', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
      description: 'TypeScript Framework',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'typescript', 
      label: 'TypeScript', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      description: 'Typed JavaScript',
      available: true,
      type: 'frontend'
    },
    { 
      value: 'node', 
      label: 'Node.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      description: 'JavaScript Runtime',
      available: true,
      type: 'backend'
    },
    { 
      value: 'express', 
      label: 'Express.js', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
      description: 'Node.js Framework',
      available: true,
      type: 'backend'
    },
    { 
      value: 'python', 
      label: 'Python', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      description: 'Programming Language',
      available: true,
      type: 'backend'
    },
    { 
      value: 'django', 
      label: 'Django', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
      description: 'Python Web Framework',
      available: true,
      type: 'backend'
    },
    { 
      value: 'flask', 
      label: 'Flask', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
      description: 'Python Microframework',
      available: true,
      type: 'backend'
    },
    { 
      value: 'java', 
      label: 'Java', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      description: 'Programming Language',
      available: true,
      type: 'backend'
    },
    { 
      value: 'spring', 
      label: 'Spring Boot', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
      description: 'Java Framework',
      available: true,
      type: 'backend'
    },
    { 
      value: 'php', 
      label: 'PHP', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
      description: 'Server-side Scripting',
      available: true,
      type: 'backend'
    },
    { 
      value: 'laravel', 
      label: 'Laravel', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg',
      description: 'PHP Framework',
      available: true,
      type: 'backend'
    },
    { 
      value: 'mongodb', 
      label: 'MongoDB', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      description: 'NoSQL Database',
      available: true,
      type: 'database'
    },
    { 
      value: 'mysql', 
      label: 'MySQL', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
      description: 'Relational Database',
      available: true,
      type: 'database'
    },
    { 
      value: 'postgresql', 
      label: 'PostgreSQL', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
      description: 'Advanced SQL Database',
      available: true,
      type: 'database'
    },
    { 
      value: 'mern', 
      label: 'MERN Stack', 
      logo: 'https://miro.medium.com/v2/resize:fit:1400/1*DnCplmvHp4VfE6eKyxDm8A.png',
      description: 'MongoDB + Express + React + Node',
      available: true,
      type: 'fullstack'
    },
    { 
      value: 'graphql', 
      label: 'GraphQL', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
      description: 'Query Language for APIs',
      available: true,
      type: 'backend'
    },
    { 
      value: 'git', 
      label: 'Git', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
      description: 'Version Control System',
      available: true,
      type: 'devops'
    },
    { 
      value: 'docker', 
      label: 'Docker', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
      description: 'Container Platform',
      available: true,
      type: 'devops'
    },
    { 
      value: 'aws', 
      label: 'AWS', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
      description: 'Cloud Platform',
      available: true,
      type: 'devops'
    }
  ]);
  
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 50
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadConfig();
    loadAPICategories();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await getConfig();
      if (response.data?.success) {
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadAPICategories = async () => {
    try {
      const response = await getCategories();
      if (response.data?.success) {
        setApiCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
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

    // Simple validation - just check if it's a number
    if (!/^\d+$/.test(formData.rollNumber)) {
      alert('Please enter numbers only for roll number');
      return;
    }

    setLoading(true);
    try {
      // Convert roll number to proper format for backend
      const rollNumberToSend = `SI-${formData.rollNumber}`;
      const registrationData = {
        ...formData,
        rollNumber: rollNumberToSend
      };
      
      const response = await registerUser(registrationData);
      
      if (response.data.success) {
        // Save ALL necessary data to localStorage
        localStorage.setItem('quizConfig', JSON.stringify(config));
        localStorage.setItem('userData', JSON.stringify(formData));
        localStorage.setItem('quizCategory', formData.category);
        localStorage.setItem('quizRollNumber', rollNumberToSend);
        
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
    e.target.src = ShamsiLogo;
    e.target.style.objectFit = 'contain';
    e.target.style.padding = '8px';
  };

  const filteredCategories = selectedType === 'all' 
    ? categories 
    : categories.filter(cat => cat.type === selectedType);

  const categoryTypes = [
    { value: 'all', label: 'All Technologies' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'database', label: 'Database' },
    { value: 'fullstack', label: 'Full Stack' },
    { value: 'devops', label: 'DevOps' }
  ];

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="header-section">
          <div className="logo">
            <div className="logo-icon-large">
              <img src={ShamsiLogo} alt="Shamsi Institute" className="logo-img-large" />
            </div>
            <h1>Shamsi Institute</h1>
            <p className="subtitle">Technical Skills Assessment</p>
          </div>
          <p className="tagline">
            Select your technology stack and start the assessment
          </p>
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
              placeholder="Enter your roll number (numbers only)"
              value={formData.rollNumber}
              onChange={(e) => {
                // Allow only numbers
                let value = e.target.value.replace(/\D/g, '');
                setFormData({...formData, rollNumber: value});
              }}
              required
            />
            <div className="input-hint">
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Select Technology Stack *</label>
            
            <div className="category-filter">
              {categoryTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`type-btn ${selectedType === type.value ? 'active' : ''}`}
                  onClick={() => setSelectedType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            <div className="categories-grid">
              {filteredCategories.map((category) => (
                <div 
                  key={category.value}
                  className={`category-card ${formData.category === category.value ? 'selected' : ''} ${!category.available ? 'not-available' : ''}`}
                  onClick={() => handleCategorySelect(category.value)}
                  title={category.description}
                >
                  <div className="category-icon white-box">
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
                    <div className="status">
                      {category.available ? (
                        <span className="available">
                          ✅ Available
                        </span>
                      ) : (
                        <span className="not-available">
                          ⛔ Not Available
                        </span>
                      )}
                    </div>
                    <span className="category-type-badge">
                      {category.type}
                    </span>
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
                      onError={(e) => {
                        e.target.src = ShamsiLogo;
                        e.target.style.objectFit = 'contain';
                        e.target.style.padding = '5px';
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
                          onError={(e) => {
                            e.target.src = ShamsiLogo;
                            e.target.style.objectFit = 'contain';
                            e.target.style.padding = '3px';
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