import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizQuestions, submitQuiz, getConfig } from '../services/api';
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
  const [selectedOptions, setSelectedOptions] = useState({}); // Track selected options for each question
  
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
          
          // Load selected options
          if (quizData.selectedOptions) {
            setSelectedOptions(quizData.selectedOptions);
          }
          
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
        selectedOptions: {},
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
          selectedOptions: selectedOptions,
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
  }, [answers, timeLeft, userData, selectedOptions, cheatCount]);

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
        const initialSelectedOptions = selectedOptions || {};
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
    // Check if this question already has a selected option
    if (selectedOptions[questionIndex]) {
      // Option already selected for this question, don't allow change
      console.log(`Question ${questionIndex + 1} already has selected option:`, selectedOptions[questionIndex]);
      return;
    }

    const newAnswers = {
      ...answers,
      [questionIndex]: optionText
    };
    
    const newSelectedOptions = {
      ...selectedOptions,
      [questionIndex]: optionText
    };
    
    setAnswers(newAnswers);
    setSelectedOptions(newSelectedOptions);
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

  // Get current question's selected option
  const currentQuestionSelected = selectedOptions[currentQuestion];

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
      <header className="quiz-header">
        <div className="header-left">
          <h1>Shamsi Institute Quiz</h1>
          {userData && (
            <div className="user-info">
              <span><strong>Name:</strong> {userData.name}</span>
              <span><strong>Roll No:</strong> {userData.rollNumber}</span>
              <span><strong>Category:</strong> {userData.category.toUpperCase()}</span>
              {quizStarted && (
                <span className="quiz-active-badge">🟢 Quiz Active</span>
              )}
            </div>
          )}
        </div>
        
        <div className="header-right">
          <div className="timer-box">
            <span className="timer-icon">⏰</span>
            <span className="timer-text">{formatTime(timeLeft)}</span>
            {timeLeft < 300 && <span className="time-warning">⚠️ Hurry!</span>}
          </div>
          
          <div className="progress-box">
            <span className="progress-icon">📊</span>
            <span className="progress-text">{progress}% Complete</span>
          </div>
          
          <div className="cheat-warning-box">
            <span className="cheat-warning-icon">🚫</span>
            <span className="cheat-warning-text">
              Tab Changes: {tabChangeCountRef.current}/3
            </span>
          </div>
        </div>
      </header>

      <div className="quiz-warning-banner">
        ⚠️ <strong>Important:</strong> Do not switch tabs or refresh. 
        {tabChangeCountRef.current > 0 && 
          ` You have changed tabs ${tabChangeCountRef.current} time(s). 3 changes will result in automatic failure.`}
      </div>

      <main className="quiz-main">
        <div className="question-nav">
          <div className="nav-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span className="marks-info">Marks: {currentQ.marks || 1}</span>
            {currentQuestionSelected && (
              <span className="option-locked-badge">🔒 Option Locked</span>
            )}
          </div>
          
          <div className="question-buttons">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`q-btn ${currentQuestion === index ? 'active' : ''} ${answers[index] ? 'answered' : ''} ${selectedOptions[index] ? 'locked' : ''}`}
                onClick={() => setCurrentQuestion(index)}
                title={`Question ${index + 1}${selectedOptions[index] ? ' (Option Locked)' : ''}`}
              >
                {index + 1}
                {selectedOptions[index] && <span className="lock-icon">🔒</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="question-card">
          <div className="question-header">
            <h2>Question {currentQuestion + 1}</h2>
            <div className="question-header-right">
              <span className="question-marks">{currentQ.marks || 1} mark{currentQ.marks !== 1 ? 's' : ''}</span>
              {currentQuestionSelected && (
                <span className="selection-locked">Selection Locked 🔒</span>
              )}
            </div>
          </div>
          
          <div className="question-text">
            <p>{currentQ.questionText}</p>
          </div>

          <div className="options-container">
            {currentQ.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === option.text;
              const isLocked = currentQuestionSelected && isSelected;
              
              return (
                <div
                  key={index}
                  className={`option-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={() => !currentQuestionSelected && handleAnswerSelect(currentQuestion, option.text)}
                >
                  <div className="option-selector">
                    <div className={`option-circle ${isSelected ? 'checked' : ''} ${isLocked ? 'locked' : ''}`}>
                      {isSelected ? (isLocked ? '🔒' : '✓') : ''}
                    </div>
                  </div>
                  <div className="option-content">
                    <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                    <span className="option-text">{option.text}</span>
                    {isLocked && <span className="option-locked-label">(Locked)</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="option-lock-notice">
            {currentQuestionSelected ? (
              <p className="lock-warning">⚠️ Your selection for this question is locked and cannot be changed.</p>
            ) : (
              <p>⚠️ Once you select an option, it will be locked and cannot be changed.</p>
            )}
          </div>

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
              {isAnswered && selectedOptions[currentQuestion] && (
                <span className="status-locked">(Locked)</span>
              )}
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
              <span className="stat-value">{Object.values(selectedOptions).length}</span>
              <span className="stat-label">Locked</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{progress}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
          
          <div className="warning-box">
            <span className="warning-icon">⚠️</span>
            <p>
              <strong>Important Rules:</strong>
              <br/>• Do not switch tabs (Allowed: {3 - tabChangeCountRef.current} more)
              <br/>• Once selected, options cannot be changed
              <br/>• Quiz auto-submits on tab change violations
            </p>
          </div>
          
          <div className="auto-save-notice">
            <span className="save-icon">💾</span>
            <span>Answers are auto-saved every 10 seconds</span>
          </div>
        </div>
      </main>

      <footer className="quiz-footer">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to leave? Your quiz will be submitted.')) {
              handleSubmit();
            }
          }}
          className="footer-btn leave-btn"
        >
          Submit & Leave
        </button>
        
        <div className="footer-timer">
          <span>Time Remaining: </span>
          <span className={`time-remaining ${timeLeft < 300 ? 'warning' : ''}`}>
            {formatTime(timeLeft)}
          </span>
          {tabChangeCountRef.current > 0 && (
            <span className="tab-change-warning">
              ⚠️ Tab Changes: {tabChangeCountRef.current}
            </span>
          )}
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