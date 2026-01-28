// src/pages/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz } from '../services/api';
import './Quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is registered
    const storedUserData = localStorage.getItem('userData');
    const category = localStorage.getItem('quizCategory');
    const rollNumber = localStorage.getItem('quizRollNumber');

    if (!storedUserData || !category || !rollNumber) {
      navigate('/register');
      return;
    }

    setUserData(JSON.parse(storedUserData));
    loadQuestions(category);
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const loadQuestions = async (category) => {
    try {
      setLoading(true);
      const response = await getQuizQuestions(category);
      
      if (response.data.success) {
        setQuestions(response.data.questions || []);
        // Initialize answers object
        const initialAnswers = {};
        response.data.questions?.forEach((q, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
      } else {
        setError('Failed to load questions');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load quiz questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionText
    }));
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
    await submitQuizForm();
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit the quiz? You cannot change answers after submission.')) {
      await submitQuizForm();
    }
  };

  const submitQuizForm = async () => {
    try {
      setSubmitting(true);
      const rollNumber = localStorage.getItem('quizRollNumber');
      
      const answersArray = Object.entries(answers).map(([index, answer]) => ({
        questionId: questions[parseInt(index)]?._id,
        selectedOption: answer
      })).filter(item => item.questionId && item.selectedOption);

      const quizData = {
        rollNumber,
        answers: answersArray,
        timeLeft
      };

      const response = await submitQuiz(quizData);
      
      if (response.data.success) {
        // Clear quiz data from localStorage
        localStorage.removeItem('quizCategory');
        localStorage.removeItem('quizAnswers');
        
        // Navigate to result page
        navigate(`/result/${rollNumber}`);
      } else {
        setError(response.data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const answered = Object.values(answers).filter(answer => answer !== null).length;
    return Math.round((answered / questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <h3>Loading Quiz Questions...</h3>
        <p>Please wait while we prepare your quiz</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Quiz</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/register')} className="btn-primary">
          Go Back to Registration
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-empty">
        <div className="empty-icon">📭</div>
        <h3>No Questions Available</h3>
        <p>No questions found for your selected category</p>
        <button onClick={() => navigate('/register')} className="btn-primary">
          Choose Different Category
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== null;
  const progress = calculateProgress();

  return (
    <div className="quiz-container">
      {/* Quiz Header */}
      <header className="quiz-header">
        <div className="header-left">
          <h1>Shamsi Institute Quiz</h1>
          {userData && (
            <div className="user-info">
              <span><strong>Name:</strong> {userData.name}</span>
              <span><strong>Roll No:</strong> {userData.rollNumber}</span>
              <span><strong>Category:</strong> {userData.category.toUpperCase()}</span>
            </div>
          )}
        </div>
        
        <div className="header-right">
          <div className="timer-box">
            <span className="timer-icon">⏰</span>
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="progress-box">
            <span className="progress-icon">📊</span>
            <span className="progress-text">{progress}% Complete</span>
          </div>
        </div>
      </header>

      {/* Main Quiz Area */}
      <main className="quiz-main">
        {/* Question Navigation */}
        <div className="question-nav">
          <div className="nav-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span className="marks-info">Marks: {currentQ.marks || 1}</span>
          </div>
          
          <div className="question-buttons">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`q-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] ? 'answered' : ''}`}
                onClick={() => setCurrentQuestion(index)}
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Current Question */}
        <div className="question-card">
          <div className="question-header">
            <h2>Question {currentQuestion + 1}</h2>
            <span className="question-marks">{currentQ.marks || 1} mark{currentQ.marks !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="question-text">
            <p>{currentQ.questionText}</p>
          </div>

          {/* Options */}
          <div className="options-container">
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`option-item ${answers[currentQuestion] === option.text ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestion, option.text)}
              >
                <div className="option-selector">
                  <div className={`option-circle ${answers[currentQuestion] === option.text ? 'checked' : ''}`}>
                    {answers[currentQuestion] === option.text ? '✓' : ''}
                  </div>
                </div>
                <div className="option-content">
                  <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                  <span className="option-text">{option.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="question-navigation">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="nav-btn prev-btn"
            >
              ← Previous
            </button>
            
            <div className="question-status">
              <span className={`status-dot ${isAnswered ? 'answered' : 'unanswered'}`}></span>
              <span>{isAnswered ? 'Answered' : 'Not Answered'}</span>
            </div>
            
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="nav-btn submit-btn"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="nav-btn next-btn"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Quiz Summary */}
        <div className="quiz-summary">
          <h3>Quiz Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{questions.length}</span>
              <span className="stat-label">Total Questions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Object.values(answers).filter(a => a !== null).length}</span>
              <span className="stat-label">Answered</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Object.values(answers).filter(a => a === null).length}</span>
              <span className="stat-label">Remaining</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{progress}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
          
          <div className="warning-box">
            <span className="warning-icon">⚠️</span>
            <p>
              <strong>Important:</strong> Time will continue to count down. 
              Submit before time runs out to save your answers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="quiz-footer">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to leave? Your progress will be lost.')) {
              navigate('/register');
            }
          }}
          className="footer-btn leave-btn"
        >
          Leave Quiz
        </button>
        
        <div className="footer-timer">
          <span>Time Remaining: </span>
          <span className={`time-remaining ${timeLeft < 300 ? 'warning' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="footer-btn submit-final-btn"
        >
          {submitting ? 'Submitting...' : 'Final Submit'}
        </button>
      </footer>
    </div>
  );
};

export default Quiz;