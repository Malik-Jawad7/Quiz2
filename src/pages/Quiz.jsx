import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz, getConfig } from '../services/api';
import ShamsiLogo from '../assets/shamsi-logo.jpg';
import { 
  FaClock, 
  FaChartBar, 
  FaExclamationTriangle, 
  FaSave, 
  FaUser, 
  FaIdCard, 
  FaTag, 
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
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [quizStarted, setQuizStarted] = useState(false);
  const [cheatDetected, setCheatDetected] = useState(false);
  const [cheatCount, setCheatCount] = useState(0);
  
  // Refs for persistence
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const savedAnswersRef = useRef({});
  const savedTimeRef = useRef(1800);
  const lastActivityRef = useRef(Date.now());
  const tabChangeCountRef = useRef(0);
  const visibilityChangeTimeRef = useRef(null);

  // Check if quiz already started and load saved state
  useEffect(() => {
    const checkQuizStatus = () => {
      const storedQuizStatus = localStorage.getItem('quizActive');
      const storedQuizData = localStorage.getItem('quizInProgress');
      
      if (storedQuizStatus === 'true' && storedQuizData) {
        try {
          const quizData = JSON.parse(storedQuizData);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - quizData.startTime) / 1000);
          const remainingTime = Math.max(0, quizData.totalTime - elapsedSeconds);
          
          savedTimeRef.current = remainingTime;
          savedAnswersRef.current = quizData.answers || {};
          startTimeRef.current = quizData.startTime;
          
          console.log('Resuming quiz from saved state:', {
            remainingTime,
            answersCount: Object.keys(quizData.answers || {}).length
          });
          
          return true;
        } catch (error) {
          console.error('Error loading saved quiz:', error);
          localStorage.removeItem('quizActive');
          localStorage.removeItem('quizInProgress');
        }
      }
      return false;
    };

    const storedUserData = localStorage.getItem('userData');
    const category = localStorage.getItem('quizCategory');
    const rollNumber = localStorage.getItem('quizRollNumber');

    console.log('Quiz Page Load - Checking localStorage:', {
      storedUserData: !!storedUserData,
      category,
      rollNumber,
      quizActive: localStorage.getItem('quizActive')
    });

    if (!storedUserData || !category || !rollNumber) {
      console.log('Missing user data, redirecting to register');
      navigate('/register');
      return;
    }

    // Check if user is marked as cheater
    const isCheater = localStorage.getItem('cheater_' + rollNumber);
    if (isCheater === 'true') {
      setCheatDetected(true);
      // Auto-submit as cheater
      setTimeout(() => submitAsCheater(rollNumber), 1000);
      return;
    }

    // Check if quiz is already active for this user
    const isQuizResumed = checkQuizStatus();
    
    if (isQuizResumed) {
      // Prevent starting new quiz if one is already in progress
      const currentActiveRoll = localStorage.getItem('activeQuizRoll');
      if (currentActiveRoll && currentActiveRoll !== rollNumber) {
        alert('Another quiz is already in progress. Please complete it first.');
        navigate('/register');
        return;
      }
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      console.log('User data loaded:', parsedUserData);
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/register');
      return;
    }
    
    // Mark quiz as active
    localStorage.setItem('quizActive', 'true');
    localStorage.setItem('activeQuizRoll', rollNumber);
    setQuizStarted(true);
    
    // Fetch passing percentage from config
    const fetchConfig = async () => {
      try {
        const response = await getConfig();
        if (response.data.success) {
          setPassingPercentage(response.data.config.passingPercentage || 40);
        }
      } catch (error) {
        console.log('Using default passing percentage');
      }
    };
    
    fetchConfig();
    loadQuestions(category);
    
    const config = localStorage.getItem('quizConfig');
    const quizTime = config ? JSON.parse(config).quizTime : 30;
    const timeInSeconds = isQuizResumed ? savedTimeRef.current : quizTime * 60;
    
    console.log('Timer set to:', timeInSeconds, 'seconds', isQuizResumed ? '(resumed)' : '(new)');
    setTimeLeft(timeInSeconds);
    
    // Save quiz start time if not already saved
    if (!isQuizResumed) {
      startTimeRef.current = Date.now();
      const quizData = {
        startTime: startTimeRef.current,
        totalTime: timeInSeconds,
        answers: {},
        category,
        rollNumber
      };
      localStorage.setItem('quizInProgress', JSON.stringify(quizData));
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          console.log('Time expired, auto-submitting...');
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Activity tracker to detect inactivity
    const activityInterval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;
      
      // If user is inactive for more than 30 seconds, mark as suspicious
      if (inactiveTime > 30000 && !document.hidden) {
        console.log('User inactive for', Math.floor(inactiveTime/1000), 'seconds');
      }
      
      lastActivityRef.current = now;
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearInterval(activityInterval);
    };
  }, [navigate]);

  // Save quiz state periodically and on answers change
  useEffect(() => {
    const saveQuizState = () => {
      if (startTimeRef.current) {
        const quizData = {
          startTime: startTimeRef.current,
          totalTime: timeLeft + (timerRef.current ? 1 : 0),
          answers: answers,
          category: userData?.category,
          rollNumber: userData?.rollNumber,
          cheatCount: cheatCount
        };
        localStorage.setItem('quizInProgress', JSON.stringify(quizData));
      }
    };

    // Save state every 10 seconds
    const saveInterval = setInterval(saveQuizState, 10000);
    
    // Also save on answers change
    if (Object.keys(answers).length > 0) {
      saveQuizState();
    }

    return () => clearInterval(saveInterval);
  }, [answers, timeLeft, userData, cheatCount]);

  // Tab change detection and cheat detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to another tab
        const now = Date.now();
        tabChangeCountRef.current++;
        
        // Mark the time when tab was hidden
        visibilityChangeTimeRef.current = now;
        
        console.log('Tab changed - count:', tabChangeCountRef.current);
        
        // If user changes tab more than 2 times, mark as cheater
        if (tabChangeCountRef.current > 2) {
          setCheatDetected(true);
          markAsCheater();
          handleCheaterSubmit();
        } else {
          // Increase cheat count
          setCheatCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 3) {
              setCheatDetected(true);
              markAsCheater();
              handleCheaterSubmit();
            }
            return newCount;
          });
        }
      } else {
        // User came back to tab
        if (visibilityChangeTimeRef.current) {
          const timeHidden = Date.now() - visibilityChangeTimeRef.current;
          
          // If user was away for more than 10 seconds, it's suspicious
          if (timeHidden > 10000) {
            setCheatCount(prev => {
              const newCount = prev + 1;
              if (newCount >= 3) {
                setCheatDetected(true);
                markAsCheater();
                handleCheaterSubmit();
              }
              return newCount;
            });
          }
        }
        visibilityChangeTimeRef.current = null;
      }
    };

    const handleBeforeUnload = (e) => {
      // Prevent accidental refresh
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your quiz will be submitted.';
      return e.returnValue;
    };

    const handleUnload = () => {
      // Submit quiz when page is being unloaded
      if (!submitting) {
        navigator.sendBeacon?.('/api/quiz/auto-submit', JSON.stringify({
          rollNumber: userData?.rollNumber,
          answers: answers,
          timeLeft: timeLeft,
          cheatDetected: cheatDetected
        }));
      }
    };

    // Track mouse movements and clicks for activity
    const trackActivity = () => {
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('mousemove', trackActivity);
    document.addEventListener('click', trackActivity);
    document.addEventListener('keydown', trackActivity);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      document.removeEventListener('mousemove', trackActivity);
      document.removeEventListener('click', trackActivity);
      document.removeEventListener('keydown', trackActivity);
    };
  }, [submitting, answers, timeLeft, userData]);

  const markAsCheater = () => {
    if (userData?.rollNumber) {
      localStorage.setItem('cheater_' + userData.rollNumber, 'true');
      // Store cheater info for 24 hours
      const cheaterData = {
        rollNumber: userData.rollNumber,
        name: userData.name,
        timestamp: new Date().toISOString(),
        reason: 'Multiple tab changes detected'
      };
      localStorage.setItem('cheater_details_' + userData.rollNumber, JSON.stringify(cheaterData));
    }
  };

  const submitAsCheater = async (rollNumber) => {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) return;

    const user = JSON.parse(userDataStr);
    
    const resultData = {
      _id: 'cheater_result_' + Date.now(),
      rollNumber: user.rollNumber,
      userName: user.name,
      name: user.name,
      category: user.category,
      score: 0,
      totalMarks: 10,
      obtainedMarks: 0,
      percentage: 0,
      correctAnswers: 0,
      totalQuestions: 10,
      attempted: 0,
      submittedAt: new Date().toISOString(),
      passingPercentage: passingPercentage,
      passed: false,
      isAutoSubmitted: true,
      isCheater: true,
      cheatReason: 'Malpractice detected - Multiple tab changes'
    };

    localStorage.setItem('quizResult', JSON.stringify(resultData));
    localStorage.removeItem('quizActive');
    localStorage.removeItem('quizInProgress');
    
    navigate('/result');
  };

  const handleCheaterSubmit = () => {
    if (cheatDetected && userData?.rollNumber) {
      submitAsCheater(userData.rollNumber);
    }
  };

  const loadQuestions = async (category) => {
    try {
      setLoading(true);
      console.log('Loading questions for category:', category);
      
      const response = await getQuizQuestions(category);
      console.log('Questions API response:', response);
      
      if (response.data?.success) {
        const questionsData = response.data.questions || [];
        console.log(`Loaded ${questionsData.length} questions`);
        
        // Log first question details to verify structure
        if (questionsData.length > 0) {
          console.log('First question structure:', {
            text: questionsData[0].questionText,
            options: questionsData[0].options,
            correctOption: questionsData[0].options.find(opt => opt.isCorrect)
          });
        }
        
        setQuestions(questionsData);
        
        // Load saved answers if available
        const initialAnswers = savedAnswersRef.current || {};
        questionsData.forEach((q, index) => {
          if (initialAnswers[index] === undefined) {
            initialAnswers[index] = null;
          }
        });
        setAnswers(initialAnswers);
      } else {
        setError('Failed to load questions: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load quiz questions. Please try again. ' + (error.message || ''));
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
    savedAnswersRef.current = newAnswers;
    lastActivityRef.current = Date.now();
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      lastActivityRef.current = Date.now();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      lastActivityRef.current = Date.now();
    }
  };

  const handleAutoSubmit = async () => {
    console.log('Auto-submitting quiz...');
    await submitQuizForm(true);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.values(answers).filter(a => a !== null).length;
    const totalQuestions = questions.length;
    
    if (answeredCount === 0) {
      if (window.confirm('You have not answered any questions. Are you sure you want to submit?')) {
        await submitQuizForm(false);
      }
    } else if (answeredCount < totalQuestions) {
      if (window.confirm(`You have answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`)) {
        await submitQuizForm(false);
      }
    } else {
      if (window.confirm('Are you sure you want to submit the quiz? You cannot change answers after submission.')) {
        await submitQuizForm(false);
      }
    }
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
        // Find the correct option for this question
        const correctOption = question.options.find(option => option.isCorrect);
        
        if (correctOption && userAnswer === correctOption.text) {
          correctAnswers++;
          obtainedMarks += questionMarks;
          console.log(`Question ${index + 1}: CORRECT - User: "${userAnswer}", Correct: "${correctOption.text}"`);
        } else if (correctOption) {
          console.log(`Question ${index + 1}: WRONG - User: "${userAnswer}", Correct: "${correctOption.text}"`);
        } else {
          console.log(`Question ${index + 1}: No correct option found in question`);
        }
      } else {
        console.log(`Question ${index + 1}: NOT ANSWERED`);
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
        alert('User data not found. Please register again.');
        navigate('/register');
        return;
      }

      const user = JSON.parse(userDataStr);
      
      console.log('🎯 Quiz Submission Started', isAutoSubmit ? '(Auto)' : '(Manual)');
      console.log('User:', user);
      console.log('Total questions:', questions.length);
      console.log('Answers:', answers);
      console.log('Cheat detected:', cheatDetected);
      console.log('Tab change count:', tabChangeCountRef.current);

      // Calculate actual score
      const scoreData = calculateScore();
      
      console.log('📊 Score Calculation:', scoreData);

      // If cheater detected, force fail
      const finalScore = cheatDetected ? {
        correctAnswers: 0,
        totalMarks: questions.length,
        obtainedMarks: 0,
        answeredCount: Object.values(answers).filter(a => a !== null).length,
        totalQuestions: questions.length,
        percentage: 0,
        passed: false
      } : scoreData;

      const resultData = {
        _id: cheatDetected ? 'cheater_result_' + Date.now() : 'quiz_result_' + Date.now(),
        rollNumber: user.rollNumber,
        userName: user.name,
        name: user.name,
        category: user.category,
        score: finalScore.correctAnswers,
        totalMarks: finalScore.totalQuestions,
        obtainedMarks: finalScore.obtainedMarks,
        percentage: finalScore.percentage.toFixed(2),
        correctAnswers: finalScore.correctAnswers,
        totalQuestions: finalScore.totalQuestions,
        attempted: finalScore.answeredCount,
        submittedAt: new Date().toISOString(),
        passingPercentage: passingPercentage,
        passed: finalScore.passed,
        isAutoSubmitted: isAutoSubmit,
        isCheater: cheatDetected,
        cheatCount: cheatCount,
        tabChangeCount: tabChangeCountRef.current,
        cheatReason: cheatDetected ? 'Malpractice detected - Multiple tab changes' : null
      };

      console.log('📊 Result Data Created:', resultData);
      
      // Clean up quiz state
      localStorage.removeItem('quizActive');
      localStorage.removeItem('quizInProgress');
      localStorage.removeItem('activeQuizRoll');
      
      // Save result to localStorage
      localStorage.setItem('quizResult', JSON.stringify(resultData));
      localStorage.setItem('lastQuizResult', JSON.stringify(resultData));
      
      console.log('✅ Result saved to localStorage');

      // Try to submit to backend
      try {
        const answersArray = Object.entries(answers).map(([index, answer]) => {
          const question = questions[parseInt(index)];
          const correctOption = question.options.find(option => option.isCorrect);
          const isCorrect = correctOption && answer === correctOption.text && !cheatDetected;
          
          return {
            questionId: question?._id || question?.id || `q_${index}`,
            questionText: question?.questionText || `Question ${parseInt(index) + 1}`,
            selectedOption: answer,
            correctOption: correctOption?.text || '',
            isCorrect: isCorrect,
            marks: question?.marks || 1
          };
        }).filter(item => item.selectedOption !== null);

        const quizData = {
          rollNumber,
          answers: answersArray,
          timeLeft,
          category: user.category,
          name: user.name,
          totalQuestions: questions.length,
          correctAnswers: finalScore.correctAnswers,
          score: finalScore.obtainedMarks,
          totalMarks: finalScore.totalMarks,
          percentage: finalScore.percentage,
          result: resultData,
          isAutoSubmitted: isAutoSubmit,
          isCheater: cheatDetected,
          cheatCount: cheatCount,
          tabChangeCount: tabChangeCountRef.current
        };

        console.log('📤 Attempting API submission...');
        const response = await submitQuiz(quizData);
        console.log('📥 API Submission Response:', response.data);
        
        if (response.data?.success && response.data.result) {
          localStorage.setItem('quizResult', JSON.stringify(response.data.result));
          localStorage.setItem('lastQuizResult', JSON.stringify(response.data.result));
        }
      } catch (apiError) {
        console.log('⚠️ API submission failed (using local result):', apiError.message);
      }

      // Navigate to result page
      console.log('🚀 Navigating to result page...');
      navigate('/result');
      
    } catch (error) {
      console.error('❌ Submit error:', error);
      alert('Failed to submit quiz: ' + error.message);
      // Still navigate to result if possible
      navigate('/result');
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
    if (questions.length === 0) return 0;
    const answered = Object.values(answers).filter(a => a !== null).length;
    return Math.round((answered / questions.length) * 100);
  };

  // Prevent right-click and keyboard shortcuts
  useEffect(() => {
    const disableShortcuts = (e) => {
      // Disable F5, Ctrl+R, Ctrl+Shift+R, Ctrl+F5
      if ((e.ctrlKey && e.key === 'r') || 
          (e.ctrlKey && e.shiftKey && e.key === 'R') ||
          e.key === 'F5' ||
          e.key === 'F11') {
        e.preventDefault();
        return false;
      }
      
      // Disable right-click
      if (e.type === 'contextmenu') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', disableShortcuts);
    document.addEventListener('contextmenu', disableShortcuts);

    return () => {
      document.removeEventListener('keydown', disableShortcuts);
      document.removeEventListener('contextmenu', disableShortcuts);
    };
  }, []);

  if (cheatDetected) {
    return (
      <div className="cheater-detected">
        <div className="cheater-icon">🚫</div>
        <h2>Malpractice Detected!</h2>
        <p>You have been caught changing tabs multiple times during the quiz.</p>
        <p className="cheater-warning">This is a violation of exam rules. Your quiz will be submitted with zero marks.</p>
        <div className="cheater-info">
          <p><strong>Name:</strong> {userData?.name}</p>
          <p><strong>Roll No:</strong> {userData?.rollNumber}</p>
          <p><strong>Tab Changes:</strong> {tabChangeCountRef.current}</p>
        </div>
        <p className="redirect-notice">Redirecting to result page...</p>
      </div>
    );
  }

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
      {/* Header - Logo in Left Corner, Institute Name in Center, User Info in Right Corner */}
      <header className="quiz-header">
        <div className="header-container">
          {/* Left Section - Logo ONLY in LEFT CORNER */}
          <div className="header-left">
            <div className="logo-container">
              {/* यहाँ लोगो छोटा सेट किया गया है - 100px x 100px */}
              <img 
                src={ShamsiLogo} 
                alt="Shamsi Institute Logo" 
                className="institute-logo" 
              />
            </div>
          </div>
          
          {/* Center Section - Institute Name */}
          <div className="header-center">
            <div className="institute-title">
              Shamsi Institute - Technology Certification Assessment
            </div>
          </div>
          
          
        </div>
      </header>

      {/* Main Quiz Area */}
      <main className="quiz-main">
        <div className="question-navigation">
          <div className="nav-header">
            <h3><FaQuestionCircle className="header-icon" /> Question Navigation</h3>
            
          </div>
          
          <div className="question-buttons">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] ? 'answered' : 'unanswered'}`}
                onClick={() => setCurrentQuestion(index)}
                title={`Question ${index + 1}${answers[index] ? ' (Answered)' : ' (Not Answered)'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="question-container">
          <div className="question-header">
            <div className="question-number">
              <span className="number-label">Question</span>
              <span className="number-value">{currentQuestion + 1}</span>
            </div>
            <div className="question-marks">
              <span className="marks-label">Marks</span>
              <span className="marks-value">{currentQ.marks || 1}</span>
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
              <FaArrowLeft className="button-icon" /> Previous
            </button>
            
            <div className="question-status">
              <div className={`status-indicator ${isAnswered ? 'answered' : 'unanswered'}`}></div>
              <span className="status-text">
                {isAnswered ? 'Answered' : 'Not Answered'}
              </span>
            </div>
            
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="nav-button submit-button"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'} <FaPaperPlane className="button-icon" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="nav-button next-button"
              >
                Next <FaArrowRight className="button-icon" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="quiz-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title"><FaChartBar className="sidebar-icon" /> Quiz Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-value">{questions.length}</div>
                <div className="summary-label">Total Questions</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{Object.values(answers).filter(a => a !== null).length}</div>
                <div className="summary-label">Answered</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{questions.length - Object.values(answers).filter(a => a !== null).length}</div>
                <div className="summary-label">Remaining</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">{progress}%</div>
                <div className="summary-label">Progress</div>
              </div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3 className="sidebar-title"><FaExclamationTriangle className="sidebar-icon" /> Rules</h3>
            <ul className="rules-list">
              <li>Do not switch tabs (Allowed: {3 - tabChangeCountRef.current} more)</li>
              <li>Do not refresh the page</li>
              <li>Timer will continue even if you leave</li>
              <li>Quiz auto-submits when time ends</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="quiz-footer">
        <div className="footer-left">
          <div className="footer-logo-section">
            <div className="footer-logo-container">
              <img src={ShamsiLogo} alt="Shamsi Institute Logo" className="footer-logo" />
              <div className="footer-title">Shamsi Institute - Technology Certification Assessment</div>
            </div>
          </div>
        </div>
        
        <div className="footer-center">
          <div className="footer-timer">
            {/* <FaClock className="timer-icon" /> */}
            <span className="time-value">{formatTime(timeLeft)}</span>
            <div className="timer-label">Time Remaining</div>
          </div>
        </div>
        
        <div className="footer-right">
          <div className="footer-buttons-group">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to submit and leave?')) {
                  handleSubmit();
                }
              }}
              className="footer-button leave-button"
            >
              <FaHome className="button-icon" /> Submit & Leave
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="footer-button submit-final-button"
            >
              {submitting ? 'Submitting...' : 'Final Submit'} <FaPaperPlane className="button-icon" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;