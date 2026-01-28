import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz } from '../services/api';
import './Quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 50
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  useEffect(() => {
    // Check if user is registered
    const storedUserData = localStorage.getItem('userData');
    const storedConfig = localStorage.getItem('quizConfig');
    
    if (!storedUserData) {
      alert('Please register first!');
      navigate('/register');
      return;
    }

    try {
      const user = JSON.parse(storedUserData);
      setUserData(user);
      
      if (storedConfig) {
        const configData = JSON.parse(storedConfig);
        setConfig(configData);
        setTimeLeft((configData.quizTime || 30) * 60);
      }
      
      loadQuestions(user.category);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/register');
    }
  }, [navigate]);

  useEffect(() => {
    if (loading || questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        
        // Show warning when 5 minutes left
        if (prev === 300) {
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 10000);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length]);

  const loadQuestions = async (category) => {
    try {
      setLoading(true);
      console.log(`Loading quiz questions for category: ${category}`);
      
      const response = await getQuizQuestions(category);
      
      if (response.data.success) {
        console.log('Questions loaded:', response.data.questions.length);
        setQuestions(response.data.questions);
        
        // Initialize empty answers object
        const initialAnswers = {};
        response.data.questions.forEach(q => {
          initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);
        
        // Save to localStorage for backup
        localStorage.setItem(`quiz_backup_${category}`, JSON.stringify({
          questions: response.data.questions,
          loadedAt: new Date().toISOString()
        }));
      } else {
        alert('Failed to load questions: ' + response.data.message);
        navigate('/register');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      
      // Try to load from backup
      const backupKey = `quiz_backup_${userData?.category}`;
      const backup = localStorage.getItem(backupKey);
      if (backup) {
        const backupData = JSON.parse(backup);
        setQuestions(backupData.questions);
        
        const initialAnswers = {};
        backupData.questions.forEach(q => {
          initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);
        
        alert('Loaded questions from backup');
      } else {
        alert('Error loading questions. Please try again or contact administrator.');
        navigate('/register');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionText
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      // Prepare answers for submission
      const submittedAnswers = Object.entries(answers)
        .filter(([_, answer]) => answer !== null)
        .map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption
        }));
      
      const submitData = {
        rollNumber: userData.rollNumber,
        answers: submittedAnswers,
        timeLeft: timeLeft
      };
      
      console.log('Submitting quiz with answers:', submittedAnswers.length);
      
      const response = await submitQuiz(submitData);
      
      if (response.data.success) {
        // Save result to localStorage
        localStorage.setItem('quizResult', JSON.stringify(response.data.result));
        
        // Cleanup
        localStorage.removeItem('userData');
        localStorage.removeItem(`quiz_backup_${userData.category}`);
        
        // Navigate to result page
        navigate('/result');
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Submission failed: ' + error.message);
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    alert('⏰ Time is up! Automatically submitting your quiz...');
    await handleSubmit();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer !== null).length;
  };

  const getQuestionStatus = (questionId) => {
    return answers[questionId] ? 'answered' : 'unanswered';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner">
          <div className="spinner-circle"></div>
        </div>
        <p>📚 Loading your assessment from database...</p>
        <p className="loading-subtext">Please wait while we fetch your questions</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="no-questions-container">
        <div className="no-questions-card">
          <h2>📭 No Questions Available</h2>
          <p>We couldn't find any questions for your selected category.</p>
          <p>Please contact your administrator or try a different category.</p>
          <button 
            onClick={() => navigate('/register')}
            className="back-to-register-btn"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion._id];

  return (
    <div className="quiz-container">
      {/* Time Warning */}
      {showTimeWarning && (
        <div className="time-warning-overlay">
          <div className="time-warning-card">
            <div className="warning-icon">⏰</div>
            <h3>Time Warning!</h3>
            <p>Only 5 minutes remaining. Please submit your quiz soon.</p>
            <button 
              onClick={() => setShowTimeWarning(false)}
              className="warning-close-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>📝 Submit Assessment</h3>
            <p>Are you sure you want to submit your answers?</p>
            
            <div className="submission-stats">
              <div className="stat-item">
                <div className="stat-value">{getAnsweredCount()}</div>
                <div className="stat-label">Answered</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{questions.length - getAnsweredCount()}</div>
                <div className="stat-label">Unanswered</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{questions.length}</div>
                <div className="stat-label">Total Questions</div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                className="modal-btn submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-small"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo">🎓</div>
            <div>
              <h1>Shamsi Institute</h1>
              <p className="subtitle">Technical Skills Assessment</p>
            </div>
          </div>
          
          <div className="user-info-section">
            <div className="info-row">
              <span className="info-label">Student:</span>
              <span className="info-value">{userData?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Roll No:</span>
              <span className="info-value">{userData?.rollNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Category:</span>
              <span className="info-value category-badge">
                {userData?.category?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <div className="timer-container">
            <div className="timer-icon">⏱️</div>
            <div className="timer-content">
              <div className={`time-display ${timeLeft <= 300 ? 'warning' : ''} ${timeLeft <= 60 ? 'danger' : ''}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="time-label">Time Remaining</div>
            </div>
          </div>
          
          <div className="quiz-info">
            <div className="info-item">
              <span className="info-label">Passing %:</span>
              <span className="info-value">{config.passingPercentage}%</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Q:</span>
              <span className="info-value">{questions.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Source:</span>
              <span className="info-value source-badge">MongoDB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="quiz-main-content">
        {/* Question Navigation Sidebar */}
        <div className="question-nav-sidebar">
          <div className="sidebar-header">
            <h3>Questions Navigation</h3>
            <div className="progress-summary">
              <span className="progress-text">
                {getAnsweredCount()}/{questions.length} Answered
              </span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="question-grid">
            {questions.map((question, index) => {
              const isCurrent = index === currentQuestionIndex;
              const status = getQuestionStatus(question._id);
              
              return (
                <button
                  key={question._id}
                  className={`question-num-btn ${isCurrent ? 'current' : ''} ${status}`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <div className="sidebar-footer">
            <button 
              className="submit-sidebar-btn"
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
            >
              🚀 Submit Quiz
            </button>
          </div>
        </div>

        {/* Question Display Area */}
        <div className="question-display-area">
          <div className="question-header">
            <div className="question-meta">
              <span className="question-number">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
                {currentQuestion.difficulty.toUpperCase()}
              </span>
              <span className="marks-badge">
                {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="question-text-container">
            <p className="question-text">{currentQuestion.questionText}</p>
          </div>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === option.text;
              const optionLetter = String.fromCharCode(65 + index);
              
              return (
                <div 
                  key={index}
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion._id, option.text)}
                >
                  <div className="option-letter-circle">
                    {optionLetter}
                  </div>
                  <div className="option-text-content">
                    {option.text}
                  </div>
                  {isSelected && (
                    <div className="selected-indicator">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="question-navigation">
            <button
              className="nav-btn prev-btn"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>
            
            <div className="question-counter">
              <span>
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                className="nav-btn next-btn"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Next →
              </button>
            ) : (
              <button
                className="nav-btn submit-final-btn"
                onClick={() => setShowConfirmModal(true)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="quiz-footer">
        <div className="footer-stats">
          <div className="footer-stat">
            <span className="stat-label">Answered:</span>
            <span className="stat-value answered-value">{getAnsweredCount()}</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Unanswered:</span>
            <span className="stat-value unanswered-value">{questions.length - getAnsweredCount()}</span>
          </div>
          <div className="footer-stat">
            <span className="stat-label">Time Left:</span>
            <span className="stat-value time-value">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <button 
          className="footer-submit-btn"
          onClick={() => setShowConfirmModal(true)}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-small"></span>
              Submitting...
            </>
          ) : (
            'Submit Final Answers'
          )}
        </button>
      </div>
    </div>
  );
};

export default Quiz;