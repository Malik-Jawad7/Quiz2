import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Result.css';

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [config, setConfig] = useState({
    passingPercentage: 40,
    quizTime: 30
  });

  useEffect(() => {
    const storedResult = localStorage.getItem('quizResult');
    
    if (!storedResult) {
      navigate('/');
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult);
      setResult(parsedResult);
    } catch (error) {
      console.error('Error parsing result:', error);
      navigate('/');
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="result-container loading">
        <div className="loading-spinner"></div>
        <p>Loading your result...</p>
      </div>
    );
  }

  const percentage = parseFloat(result.percentage) || 0;
  const passed = percentage >= (result.passingPercentage || config.passingPercentage);
  const score = result.score || 0;
  const totalQuestions = result.totalQuestions || 0;

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-header">
          <h1>Shamsi Institute of Technology</h1>
          <h2>Quiz Result</h2>
        </div>

        <div className="student-info">
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{result.userName || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Roll Number:</span>
            <span className="info-value">{result.rollNumber || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Category:</span>
            <span className="info-value category-badge">
              {(result.category || 'general').toUpperCase()}
            </span>
          </div>
        </div>

        <div className={`result-status ${passed ? 'passed' : 'failed'}`}>
          <div className="status-icon">
            {passed ? '🏆' : '📝'}
          </div>
          <div className="status-content">
            <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Trying!'}</h3>
            <p>
              {passed 
                ? `You scored ${percentage.toFixed(2)}% which is above the passing criteria of ${result.passingPercentage || config.passingPercentage}%.`
                : `You scored ${percentage.toFixed(2)}% which is below the passing criteria of ${result.passingPercentage || config.passingPercentage}%.`
              }
            </p>
          </div>
        </div>

        <div className="score-details">
          <h3>Performance Summary</h3>
          <div className="score-grid">
            <div className="score-item">
              <div className="score-icon">📊</div>
              <div className="score-info">
                <span className="score-label">Score</span>
                <span className="score-value">{score}/{totalQuestions}</span>
              </div>
            </div>
            <div className="score-item">
              <div className="score-icon">💯</div>
              <div className="score-info">
                <span className="score-label">Percentage</span>
                <span className={`score-value ${passed ? 'text-success' : 'text-danger'}`}>
                  {percentage.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="score-item">
              <div className="score-icon">🎯</div>
              <div className="score-info">
                <span className="score-label">Status</span>
                <span className={`score-value ${passed ? 'text-success' : 'text-danger'}`}>
                  {passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
            className="btn btn-primary"
          >
            📝 New Registration
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="btn btn-info"
          >
            🔧 Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;