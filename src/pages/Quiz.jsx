// src/components/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestionsByCategory, submitQuiz, getQuizConfig } from '../services/api';
import './Quiz.css';

const Quiz = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [markedForReview, setMarkedForReview] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [attemptsToClose, setAttemptsToClose] = useState(0);
    const [showExitWarning, setShowExitWarning] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizConfig, setQuizConfig] = useState({
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
    });
    const [selectedAnswers, setSelectedAnswers] = useState({});

    // Get user data from localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const category = localStorage.getItem('category');
    const rollNumber = localStorage.getItem('rollNumber');

    // Load quiz config and state from localStorage
    useEffect(() => {
        const loadConfigAndQuestions = async () => {
            if (!userId || !category) {
                navigate('/');
                return;
            }

            try {
                // Load quiz config
                const configResponse = await getQuizConfig();
                if (configResponse.data?.success) {
                    const config = configResponse.data.config || {};
                    setQuizConfig({
                        quizTime: config.quizTime || 30,
                        passingPercentage: config.passingPercentage || 40,
                        totalQuestions: config.totalQuestions || 50
                    });
                    setTimeLeft((config.quizTime || 30) * 60);
                }

                // Load saved quiz state
                const savedQuiz = localStorage.getItem(`quiz_${userId}_${category}`);
                if (savedQuiz) {
                    const parsed = JSON.parse(savedQuiz);
                    if (parsed.questions && parsed.answers && parsed.timeLeft) {
                        setQuestions(parsed.questions);
                        setAnswers(parsed.answers);
                        setSelectedAnswers(parsed.answers);
                        setTimeLeft(parsed.timeLeft);
                        setCurrentQuestion(parsed.currentQuestion || 0);
                        setMarkedForReview(parsed.markedForReview || []);
                        setQuizStarted(true);
                        setLoading(false);
                        enterFullscreen();
                        return;
                    }
                }

                // Load fresh questions
                await loadQuestions();
            } catch (error) {
                console.error('Error loading quiz:', error);
                await loadQuestions();
            }
        };

        loadConfigAndQuestions();
    }, [navigate, userId, category]);

    // Save quiz state to localStorage
    useEffect(() => {
        if (quizStarted && questions.length > 0) {
            const quizState = {
                questions,
                answers,
                selectedAnswers,
                timeLeft,
                currentQuestion,
                markedForReview,
                lastSaved: Date.now()
            };
            localStorage.setItem(`quiz_${userId}_${category}`, JSON.stringify(quizState));
        }
    }, [questions, answers, selectedAnswers, timeLeft, currentQuestion, markedForReview, quizStarted, userId, category]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const response = await getQuestionsByCategory(category);
            
            if (response.data.success) {
                let questions = response.data.questions || [];
                
                // Shuffle questions randomly for each student
                questions = shuffleArray(questions);
                
                // Limit questions based on config
                const totalQuestions = quizConfig.totalQuestions;
                if (questions.length > totalQuestions) {
                    questions = questions.slice(0, totalQuestions);
                }
                
                setQuestions(questions);
                
                // Initialize answers objects
                const initialAnswers = {};
                const initialSelectedAnswers = {};
                questions.forEach(q => {
                    initialAnswers[q._id] = null;
                    initialSelectedAnswers[q._id] = null;
                });
                setAnswers(initialAnswers);
                setSelectedAnswers(initialSelectedAnswers);
                
                setQuizStarted(true);
                enterFullscreen();
                setupPageProtection();
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Shuffle array function
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Enter fullscreen mode
    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
        setIsFullscreen(true);
    };

    // Setup page protection
    const setupPageProtection = () => {
        // Prevent right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.key === 'r') ||
                e.key === 'F5'
            ) {
                e.preventDefault();
                return false;
            }
        });
        
        // Handle tab/window switch
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                setAttemptsToClose(prev => {
                    const newAttempts = prev + 1;
                    if (newAttempts >= 3) {
                        handleAutoSubmit();
                        return newAttempts;
                    }
                    setShowExitWarning(true);
                    return newAttempts;
                });
            }
        });
    };

    // Timer effect
    useEffect(() => {
        if (loading || !quizStarted) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                
                if (prev === 300 || prev === 60) {
                    setShowTimeWarning(true);
                    setTimeout(() => setShowTimeWarning(false), 5000);
                }
                
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, quizStarted]);

    const handleAutoSubmit = async () => {
        if (submitting) return;
        
        setSubmitting(true);
        try {
            const result = calculateResult();
            const response = await submitQuiz({
                userId,
                userName,
                rollNumber,
                category,
                answers: result.answersData,
                score: result.score,
                totalMarks: result.totalMarks,
                percentage: result.percentage,
                passed: result.passed,
                totalQuestions: questions.length,
                attempted: getAnsweredCount(),
                timeSpent: (quizConfig.quizTime * 60) - timeLeft
            });

            cleanupAndNavigate(result);
        } catch (error) {
            const result = calculateResult();
            cleanupAndNavigate(result);
        }
    };

    const calculateResult = () => {
        let score = 0;
        let totalMarks = 0;
        const answersData = [];
        
        questions.forEach(q => {
            totalMarks += q.marks || 1;
            const answer = answers[q._id];
            let isCorrect = false;
            
            if (answer && answer.selected) {
                const correctOption = q.options.find(opt => opt.isCorrect);
                if (correctOption && correctOption.text === answer.selected) {
                    score += q.marks || 1;
                    isCorrect = true;
                }
                
                answersData.push({
                    questionId: q._id,
                    questionText: q.questionText,
                    selectedAnswer: answer.selected,
                    correctAnswer: correctOption?.text || '',
                    isCorrect: isCorrect,
                    marks: q.marks || 1,
                    marksObtained: isCorrect ? q.marks || 1 : 0
                });
            }
        });
        
        const percentage = totalMarks > 0 ? ((score / totalMarks) * 100) : 0;
        const passed = percentage >= quizConfig.passingPercentage;
        
        return {
            success: true,
            score: score,
            totalMarks: totalMarks,
            percentage: percentage.toFixed(2),
            totalQuestions: questions.length,
            attempted: getAnsweredCount(),
            passed: passed,
            answersData: answersData,
            timeSpent: (quizConfig.quizTime * 60) - timeLeft
        };
    };

    const cleanupAndNavigate = (result) => {
        // Clear quiz state
        localStorage.removeItem(`quiz_${userId}_${category}`);
        
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        
        // Save result
        const resultData = {
            ...result,
            userName: userName,
            rollNumber: rollNumber,
            category: category,
            submittedAt: new Date().toISOString(),
            quizTime: quizConfig.quizTime,
            passingPercentage: quizConfig.passingPercentage
        };
        
        localStorage.setItem('quizResult', JSON.stringify(resultData));
        navigate('/result');
    };

    const handleAnswerSelect = (questionId, optionText) => {
        // Check if already answered this question
        if (selectedAnswers[questionId]) {
            return; // Block changing answer
        }
        
        const currentQ = questions.find(q => q._id === questionId);
        const selectedOption = currentQ?.options.find(opt => opt.text === optionText);
        
        const newAnswer = { 
            selected: optionText,
            isCorrect: selectedOption?.isCorrect || false,
            markedForReview: markedForReview.includes(questionId),
            timestamp: Date.now()
        };
        
        setAnswers(prev => ({
            ...prev,
            [questionId]: newAnswer
        }));
        
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionText
        }));
    };

    const toggleMarkForReview = (questionId) => {
        setMarkedForReview(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
        
        if (answers[questionId]) {
            setAnswers(prev => ({
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    markedForReview: !prev[questionId]?.markedForReview
                }
            }));
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        await handleAutoSubmit();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getAnsweredCount = () => {
        return Object.values(answers).filter(a => a?.selected).length;
    };

    const getUnansweredCount = () => {
        return questions.length - getAnsweredCount();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading Assessment...</p>
                <p className="loading-subtext">Preparing your {category} quiz</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="no-questions">
                <h2>No Questions Available</h2>
                <p>Please contact administrator to add questions for {category} category.</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const isAnswered = answers[currentQ?._id]?.selected;
    const isSelected = selectedAnswers[currentQ?._id];

    return (
        <div className="quiz-container">
            {/* Time Warning Modal */}
            {showTimeWarning && (
                <div className="time-warning">
                    ⚠️ Time is running out! Only {Math.floor(timeLeft/60)} minute{timeLeft > 60 ? 's' : ''} remaining.
                </div>
            )}

            {/* Exit Warning Modal */}
            {showExitWarning && (
                <div className="modal-overlay">
                    <div className="exit-warning-modal">
                        <div className="warning-icon">⚠️</div>
                        <h3>Warning!</h3>
                        <p>Switching tabs/windows is not allowed during assessment.</p>
                        <p>Attempts: {attemptsToClose}/3</p>
                        <button 
                            className="modal-btn confirm"
                            onClick={() => setShowExitWarning(false)}
                        >
                            Continue Assessment
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm Submit Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <h3>Submit Assessment</h3>
                        <p>Are you sure you want to submit your answers?</p>
                        <div className="modal-stats">
                            <div className="modal-stat">
                                <span className="stat-value">{getAnsweredCount()}</span>
                                <span className="stat-label">Answered</span>
                            </div>
                            <div className="modal-stat">
                                <span className="stat-value">{getUnansweredCount()}</span>
                                <span className="stat-label">Unanswered</span>
                            </div>
                            <div className="modal-stat">
                                <span className="stat-value">{markedForReview.length}</span>
                                <span className="stat-label">Marked for Review</span>
                            </div>
                            <div className="modal-stat">
                                <span className="stat-value">{questions.length}</span>
                                <span className="stat-label">Total Questions</span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="modal-btn cancel"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-btn confirm"
                                onClick={confirmSubmit}
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Assessment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen warning */}
            {!isFullscreen && (
                <div className="fullscreen-warning">
                    <div className="warning-content">
                        <h3>⚠️ Fullscreen Required</h3>
                        <p>Please allow fullscreen mode to start the assessment</p>
                        <button onClick={enterFullscreen} className="fullscreen-btn">
                            Enter Fullscreen
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="quiz-header">
                <div className="header-main">
                    <div className="header-left-section">
                        <div className="institute-logo">
                            <div className="logo-icon">
                                <i className="fas fa-graduation-cap"></i>
                            </div>
                            <div className="institute-name">
                                <h1>Shamsi Institute</h1>
                                <p>Technical Skills Assessment</p>
                            </div>
                        </div>
                        <div className="user-details-row">
                            <div className="user-info-item">
                                <span className="info-label">👤 Student:</span>
                                <span className="info-value">{userName}</span>
                            </div>
                            <div className="user-info-item">
                                <span className="info-label">🎫 Roll No:</span>
                                <span className="info-value">{rollNumber}</span>
                            </div>
                            <div className="user-info-item">
                                <span className="info-label">📚 Category:</span>
                                <span className="info-value">{category.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-right-section">
                        <div className="timer-box">
                            <div className="timer-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="timer-content">
                                <div className="time-display">{formatTime(timeLeft)}</div>
                                <div className="time-label">Time Remaining</div>
                            </div>
                        </div>
                        <div className="config-box">
                            <div className="config-item">
                                <span className="config-label">Passing %:</span>
                                <span className="config-value">{quizConfig.passingPercentage}%</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">Total Q:</span>
                                <span className="config-value">{questions.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Security Warning */}
                <div className="security-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Do not switch tabs or refresh the page. Multiple attempts may lead to automatic submission.</span>
                </div>
            </div>

            <div className="quiz-content">
                {/* Left Panel - Question Navigation */}
                <div className="question-nav">
                    <div className="nav-header">
                        <h3>Questions Navigation</h3>
                        <div className="legend">
                            <div className="legend-item">
                                <div className="legend-dot answered"></div>
                                <span>Answered</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot review"></div>
                                <span>Review</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot current"></div>
                                <span>Current</span>
                            </div>
                        </div>
                    </div>
                    <div className="question-grid">
                        {questions.map((q, index) => {
                            const isCurrent = index === currentQuestion;
                            const isAnswered = answers[q._id]?.selected;
                            const isReview = markedForReview.includes(q._id);
                            
                            return (
                                <button
                                    key={q._id}
                                    className={`question-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isReview ? 'review' : ''}`}
                                    onClick={() => setCurrentQuestion(index)}
                                    title={`Question ${index + 1} (${q.marks} marks)`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Question Statistics */}
                    <div className="question-stats">
                        <div className="stats-box-grid">
                            <div className="stat-box answered-box">
                                <div className="box-number">{getAnsweredCount()}</div>
                                <div className="box-label">Answered</div>
                            </div>
                            <div className="stat-box review-box">
                                <div className="box-number">{markedForReview.length}</div>
                                <div className="box-label">Marked</div>
                            </div>
                            <div className="stat-box total-box">
                                <div className="box-number">{questions.length}</div>
                                <div className="box-label">Total</div>
                            </div>
                            <div className="stat-box pending-box">
                                <div className="box-number">{getUnansweredCount()}</div>
                                <div className="box-label">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Question Area */}
                <div className="question-area">
                    <div className="question-header">
                        <div className="question-meta">
                            <span className="question-number">Question {currentQuestion + 1} of {questions.length}</span>
                            <span className={`difficulty ${currentQ.difficulty}`}>
                                <i className={`fas fa-signal ${currentQ.difficulty === 'easy' ? 'text-success' : currentQ.difficulty === 'medium' ? 'text-warning' : 'text-danger'}`}></i>
                                {currentQ.difficulty.toUpperCase()}
                            </span>
                            <span className="marks">
                                <i className="fas fa-star"></i> {currentQ.marks} Marks
                            </span>
                        </div>
                        <div className="question-actions">
                            <button 
                                className={`mark-btn ${markedForReview.includes(currentQ._id) ? 'marked' : ''}`}
                                onClick={() => toggleMarkForReview(currentQ._id)}
                            >
                                <i className={`fas fa-${markedForReview.includes(currentQ._id) ? 'check' : 'flag'}`}></i>
                                {markedForReview.includes(currentQ._id) ? 'Marked for Review' : 'Mark for Review'}
                            </button>
                        </div>
                    </div>

                    <div className="question-text">
                        <p>{currentQ.questionText}</p>
                    </div>

                    <div className="options-container">
                        {currentQ.options.map((option, index) => {
                            const isSelected = answers[currentQ._id]?.selected === option.text;
                            const isLocked = selectedAnswers[currentQ._id] && !isSelected; // Block other options if answered
                            
                            return (
                                <div 
                                    key={index}
                                    className={`option ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                                    onClick={() => {
                                        if (!isLocked) {
                                            handleAnswerSelect(currentQ._id, option.text);
                                        }
                                    }}
                                >
                                    <div className="option-letter">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <div className="option-text">
                                        {option.text}
                                    </div>
                                    {isSelected && (
                                        <div className="option-check">
                                            <i className="fas fa-check"></i>
                                        </div>
                                    )}
                                    {isLocked && (
                                        <div className="option-lock">
                                            <i className="fas fa-lock"></i>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="navigation-buttons">
                        <button
                            className="nav-btn prev"
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                        >
                            <i className="fas fa-arrow-left"></i> Previous
                        </button>
                        
                        <div className="question-progress">
                            Question {currentQuestion + 1} of {questions.length}
                        </div>
                        
                        {currentQuestion < questions.length - 1 ? (
                            <button
                                className="nav-btn next"
                                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                            >
                                Next <i className="fas fa-arrow-right"></i>
                            </button>
                        ) : (
                            <button
                                className="nav-btn submit"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane"></i> Submit Assessment
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Quiz;