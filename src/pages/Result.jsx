// src/pages/Result.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Result.css';

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [config, setConfig] = useState({
    passingPercentage: 40
  });

  useEffect(() => {
    const storedResult = localStorage.getItem('quizResult');
    const savedConfig = localStorage.getItem('resultConfig');
    
    if (!storedResult) {
      navigate('/register');
      return;
    }

    try {
      setResult(JSON.parse(storedResult));
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error parsing result:', error);
      navigate('/register');
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
  const passingPercentage = result.passingPercentage || config.passingPercentage || 40;
  const passed = percentage >= passingPercentage;
  const score = result.score || 0;
  const totalMarks = result.totalMarks || 0;

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
            <div className="badge-icon">
              <i className="fas fa-award"></i>
            </div>
            <div className="badge-text">
              <span>Official Result</span>
              <small>MongoDB ID: {result._id?.substring(0, 12)}...</small>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="student-info-section">
          <h2>Student Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Full Name:</span>
              <span className="info-value">{result.userName || result.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Roll Number:</span>
              <span className="info-value">{result.rollNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Assessment Date:</span>
              <span className="info-value">
                {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Technology Category:</span>
              <span className="info-value category-tag">
                {result.category?.toUpperCase() || 'GENERAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Result Status */}
        <div className={`result-status ${passed ? 'passed' : 'failed'}`}>
          <div className="status-icon">
            {passed ? (
              <div className="icon-circle success">
                <i className="fas fa-trophy"></i>
              </div>
            ) : (
              <div className="icon-circle warning">
                <i className="fas fa-exclamation-circle"></i>
              </div>
            )}
          </div>
          <div className="status-content">
            <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Trying!'}</h3>
            <p>
              {passed 
                ? `You have successfully passed the ${result.category?.toUpperCase()} assessment with a score of ${percentage.toFixed(2)}% which meets the passing criteria of ${passingPercentage}% (Admin Setting).`
                : `You scored ${percentage.toFixed(2)}% in the ${result.category?.toUpperCase()} assessment, which is below the required passing percentage of ${passingPercentage}% (Admin Setting).`
              }
            </p>
            <div className="config-info">
              <i className="fas fa-database"></i>
              <span>Passing criteria set by administrator in MongoDB</span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="performance-summary">
          <h2>Performance Summary</h2>
          <div className="score-grid">
            <div className="score-card">
              <div className="score-value">{score}/{totalMarks}</div>
              <div className="score-label">Total Score</div>
            </div>

            <div className="score-card">
              <div className={`score-value ${passed ? 'text-success' : 'text-danger'}`}>
                {percentage.toFixed(2)}%
              </div>
              <div className="score-label">Percentage</div>
            </div>

            <div className="score-card">
              <div className="score-value">{result.attempted || 0}/{result.totalQuestions || 0}</div>
              <div className="score-label">Questions Attempted</div>
            </div>

            <div className="score-card">
              <div className={`score-value ${passed ? 'text-success' : 'text-danger'}`}>
                {passed ? 'PASSED' : 'FAILED'}
              </div>
              <div className="score-label">Final Status</div>
            </div>
          </div>

          {/* Percentage Bar */}
          <div className="percentage-bar-container">
            <div className="bar-labels">
              <span>0%</span>
              <span>Passing: {passingPercentage}%</span>
              <span>100%</span>
            </div>
            <div className="percentage-bar">
              <div 
                className="percentage-fill"
                style={{ width: `${percentage}%`, backgroundColor: passed ? '#10b981' : '#ef4444' }}
              >
                <span className="percentage-text">{percentage.toFixed(1)}%</span>
              </div>
              <div 
                className="passing-line"
                style={{ left: `${passingPercentage}%` }}
              >
                <div className="passing-label">{passingPercentage}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button 
            onClick={() => {
              localStorage.removeItem('quizResult');
              navigate('/register');
            }}
            className="btn btn-primary"
          >
            <i className="fas fa-home"></i> Back to Home
          </button>
          <button 
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            <i className="fas fa-print"></i> Print Result
          </button>
          <button 
            onClick={() => navigate('/admin/login')}
            className="btn btn-info"
          >
            <i className="fas fa-user-shield"></i> Admin Panel
          </button>
        </div>

        {/* Footer */}
        <div className="result-footer">
          <p className="footer-text">
            <i className="fas fa-info-circle"></i> Result stored in MongoDB Database
          </p>
        </div>
      </div>
    </div>
  );
};

export default Result;