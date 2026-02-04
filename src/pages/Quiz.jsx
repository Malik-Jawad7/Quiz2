import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz } from '../services/api';
import ShamsiLogo from '../assets/shamsi-logo.jpg';
import { 
  FaClock, 
  FaChartBar, 
  FaArrowLeft, 
  FaArrowRight, 
  FaPaperPlane, 
  FaHome, 
  FaQuestionCircle,
  FaCheckCircle,
  FaCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaUser,
  FaIdCard
} from 'react-icons/fa';
import './Quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  
  const timerRef = useRef(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const quizCategory = localStorage.getItem('quizCategory');

    if (!storedUserData || !quizCategory) {
      navigate('/register');
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      setCategory(quizCategory);
      
      // Load config from localStorage
      const savedConfig = localStorage.getItem('quizConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setPassingPercentage(config.passingPercentage || 40);
        const timeInSeconds = (config.quizTime || 30) * 60;
        setTimeLeft(timeInSeconds);
      }
      
      loadQuestions(quizCategory);
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/register');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate]);

  const loadQuestions = async (category) => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading questions for category:', category);
      
      const response = await getQuizQuestions(category);
      
      console.log('Questions response:', response);
      
      if (response.success && response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
        console.log('Questions loaded from database:', response.questions.length);
        
        // Set timer from config if available
        if (response.config?.quizTime) {
          const timeInSeconds = response.config.quizTime * 60;
          setTimeLeft(timeInSeconds);
        }
        
        // Set passing percentage from config if available
        if (response.config?.passingPercentage) {
          setPassingPercentage(response.config.passingPercentage);
        }
        
        // Start timer
        startTimer();
        
      } else {
        const errorMsg = response.message || 'No questions available';
        console.error('Question loading failed:', errorMsg);
        setError(`No questions available for ${category}. Please ask admin to add questions first.`);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(`Failed to load questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = (questionIndex, optionText) => {
    const newAnswers = {
      ...answers,
      [questionIndex]: optionText
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAutoSubmit = async () => {
    await submitQuizForm(true);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const questionMarks = question.marks || 1;
      totalMarks += questionMarks;
      
      if (userAnswer !== undefined && userAnswer !== null) {
        const correctOption = question.options.find(option => option.isCorrect);
        
        if (correctOption && userAnswer === correctOption.text) {
          correctAnswers++;
          obtainedMarks += questionMarks;
        }
      }
    });
    
    const answeredCount = Object.values(answers).filter(answer => answer !== undefined && answer !== null).length;
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    
    return {
      correctAnswers,
      totalMarks,
      obtainedMarks,
      answeredCount,
      totalQuestions: questions.length,
      percentage: parseFloat(percentage.toFixed(2)),
      passed: percentage >= passingPercentage
    };
  };

  const submitQuizForm = async (isAutoSubmit = false) => {
    try {
      setSubmitting(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (!userData) {
        alert('User data not found.');
        navigate('/register');
        return;
      }

      const scoreData = calculateScore();
      
      console.log('Score calculated:', scoreData);

      const resultData = {
        rollNumber: localStorage.getItem('quizRollNumber') || userData.rollNumber,
        name: userData.name,
        category: userData.category || category,
        score: scoreData.correctAnswers,
        totalMarks: scoreData.totalQuestions,
        obtainedMarks: scoreData.obtainedMarks,
        percentage: scoreData.percentage,
        correctAnswers: scoreData.correctAnswers,
        totalQuestions: scoreData.totalQuestions,
        attempted: scoreData.answeredCount,
        submittedAt: new Date().toISOString(),
        passingPercentage: passingPercentage,
        passed: scoreData.passed,
        isAutoSubmitted: isAutoSubmit
      };

      console.log('Saving result:', resultData);
      
      // Save result to localStorage
      localStorage.setItem('quizResult', JSON.stringify(resultData));
      
      // Save for admin panel access
      localStorage.setItem('lastQuizResult', JSON.stringify(resultData));
      
      // Clean up
      localStorage.removeItem('quizActive');
      
      // Try to submit to backend
      try {
        const quizData = {
          rollNumber: resultData.rollNumber,
          name: resultData.name,
          category: resultData.category,
          score: resultData.score,
          percentage: resultData.percentage,
          totalQuestions: resultData.totalQuestions,
          correctAnswers: resultData.correctAnswers
        };
        
        const response = await submitQuiz(quizData);
        console.log('API submission response:', response);
      } catch (apiError) {
        console.log('API submission failed (continuing offline):', apiError.message);
      }

      navigate('/result');
      
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit quiz: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.values(answers).filter(a => a !== undefined && a !== null).length;
    
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to submit the quiz?')) {
        return;
      }
    }
    
    await submitQuizForm(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoHome = () => {
    if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
      navigate('/register');
    }
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
        </div>
        <h3>Loading Quiz Questions from Database...</h3>
        <p>Please wait while we load the questions</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <FaExclamationTriangle className="error-icon" />
        <h3>Error Loading Quiz</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => navigate('/register')} className="btn-primary">
            Go Back to Registration
          </button>
          <button onClick={() => loadQuestions(category)} className="btn-secondary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-empty">
        <FaQuestionCircle className="empty-icon" />
        <h3>No Questions Available</h3>
        <p>There are no questions available for this category in the database.</p>
        <p>Please contact administrator to add questions for {category}.</p>
        <div className="empty-actions">
          <button onClick={() => navigate('/register')} className="btn-primary">
            Choose Different Category
          </button>
          <button onClick={handleGoHome} className="btn-secondary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== undefined && answers[currentQuestion] !== null;

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <div className="header-container">
          <div className="header-left">
            <img src={ShamsiLogo} alt="Shamsi Institute" className="institute-logo" />
          </div>
          
          <div className="header-center">
            <div className="institute-title">
              Shamsi Institute - Technology Certification Assessment
            </div>
            <div className="quiz-info">
              <span className="category-badge">
                <FaIdCard /> {category.toUpperCase()}
              </span>
              <span className="question-count">
                <FaQuestionCircle /> {questions.length} Questions
              </span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <div className="user-detail">
                <FaUser className="user-icon" />
                <div className="user-text">
                  <div className="user-name">{userData?.name || 'Student'}</div>
                  <div className="user-roll">ID: {userData?.rollNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="quiz-main">
        {/* Left Sidebar - Question Navigation */}
        <div className="question-navigation">
          <h3><FaQuestionCircle /> Question Navigation</h3>
          <div className="question-buttons">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] !== undefined && answers[index] !== null ? 'answered' : 'unanswered'}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div className="navigation-summary">
            <div className="summary-item">
              <span className="label">Total:</span>
              <span className="value">{questions.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Answered:</span>
              <span className="value answered-count">
                {Object.values(answers).filter(a => a !== undefined && a !== null).length}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Remaining:</span>
              <span className="value remaining-count">
                {questions.length - Object.values(answers).filter(a => a !== undefined && a !== null).length}
              </span>
            </div>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="question-container">
          <div className="question-header">
            <div className="question-info">
              <div className="question-number">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="question-meta">
                <div className="question-marks">
                  Marks: {currentQ.marks || 1}
                </div>
                <div className={`question-difficulty ${currentQ.difficulty || 'medium'}`}>
                  {currentQ.difficulty || 'medium'}
                </div>
              </div>
            </div>
            <div className="timer-display-main">
              <FaClock /> {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="question-content">
            <p className="question-text">{currentQ.questionText}</p>
          </div>

          <div className="options-container">
            {currentQ.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === option.text;
              
              return (
                <div
                  key={index}
                  className={`option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion, option.text)}
                >
                  <div className="option-marker">
                    <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                    <div className="option-selector">
                      {isSelected ? (
                        <FaCheckCircle className="option-checked" />
                      ) : (
                        <FaCircle className="option-unchecked" />
                      )}
                    </div>
                  </div>
                  <div className="option-text-content">
                    <span className="option-text">{option.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="question-footer">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="nav-button prev-button"
            >
              <FaArrowLeft /> Previous
            </button>
            
            <div className="question-status">
              <span className={`status-badge ${isAnswered ? 'answered' : 'unanswered'}`}>
                {isAnswered ? '✓ Answered' : '✗ Not Answered'}
              </span>
            </div>
            
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="nav-button submit-button"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="spinning" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz <FaPaperPlane />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="nav-button next-button"
              >
                Next <FaArrowRight />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar - Quiz Summary */}
        <div className="quiz-sidebar">
          <div className="sidebar-section">
            <h3><FaChartBar /> Quiz Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-value">{questions.length}</div>
                <div className="summary-label">Total</div>
              </div>
              <div className="summary-item">
                <div className="summary-value answered-value">
                  {Object.values(answers).filter(a => a !== undefined && a !== null).length}
                </div>
                <div className="summary-label">Answered</div>
              </div>
              <div className="summary-item">
                <div className="summary-value remaining-value">
                  {questions.length - Object.values(answers).filter(a => a !== undefined && a !== null).length}
                </div>
                <div className="summary-label">Remaining</div>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3><FaClock /> Time Remaining</h3>
            <div className="timer-display">
              <div className={`time-circle ${timeLeft < 300 ? 'warning' : ''}`}>
                <span className="time-text">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Passing Criteria</h3>
            <div className="passing-info">
              <div className="passing-item">
                <span className="label">Required:</span>
                <span className="value">{passingPercentage}%</span>
              </div>
              <div className="passing-item">
                <span className="label">Questions:</span>
                <span className="value">{questions.length}</span>
              </div>
              <div className="passing-item">
                <span className="label">Time:</span>
                <span className="value">{Math.floor(timeLeft / 60)} min</span>
              </div>
            </div>
          </div>
          
          <div className="sidebar-actions">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="sidebar-submit-btn"
            >
              {submitting ? (
                <>
                  <FaSpinner className="spinning" /> Submitting...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Submit Now
                </>
              )}
            </button>
            
            <button
              onClick={handleGoHome}
              className="sidebar-home-btn"
            >
              <FaHome /> Leave Quiz
            </button>
          </div>
        </div>
      </main>

      <footer className="quiz-footer">
        <div className="footer-left">
          <div className="footer-logo-container">
            <img src={ShamsiLogo} alt="Shamsi Institute" className="footer-logo" />
            <div className="footer-title">Shamsi Institute</div>
          </div>
        </div>
        
        <div className="footer-right">
          <div className="footer-actions">
            <div className="footer-timer">
              <FaClock /> {formatTime(timeLeft)}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="footer-submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'} <FaPaperPlane />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;