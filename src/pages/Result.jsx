import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '../services/api';
import ShamsiLogo from '../assets/shamsi-logo.jpg';
import './Result.css';

// Add icons
import { 
  FaClock, 
  FaPercentage, 
  FaListOl, 
  FaCheckCircle, 
  FaTimesCircle,
  FaCog,
  FaSpinner,
  FaUser,
  FaIdCard,
  FaTag,
  FaCalendarAlt,
  FaTrophy,
  FaBook
} from 'react-icons/fa';

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // Config states from Admin Panel
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 50
  });
  
  const [configLoading, setConfigLoading] = useState(true);
  const [configSource, setConfigSource] = useState('default');

  // Fetch configuration from API and localStorage
  const fetchConfiguration = async () => {
    try {
      // First check localStorage
      const savedConfig = localStorage.getItem('quizConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setConfigSource('localStorage');
      }
      
      // Then try API for latest config
      const response = await getConfig();
      if (response.success && response.config) {
        const apiConfig = response.config;
        setConfig(apiConfig);
        setConfigSource('api');
        
        // Save to localStorage
        localStorage.setItem('quizConfig', JSON.stringify(apiConfig));
      }
    } catch (error) {
      console.error('Error loading config:', error);
      // Use default if nothing available
      if (!localStorage.getItem('quizConfig')) {
        setConfigSource('default');
      }
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    // Step 1: Fetch configuration
    fetchConfiguration();
    
    // Step 2: Load result data
    const storedResult = localStorage.getItem('quizResult');
    const storedLastResult = localStorage.getItem('lastQuizResult');
    const storedUserData = localStorage.getItem('userData');

    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        setResult(parsedResult);
      } catch (error) {
        console.error('Error parsing quizResult:', error);
      }
    } else if (storedLastResult) {
      try {
        const parsedResult = JSON.parse(storedLastResult);
        setResult(parsedResult);
      } catch (error) {
        console.error('Error parsing lastQuizResult:', error);
      }
    }

    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    setLoading(false);
  }, []);

  // Category mapping function
  const getCategoryFullName = (categoryCode) => {
    if (!categoryCode) return 'GENERAL TECHNOLOGY';
    
    const categoryMap = {
      'html': 'HTML & CSS WEB DEVELOPMENT',
      'css': 'HTML & CSS WEB DEVELOPMENT',
      'javascript': 'JAVASCRIPT PROGRAMMING',
      'react': 'REACT JS DEVELOPMENT',
      'node': 'NODE.JS BACKEND',
      'java': 'JAVA PROGRAMMING',
      'python': 'PYTHON PROGRAMMING',
      'mongodb': 'MONGODB DATABASE',
      'mysql': 'SQL DATABASE',
      'postgresql': 'POSTGRESQL DATABASE',
      'aws': 'AWS CLOUD',
      'docker': 'DOCKER CONTAINERS',
      'git': 'GIT VERSION CONTROL',
      'linux': 'LINUX ADMINISTRATION'
    };
    
    const key = categoryCode.toString().toLowerCase().trim();
    
    // Check exact match first
    if (categoryMap[key]) {
      return categoryMap[key];
    }
    
    // If no match found, return formatted version
    return categoryCode.replace(/([A-Z])/g, ' $1').toUpperCase();
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date/Time';
    }
  };

  const calculatePassStatus = () => {
    if (!result) return { passed: false, percentage: 0 };
    
    const percentage = parseFloat(result.percentage) || 0;
    // Use passing percentage from Admin Panel config
    const passed = percentage >= config.passingPercentage;
    
    return { passed, percentage };
  };

  if (loading || configLoading) {
    return (
      <div className="result-container loading">
        <div className="loading-spinner"></div>
        <h3>Loading Your Result...</h3>
        <p>Please wait while we process your quiz data</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-container error">
        <div className="error-icon">📄</div>
        <h3>Result Not Available</h3>
        <p>Your quiz result could not be found. Please take the quiz again.</p>
        <div className="result-actions">
          <button onClick={() => navigate('/register')} className="btn btn-primary">
            Take New Quiz
          </button>
        </div>
      </div>
    );
  }

  const { passed, percentage } = calculatePassStatus();
  const score = result.score || 0;
  const totalMarks = result.totalMarks || 0;
  const correctAnswers = result.correctAnswers || 0;
  const totalQuestions = result.totalQuestions || 0;

  return (
    <div className="result-container">
      <div className="result-card">
        {/* Header */}
        <div className="result-header">
          <div className="header-logo">
            <img 
              src={ShamsiLogo} 
              alt="Shamsi Institute" 
              className="logo-img"
            />
            <div className="logo-text">
              <h1 className="institute-name">Shamsi Institute</h1>
              <p className="institute-tagline">Technology Certification Assessment</p>
            </div>
          </div>
          
          {/* Config Source Indicator */}
          <div className="config-source-indicator">
            <span className={`source-badge ${configSource}`}>
              <FaCog /> Config Source: {configSource}
            </span>
          </div>
        </div>

        {/* Assessment Configuration Section */}
        <div className="assessment-config-section">
          <h2 className="section-title">
            <FaCog /> Assessment Configuration (Set by Admin)
          </h2>
          <div className="config-details-grid">
            <div className="config-item">
              <div className="config-icon">
                <FaClock />
              </div>
              <div className="config-content">
                <div className="config-label">Time Limit</div>
                <div className="config-value">{config.quizTime} minutes</div>
              </div>
            </div>
            
            <div className="config-item highlight">
              <div className="config-icon">
                <FaPercentage />
              </div>
              <div className="config-content">
                <div className="config-label">Passing Percentage</div>
                <div className="config-value">{config.passingPercentage}%</div>
              </div>
            </div>
            
            <div className="config-item">
              <div className="config-icon">
                <FaListOl />
              </div>
              <div className="config-content">
                <div className="config-label">Total Questions</div>
                <div className="config-value">{config.totalQuestions}</div>
              </div>
            </div>
            
            <div className="config-item">
              <div className="config-icon">
                {passed ? <FaCheckCircle /> : <FaTimesCircle />}
              </div>
              <div className="config-content">
                <div className="config-label">Required to Pass</div>
                <div className="config-value">≥ {config.passingPercentage}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="student-section">
          <h2 className="section-title">
            <FaUser /> Student Information
          </h2>
          <div className="student-details-grid">
            <div className="student-detail-item">
              <div className="detail-icon">
                <FaUser />
              </div>
              <div className="detail-content">
                <div className="detail-label">Full Name</div>
                <div className="detail-value">
                  {result.userName || result.name || userData?.name || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="student-detail-item">
              <div className="detail-icon">
                <FaIdCard />
              </div>
              <div className="detail-content">
                <div className="detail-label">Roll Number</div>
                <div className="detail-value">
                  {result.rollNumber || userData?.rollNumber || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="student-detail-item">
              <div className="detail-icon">
                <FaTag />
              </div>
              <div className="detail-content">
                <div className="detail-label">Technology Category</div>
                <div className="detail-value">
                  <span className="category-badge">
                    {getCategoryFullName(result.category || userData?.category)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="student-detail-item">
              <div className="detail-icon">
                <FaCalendarAlt />
              </div>
              <div className="detail-content">
                <div className="detail-label">Date & Time</div>
                <div className="detail-value">
                  {formatDateTime(result.submittedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Status */}
        <div className={`status-section ${passed ? 'passed' : 'failed'}`}>
          <div className="status-icon">
            {passed ? <FaTrophy /> : <FaBook />}
          </div>
          <div className="status-content">
            <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}</h3>
            <p className="status-message">
              {passed 
                ? `You scored ${percentage.toFixed(2)}% and passed the assessment. (Required: ${config.passingPercentage}%)`
                : `You scored ${percentage.toFixed(2)}%. Required to pass: ${config.passingPercentage}%`
              }
            </p>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="performance-comparison-section">
          <h2 className="section-title">Performance Analysis</h2>
          
          <div className="comparison-container">
            <div className="comparison-bar">
              <div className="bar-labels">
                <span>0%</span>
                <span className="passing-line-label">
                  Passing: {config.passingPercentage}%
                </span>
                <span>100%</span>
              </div>
              
              <div className="bar-track-container">
                <div className="bar-track"></div>
                <div 
                  className="bar-passing-line"
                  style={{ left: `${config.passingPercentage}%` }}
                >
                  <div className="passing-label">Passing Line</div>
                </div>
                <div 
                  className={`bar-fill ${passed ? 'passed-fill' : 'failed-fill'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                >
                  <div className="fill-label">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            </div>
            
            <div className="comparison-stats">
              <div className="comparison-stat">
                <div className="stat-label">Your Score</div>
                <div className={`stat-value ${passed ? 'passed' : 'failed'}`}>
                  {percentage.toFixed(1)}%
                </div>
              </div>
              
              <div className="comparison-stat">
                <div className="stat-label">Passing Score</div>
                <div className="stat-value">{config.passingPercentage}%</div>
              </div>
              
              <div className="comparison-stat">
                <div className="stat-label">Difference</div>
                <div className={`stat-value ${percentage >= config.passingPercentage ? 'positive' : 'negative'}`}>
                  {percentage >= config.passingPercentage ? '+' : ''}{(percentage - config.passingPercentage).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="score-summary">
          <h2 className="section-title">Performance Summary</h2>
          
          <div className="score-grid">
            <div className="score-item">
              <div className="score-label">Marks Obtained</div>
              <div className="score-number">{score}/{totalMarks}</div>
              <div className="score-subtext">Score</div>
            </div>
            
            <div className="score-item highlight">
              <div className="score-label">Your Percentage</div>
              <div className={`score-number ${passed ? 'passed-score' : 'failed-score'}`}>
                {percentage.toFixed(1)}%
              </div>
              <div className="score-subtext">Your Performance</div>
            </div>
            
            <div className="score-item">
              <div className="score-label">Passing Percentage</div>
              <div className="score-number required-percentage">
                {config.passingPercentage}%
              </div>
              <div className="score-subtext">Set by Admin</div>
            </div>
            
            <div className="score-item">
              <div className="score-label">Result Status</div>
              <div className={`score-number result-status ${passed ? 'passed-status' : 'failed-status'}`}>
                {passed ? 'PASS' : 'FAIL'}
              </div>
              <div className="score-subtext">Final Result</div>
            </div>
          </div>
          
          <div className="detailed-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">Correct Answers:</span>
                <span className="stat-value">{correctAnswers}/{totalQuestions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Attempted:</span>
                <span className="stat-value">{result.attempted || 0}/{totalQuestions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">
                  {totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="action-section">
          <button onClick={() => navigate('/register')} className="action-btn primary-btn">
            Take New Quiz
          </button>
          <button onClick={() => window.print()} className="action-btn secondary-btn">
            Print Result
          </button>
        </div>

        {/* Footer */}
        <footer className="result-footer-blue">
          <div className="footer-content-blue">
            <div className="footer-left">
              <h3>Shamsi Institute</h3>
              <p>Technology Certification Assessment</p>
            </div>
            
            <div className="footer-center">
              <p>Assessment completed successfully</p>
              <p className="footer-subtext">
                Passing percentage set by Admin: <strong>{config.passingPercentage}%</strong>
              </p>
            </div>
            
            <div className="footer-right">
              <p>Date: {formatDateTime(result.submittedAt)}</p>
              <p>
                Status: <span className={passed ? 'passed-badge' : 'failed-badge'}>
                  {passed ? 'PASSED' : 'FAILED'}
                </span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Result;