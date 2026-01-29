import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getConfig, getCategories } from '../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '', // Empty initially
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
      console.log('Config response:', response);
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
      console.log('Categories response:', response);
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

    // Validate roll number format
    if (!formData.rollNumber.startsWith('SI-')) {
      alert('Roll number must start with SI- (e.g., SI-2024-001)');
      return;
    }

    // Check if roll number has proper format: SI-YYYY-NNN
    const rollParts = formData.rollNumber.split('-');
    if (rollParts.length < 3) {
      alert('Please enter complete roll number: SI-YYYY-NNN (e.g., SI-2024-001)');
      return;
    }

    const year = rollParts[1];
    if (year.length !== 4 || isNaN(year)) {
      alert('Please enter valid year in roll number (e.g., 2024)');
      return;
    }

    const number = rollParts[2];
    if (!number || isNaN(number)) {
      alert('Please enter valid roll number (e.g., 001, 123)');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting registration:', formData);
      const response = await registerUser(formData);
      console.log('Registration response:', response);
      
      if (response.data.success) {
        // Save ALL necessary data to localStorage
        localStorage.setItem('quizConfig', JSON.stringify(config));
        localStorage.setItem('userData', JSON.stringify(formData));
        localStorage.setItem('quizCategory', formData.category);
        localStorage.setItem('quizRollNumber', formData.rollNumber);
        
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
    
    const fallbackDiv = document.createElement('div');
    
    const fallbackColors = {
      html: '#E34F26',
      css: '#1572B6',
      javascript: '#F7DF1E',
      react: '#61DAFB',
      nextjs: '#000000',
      vue: '#4FC08D',
      angular: '#DD0031',
      typescript: '#3178C6',
      node: '#339933',
      express: '#000000',
      python: '#3776AB',
      django: '#092E20',
      flask: '#000000',
      java: '#007396',
      spring: '#6DB33F',
      php: '#777BB4',
      laravel: '#FF2D20',
      mongodb: '#47A248',
      mysql: '#4479A1',
      postgresql: '#336791',
      mern: '#00C853',
      graphql: '#E10098',
      git: '#F05032',
      docker: '#2496ED',
      aws: '#FF9900'
    };
    
    const backgroundColor = fallbackColors[category.value] || '#667eea';
    const textColor = category.value === 'javascript' || category.value === 'nextjs' || 
                     category.value === 'express' || category.value === 'flask' ? '#000000' : 'white';
    
    fallbackDiv.style.cssText = `
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${textColor};
      font-size: 20px;
      font-weight: bold;
      border-radius: 8px;
      background: ${backgroundColor};
      border: 1px solid #e2e8f0;
    `;
    fallbackDiv.textContent = category.label.charAt(0);
    e.target.parentElement.appendChild(fallbackDiv);
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
            <span className="logo-icon">🎓</span>
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
              placeholder="SI-2024-001"
              value={formData.rollNumber}
              onChange={(e) => {
                // Get the current value
                let value = e.target.value;
                
                // Convert to uppercase
                value = value.toUpperCase();
                
                // Only allow alphanumeric and dash
                value = value.replace(/[^A-Z0-9-]/g, '');
                
                // Auto-add SI- prefix if user types numbers
                if (!value.startsWith('SI-') && /^[0-9]/.test(value)) {
                  value = 'SI-' + value;
                }
                
                // If user clears everything, show empty
                if (value === 'SI-') {
                  value = '';
                }
                
                // Update the state
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
                    <div className={`status ${!category.available ? 'not-available-status' : 'available-status'}`}>
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
                        e.target.style.display = 'none';
                        const fallbackColors = {
                          html: '#E34F26',
                          css: '#1572B6',
                          javascript: '#F7DF1E',
                          react: '#61DAFB',
                          nextjs: '#000000',
                          vue: '#4FC08D',
                          angular: '#DD0031',
                          typescript: '#3178C6',
                          node: '#339933',
                          express: '#000000',
                          python: '#3776AB',
                          django: '#092E20',
                          flask: '#000000',
                          java: '#007396',
                          spring: '#6DB33F',
                          php: '#777BB4',
                          laravel: '#FF2D20',
                          mongodb: '#47A248',
                          mysql: '#4479A1',
                          postgresql: '#336791',
                          mern: '#00C853',
                          graphql: '#E10098',
                          git: '#F05032',
                          docker: '#2496ED',
                          aws: '#FF9900'
                        };
                        
                        const backgroundColor = fallbackColors[selectedCategory.value] || '#667eea';
                        const textColor = selectedCategory.value === 'javascript' || 
                                         selectedCategory.value === 'nextjs' || 
                                         selectedCategory.value === 'express' || 
                                         selectedCategory.value === 'flask' ? '#000000' : 'white';
                        
                        const fallbackSpan = document.createElement('span');
                        fallbackSpan.style.cssText = `
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          width: 30px;
                          height: 30px;
                          background-color: ${backgroundColor};
                          color: ${textColor};
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallbackColors = {
                              html: '#E34F26',
                              css: '#1572B6',
                              javascript: '#F7DF1E',
                              react: '#61DAFB',
                              nextjs: '#000000',
                              vue: '#4FC08D',
                              angular: '#DD0031',
                              typescript: '#3178C6',
                              node: '#339933',
                              express: '#000000',
                              python: '#3776AB',
                              django: '#092E20',
                              flask: '#000000',
                              java: '#007396',
                              spring: '#6DB33F',
                              php: '#777BB4',
                              laravel: '#FF2D20',
                              mongodb: '#47A248',
                              mysql: '#4479A1',
                              postgresql: '#336791',
                              mern: '#00C853',
                              graphql: '#E10098',
                              git: '#F05032',
                              docker: '#2496ED',
                              aws: '#FF9900'
                            };
                            
                            const backgroundColor = fallbackColors[selectedCategory.value] || '#667eea';
                            const textColor = selectedCategory.value === 'javascript' || 
                                             selectedCategory.value === 'nextjs' || 
                                             selectedCategory.value === 'express' || 
                                             selectedCategory.value === 'flask' ? '#000000' : 'white';
                            
                            const fallbackSpan = document.createElement('span');
                            fallbackSpan.style.cssText = `
                              display: inline-flex;
                              align-items: center;
                              justify-content: center;
                              width: 20px;
                              height: 20px;
                              background-color: ${backgroundColor};
                              color: ${textColor};
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