// src/pages/Result.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResultConfig } from '../services/api'; // ✅ اب getResultConfig موجود ہے
import './Result.css';

const Result = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({
        name: '',
        rollNumber: '',
        category: ''
    });
    const [config, setConfig] = useState({
        passingPercentage: 40,
        quizTime: 30,
        totalQuestions: 50
    });
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 60000);

        // Get admin configuration for result page
        const fetchResultConfig = async () => {
            try {
                const response = await getResultConfig(); // ✅ اب کام کرے گا
                if (response.data?.success && response.data.config) {
                    const newConfig = {
                        passingPercentage: response.data.config.passingPercentage || 40,
                        quizTime: response.data.config.quizTime || 30,
                        totalQuestions: response.data.config.totalQuestions || 50
                    };
                    setConfig(newConfig);
                    
                    // Update result with new config if result exists
                    if (result) {
                        const updatedResult = {
                            ...result,
                            passed: parseFloat(result.percentage || 0) >= newConfig.passingPercentage,
                            passingPercentage: newConfig.passingPercentage
                        };
                        setResult(updatedResult);
                    }
                }
            } catch (error) {
                console.log('Using default config for result page');
            }
        };

        // Get user data
        const userName = localStorage.getItem('userName');
        const rollNumber = localStorage.getItem('rollNumber');
        const category = localStorage.getItem('category');
        const savedResult = localStorage.getItem('quizResult');

        // Fetch config
        fetchResultConfig();

        if (userName && rollNumber && category) {
            setUserInfo({
                name: userName,
                rollNumber: rollNumber,
                category: category
            });
        }

        if (savedResult) {
            try {
                const parsedResult = JSON.parse(savedResult);
                
                // Calculate percentage if not present
                let percentage = parsedResult.percentage;
                if (!percentage && parsedResult.score !== undefined && parsedResult.totalMarks) {
                    percentage = (parsedResult.score / parsedResult.totalMarks) * 100;
                }
                
                // Initial result with default passing percentage (will be updated when config loads)
                const initialResult = {
                    ...parsedResult,
                    correct: parsedResult.correct || parsedResult.score || 0,
                    incorrect: parsedResult.incorrect || 0,
                    unattempted: parsedResult.unattempted || 
                               ((parsedResult.totalQuestions || parsedResult.totalMarks || 50) - 
                               (parsedResult.attempted || 0)),
                    percentage: parseFloat(percentage || 0).toFixed(2),
                    passed: parsedResult.passed || 
                           (parseFloat(percentage || 0) >= config.passingPercentage),
                    passingPercentage: config.passingPercentage
                };
                
                // Validate and calculate missing fields
                if (!initialResult.incorrect && initialResult.attempted) {
                    initialResult.incorrect = initialResult.attempted - (initialResult.correct || initialResult.score || 0);
                }
                
                if (!initialResult.unattempted && initialResult.totalQuestions) {
                    initialResult.unattempted = initialResult.totalQuestions - initialResult.attempted;
                }
                
                setResult(initialResult);
            } catch (error) {
                console.error('Error parsing result:', error);
                createDemoResult();
            }
        } else {
            createDemoResult();
        }

        // Simulate loading
        setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearInterval(timer);
    }, [navigate]);

    useEffect(() => {
        // Update result when config changes
        if (result && config) {
            const updatedResult = {
                ...result,
                passed: parseFloat(result.percentage || 0) >= config.passingPercentage,
                passingPercentage: config.passingPercentage
            };
            setResult(updatedResult);
        }
    }, [config]);

    const createDemoResult = () => {
        // Get config for demo result
        const demoResult = {
            score: Math.floor(Math.random() * 30) + 20,
            totalMarks: 50,
            totalQuestions: config.totalQuestions || 50,
            attempted: 48,
            correct: 42,
            incorrect: 6,
            unattempted: 2,
            percentage: 84,
            passed: (84 >= config.passingPercentage),
            grade: (84 >= config.passingPercentage) ? 'PASS' : 'FAIL',
            timeSpent: 1560,
            answersData: [],
            passingPercentage: config.passingPercentage || 40
        };
        setResult(demoResult);
    };

    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateAccuracy = () => {
        if (!result || !result.attempted) return '0';
        const attempted = result.attempted || 0;
        const correct = result.correct || result.score || 0;
        return attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : '0';
    };

    const handleDownloadCertificate = () => {
        if (!result) return;
        
        const certificateContent = `
            <html>
            <head>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        margin: 0; 
                        padding: 50px; 
                        text-align: center;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        color: white;
                    }
                    .certificate-container {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        max-width: 800px;
                        margin: 0 auto;
                        color: #333;
                        border: 15px solid #f8f9fa;
                        position: relative;
                    }
                    .certificate-border {
                        border: 3px solid #667eea;
                        padding: 30px;
                        position: relative;
                    }
                    .institute-name {
                        font-size: 32px;
                        font-weight: bold;
                        color: #667eea;
                        margin-bottom: 10px;
                    }
                    .certificate-title {
                        font-size: 42px;
                        color: #333;
                        margin: 20px 0;
                        font-weight: 300;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                    }
                    .student-name {
                        font-size: 36px;
                        color: #667eea;
                        margin: 30px 0;
                        font-weight: bold;
                    }
                    .certificate-text {
                        font-size: 18px;
                        line-height: 1.6;
                        margin: 30px 0;
                    }
                    .score-display {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 15px;
                        margin: 30px auto;
                        max-width: 400px;
                    }
                    .score-value {
                        font-size: 48px;
                        font-weight: bold;
                    }
                    .certificate-footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #eee;
                        color: #666;
                    }
                    .signature {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 2px solid #667eea;
                        display: inline-block;
                    }
                    .watermark {
                        position: absolute;
                        opacity: 0.1;
                        font-size: 120px;
                        transform: rotate(-45deg);
                        top: 40%;
                        left: 10%;
                        color: #667eea;
                    }
                    .passing-info {
                        font-size: 14px;
                        color: #fff;
                        background: rgba(0,0,0,0.1);
                        padding: 5px 10px;
                        border-radius: 5px;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="certificate-container">
                    <div class="watermark">SHAMSI INSTITUTE</div>
                    <div class="certificate-border">
                        <div class="institute-name">SHAMSI INSTITUTE OF TECHNOLOGY</div>
                        <div class="certificate-title">Certificate of Achievement</div>
                        
                        <div class="certificate-text">
                            This is to certify that
                        </div>
                        
                        <div class="student-name">${userInfo.name}</div>
                        
                        <div class="certificate-text">
                            has successfully completed the<br>
                            <strong>${userInfo.category?.toUpperCase() || 'TECHNICAL'} ASSESSMENT</strong><br>
                            with the following performance:
                        </div>
                        
                        <div class="score-display">
                            <div class="score-value">${result.percentage}%</div>
                            <div>Score: ${result.score}/${result.totalMarks}</div>
                            <div>Status: ${result.passed ? 'PASSED' : 'COMPLETED'}</div>
                            <div class="passing-info">Passing Criteria: ${config.passingPercentage}% (Set by Institute)</div>
                        </div>
                        
                        <div class="certificate-text">
                            Assessment Date: ${currentDateTime.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                        
                        <div class="signature">
                            <div>Director</div>
                            <div>Shamsi Institute</div>
                        </div>
                        
                        <div class="certificate-footer">
                            Certificate ID: SIT-${Date.now()}<br>
                            Validated by Shamsi Institute Assessment System
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(certificateContent);
        printWindow.document.close();
        printWindow.print();
    };

    const handleShare = async () => {
        if (!result || !userInfo) return;

        const shareText = `🎯 I scored ${result.percentage}% in ${userInfo.category} assessment at Shamsi Institute! Score: ${result.score}/${result.totalMarks} | Passing: ${config.passingPercentage}% | Status: ${result.passed ? 'PASSED ✅' : 'COMPLETED'}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Assessment Results',
                    text: shareText,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Share cancelled');
                fallbackShare(shareText);
            }
        } else {
            fallbackShare(shareText);
        }
    };

    const fallbackShare = (text) => {
        navigator.clipboard.writeText(text);
        alert('Results copied to clipboard! 📋');
    };

    const handleRetake = () => {
        localStorage.removeItem(`quiz_${localStorage.getItem('userId')}_${userInfo.category}`);
        navigate('/quiz');
    };

    const handleNewRegistration = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleViewAnswers = () => {
        if (result && result.answersData && result.answersData.length > 0) {
            // Show answers in modal
            const answersWindow = window.open('', '_blank');
            const answersContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .answer-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                        .correct { background-color: #d4edda; border-color: #c3e6cb; }
                        .incorrect { background-color: #f8d7da; border-color: #f5c6cb; }
                        .question { font-weight: bold; margin-bottom: 10px; }
                        .answer { margin: 5px 0; }
                        .correct-answer { color: #155724; font-weight: bold; }
                        .selected-answer { color: #721c24; font-weight: bold; }
                        .passing-info { 
                            background-color: #e8f4f8; 
                            padding: 10px; 
                            border-radius: 5px; 
                            margin-bottom: 20px; 
                            border-left: 4px solid #007bff;
                        }
                    </style>
                </head>
                <body>
                    <div class="passing-info">
                        <strong>Institute Passing Criteria:</strong> ${config.passingPercentage}% | 
                        <strong>Your Score:</strong> ${result.percentage}% |
                        <strong>Result:</strong> ${result.passed ? 'PASSED ✅' : 'NOT PASSED ❌'}
                    </div>
                    <h2>Detailed Answers</h2>
                    ${result.answersData.map((answer, index) => `
                        <div class="answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="question">Q${index + 1}: ${answer.questionText}</div>
                            <div class="answer"><strong>Your Answer:</strong> <span class="selected-answer">${answer.selectedAnswer}</span></div>
                            <div class="answer"><strong>Correct Answer:</strong> <span class="correct-answer">${answer.correctAnswer}</span></div>
                            <div class="answer"><strong>Status:</strong> ${answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}</div>
                            <div class="answer"><strong>Marks:</strong> ${answer.marksObtained}/${answer.marks}</div>
                        </div>
                    `).join('')}
                </body>
                </html>
            `;
            answersWindow.document.write(answersContent);
            answersWindow.document.close();
        } else {
            alert('Detailed answers are not available for this attempt.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <h2>Analyzing Your Performance</h2>
                <p>Fetching configuration from server...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="loading-container">
                <h2>No Results Found</h2>
                <p>Please complete an assessment first.</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Start Assessment
                </button>
            </div>
        );
    }

    const accuracy = calculateAccuracy();
    const timeSpent = formatTime(result.timeSpent);
    const passingPercentage = config.passingPercentage;
    const isPassed = parseFloat(result.percentage) >= passingPercentage;

    return (
        <div className="result-container">
            {/* Header */}
            <header className="result-header">
                <div className="header-content">
                    <div className="institute-logo">
                        <div className="logo-icon">🏛️</div>
                        <div>
                            <h1>Shamsi Institute</h1>
                            <p>Technology Assessment System</p>
                            <div className="config-info">
                                <i className="fas fa-cog"></i>
                                Passing Percentage: <strong>{config.passingPercentage}%</strong> (Set by Admin)
                            </div>
                        </div>
                    </div>
                    <div className="header-info">
                        <div className="current-time">
                            {currentDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="current-date">
                            {currentDateTime.toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="result-main">
                {/* Performance Summary */}
                <div className="performance-summary">
                    <div className="summary-header">
                        <div className="student-info">
                            <div className="student-avatar">
                                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="student-details">
                                <h2>{userInfo.name || 'Student'}</h2>
                                <div className="student-meta">
                                    <div className="meta-item">
                                        <span>🎫</span>
                                        <span>Roll: {userInfo.rollNumber || 'N/A'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span>💻</span>
                                        <span>Technology: {userInfo.category || 'General'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span>⚙️</span>
                                        <span>Passing: {config.passingPercentage}% (Admin Set)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`result-badge ${isPassed ? 'passed' : 'failed'}`}>
                            {isPassed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}
                            <div className="badge-subtext">
                                {result.percentage}% vs {config.passingPercentage}%
                            </div>
                        </div>
                    </div>

                    <div className="score-display">
                        <div className="score-gauge">
                            <svg className="gauge-circle" viewBox="0 0 100 100">
                                <circle className="gauge-bg" cx="50" cy="50" r="45" />
                                <circle 
                                    className={`gauge-fill ${isPassed ? 'passed' : 'failed'}`}
                                    cx="50" 
                                    cy="50" 
                                    r="45"
                                    strokeDasharray={`${(result.percentage / 100) * 283} 283`}
                                    transform="rotate(-90 50 50)"
                                />
                                {/* Passing marker line */}
                                <line 
                                    className="passing-marker"
                                    x1="50" 
                                    y1="50" 
                                    x2={50 + 50 * Math.cos((passingPercentage / 100) * 2 * Math.PI - Math.PI/2)}
                                    y2={50 + 50 * Math.sin((passingPercentage / 100) * 2 * Math.PI - Math.PI/2)}
                                    stroke="#ff6b6b"
                                    strokeWidth="2"
                                />
                                {/* Passing percentage text */}
                                <text 
                                    x={50 + 55 * Math.cos((passingPercentage / 100) * 2 * Math.PI - Math.PI/2)}
                                    y={50 + 55 * Math.sin((passingPercentage / 100) * 2 * Math.PI - Math.PI/2)}
                                    textAnchor="middle"
                                    className="passing-text"
                                    fontSize="8"
                                    fill="#ff6b6b"
                                    fontWeight="bold"
                                >
                                    {passingPercentage}%
                                </text>
                            </svg>
                            <div className="gauge-text">
                                <div className="gauge-percentage">{result.percentage}%</div>
                                <div className="gauge-score">{result.score}/{result.totalMarks}</div>
                                <div className="gauge-passing">Pass: {passingPercentage}%</div>
                            </div>
                        </div>
                        <div className="score-details">
                            <div className="score-stats">
                                <div className="score-stat">
                                    <div className="stat-icon">🎯</div>
                                    <div className="stat-value">{accuracy}%</div>
                                    <div className="stat-label">Accuracy</div>
                                </div>
                                <div className="score-stat">
                                    <div className="stat-icon">⏱️</div>
                                    <div className="stat-value">{timeSpent}</div>
                                    <div className="stat-label">Time Spent</div>
                                </div>
                                <div className="score-stat">
                                    <div className="stat-icon">📝</div>
                                    <div className="stat-value">{result.attempted || 0}/{result.totalQuestions || 0}</div>
                                    <div className="stat-label">Attempted</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Analysis */}
                <div className="performance-analysis">
                    <div className="analysis-header">
                        <h3>📊 Performance Analysis</h3>
                        <div className="analysis-info">
                            <span className="passing-criteria">
                                <i className="fas fa-cog"></i> 
                                Passing Criteria: <strong>{config.passingPercentage}%</strong> (Set by Admin)
                            </span>
                            <button className="view-details-btn" onClick={handleViewAnswers}>
                                View Answer Details
                            </button>
                        </div>
                    </div>
                    
                    <div className="analysis-grid">
                        <div className="analysis-card">
                            <h4>📈 Question Analysis</h4>
                            <div className="progress-item">
                                <div className="progress-label">
                                    <span className="progress-text">Correct Answers</span>
                                    <span className="progress-value correct">{result.correct || result.score || 0}</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill correct"
                                        style={{ 
                                            width: `${((result.correct || result.score || 0) / (result.totalQuestions || 1)) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="progress-item">
                                <div className="progress-label">
                                    <span className="progress-text">Incorrect Answers</span>
                                    <span className="progress-value incorrect">{result.incorrect || 0}</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill incorrect"
                                        style={{ 
                                            width: `${((result.incorrect || 0) / (result.totalQuestions || 1)) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="progress-item">
                                <div className="progress-label">
                                    <span className="progress-text">Unattempted</span>
                                    <span className="progress-value unattempted">{result.unattempted || 0}</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill unattempted"
                                        style={{ 
                                            width: `${((result.unattempted || 0) / (result.totalQuestions || 1)) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="analysis-card">
                            <h4>📊 Score Comparison</h4>
                            <div className="comparison-chart">
                                <div className="chart-item">
                                    <span className="chart-label">Your Score</span>
                                    <div className="chart-bar-container">
                                        <div 
                                            className="chart-bar your-score"
                                            style={{ width: `${result.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="chart-value">{result.percentage}%</span>
                                </div>
                                
                                <div className="chart-item">
                                    <span className="chart-label">Passing Mark</span>
                                    <div className="chart-bar-container">
                                        <div 
                                            className="chart-bar passing"
                                            style={{ width: `${passingPercentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="chart-value">{passingPercentage}%</span>
                                </div>
                                
                                <div className="chart-item">
                                    <span className="chart-label">Class Average</span>
                                    <div className="chart-bar-container">
                                        <div 
                                            className="chart-bar average"
                                            style={{ width: '65%' }}
                                        ></div>
                                    </div>
                                    <span className="chart-value">65%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Panel */}
                <div className="action-panel">
                    <h3>🚀 Next Steps</h3>
                    <div className="action-grid">
                        <button className="action-button" onClick={handleRetake}>
                            <div className="action-icon">🔄</div>
                            <div className="action-content">
                                <div className="action-title">Retake Assessment</div>
                                <div className="action-description">Improve your score with another attempt</div>
                            </div>
                        </button>

                        <button className="action-button" onClick={handleDownloadCertificate}>
                            <div className="action-icon">📜</div>
                            <div className="action-content">
                                <div className="action-title">Download Certificate</div>
                                <div className="action-description">Get your achievement certificate</div>
                            </div>
                        </button>

                        <button className="action-button" onClick={handleShare}>
                            <div className="action-icon">📢</div>
                            <div className="action-content">
                                <div className="action-title">Share Results</div>
                                <div className="action-description">Share with your network</div>
                            </div>
                        </button>

                        <button className="action-button" onClick={handleNewRegistration}>
                            <div className="action-icon">👤</div>
                            <div className="action-content">
                                <div className="action-title">New Registration</div>
                                <div className="action-description">Register for another course</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="insights-panel">
                    <h3>💡 Expert Insights</h3>
                    <div className="insights-grid">
                        <div className="insight-card">
                            <div className="insight-icon">🎯</div>
                            <h4>Accuracy Analysis</h4>
                            <p>Your accuracy of {accuracy}% shows {parseFloat(accuracy) >= 80 ? 'excellent' : parseFloat(accuracy) >= 60 ? 'good' : 'satisfactory'} understanding of concepts.</p>
                        </div>
                        
                        <div className="insight-card">
                            <div className="insight-icon">⚙️</div>
                            <h4>Passing Criteria</h4>
                            <p>Institute passing requirement is {config.passingPercentage}%. You scored {result.percentage}% which is {isPassed ? 'above' : 'below'} the requirement.</p>
                        </div>
                        
                        <div className="insight-card">
                            <div className="insight-icon">📊</div>
                            <h4>Performance Level</h4>
                            <p>Based on your score, you're at {result.percentage >= 90 ? 'Expert' : result.percentage >= 75 ? 'Advanced' : result.percentage >= 60 ? 'Intermediate' : 'Beginner'} level.</p>
                        </div>
                        
                        <div className="insight-card">
                            <div className="insight-icon">🎓</div>
                            <h4>Recommendations</h4>
                            <p>
                                {isPassed 
                                    ? `Great job! You've passed with ${result.percentage}% (Required: ${config.passingPercentage}%). Consider advanced topics in ${userInfo.category}.`
                                    : `Focus on fundamental concepts. You need ${config.passingPercentage}% to pass, you scored ${result.percentage}%. Review incorrect answers and practice more.`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="detailed-stats">
                    <h3>📋 Detailed Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-title">Total Questions</div>
                            <div className="stat-value">{result.totalQuestions || 0}</div>
                        </div>
                        
                        <div className="stat-box">
                            <div className="stat-title">Correct Answers</div>
                            <div className="stat-value correct">{result.correct || result.score || 0}</div>
                        </div>
                        
                        <div className="stat-box">
                            <div className="stat-title">Incorrect Answers</div>
                            <div className="stat-value incorrect">{result.incorrect || 0}</div>
                        </div>
                        
                        <div className="stat-box">
                            <div className="stat-title">Your Percentage</div>
                            <div className="stat-value percentage">{result.percentage}%</div>
                        </div>
                        
                        <div className="stat-box">
                            <div className="stat-title">Passing Criteria</div>
                            <div className="stat-value passing">{config.passingPercentage}%</div>
                        </div>
                        
                        <div className="stat-box">
                            <div className="stat-title">Result</div>
                            <div className={`stat-value ${isPassed ? 'passed' : 'failed'}`}>
                                {isPassed ? 'PASSED ✅' : 'FAILED ❌'}
                                <div className="result-detail">
                                    ({result.percentage}% vs {config.passingPercentage}%)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="result-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Shamsi Institute</h4>
                        <div className="footer-info">
                            <p>📍 Technology Road, Karachi</p>
                            <p>📞 +92 300 123 4567</p>
                            <p>✉️ results@shamsi.edu.pk</p>
                        </div>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <div className="footer-links">
                            <button onClick={() => navigate('/')}>📝 New Registration</button>
                            <button onClick={handleRetake}>🧠 Take Assessment</button>
                            <button onClick={() => window.open('/admin', '_blank')}>👨‍💼 Admin Panel</button>
                        </div>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Assessment Info</h4>
                        <div className="assessment-info">
                            <p><strong>Passing Percentage:</strong> {config.passingPercentage}%</p>
                            <p><strong>Quiz Duration:</strong> {config.quizTime} minutes</p>
                            <p><strong>Total Questions:</strong> {config.totalQuestions}</p>
                        </div>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <div className="security-badge">
                        <span>⚙️</span>
                        <span>Admin Settings Active • Passing: {config.passingPercentage}%</span>
                    </div>
                    <div className="copyright">
                        © {new Date().getFullYear()} Shamsi Institute of Technology • Version 4.0
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Result;