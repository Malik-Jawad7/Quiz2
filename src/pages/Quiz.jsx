import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz, getConfig } from '../services/api';
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
  FaCircle
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
  
  const timerRef = useRef(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const category = localStorage.getItem('quizCategory');

    if (!storedUserData || !category) {
      navigate('/register');
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    } catch (error) {
      navigate('/register');
      return;
    }
    
    // Load config
    const loadConfig = async () => {
      try {
        const response = await getConfig();
        if (response.success) {
          setPassingPercentage(response.config.passingPercentage);
          const timeInSeconds = response.config.quizTime * 60;
          setTimeLeft(timeInSeconds);
        }
      } catch (error) {
        console.log('Using default config');
      }
    };
    
    loadConfig();
    loadQuestions(category);
    
    // Start timer
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate]);

  const loadQuestions = async (category) => {
    try {
      setLoading(true);
      const response = await getQuizQuestions(category);
      
      if (response.success && response.questions.length > 0) {
        setQuestions(response.questions);
      } else {
        alert('No questions available for this category. Please contact admin.');
        navigate('/register');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load questions. Please try again.');
      navigate('/register');
    } finally {
      setLoading(false);
    }
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
      
      if (userAnswer !== null) {
        const correctOption = question.options.find(option => option.isCorrect);
        
        if (correctOption && userAnswer === correctOption.text) {
          correctAnswers++;
          obtainedMarks += questionMarks;
        }
      }
    });
    
    const answeredCount = Object.values(answers).filter(answer => answer !== null).length;
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    
    return {
      correctAnswers,
      totalMarks,
      obtainedMarks,
      answeredCount,
      totalQuestions: questions.length,
      percentage,
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
      
      const rollNumber = localStorage.getItem('quizRollNumber');
      const userDataStr = localStorage.getItem('userData');
      
      if (!userDataStr) {
        alert('User data not found.');
        navigate('/register');
        return;
      }

      const user = JSON.parse(userDataStr);
      const scoreData = calculateScore();

      const resultData = {
        _id: 'quiz_result_' + Date.now(),
        rollNumber: rollNumber || user.rollNumber,
        name: user.name,
        category: user.category,
        score: scoreData.correctAnswers,
        totalMarks: scoreData.totalQuestions,
        obtainedMarks: scoreData.obtainedMarks,
        percentage: scoreData.percentage.toFixed(2),
        correctAnswers: scoreData.correctAnswers,
        totalQuestions: scoreData.totalQuestions,
        attempted: scoreData.answeredCount,
        submittedAt: new Date().toISOString(),
        passingPercentage: passingPercentage,
        passed: scoreData.passed,
        isAutoSubmitted: isAutoSubmit
      };

      // Save result to localStorage
      localStorage.setItem('quizResult', JSON.stringify(resultData));
      
      // Clean up
      localStorage.removeItem('quizActive');
      
      // Try to submit to backend
      try {
        const quizData = {
          rollNumber: rollNumber,
          name: user.name,
          category: user.category,
          score: scoreData.correctAnswers,
          percentage: scoreData.percentage,
          totalQuestions: questions.length,
          correctAnswers: scoreData.correctAnswers
        };
        
        await submitQuiz(quizData);
      } catch (apiError) {
        console.log('API submission failed:', apiError.message);
      }

      navigate('/result');
      
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit the quiz?')) {
      await submitQuizForm(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <h3>Loading Quiz...</h3>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-empty">
        <h3>No Questions Available</h3>
        <button onClick={() => navigate('/register')} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== null;

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
          </div>
          
          <div className="header-right">
            <div className="timer">
              <FaClock /> {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <main className="quiz-main">
        <div className="question-navigation">
          <h3><FaQuestionCircle /> Question Navigation</h3>
          <div className="question-buttons">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] ? 'answered' : 'unanswered'}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="question-container">
          <div className="question-header">
            <div className="question-number">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="question-marks">
              Marks: {currentQ.marks || 1}
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
              {isAnswered ? 'Answered' : 'Not Answered'}
            </div>
            
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="nav-button submit-button"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'} <FaPaperPlane />
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

        <div className="quiz-sidebar">
          <div className="sidebar-section">
            <h3><FaChartBar /> Quiz Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-value">{questions.length}</div>
                <div className="summary-label">Total</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{Object.values(answers).filter(a => a !== null).length}</div>
                <div className="summary-label">Answered</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{questions.length - Object.values(answers).filter(a => a !== null).length}</div>
                <div className="summary-label">Remaining</div>
              </div>
            </div>
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
        
        <div className="footer-center">
          <div className="footer-timer">
            <FaClock /> {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="footer-right">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="footer-button submit-final-button"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'} <FaPaperPlane />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;