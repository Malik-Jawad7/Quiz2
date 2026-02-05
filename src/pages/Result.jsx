import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '../services/api';
import ShamsiLogo from '../assets/shamsi-logo.jpg';
import './Result.css';

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
  FaCalendarAlt,
  FaTrophy,
  FaBook,
  FaFileAlt,
  FaGraduationCap,
  FaChartLine,
  FaChartBar,
  FaUserGraduate,
  FaAward,
  FaCertificate,
  FaCrown,
  FaStar,
  FaShieldAlt,
  FaBrain,
  FaLightbulb,
  FaRocket,
  FaRegClock,
  FaRegChartBar,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRegUser,
  FaRegCalendarAlt,
  FaUniversity,
  FaChalkboardTeacher,
  FaLaptopCode
} from 'react-icons/fa';

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 50
  });
  
  const [configLoading, setConfigLoading] = useState(true);
  const [configSource, setConfigSource] = useState('default');

  const fetchConfiguration = async () => {
    try {
      const savedConfig = localStorage.getItem('quizConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        setConfigSource('localStorage');
      }
      
      const response = await getConfig();
      if (response.success && response.config) {
        const apiConfig = response.config;
        setConfig(apiConfig);
        setConfigSource('api');
        localStorage.setItem('quizConfig', JSON.stringify(apiConfig));
      }
    } catch (error) {
      console.error('Error loading config:', error);
      if (!localStorage.getItem('quizConfig')) {
        setConfigSource('default');
      }
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguration();
    
    const storedResult = localStorage.getItem('quizResult');
    const storedLastResult = localStorage.getItem('lastQuizResult');
    const storedUserData = localStorage.getItem('userData');

    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        setResult(parsedResult);
        console.log('📊 Result data loaded:', parsedResult);
      } catch (error) {
        console.error('Error parsing quizResult:', error);
      }
    } else if (storedLastResult) {
      try {
        const parsedResult = JSON.parse(storedLastResult);
        setResult(parsedResult);
        console.log('📊 Last result data loaded:', parsedResult);
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
      'aws': 'AWS CLOUD',
      'docker': 'DOCKER CONTAINERS',
      'git': 'GIT VERSION CONTROL'
    };
    
    const key = categoryCode.toString().toLowerCase().trim();
    
    if (categoryMap[key]) {
      return categoryMap[key];
    }
    
    return categoryCode.replace(/([A-Z])/g, ' $1').toUpperCase();
  };

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

  // FIXED: calculatePassStatus function
  const calculatePassStatus = () => {
    if (!result) return { passed: false, percentage: 0 };
    
    console.log('🧮 Calculating pass status with result:', result);
    
    let percentage = 0;
    let numerator = 0;
    let denominator = 100; // Default denominator
    
    // Priority 1: Direct percentage field
    if (result.percentage !== undefined && result.percentage !== null) {
      percentage = parseFloat(result.percentage);
      console.log('✅ Using direct percentage:', percentage);
    }
    // Priority 2: From marks (obtainedMarks / totalMarks)
    else if (result.obtainedMarks !== undefined && result.totalMarks !== undefined) {
      numerator = parseFloat(result.obtainedMarks) || 0;
      denominator = parseFloat(result.totalMarks) || 100;
      percentage = (numerator / denominator) * 100;
      console.log('📊 Using marks:', numerator, '/', denominator, '=', percentage);
    }
    // Priority 3: From score (correctAnswers / totalQuestions)
    else if (result.score !== undefined && result.totalQuestions !== undefined) {
      numerator = parseFloat(result.score) || 0;
      denominator = parseFloat(result.totalQuestions) || 1;
      percentage = (numerator / denominator) * 100;
      console.log('🎯 Using score:', numerator, '/', denominator, '=', percentage);
    }
    // Priority 4: From correctAnswers / totalQuestions
    else if (result.correctAnswers !== undefined && result.totalQuestions !== undefined) {
      numerator = parseFloat(result.correctAnswers) || 0;
      denominator = parseFloat(result.totalQuestions) || 1;
      percentage = (numerator / denominator) * 100;
      console.log('✔️ Using correctAnswers:', numerator, '/', denominator, '=', percentage);
    }
    // Priority 5: Try to extract from attempted
    else if (result.attempted !== undefined) {
      const attempted = parseFloat(result.attempted) || 0;
      denominator = result.totalQuestions || config.totalQuestions || 50;
      percentage = (attempted / denominator) * 100;
      console.log('📝 Using attempted:', attempted, '/', denominator, '=', percentage);
    }
    
    // Validate percentage
    if (isNaN(percentage) || !isFinite(percentage)) {
      console.log('⚠️ Invalid percentage, setting to 0');
      percentage = 0;
    }
    
    // Clamp between 0 and 100
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;
    
    // Round to 2 decimal places
    percentage = Math.round(percentage * 100) / 100;
    
    // Determine pass status
    const passingThreshold = result.passingPercentage || config.passingPercentage || 40;
    const passed = percentage >= passingThreshold;
    
    console.log('📈 Final calculation:');
    console.log('  - Percentage:', percentage);
    console.log('  - Passing threshold:', passingThreshold);
    console.log('  - Passed:', passed);
    console.log('  - Result fields available:', Object.keys(result));
    
    return { 
      passed, 
      percentage,
      numerator,
      denominator,
      passingThreshold
    };
  };

  if (loading || configLoading) {
    return (
      <div className="result-container loading">
        <div className="loading-spinner">
          <FaSpinner className="spin-icon" />
        </div>
        <h3>Loading Your Result...</h3>
        <p>Please wait while we process your quiz data</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-container error">
        <div className="error-icon">
          <FaFileAlt />
        </div>
        <h3>Result Not Available</h3>
        <p>Your quiz result could not be found. Please take the quiz again.</p>
        <div className="result-actions">
          <button onClick={() => navigate('/register')} className="btn btn-primary">
            <FaGraduationCap /> Take New Quiz
          </button>
        </div>
      </div>
    );
  }

  const { 
    passed, 
    percentage,
    numerator,
    denominator,
    passingThreshold 
  } = calculatePassStatus();
  
  const score = result.score || result.correctAnswers || numerator || 0;
  const totalMarks = result.totalMarks || denominator || 100;
  const obtainedMarks = result.obtainedMarks || numerator || 0;
  const correctAnswers = result.correctAnswers || numerator || 0;
  const totalQuestions = result.totalQuestions || denominator || 50;
  const attempted = result.attempted || 0;
  const passingPercentage = passingThreshold;

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
          
          <div className="config-source-indicator">
            <span className={`source-badge ${configSource}`}>
              <FaCog /> Config Source: {configSource}
            </span>
          </div>
        </div>

        {/* Debug Info (visible in console only) */}
        {console.log('🔄 Result component rendering with:', {
          result,
          passed,
          percentage,
          passingPercentage
        })}

        {/* Assessment Configuration Section */}
        <div className="assessment-config-section">
          <h2 className="section-title">
            <FaCog /> Assessment Configuration
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
            <FaUserGraduate /> Student Information
          </h2>
          <div className="student-details-row">
            <div className="detail-item-row">
              <div className="detail-label-row">
                <FaUser /> Full Name
              </div>
              <div className="detail-value-row">
                {result.userName || result.name || userData?.name || 'N/A'}
              </div>
            </div>
            
            <div className="detail-item-row">
              <div className="detail-label-row">
                <FaIdCard /> Roll Number
              </div>
              <div className="detail-value-row">
                {result.rollNumber || userData?.rollNumber || 'N/A'}
              </div>
            </div>
            
            <div className="detail-item-row">
              <div className="detail-label-row">
                <FaLaptopCode /> Technology Category
              </div>
              <div className="detail-value-row">
                <span className="category-badge-row">
                  {getCategoryFullName(result.category || userData?.category)}
                </span>
              </div>
            </div>
            
            <div className="detail-item-row">
              <div className="detail-label-row">
                <FaCalendarAlt /> Date & Time
              </div>
              <div className="detail-value-row">
                <span className="date-time-row">
                  {formatDateTime(result.submittedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Result Status */}
        <div className={`status-section ${passed ? 'passed' : 'failed'}`}>
          <div className="status-icon">
            {passed ? <FaCrown /> : <FaBook />}
          </div>
          <div className="status-content">
            <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}</h3>
            <p className="status-message">
              {passed 
                ? `You scored ${percentage.toFixed(2)}% and passed the assessment. (Required: ${passingPercentage}%)`
                : `You scored ${percentage.toFixed(2)}%. Required to pass: ${passingPercentage}%`
              }
            </p>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span>Correct Answers:</span>
                <span>{correctAnswers} / {totalQuestions}</span>
              </div>
              <div className="breakdown-item">
                <span>Attempted:</span>
                <span>{attempted} / {totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Circular Performance Meter */}
        <div className="progress-section">
          <div className="progress-header">
            <h3 className="progress-label">
              <FaChartLine /> Performance Analysis
            </h3>
            <div className="progress-percentage">
              {percentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="circular-progress-container">
            <div className="circular-progress-wrapper">
              <div className="circular-progress-outer">
                <div className="circular-progress-track"></div>
                
                <div 
                  className={`circular-progress-fill ${passed ? 'passed-circle' : 'failed-circle'}`}
                  style={{
                    background: `conic-gradient(${passed ? '#10B981' : '#EF4444'} ${percentage * 3.6}deg, #f1f5f9 ${percentage * 3.6}deg)`
                  }}
                >
                  <div 
                    className="circular-passing-marker"
                    style={{ transform: `rotate(${passingPercentage * 3.6}deg)` }}
                  >
                    <div className="passing-marker-dot"></div>
                    <div className="passing-marker-label">
                      <span className="passing-marker-text">
                        <FaStar /> Passing: {passingPercentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="circular-progress-inner">
                    <div className="circular-progress-text">
                      <span className="circular-progress-percentage">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="circular-progress-label">
                        Your Score
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="circular-indicators">
                <div className="indicator-item">
                  <div className="indicator-dot current-dot"></div>
                  <div className="indicator-label">Your Score</div>
                  <div className="indicator-value">{percentage.toFixed(1)}%</div>
                </div>
                
                <div className="indicator-item">
                  <div className="indicator-dot passing-dot"></div>
                  <div className="indicator-label">Passing Score</div>
                  <div className="indicator-value">{passingPercentage}%</div>
                </div>
                
                <div className="indicator-item">
                  <div className="indicator-dot result-dot"></div>
                  <div className="indicator-label">Result</div>
                  <div className="indicator-value">{passed ? 'PASS' : 'FAIL'}</div>
                </div>
              </div>
            </div>
            
            <div className="performance-scale">
              <div className="scale-item poor">
                <FaTimesCircle className="scale-icon" />
                <div className="scale-label">Needs Improvement</div>
                <div className="scale-range">0 - 39%</div>
              </div>
              
              <div className="scale-item average">
                <FaRegChartBar className="scale-icon" />
                <div className="scale-label">Average</div>
                <div className="scale-range">40 - 59%</div>
              </div>
              
              <div className="scale-item good">
                <FaCheckCircle className="scale-icon" />
                <div className="scale-label">Good</div>
                <div className="scale-range">60 - 79%</div>
              </div>
              
              <div className="scale-item excellent">
                <FaTrophy className="scale-icon" />
                <div className="scale-label">Excellent</div>
                <div className="scale-range">80 - 100%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="score-summary">
          <h2 className="section-title">
            <FaChartBar /> Performance Summary
          </h2>
          
          <div className="score-grid">
            <div className="score-item">
              <div className="score-label">
                <FaRegClock /> Correct Answers
              </div>
              <div className="score-number">{correctAnswers}/{totalQuestions}</div>
              <div className="score-subtext">{correctAnswers} out of {totalQuestions}</div>
            </div>
            
            <div className="score-item highlight">
              <div className="score-label">
                <FaPercentage /> Your Percentage
              </div>
              <div className={`score-number ${passed ? 'passed-score' : 'failed-score'}`}>
                {percentage.toFixed(1)}%
              </div>
              <div className="score-subtext">Your Performance</div>
            </div>
            
            <div className="score-item">
              <div className="score-label">
                <FaShieldAlt /> Passing Percentage
              </div>
              <div className="score-number required-percentage">
                {passingPercentage}%
              </div>
              <div className="score-subtext">Required to Pass</div>
            </div>
            
            <div className="score-item">
              <div className="score-label">
                <FaAward /> Result Status
              </div>
              <div className={`score-number result-status ${passed ? 'passed-status' : 'failed-status'}`}>
                {passed ? <FaCheckCircle /> : <FaTimesCircle />} {passed ? 'PASS' : 'FAIL'}
              </div>
              <div className="score-subtext">Final Result</div>
            </div>
          </div>
          
          <div className="detailed-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">
                  <FaRegCheckCircle /> Score:
                </span>
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <FaBrain /> Attempted Questions:
                </span>
                <span className="stat-value">{attempted}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">
                  <FaLightbulb /> Accuracy:
                </span>
                <span className="stat-value">
                  {attempted > 0 ? ((correctAnswers / attempted) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            {/* Data Source Info */}
            <div className="data-source-info">
              <small>Data from: {Object.keys(result).join(', ')}</small>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="action-section">
          <button onClick={() => navigate('/register')} className="action-btn primary-btn">
            <FaRocket /> Take New Quiz
          </button>
          <button 
            onClick={() => {
              console.log('Current result object:', result);
              console.log('Calculated values:', { passed, percentage, passingPercentage });
            }}
            className="action-btn secondary-btn"
          >
            Debug Info
          </button>
        </div>

        {/* Footer */}
        <footer className="result-footer-blue">
          <div className="footer-content-blue">
            <div className="footer-logo-container">
              <img 
                src={ShamsiLogo} 
                alt="Shamsi Institute" 
                className="footer-logo"
              />
              <div className="footer-institute-info">
                <h3 className="footer-institute-name">Shamsi Institute</h3>
                <p className="footer-institute-tagline">Technology Certification Assessment</p>
              </div>
            </div>
            
            <div className="footer-center-info">
              <p className="footer-text">
                <FaCertificate /> Assessment completed successfully
              </p>
              <p className="footer-subtext">
                Passing percentage required: <strong>{passingPercentage}%</strong>
              </p>
            </div>
            
            <div className="footer-right-info">
              <p className="footer-date">
                <FaRegCalendarAlt /> Date: {formatDateTime(result.submittedAt)}
              </p>
              <p className="footer-status">
                Status: <span className={passed ? 'passed-badge' : 'failed-badge'}>
                  {passed ? <FaCheckCircle /> : <FaTimesCircle />} {passed ? 'PASSED' : 'FAILED'}
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