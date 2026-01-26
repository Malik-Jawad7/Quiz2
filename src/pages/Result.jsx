import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResultConfig } from '../services/api';
import './Result.css';

const Result = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [config, setConfig] = useState({
        passingPercentage: 40,
        quizTime: 30,
        totalQuestions: 50
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedResult = localStorage.getItem('quizResult');
        const userInfo = localStorage.getItem('userInfo');
        
        if (!storedResult || !userInfo) {
            navigate('/');
            return;
        }

        try {
            const parsedResult = JSON.parse(storedResult);
            const parsedUserInfo = JSON.parse(userInfo);
            
            setResult({
                ...parsedResult,
                ...parsedUserInfo
            });
        } catch (error) {
            console.error('Error parsing stored data:', error);
            navigate('/');
        }

        // Load configuration
        const loadConfig = async () => {
            try {
                const response = await getResultConfig();
                if (response.data.success) {
                    setConfig(response.data.config);
                }
            } catch (error) {
                console.log('Failed to load config, using defaults');
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [navigate]);

    const calculatePercentage = () => {
        if (!result || !result.totalQuestions || result.totalQuestions === 0) return 0;
        return ((result.score || 0) / result.totalQuestions) * 100;
    };

    const isPassed = () => {
        const percentage = calculatePercentage();
        return percentage >= config.passingPercentage;
    };

    const handleRetakeQuiz = () => {
        localStorage.removeItem('quizResult');
        localStorage.removeItem('userAnswers');
        navigate('/quiz');
    };

    const handleNewRegistration = () => {
        localStorage.clear();
        navigate('/');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading) {
        return (
            <div className="result-container loading">
                <div className="loading-spinner"></div>
                <p>Loading your result...</p>
            </div>
        );
    }

    if (!result) {
        return null;
    }

    const percentage = calculatePercentage();
    const passed = isPassed();
    const score = result.score || 0;
    const totalQuestions = result.totalQuestions || config.totalQuestions;
    const attempted = result.attempted || 0;
    const correct = result.correct || score;
    const incorrect = result.incorrect || (attempted - correct);
    const unattempted = result.unattempted || (totalQuestions - attempted);
    const timeSpent = result.timeSpent || 0;

    return (
        <div className="result-container">
            <div className="result-card">
                {/* Header */}
                <div className="result-header">
                    <img src="/images.jpg" alt="Logo" className="result-logo" />
                    <h1>Shamsi Institute of Technology</h1>
                    <h2>Quiz Result</h2>
                </div>

                {/* Student Info */}
                <div className="student-info">
                    <div className="info-row">
                        <span className="info-label">Name:</span>
                        <span className="info-value">{result.name || 'N/A'}</span>
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
                    <div className="info-row">
                        <span className="info-label">Date & Time:</span>
                        <span className="info-value">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>

                {/* Result Status */}
                <div className={`result-status ${passed ? 'passed' : 'failed'}`}>
                    <div className="status-icon">
                        {passed ? '🏆' : '📝'}
                    </div>
                    <div className="status-content">
                        <h3>{passed ? 'Congratulations! You Passed!' : 'Keep Trying! You Can Do Better!'}</h3>
                        <p>
                            {passed 
                                ? `You scored ${percentage.toFixed(2)}% which is above the passing criteria of ${config.passingPercentage}%.`
                                : `You scored ${percentage.toFixed(2)}% which is below the passing criteria of ${config.passingPercentage}%.`
                            }
                        </p>
                    </div>
                </div>

                {/* Score Details */}
                <div className="score-details">
                    <h3>Performance Summary</h3>
                    <div className="score-grid">
                        <div className="score-item">
                            <div className="score-icon">📊</div>
                            <div className="score-info">
                                <span className="score-label">Total Score</span>
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
                            <div className="score-icon">✅</div>
                            <div className="score-info">
                                <span className="score-label">Correct Answers</span>
                                <span className="score-value">{correct}</span>
                            </div>
                        </div>
                        <div className="score-item">
                            <div className="score-icon">❌</div>
                            <div className="score-info">
                                <span className="score-label">Incorrect Answers</span>
                                <span className="score-value">{incorrect}</span>
                            </div>
                        </div>
                        <div className="score-item">
                            <div className="score-icon">⏰</div>
                            <div className="score-info">
                                <span className="score-label">Time Spent</span>
                                <span className="score-value">{formatTime(timeSpent)}</span>
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

                {/* Progress Visualization */}
                <div className="progress-section">
                    <h3>Performance Analysis</h3>
                    <div className="progress-bar-container">
                        <div className="progress-labels">
                            <span>0%</span>
                            <span>Passing ({config.passingPercentage}%)</span>
                            <span>100%</span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                            <div 
                                className="passing-marker"
                                style={{ left: `${config.passingPercentage}%` }}
                            ></div>
                        </div>
                        <div className="current-score">
                            <span>Your Score: </span>
                            <strong>{percentage.toFixed(2)}%</strong>
                        </div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="breakdown-section">
                    <h3>Detailed Breakdown</h3>
                    <div className="breakdown-grid">
                        <div className="breakdown-item">
                            <span>Total Questions:</span>
                            <strong>{totalQuestions}</strong>
                        </div>
                        <div className="breakdown-item">
                            <span>Attempted:</span>
                            <strong>{attempted}</strong>
                        </div>
                        <div className="breakdown-item">
                            <span>Unattempted:</span>
                            <strong>{unattempted}</strong>
                        </div>
                        <div className="breakdown-item">
                            <span>Accuracy:</span>
                            <strong>{attempted > 0 ? ((correct / attempted) * 100).toFixed(2) : 0}%</strong>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button 
                        onClick={handleRetakeQuiz}
                        className="btn btn-primary"
                    >
                        🔄 Retake Quiz
                    </button>
                    <button 
                        onClick={handleNewRegistration}
                        className="btn btn-secondary"
                    >
                        📝 New Registration
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="btn btn-success"
                    >
                        🖨️ Print Result
                    </button>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="btn btn-info"
                    >
                        🔧 Admin Panel
                    </button>
                </div>

                {/* Footer */}
                <div className="result-footer">
                    <p className="note">
                        📝 <strong>Note:</strong> This result is generated electronically and doesn't require signature.
                    </p>
                    <p className="disclaimer">
                        ℹ️ For any discrepancies, contact the examination department within 7 days.
                    </p>
                    <div className="footer-info">
                        <p>© 2024 Shamsi Institute of Technology. All rights reserved.</p>
                        <p>Result ID: {Date.now()}-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;