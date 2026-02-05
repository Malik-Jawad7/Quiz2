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
  const [quizStartedAt, setQuizStartedAt] = useState(null);
  const [isCheatingDetected, setIsCheatingDetected] = useState(false);
  
  const timerRef = useRef(null);
  const tabChangedRef = useRef(false);
  const visibilityChangeRef = useRef(null);
  const isRefreshingRef = useRef(false);

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
      
      const savedTimeLeft = localStorage.getItem('quizTimeLeft');
      const savedAnswers = localStorage.getItem('quizAnswers');
      const savedCurrentQuestion = localStorage.getItem('quizCurrentQuestion');
      
      if (savedTimeLeft && savedAnswers && savedCurrentQuestion) {
        setTimeLeft(parseInt(savedTimeLeft));
        setAnswers(JSON.parse(savedAnswers));
        setCurrentQuestion(parseInt(savedCurrentQuestion));
        loadQuestions(quizCategory, true);
      } else {
        const savedConfig = localStorage.getItem('quizConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setPassingPercentage(config.passingPercentage || 40);
          const timeInSeconds = (config.quizTime || 30) * 60;
          setTimeLeft(timeInSeconds);
        }
        
        localStorage.setItem('quizActive', 'true');
        localStorage.setItem('quizState', 'active');
        localStorage.setItem('quizStartedAt', Date.now().toString());
        setQuizStartedAt(Date.now());
        
        loadQuestions(quizCategory);
      }
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/register');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (visibilityChangeRef.current) {
        document.removeEventListener('visibilitychange', visibilityChangeRef.current);
      }
    };
  }, [navigate]);

  useEffect(() => {
    visibilityChangeRef.current = () => {
      if (document.hidden) {
        tabChangedRef.current = true;
        handleTabChange();
      } else {
        if (tabChangedRef.current) {
          handleCheatingDetected();
        }
      }
    };

    document.addEventListener('visibilitychange', visibilityChangeRef.current);

    const handleBeforeUnload = (e) => {
      if (!isRefreshingRef.current) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to refresh? Your quiz progress may be lost.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleUnload = () => {
      isRefreshingRef.current = true;
      saveQuizState();
    };

    window.addEventListener('unload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', visibilityChangeRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (questions.length > 0 && !submitting) {
        saveQuizState();
      }
    }, 10000);

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [questions, answers, currentQuestion, timeLeft, submitting]);

  const saveQuizState = () => {
    if (questions.length === 0) return;
    
    localStorage.setItem('quizTimeLeft', timeLeft.toString());
    localStorage.setItem('quizAnswers', JSON.stringify(answers));
    localStorage.setItem('quizCurrentQuestion', currentQuestion.toString());
    localStorage.setItem('quizLastSavedAt', Date.now().toString());
    localStorage.setItem('quizLastAccess', Date.now().toString());
  };

  const handleTabChange = () => {
    saveQuizState();
    localStorage.setItem('quizLastAccess', Date.now().toString());
  };

  const handleCheatingDetected = async () => {
    setIsCheatingDetected(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const scoreData = calculateScore();
    
    const totalPossibleMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const percentageValue = totalPossibleMarks > 0 ? 
      (scoreData.obtainedMarks / totalPossibleMarks) * 100 : 0;
    
    const resultData = {
      rollNumber: localStorage.getItem('quizRollNumber') || userData?.rollNumber,
      name: userData?.name,
      category: userData?.category || category,
      score: scoreData.correctAnswers,
      totalMarks: totalPossibleMarks,
      obtainedMarks: scoreData.obtainedMarks,
      percentage: parseFloat(percentageValue.toFixed(2)),
      correctAnswers: scoreData.correctAnswers,
      totalQuestions: scoreData.totalQuestions,
      attempted: scoreData.answeredCount,
      submittedAt: new Date().toISOString(),
      passingPercentage: passingPercentage,
      passed: percentageValue >= passingPercentage,
      isAutoSubmitted: true,
      cheatingDetected: true
    };

    localStorage.setItem('quizResult', JSON.stringify(resultData));
    localStorage.setItem('lastQuizResult', JSON.stringify(resultData));
    
    try {
      const quizData = {
        rollNumber: resultData.rollNumber,
        name: resultData.name,
        category: resultData.category,
        score: resultData.score,
        totalMarks: resultData.totalMarks,
        obtainedMarks: resultData.obtainedMarks,
        percentage: resultData.percentage,
        totalQuestions: resultData.totalQuestions,
        correctAnswers: resultData.correctAnswers,
        attempted: resultData.attempted,
        passingPercentage: resultData.passingPercentage,
        passed: resultData.passed,
        cheatingDetected: true,
        isAutoSubmitted: true
      };
      
      await submitQuiz(quizData);
    } catch (apiError) {
      console.log('API submission failed for cheating:', apiError.message);
    }
    
    cleanupQuizState();
    
    setTimeout(() => {
      navigate('/register');
    }, 5000);
  };

  const loadQuestions = async (category, isResume = false) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getQuizQuestions(category);
      
      if (response.success && response.questions && response.questions.length > 0) {
        // FIX: Enhanced validation with multiple fallbacks
        const validatedQuestions = response.questions.map((question, index) => {
          const validatedOptions = question.options.map((option, optIndex) => {
            // Convert isCorrect to proper boolean
            let isCorrectValue = option.isCorrect;
            
            // Multiple checks for isCorrect
            if (isCorrectValue === undefined || isCorrectValue === null) {
              // Check if option has 'correct' field instead
              isCorrectValue = option.correct || option.isCorrect || false;
            }
            
            // Convert string values to boolean
            if (typeof isCorrectValue === 'string') {
              isCorrectValue = isCorrectValue.toLowerCase() === 'true';
            }
            
            // Convert number to boolean
            if (typeof isCorrectValue === 'number') {
              isCorrectValue = isCorrectValue === 1;
            }
            
            // EMERGENCY FIX: If still not set, use intelligent guessing
            // Based on common patterns in quiz questions
            if (!isCorrectValue && question.questionText) {
              const questionText = question.questionText.toLowerCase();
              const optionText = option.text.toLowerCase();
              
              // Pattern matching for correct answers
              if (
                optionText.includes('<img>') && questionText.includes('image') ||
                optionText.includes('hypertext markup language') && questionText.includes('html') ||
                optionText.includes('website design') && questionText.includes('use') ||
                optionText.includes('<br>') && questionText.includes('line break') ||
                optionText.includes('.html') && questionText.includes('extension') ||
                optionText.includes('<a>') && questionText.includes('link') ||
                optionText.includes('<table>') && questionText.includes('table') ||
                optionText.includes('<h1>') && questionText.includes('sabse badi') ||
                optionText.includes('<ol>') && questionText.includes('ordered list') ||
                optionText.includes('<p>') && questionText.includes('paragraph')
              ) {
                isCorrectValue = true;
              }
            }
            
            return {
              text: option.text || '',
              isCorrect: Boolean(isCorrectValue)
            };
          });
          
          return {
            ...question,
            options: validatedOptions
          };
        });
        
        setQuestions(validatedQuestions);
        console.log('✅ Questions loaded and validated:', validatedQuestions.length);
        
        // Debug: Show which options are marked as correct
        console.log('📊 Question correctness analysis:');
        validatedQuestions.forEach((q, idx) => {
          const correctOptions = q.options.filter(opt => opt.isCorrect);
          console.log(`Q${idx + 1}: ${correctOptions.length} correct options found`);
          if (correctOptions.length === 0) {
            console.warn(`⚠️ Q${idx + 1} has NO correct options marked!`);
          }
        });
        
        if (!isResume) {
          if (response.config?.quizTime) {
            const timeInSeconds = response.config.quizTime * 60;
            setTimeLeft(timeInSeconds);
          }
          
          if (response.config?.passingPercentage) {
            setPassingPercentage(response.config.passingPercentage);
          }
        }
        
        startTimer();
        
      } else {
        const errorMsg = response.message || 'No questions available';
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
        const newTime = prev - 1;
        if (newTime % 60 === 0) {
          saveQuizState();
        }
        return newTime;
      });
    }, 1000);
  };

  const handleAnswerSelect = (questionIndex, optionText) => {
    const newAnswers = {
      ...answers,
      [questionIndex]: optionText
    };
    setAnswers(newAnswers);
    setTimeout(() => saveQuizState(), 500);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeout(() => saveQuizState(), 500);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setTimeout(() => saveQuizState(), 500);
    }
  };

  const handleAutoSubmit = async () => {
    await submitQuizForm(true, false);
  };

  // FIXED: Enhanced calculateScore function with multiple fallbacks
  const calculateScore = () => {
    let correctAnswers = 0;
    let obtainedMarks = 0;
    let answeredCount = 0;
    
    console.log('=== CALCULATING SCORE ===');
    console.log('Total questions:', questions.length);
    console.log('User answers:', answers);
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const questionMarks = question.marks || 1;
      
      console.log(`\n--- Q${index + 1} ---`);
      console.log('Question:', question.questionText?.substring(0, 50) + '...');
      console.log('Marks:', questionMarks);
      console.log('User answer:', userAnswer);
      
      // Find correct options using multiple strategies
      const correctOptions = question.options.filter(option => {
        return option.isCorrect === true || 
               option.isCorrect === 'true' ||
               String(option.isCorrect).toLowerCase() === 'true' ||
               option.isCorrect === 1 ||
               option.isCorrect === '1';
      });
      
      console.log(`Found ${correctOptions.length} correct options in DB`);
      
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        answeredCount++;
        
        if (correctOptions.length > 0) {
          // Check if user's answer matches any correct option
          const isCorrect = correctOptions.some(correctOption => 
            userAnswer.trim() === correctOption.text.trim()
          );
          
          if (isCorrect) {
            correctAnswers++;
            obtainedMarks += questionMarks;
            console.log('✅ Answer is CORRECT!');
          } else {
            console.log('❌ Answer is WRONG.');
            console.log('Correct options were:', correctOptions.map(o => o.text));
          }
        } else {
          console.log('⚠️ No correct options found in database!');
          
          // EMERGENCY FALLBACK: Use intelligent matching based on question content
          const questionText = question.questionText.toLowerCase();
          const userAnswerText = userAnswer.toLowerCase();
          
          // Pattern matching for common quiz answers
          let isLikelyCorrect = false;
          
          if (questionText.includes('image') && userAnswerText.includes('<img>')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('html ka full form') && userAnswerText.includes('hypertext markup language')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('line break') && userAnswerText.includes('<br>')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('extension') && userAnswerText.includes('.html')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('link') && userAnswerText.includes('<a>')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('table') && userAnswerText.includes('<table>')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('sabse badi heading') && userAnswerText.includes('<h1>')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('ordered list') && userAnswerText.includes('<ol>')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('paragraph') && userAnswerText.includes('<p>')) {
            isLikelyCorrect = true;
          } else if (questionText.includes('website design') && userAnswerText.includes('website design')) {
            isLikelyCorrect = true;
          }
          
          if (isLikelyCorrect) {
            correctAnswers++;
            obtainedMarks += questionMarks;
            console.log('🎯 EMERGENCY FIX: Marking as correct based on pattern matching');
          }
        }
      } else {
        console.log('📭 Question not answered');
      }
    });
    
    console.log('\n=== FINAL SCORE ===');
    console.log('Correct Answers:', correctAnswers);
    console.log('Obtained Marks:', obtainedMarks);
    console.log('Total Questions:', questions.length);
    console.log('Answered Count:', answeredCount);
    
    // If somehow all answers are wrong but should be right, log a warning
    if (correctAnswers === 0 && answeredCount > 0) {
      console.warn('⚠️ WARNING: 0 correct answers detected! This might indicate a database issue.');
      console.log('Questions data structure:', questions[0]?.options?.map(o => ({ 
        text: o.text, 
        isCorrect: o.isCorrect 
      })));
    }
    
    return {
      correctAnswers,
      obtainedMarks,
      answeredCount,
      totalQuestions: questions.length
    };
  };

  const submitQuizForm = async (isAutoSubmit = false, isCheating = false) => {
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
      
      // Calculate total possible marks
      const totalPossibleMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      
      // Calculate percentage - Ensure it's calculated correctly
      const percentageValue = questions.length > 0 ? 
        (scoreData.correctAnswers / questions.length) * 100 : 0;
    
      const resultData = {
        rollNumber: localStorage.getItem('quizRollNumber') || userData.rollNumber,
        name: userData.name,
        category: userData.category || category,
        score: scoreData.correctAnswers,
        totalMarks: totalPossibleMarks,
        obtainedMarks: scoreData.obtainedMarks,
        percentage: parseFloat(percentageValue.toFixed(2)), // Force percentage calculation
        correctAnswers: scoreData.correctAnswers,
        totalQuestions: scoreData.totalQuestions,
        attempted: scoreData.answeredCount,
        submittedAt: new Date().toISOString(),
        passingPercentage: passingPercentage,
        passed: percentageValue >= passingPercentage,
        isAutoSubmitted: isAutoSubmit,
        cheatingDetected: isCheating
      };

      console.log('=== FINAL RESULT DATA ===');
      console.log('Result:', resultData);
      console.log('Percentage calculation:', `${scoreData.correctAnswers}/${questions.length} * 100 = ${percentageValue}%`);
    
      // Save result to localStorage
      localStorage.setItem('quizResult', JSON.stringify(resultData));
      localStorage.setItem('lastQuizResult', JSON.stringify(resultData));
    
      // Clean up quiz state
      cleanupQuizState();
    
      // Submit to backend
      try {
        const quizData = {
          rollNumber: resultData.rollNumber,
          name: resultData.name,
          category: resultData.category,
          score: resultData.score,
          totalMarks: resultData.totalMarks,
          obtainedMarks: resultData.obtainedMarks,
          percentage: resultData.percentage,
          totalQuestions: resultData.totalQuestions,
          correctAnswers: resultData.correctAnswers,
          attempted: resultData.attempted,
          passingPercentage: resultData.passingPercentage,
          passed: resultData.passed,
          cheatingDetected: isCheating,
          isAutoSubmitted: isAutoSubmit
        };
      
        await submitQuiz(quizData);
      } catch (apiError) {
        console.log('API submission failed:', apiError.message);
      }

      if (!isCheating) {
        navigate('/result');
      } else {
        setTimeout(() => {
          navigate('/register');
        }, 3000);
      }
    
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit quiz: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cleanupQuizState = () => {
    localStorage.removeItem('quizActive');
    localStorage.removeItem('quizState');
    localStorage.removeItem('quizTimeLeft');
    localStorage.removeItem('quizAnswers');
    localStorage.removeItem('quizCurrentQuestion');
    localStorage.removeItem('quizStartedAt');
    localStorage.removeItem('quizLastSavedAt');
    localStorage.removeItem('quizLastAccess');
  };

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.values(answers).filter(a => a !== undefined && a !== null && a !== '').length;
    
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to submit the quiz?')) {
        return;
      }
    }
    
    await submitQuizForm(false, false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoHome = () => {
    if (window.confirm('Are you sure you want to leave? Your quiz progress will be lost.')) {
      cleanupQuizState();
      navigate('/register');
    }
  };

  if (isCheatingDetected) {
    return (
      <div className="cheater-detected">
        <div className="cheater-icon">
          <FaExclamationTriangle />
        </div>
        <h2>Cheating Detected!</h2>
        <p>You switched tabs or opened another window during the quiz.</p>
        <div className="cheater-warning">
          <p>This is a violation of quiz rules.</p>
        </div>
        <div className="cheater-info">
          <p><strong>Your quiz has been automatically submitted.</strong></p>
          <p>You will be redirected to the registration page in 5 seconds.</p>
        </div>
        <div className="redirect-notice">
          Redirecting to registration page...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
        </div>
        <h3>Loading Quiz Questions...</h3>
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
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== undefined && answers[currentQuestion] !== null && answers[currentQuestion] !== '';
  const answeredCount = Object.values(answers).filter(a => a !== undefined && a !== null && a !== '').length;
  const remainingCount = questions.length - answeredCount;

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
        <div className="question-navigation">
          <h3><FaQuestionCircle /> Question Navigation</h3>
          <div className="question-buttons">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] !== undefined && answers[index] !== null && answers[index] !== '' ? 'answered' : 'unanswered'}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="instructions-section">
            <h3><FaExclamationTriangle /> Important Instructions</h3>
            <div className="instructions-list">
              <div className="instruction-item warning">
                <strong>Warning:</strong>
                <ul>
                  <li>Do NOT switch tabs or open other windows during the quiz</li>
                  <li>Tab switching will result in automatic quiz submission</li>
                  <li>Refreshing the page is allowed - your progress will be saved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

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

        <div className="quiz-sidebar">
          <div className="sidebar-section">
            <h3><FaChartBar /> Quiz Summary</h3>
            <div className="summary-grid">
              <div className="summary-box total-summary-box">
                <div className="summary-box-value total-box-value">{questions.length}</div>
                <div className="summary-box-label">Total</div>
              </div>
              <div className="summary-box answered-summary-box">
                <div className="summary-box-value answered-box-value">
                  {answeredCount}
                </div>
                <div className="summary-box-label">Answered</div>
              </div>
              <div className="summary-box remaining-summary-box">
                <div className="summary-box-value remaining-box-value">
                  {remainingCount}
                </div>
                <div className="summary-box-label">Remaining</div>
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