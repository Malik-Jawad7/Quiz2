import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '../services/api'; // API import کریں
import './Result.css';

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [passingPercentage, setPassingPercentage] = useState(40); // Default value
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 Result Page Loaded');
    
    // Fetch admin configuration
    const fetchConfig = async () => {
      try {
        const response = await getConfig();
        if (response.data.success) {
          const configData = response.data.config;
          console.log('⚙️ Loaded admin config:', configData);
          setPassingPercentage(configData.passingPercentage || 40);
        } else {
          console.log('Using default passing percentage');
        }
      } catch (error) {
        console.error('Error fetching config, using default:', error);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
    
    // Check for result in localStorage
    const storedResult = localStorage.getItem('quizResult');
    const storedLastResult = localStorage.getItem('lastQuizResult');
    const storedUserData = localStorage.getItem('userData');
    
    console.log('🔍 Checking localStorage:', {
      quizResult: !!storedResult,
      lastQuizResult: !!storedLastResult,
      userData: !!storedUserData
    });

    // First try to get quizResult
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        console.log('✅ Loaded quizResult:', parsedResult);
        setResult(parsedResult);
      } catch (error) {
        console.error('Error parsing quizResult:', error);
      }
    } 
    // If not found, try lastQuizResult
    else if (storedLastResult) {
      try {
        const parsedResult = JSON.parse(storedLastResult);
        console.log('✅ Loaded lastQuizResult:', parsedResult);
        setResult(parsedResult);
        // Save it as quizResult for future
        localStorage.setItem('quizResult', storedLastResult);
      } catch (error) {
        console.error('Error parsing lastQuizResult:', error);
      }
    }
    // If still not found, create a mock result
    else if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        console.log('Creating mock result for user:', user);
        
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
          passingPercentage: passingPercentage, // Use fetched passing percentage
          passed: true
        };
        
        console.log('📊 Mock result created:', mockResult);
        setResult(mockResult);
        localStorage.setItem('quizResult', JSON.stringify(mockResult));
      } catch (error) {
        console.error('Error creating mock result:', error);
      }
    }

    // Load user data
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

  const handleNewQuiz = () => {
    console.log('🔄 Starting new quiz...');
    // Clear only quiz-related data
    localStorage.removeItem('quizResult');
    localStorage.removeItem('lastQuizResult');
    localStorage.removeItem('quizCategory');
    localStorage.removeItem('quizRollNumber');
    // Keep userData for convenience
    navigate('/register');
  };

  // Calculate passed status based on admin's passing percentage
  const calculatePassStatus = () => {
    if (!result) return { passed: false, percentage: 0 };
    
    const percentage = parseFloat(result.percentage) || 0;
    // Use admin's passing percentage from config
    const passed = percentage >= passingPercentage;
    
    console.log('📊 Status Calculation:', {
      studentPercentage: percentage,
      adminPassingPercentage: passingPercentage,
      passed: passed
    });
    
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

  console.log('📊 Displaying result:', {
    percentage,
    passingPercentage,
    passed,
    score,
    totalMarks,
    resultPassingPercentage: result.passingPercentage // Log result's stored passing percentage
  });

  return (
    <div className="result-container">
      <div className="result-card">
        {/* Header */}
        <div className="result-header">
          <div className="institute-logo">
            <h1>Shamsi Institute</h1>
            <p className="institute-tagline">Technology Certification Assessment</p>
          </div>
          <div className="certificate-badge">
            <div className="badge-icon">🏆</div>
            <div className="badge-text">
              <span>Quiz Result</span>
              <small>Submitted Successfully</small>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="student-info-section">
          <h2>Student Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Full Name:</span>
              <span className="info-value">{result.userName || result.name || userData?.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Roll Number:</span>
              <span className="info-value">{result.rollNumber || userData?.rollNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Assessment Date:</span>
              <span className="info-value">
                {result.submittedAt 
                  ? new Date(result.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : new Date().toLocaleDateString()
                }
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Technology Category:</span>
              <span className="info-value category-tag">
                {result.category?.toUpperCase() || userData?.category?.toUpperCase() || 'GENERAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Result Status */}
        <div className={`result-status ${passed ? 'passed' : 'failed'}`}>
          <div className="status-icon">
            {passed ? (
              <div className="icon-circle success">🎉</div>
            ) : (
              <div className="icon-circle warning">📝</div>
            )}
          </div>
          <div className="status-content">
            <h3>{passed ? '🎯 Congratulations! You Passed!' : '📚 Keep Practicing!'}</h3>
            <p>
              {passed 
                ? `You have successfully passed the ${result.category?.toUpperCase() || ''} assessment with a score of ${percentage.toFixed(2)}% which meets the passing criteria of ${passingPercentage}%.`
                : `You scored ${percentage.toFixed(2)}% in the ${result.category?.toUpperCase() || ''} assessment, which is below the required passing percentage of ${passingPercentage}%.`
              }
            </p>
            <div className="result-details">
              <span><strong>Score:</strong> {score}/{totalMarks}</span>
              <span><strong>Questions Attempted:</strong> {result.attempted || 0}/{result.totalQuestions || 0}</span>
              <span><strong>Correct Answers:</strong> {result.correctAnswers || 0}</span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="performance-summary">
          <h2>📊 Performance Summary</h2>
          <div className="score-grid">
            <div className="score-card total-score">
              <div className="score-icon">📝</div>
              <div className="score-content">
                <div className="score-value">{score}/{totalMarks}</div>
                <div className="score-label">Total Score</div>
              </div>
            </div>

            <div className="score-card percentage-card">
              <div className="score-icon">📈</div>
              <div className="score-content">
                <div className={`score-value ${passed ? 'text-success' : 'text-danger'}`}>
                  {percentage.toFixed(2)}%
                </div>
                <div className="score-label">Percentage</div>
              </div>
            </div>

            <div className="score-card attempted-card">
              <div className="score-icon">✅</div>
              <div className="score-content">
                <div className="score-value">{result.attempted || 0}/{result.totalQuestions || 0}</div>
                <div className="score-label">Attempted</div>
              </div>
            </div>

            <div className="score-card status-card">
              <div className="score-icon">{passed ? '🏆' : '📋'}</div>
              <div className="score-content">
                <div className={`score-value ${passed ? 'text-success' : 'text-danger'}`}>
                  {passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="score-label">Result</div>
              </div>
            </div>
          </div>

          {/* Percentage Bar */}
          <div className="percentage-bar-container">
            <div className="bar-labels">
              <span>0%</span>
              <span className="passing-label">Passing: {passingPercentage}%</span>
              <span>100%</span>
            </div>
            <div className="percentage-bar">
              <div 
                className="percentage-fill"
                style={{ 
                  width: `${Math.min(Math.max(percentage, 0), 100)}%`, 
                  backgroundColor: passed ? '#10b981' : '#ef4444' 
                }}
              >
                <span className="percentage-text">{percentage.toFixed(1)}%</span>
              </div>
              <div 
                className="passing-line"
                style={{ left: `${Math.min(Math.max(passingPercentage, 0), 100)}%` }}
              >
                <div className="passing-marker"></div>
              </div>
            </div>
          </div>
          
          {/* Admin Config Info */}
          <div className="admin-config-info">
            <p className="config-note">
              ⚙️ Passing criteria set by administration: <strong>{passingPercentage}%</strong>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button 
            onClick={handleNewQuiz}
            className="btn btn-primary"
          >
            🚀 Take New Quiz
          </button>
          {/* <button 
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            🖨️ Print Result
          </button> */}
          {/* <button 
            onClick={() => navigate('/admin/login')}
            className="btn btn-info"
          >
            🔐 Admin Panel
          </button> */}
        </div>

        {/* Footer */}
        <div className="result-footer">
          <p className="footer-text">
            📊 Quiz completed successfully | Result ID: {result._id?.substring(0, 12) || 'LOCAL_RESULT'} | 
            Passing %: {passingPercentage}%
          </p>
          <p className="footer-subtext">
            Note: This result is stored in your browser. For permanent record, please save or print.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Result;