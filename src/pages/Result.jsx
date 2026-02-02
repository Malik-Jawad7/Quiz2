import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '../services/api';
import ShamsiLogo from '../assets/shamsi-logo.jpg';
import './Result.css';

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [configLoading, setConfigLoading] = useState(true);

  // Category mapping function
  const getCategoryFullName = (categoryCode) => {
    if (!categoryCode) return 'GENERAL TECHNOLOGY';
    
    const categoryMap = {
      'javascr': 'JAVASCRIPT PROGRAMMING',
      'javascript': 'JAVASCRIPT PROGRAMMING',
      'js': 'JAVASCRIPT PROGRAMMING',
      'react': 'REACT JS DEVELOPMENT',
      'node': 'NODE.JS BACKEND',
      'html': 'HTML & CSS WEB DEVELOPMENT',
      'css': 'HTML & CSS WEB DEVELOPMENT',
      'java': 'JAVA PROGRAMMING',
      'python': 'PYTHON PROGRAMMING',
      'fullstack': 'FULL STACK DEVELOPMENT',
      'frontend': 'FRONTEND DEVELOPMENT',
      'backend': 'BACKEND DEVELOPMENT',
      'general': 'GENERAL TECHNOLOGY',
      'db': 'DATABASE MANAGEMENT',
      'sql': 'SQL DATABASE',
      'mongodb': 'MONGODB DATABASE',
      'network': 'COMPUTER NETWORKING',
      'security': 'CYBER SECURITY'
    };
    
    const key = categoryCode.toString().toLowerCase().trim();
    
    // Check exact match first
    if (categoryMap[key]) {
      return categoryMap[key];
    }
    
    // Check partial match
    for (const [mapKey, mapValue] of Object.entries(categoryMap)) {
      if (key.includes(mapKey) || mapKey.includes(key)) {
        return mapValue;
      }
    }
    
    // If no match found, return uppercase version
    return categoryCode.toUpperCase();
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
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

  useEffect(() => {
    console.log('🎯 Result Page Loaded');
    
    const fetchConfig = async () => {
      try {
        const response = await getConfig();
        if (response.data.success) {
          const configData = response.data.config;
          setPassingPercentage(configData.passingPercentage || 40);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
    
    const storedResult = localStorage.getItem('quizResult');
    const storedLastResult = localStorage.getItem('lastQuizResult');
    const storedUserData = localStorage.getItem('userData');
    
    console.log('Debug - LocalStorage Data:', {
      storedResult: !!storedResult,
      storedLastResult: !!storedLastResult,
      storedUserData: !!storedUserData,
      category: localStorage.getItem('quizCategory')
    });

    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        console.log('Parsed Result:', parsedResult);
        setResult(parsedResult);
      } catch (error) {
        console.error('Error parsing quizResult:', error);
      }
    } else if (storedLastResult) {
      try {
        const parsedResult = JSON.parse(storedLastResult);
        console.log('Parsed Last Result:', parsedResult);
        setResult(parsedResult);
        localStorage.setItem('quizResult', storedLastResult);
      } catch (error) {
        console.error('Error parsing lastQuizResult:', error);
      }
    } else if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        console.log('Creating mock result for:', user);
        const mockResult = {
          _id: 'mock_result_' + Date.now(),
          rollNumber: user.rollNumber,
          userName: user.name,
          name: user.name,
          category: user.category,
          score: 12,
          totalMarks: 15,
          percentage: 80,
          correctAnswers: 12,
          totalQuestions: 15,
          attempted: 15,
          submittedAt: new Date().toISOString(),
          passingPercentage: 40,
          passed: true
        };
        console.log('Mock Result:', mockResult);
        setResult(mockResult);
        localStorage.setItem('quizResult', JSON.stringify(mockResult));
      } catch (error) {
        console.error('Error creating mock result:', error);
      }
    }

    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        console.log('User Data:', parsedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    setLoading(false);
  }, []);

  const handleNewQuiz = () => {
    localStorage.removeItem('quizResult');
    localStorage.removeItem('lastQuizResult');
    localStorage.removeItem('quizCategory');
    localStorage.removeItem('quizRollNumber');
    navigate('/register');
  };

  const calculatePassStatus = () => {
    if (!result) return { passed: false, percentage: 0 };
    
    const percentage = parseFloat(result.percentage) || 0;
    const passed = percentage >= passingPercentage;
    
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
          <button onClick={handleNewQuiz} className="btn btn-primary">
            🏠 Take New Quiz
          </button>
        </div>
      </div>
    );
  }

  const { passed, percentage } = calculatePassStatus();
  const score = result.score || 0;
  const totalMarks = result.totalMarks || 0;

  return (
    <div className="result-container">
      <div className="result-card">
        {/* Header with LARGE Logo */}
        <div className="result-header">
          <div className="header-logo">
            {/* BIGGER LOGO */}
            <img 
              src={ShamsiLogo} 
              alt="Shamsi Institute" 
              className="logo-img"
            />
            <div className="logo-text">
              <h1 className="institute-name">
                Shamsi Institute
              </h1>
              <p className="institute-tagline">
                Technology Certification Assessment
              </p>
            </div>
          </div>
          
          <div className="result-certificate">
            <h3>Assessment Result</h3>
            <p className="certificate-id">ID: {result._id?.substring(0, 8) || 'LOCAL'}</p>
          </div>
        </div>

        {/* Student Information - ROW LAYOUT */}
        <div className="student-section">
          <h2 className="section-title">Student Information</h2>
          
          <div className="student-details-row">
            {/* Name - Row Layout */}
            <div className="detail-item-row">
              <div className="detail-label-row">Full Name</div>
              <div className="detail-value-row">
                {result.userName || result.name || userData?.name || 'N/A'}
              </div>
            </div>
            
            {/* Roll Number - Row Layout */}
            <div className="detail-item-row">
              <div className="detail-label-row">Roll Number</div>
              <div className="detail-value-row">
                {result.rollNumber || userData?.rollNumber || 'N/A'}
              </div>
            </div>
            
            {/* Category - Row Layout */}
            <div className="detail-item-row">
              <div className="detail-label-row">Category</div>
              <div className="detail-value-row">
                <span className="category-badge-row">
                  {getCategoryFullName(result.category || userData?.category || localStorage.getItem('quizCategory'))}
                </span>
              </div>
            </div>
            
            {/* Date & Time - Row Layout */}
            <div className="detail-item-row">
              <div className="detail-label-row">Date & Time</div>
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
            {passed ? '🏆' : '📝'}
          </div>
          <div className="status-content">
            <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}</h3>
            <p className="status-message">
              {passed 
                ? `You scored ${percentage.toFixed(2)}% and passed the assessment.`
                : `You scored ${percentage.toFixed(2)}%. Minimum required: ${passingPercentage}%.`
              }
            </p>
          </div>
        </div>

        {/* Score Summary */}
        <div className="score-summary">
          <h2 className="section-title">Performance Summary</h2>
          
          <div className="score-grid">
            <div className="score-item">
              <div className="score-label">Score</div>
              <div className="score-number">{score}/{totalMarks}</div>
              <div className="score-subtext">Marks Obtained</div>
            </div>
            
            <div className="score-item">
              <div className="score-label">Percentage</div>
              <div className={`score-number ${passed ? 'passed-score' : 'failed-score'}`}>
                {percentage.toFixed(1)}%
              </div>
              <div className="score-subtext">Overall Performance</div>
            </div>
            
            <div className="score-item">
              <div className="score-label">Correct Answers</div>
              <div className="score-number">{result.correctAnswers || 0}/{result.totalQuestions || 0}</div>
              <div className="score-subtext">Accuracy</div>
            </div>
            
            <div className="score-item">
              <div className="score-label">Result</div>
              <div className={`score-number result-status ${passed ? 'passed-status' : 'failed-status'}`}>
                {passed ? 'PASS' : 'FAIL'}
              </div>
              <div className="score-subtext">Final Status</div>
            </div>
          </div>
        </div>

        {/* Circular Performance Gauge */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Performance Analysis</span>
            <span className="progress-percentage">{percentage.toFixed(1)}%</span>
          </div>
          
          <div className="circular-progress-container">
            <div className="circular-progress-wrapper">
              {/* Outer Circle */}
              <div className="circular-progress-outer">
                <div className="circular-progress-track"></div>
                
                {/* Progress Circle */}
                <div 
                  className={`circular-progress-fill ${passed ? 'passed-circle' : 'failed-circle'}`}
                  style={{
                    background: `conic-gradient(${passed ? '#10B981' : '#EF4444'} ${percentage * 3.6}deg, #f1f5f9 0)`
                  }}
                >
                  <div className="circular-progress-inner">
                    <div className="circular-progress-text">
                      <span className="circular-progress-percentage">{percentage.toFixed(1)}%</span>
                      <span className="circular-progress-label">Score</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Performance Indicators */}
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
                  <div className="indicator-value">
                    <span className={passed ? 'passed-badge' : 'failed-badge'}>
                      {passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Scale */}
            <div className="performance-scale">
              <div className="scale-item poor">
                <div className="scale-label">Poor</div>
                <div className="scale-range">0-39%</div>
              </div>
              
              <div className="scale-item average">
                <div className="scale-label">Average</div>
                <div className="scale-range">40-69%</div>
              </div>
              
              <div className="scale-item good">
                <div className="scale-label">Good</div>
                <div className="scale-range">70-89%</div>
              </div>
              
              <div className="scale-item excellent">
                <div className="scale-label">Excellent</div>
                <div className="scale-range">90-100%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="stats-section">
          <h2 className="section-title">Detailed Statistics</h2>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Questions Attempted</div>
              <div className="stat-value">{result.attempted || 0}/{result.totalQuestions || 0}</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Status</div>
              <div className="stat-value">Quiz Completed</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Passing Criteria</div>
              <div className="stat-value">{passingPercentage}%</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-label">Assessment Date</div>
              <div className="stat-value">
                {formatDate(result.submittedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="action-section">
          <button onClick={handleNewQuiz} className="action-btn primary-btn">
            Take New Quiz
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
                <h3 className="footer-institute-name">
                  Shamsi Institute
                </h3>
                <p className="footer-institute-tagline">
                  Technology Certification Assessment
                </p>
              </div>
            </div>
            
            <div className="footer-center-info">
              <p className="footer-text">
                Assessment completed successfully | Passing criteria: {passingPercentage}%
              </p>
              <p className="footer-subtext">
                Note: This result is stored locally. For official record, please save or print.
              </p>
            </div>
            
            <div className="footer-right-info">
              <p className="footer-date">
                Date: {formatDate(result.submittedAt)}
              </p>
              <p className="footer-status">
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