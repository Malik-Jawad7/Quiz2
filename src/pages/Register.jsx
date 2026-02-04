import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getConfig, getCategories } from '../services/api';
import ShamsiLogo from '../assets/shamsi-logo.jpg';
import './Register.css';

// React Icons
import { 
  FaCode, 
  FaServer, 
  FaDatabase, 
  FaGlobe, 
  FaDocker,
  FaCheck,
  FaClock,
  FaPercentage,
  FaListOl,
  FaUser,
  FaIdCard,
  FaLayerGroup,
  FaRocket,
  FaLock,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaSearch,
  FaCog,
  FaInfoCircle
} from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    category: ''
  });
  
  // Default categories including DevOps
  const [defaultCategories, setDefaultCategories] = useState([
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
    // DevOps Categories
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
    },
    { 
      value: 'jenkins', 
      label: 'Jenkins', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg',
      description: 'CI/CD Automation',
      available: true,
      type: 'devops'
    },
    { 
      value: 'kubernetes', 
      label: 'Kubernetes', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
      description: 'Container Orchestration',
      available: true,
      type: 'devops'
    },
    { 
      value: 'linux', 
      label: 'Linux', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
      description: 'Operating System',
      available: true,
      type: 'devops'
    },
    { 
      value: 'ansible', 
      label: 'Ansible', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg',
      description: 'Configuration Management',
      available: true,
      type: 'devops'
    },
    { 
      value: 'terraform', 
      label: 'Terraform', 
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg',
      description: 'Infrastructure as Code',
      available: true,
      type: 'devops'
    }
  ]);
  
  const [categories, setCategories] = useState([...defaultCategories]);
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 50
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [configSource, setConfigSource] = useState('default');
  const [notification, setNotification] = useState(null);
  const [isHovering, setIsHovering] = useState(null);

  useEffect(() => {
    loadConfig();
    loadAPICategories();
    
    // Listen for storage changes (when admin updates config)
    const handleStorageChange = () => {
      loadConfig();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadConfig = async () => {
    try {
      // First try to load from localStorage (fastest)
      const savedConfig = localStorage.getItem('quizConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setConfigSource('localStorage');
      }
      
      // Then try API for latest config
      const response = await getConfig();
      if (response.data?.success && response.data.config) {
        const apiConfig = response.data.config;
        setConfig(apiConfig);
        setConfigSource('api');
        
        // Save to localStorage for future use
        localStorage.setItem('quizConfig', JSON.stringify(apiConfig));
      }
    } catch (error) {
      // If API fails and no localStorage, use defaults
      if (!localStorage.getItem('quizConfig')) {
        setConfigSource('default');
      }
    }
  };

  const loadAPICategories = async () => {
    try {
      const response = await getCategories();
      if (response.data?.success && response.data.categories) {
        setApiCategories(response.data.categories);
        
        // Merge API categories with defaults
        const mergedCategories = [...defaultCategories];
        response.data.categories.forEach(apiCat => {
          if (!mergedCategories.find(c => c.value === apiCat.value)) {
            mergedCategories.push({
              value: apiCat.value,
              label: apiCat.label || apiCat.value,
              logo: apiCat.logo || ShamsiLogo,
              description: apiCat.description || apiCat.label || apiCat.value,
              available: true,
              type: apiCat.type || 'general'
            });
          }
        });
        
        setCategories(mergedCategories);
      } else {
        setCategories([...defaultCategories]);
      }
    } catch (error) {
      setCategories([...defaultCategories]);
    }
  };

  const handleCategorySelect = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue);
    if (category && category.available) {
      setFormData({...formData, category: categoryValue});
      setSelectedCategory(category);
      
      showNotification(`${category.label} selected`, 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rollNumber || !formData.category) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    if (!/^\d+$/.test(formData.rollNumber)) {
      showNotification('Please enter numbers only for roll number', 'error');
      return;
    }

    setLoading(true);
    try {
      const rollNumberToSend = `SI-${formData.rollNumber}`;
      const registrationData = {
        ...formData,
        rollNumber: rollNumberToSend
      };
      
      const response = await registerUser(registrationData);
      
      if (response.data.success) {
        localStorage.setItem('quizConfig', JSON.stringify(config));
        localStorage.setItem('userData', JSON.stringify(formData));
        localStorage.setItem('quizCategory', formData.category);
        localStorage.setItem('quizRollNumber', rollNumberToSend);
        
        const categoryInfo = categories.find(c => c.value === formData.category);
        if (categoryInfo) {
          localStorage.setItem('categoryInfo', JSON.stringify(categoryInfo));
        }
        
        showNotification('Registration successful! Redirecting to quiz...', 'success');
        
        setTimeout(() => {
          navigate('/quiz');
        }, 1500);
      } else {
        showNotification('Registration failed: ' + response.data.message, 'error');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      showNotification('Error: ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoError = (e, category) => {
    e.target.src = ShamsiLogo;
    e.target.style.objectFit = 'contain';
    e.target.style.padding = '8px';
  };

  const filteredCategories = selectedType === 'all' 
    ? categories 
    : categories.filter(cat => cat.type === selectedType);

  const categoryTypes = [
    { value: 'all', label: 'All', icon: <FaLayerGroup /> },
    { value: 'frontend', label: 'Frontend', icon: <FaCode /> },
    { value: 'backend', label: 'Backend', icon: <FaServer /> },
    { value: 'database', label: 'Database', icon: <FaDatabase /> },
    { value: 'fullstack', label: 'Full Stack', icon: <FaGlobe /> },
    { value: 'devops', label: 'DevOps', icon: <FaDocker /> }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'frontend': return <FaCode />;
      case 'backend': return <FaServer />;
      case 'database': return <FaDatabase />;
      case 'fullstack': return <FaGlobe />;
      case 'devops': return <FaDocker />;
      default: return <FaCode />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'frontend': return '#3498db';
      case 'backend': return '#2ecc71';
      case 'database': return '#9b59b6';
      case 'fullstack': return '#e74c3c';
      case 'devops': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="register-container">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {notification.type === 'success' ? <FaCheck /> : 
               notification.type === 'error' ? <FaExclamationTriangle /> : 
               notification.type === 'warning' ? <FaExclamationTriangle /> : <FaInfoCircle />}
            </span>
            <span>{notification.message}</span>
          </div>
          <button 
            className="toast-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
      
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
          {/* Personal Information Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FaUser /> Personal Information
            </h3>
            
            <div className="form-group">
              <label htmlFor="name">
                <FaUser /> Full Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rollNumber">
                <FaIdCard /> Roll Number
              </label>
              <input
                type="text"
                id="rollNumber"
                placeholder="Enter your roll number (numbers only)"
                value={formData.rollNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, rollNumber: value});
                }}
                required
                disabled={loading}
              />
              <div className="input-hint">
                Enter numbers only (e.g., 12345)
              </div>
            </div>
          </div>

          {/* Technology Selection Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FaLayerGroup /> Select Technology Stack
            </h3>
            
            <div className="category-filter">
              {categoryTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`type-btn ${selectedType === type.value ? 'active' : ''}`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <span className="type-icon">{type.icon}</span>
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
                  onMouseEnter={() => setIsHovering(category.value)}
                  onMouseLeave={() => setIsHovering(null)}
                  title={category.description}
                >
                  <div className={`category-icon white-box ${formData.category === category.value ? 'selected-icon-box' : ''}`}>
                    <img 
                      src={category.logo} 
                      alt={`${category.label} logo`}
                      className="category-logo-img"
                      onError={(e) => handleLogoError(e, category)}
                    />
                  </div>
                  <div className="category-info">
                    <div className="category-header">
                      <h4>{category.label}</h4>
                      <span 
                        className="category-type-badge"
                        style={{
                          backgroundColor: getTypeColor(category.type) + '20',
                          color: getTypeColor(category.type)
                        }}
                      >
                        {getTypeIcon(category.type)}
                        {category.type}
                      </span>
                    </div>
                    <p className="category-description">
                      {category.description}
                    </p>
                    <div className="status">
                      {category.available ? (
                        <span className="available">
                          <FaCheck /> Available
                        </span>
                      ) : (
                        <span className="not-available">
                          <FaExclamationTriangle /> Not Available
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {formData.category === category.value && (
                    <div className="selection-indicator">
                      <FaCheck className="check-icon" />
                    </div>
                  )}
                  
                  {isHovering === category.value && formData.category !== category.value && (
                    <div className="hover-overlay"></div>
                  )}
                </div>
              ))}
              
              {filteredCategories.length === 0 && (
                <div className="no-categories">
                  <FaSearch className="empty-icon" />
                  <h4>No categories found for "{selectedType}"</h4>
                  <p>Try selecting a different technology type</p>
                </div>
              )}
            </div>
            
            {selectedCategory && (
              <div className="selected-category-info">
                <div className="selected-info-header">
                  <div className="selected-icon">
                    <img 
                      src={selectedCategory.logo} 
                      alt="Selected icon"
                      onError={(e) => {
                        e.target.src = ShamsiLogo;
                        e.target.style.objectFit = 'contain';
                        e.target.style.padding = '5px';
                      }}
                    />
                  </div>
                  <div className="selected-details">
                    <h4>
                      <strong>{selectedCategory.label}</strong>
                    </h4>
                    <p className="selected-description">
                      {selectedCategory.description}
                    </p>
                    <div className="selected-type" style={{ color: getTypeColor(selectedCategory.type) }}>
                      {getTypeIcon(selectedCategory.type)} {selectedCategory.type}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="category-note">
              <p>
                <FaExclamationTriangle /> <strong>Note:</strong> Only available technology stacks can be selected for assessment.
              </p>
            </div>
          </div>

          {/* Assessment Details Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FaQuestionCircle /> Assessment Details
            </h3>
            
            <div className="assessment-info">
              <div className="config-source-info">
                <span className={`source-badge ${configSource}`}>
                  <FaCog /> Config: {configSource}
                </span>
                <button 
                  type="button" 
                  className="refresh-config-btn"
                  onClick={loadConfig}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaCog />}
                </button>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <FaClock />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{config.quizTime} minutes</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <FaPercentage />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Passing Score:</span>
                    <span className="info-value">{config.passingPercentage}%</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <FaListOl />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Total Questions:</span>
                    <span className="info-value">{config.totalQuestions}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    {selectedCategory ? getTypeIcon(selectedCategory.type) : <FaCode />}
                  </div>
                  <div className="info-content">
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
              
              <div className="assessment-note">
                <p>
                  <FaExclamationTriangle /> <strong>Important:</strong> The quiz will automatically submit when time runs out.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !formData.category}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinning" />
                  Registering...
                </>
              ) : (
                <>
                  <FaRocket />
                  Start Assessment
                </>
              )}
            </button>

            <button 
              type="button" 
              className="admin-login-btn"
              onClick={() => navigate('/admin/login')}
              disabled={loading}
            >
              <FaLock />
              Admin Login
            </button>
          </div>
        </form>

        <div className="instructor-info">
          <p className="instructor-text">
            <FaQuestionCircle /> <strong>Need help?</strong> Contact your instructor for any questions about the assessment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;