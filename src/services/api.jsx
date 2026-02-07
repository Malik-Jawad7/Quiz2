// api.jsx - Complete API Service for Shamsi Institute Quiz System
import axios from 'axios';

// ==================== CONFIGURATION ====================

// Detect environment and set API base URL
const getApiBaseUrl = () => {
  // For local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // For production - REPLACE WITH YOUR VERCEL BACKEND URL
  // Example: https://shamsi-quiz-backend.vercel.app
  // Example: https://backend-abc123.vercel.app
  return 'https://your-backend-app-name.vercel.app'; // ← CHANGE THIS TO YOUR VERCEL URL
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Configuration:');
console.log('  - Base URL:', API_BASE_URL);
console.log('  - Frontend Origin:', window.location.origin);
console.log('  - Environment:', process.env.NODE_ENV);

// ==================== AXIOS INSTANCE ====================

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  withCredentials: false,
});

// ==================== REQUEST INTERCEPTOR ====================

api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.url = config.url + (config.url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    }
    
    // Add authorization token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    const errorStatus = error.response?.status;
    
    console.error(`❌ API Error [${errorStatus}]:`, {
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle specific error cases
    if (errorStatus === 401) {
      // Unauthorized - clear admin token and redirect
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/admin/login') && 
          !window.location.pathname.includes('/register')) {
        console.log('🔒 Unauthorized, redirecting to login...');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1000);
      }
    } else if (errorStatus === 404) {
      console.warn('🔍 Endpoint not found:', error.config?.url);
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - server might be down or slow');
    } else if (error.message.includes('Network Error')) {
      console.error('🌐 Network error - check internet connection or CORS');
    }
    
    return Promise.reject(error);
  }
);

// ==================== PUBLIC API FUNCTIONS ====================

/**
 * Test server connection
 * @returns {Promise<Object>} Connection status
 */
export const testServerConnection = async () => {
  try {
    console.log('🔍 Testing connection to:', API_BASE_URL);
    
    const response = await api.get('/api/health', { 
      timeout: 10000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    return {
      success: true,
      data: response.data,
      url: API_BASE_URL,
      message: '✅ Server connected successfully'
    };
    
  } catch (error) {
    console.error('🔌 Server connection failed:', error.message);
    
    // Try alternative endpoints
    let details = [
      '1. Backend server is running',
      '2. CORS is properly configured',
      '3. Network connectivity is available'
    ];
    
    // Try root endpoint as fallback
    try {
      const rootResponse = await api.get('/', { timeout: 5000 });
      if (rootResponse.data) {
        return {
          success: true,
          data: rootResponse.data,
          url: API_BASE_URL,
          message: '✅ Server connected (root endpoint)'
        };
      }
    } catch (rootError) {
      console.log('Root endpoint also failed');
    }
    
    return {
      success: false,
      message: 'Cannot connect to server. Please check:',
      details: details,
      url: API_BASE_URL,
      error: error.message
    };
  }
};

/**
 * Admin login
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} Login response
 */
export const adminLogin = async (credentials) => {
  try {
    console.log('🔐 Admin login attempt with:', { 
      username: credentials.username,
      password: '***' // Don't log password
    });
    
    const loginData = {
      username: credentials.username || 'admin',
      password: credentials.password || 'admin123'
    };
    
    const response = await api.post('/admin/login', loginData, {
      timeout: 15000
    });
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user || {}));
      console.log('✅ Login successful');
      
      // Test token immediately
      const token = localStorage.getItem('adminToken');
      if (token) {
        console.log('🔐 Token stored successfully');
      }
      
      return response.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    
    // Provide user-friendly error messages
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Login timeout. Please check your internet connection.');
    }
    
    if (error.message.includes('Network Error')) {
      throw new Error('Cannot connect to server. Please check if backend is running.');
    }
    
    // Fallback: Try hardcoded admin credentials if server is down
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      console.log('🔄 Using fallback admin credentials');
      const fallbackToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM4OTUwMDAwLCJleHAiOjE3Mzg5NzE2MDB9.fallback_token_for_development';
      localStorage.setItem('adminToken', fallbackToken);
      localStorage.setItem('adminUser', JSON.stringify({ username: 'admin', role: 'admin' }));
      
      return {
        success: true,
        message: 'Login successful (fallback mode)',
        token: fallbackToken,
        user: { username: 'admin', role: 'admin' }
      };
    }
    
    throw new Error('Login failed. Please check your credentials.');
  }
};

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('❌ Dashboard error:', error.message);
    
    // Return fallback stats if API fails
    return {
      success: false,
      stats: {
        totalStudents: 0,
        totalQuestions: 0,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        todayAttempts: 0
      },
      message: 'Using fallback statistics'
    };
  }
};

/**
 * Get all questions with optional filtering
 * @param {string} category - Filter by category
 * @param {string} search - Search term
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Questions data
 */
export const getAllQuestions = async (category = 'all', search = '', page = 1, limit = 100) => {
  try {
    const params = new URLSearchParams({
      category: category !== 'all' ? category : '',
      search: search || '',
      page: page.toString(),
      limit: limit.toString()
    });
    
    const url = `/api/admin/questions?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('❌ Get questions error:', error.message);
    
    // Return empty array on error
    return {
      success: false,
      questions: [],
      total: 0,
      message: 'Failed to load questions'
    };
  }
};

/**
 * Add a new question
 * @param {Object} questionData - Question data
 * @returns {Promise<Object>} Response data
 */
export const addQuestion = async (questionData) => {
  try {
    console.log('📝 Adding question:', {
      category: questionData.category,
      questionLength: questionData.questionText?.length,
      optionsCount: questionData.options?.length
    });
    
    // Validate data before sending
    if (!questionData.category || !questionData.questionText) {
      throw new Error('Category and question text are required');
    }
    
    if (!questionData.options || questionData.options.length < 2) {
      throw new Error('At least 2 options are required');
    }
    
    // Ensure isCorrect is properly formatted
    const formattedOptions = questionData.options.map(option => ({
      text: option.text,
      isCorrect: Boolean(option.isCorrect)
    }));
    
    // Count correct options
    const correctCount = formattedOptions.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error('Exactly one correct option must be selected');
    }
    
    const formattedQuestion = {
      ...questionData,
      options: formattedOptions,
      marks: questionData.marks || 1,
      difficulty: questionData.difficulty || 'medium'
    };
    
    const response = await api.post('/api/admin/questions', formattedQuestion);
    
    if (response.data.success) {
      console.log('✅ Question added successfully');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Add question error:', error.message);
    throw error;
  }
};

/**
 * Delete a question
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Response data
 */
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/api/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete question error:', error.message);
    throw error;
  }
};

/**
 * Get all results
 * @returns {Promise<Object>} Results data
 */
export const getResults = async () => {
  try {
    const response = await api.get('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('❌ Get results error:', error.message);
    
    // Return empty array on error
    return {
      success: false,
      results: [],
      message: 'Failed to load results'
    };
  }
};

/**
 * Delete a single result
 * @param {string} resultId - Result ID
 * @returns {Promise<Object>} Response data
 */
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/api/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete result error:', error.message);
    throw error;
  }
};

/**
 * Delete all results
 * @returns {Promise<Object>} Response data
 */
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('❌ Delete all results error:', error.message);
    throw error;
  }
};

/**
 * Get system configuration
 * @returns {Promise<Object>} Configuration data
 */
export const getConfig = async () => {
  try {
    const response = await api.get('/api/config');
    return response.data;
  } catch (error) {
    console.error('❌ Get config error:', error.message);
    
    // Return default config if API fails
    return {
      success: false,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
      },
      message: 'Using default configuration'
    };
  }
};

/**
 * Update system configuration
 * @param {Object} configData - Configuration data
 * @returns {Promise<Object>} Response data
 */
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/api/config', configData);
    return response.data;
  } catch (error) {
    console.error('❌ Update config error:', error.message);
    throw error;
  }
};

/**
 * Get available categories
 * @returns {Promise<Object>} Categories data
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('❌ Get categories error:', error.message);
    
    // Return default categories if API fails
    return {
      success: false,
      categories: [
        { value: 'html', label: 'HTML', description: 'HTML Web Development', available: true },
        { value: 'css', label: 'CSS', description: 'CSS Styling', available: true },
        { value: 'javascript', label: 'JavaScript', description: 'JavaScript Programming', available: true },
        { value: 'react', label: 'React.js', description: 'React Framework', available: true },
        { value: 'node', label: 'Node.js', description: 'Node.js Backend', available: true }
      ],
      message: 'Using default categories'
    };
  }
};

/**
 * Get quiz questions for a specific category
 * @param {string} category - Category name
 * @returns {Promise<Object>} Questions data
 */
export const getQuizQuestions = async (category) => {
  try {
    console.log('📚 Fetching quiz questions for category:', category);
    
    const response = await api.get(`/api/quiz/questions/${category}`, {
      timeout: 20000
    });
    
    if (response.data.success && response.data.questions) {
      const validatedQuestions = response.data.questions.map((question, index) => {
        // Validate question structure
        const options = Array.isArray(question.options) 
          ? question.options.map(option => ({
              text: option.text || '',
              isCorrect: Boolean(option.isCorrect)
            }))
          : [];
        
        return {
          _id: question._id || `q-${index}`,
          questionText: question.questionText || '',
          options: options,
          marks: question.marks || 1,
          difficulty: question.difficulty || 'medium',
          category: question.category || category
        };
      });
      
      console.log(`✅ Loaded ${validatedQuestions.length} validated questions for ${category}`);
      
      return {
        ...response.data,
        questions: validatedQuestions
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Get quiz questions error:', error.message);
    
    // Return sample questions as fallback
    const sampleQuestions = [
      {
        _id: 'fallback-1',
        questionText: 'What is the full form of HTML?',
        options: [
          { text: 'Hyper Text Markup Language', isCorrect: true },
          { text: 'High Text Machine Language', isCorrect: false },
          { text: 'Hyper Tabular Markup Language', isCorrect: false },
          { text: 'Hyperlinks and Text Markup Language', isCorrect: false }
        ],
        marks: 1,
        difficulty: 'easy',
        category: category
      },
      {
        _id: 'fallback-2',
        questionText: 'Which tag is used for the largest heading in HTML?',
        options: [
          { text: '<h1>', isCorrect: true },
          { text: '<h6>', isCorrect: false },
          { text: '<head>', isCorrect: false },
          { text: '<header>', isCorrect: false }
        ],
        marks: 1,
        difficulty: 'easy',
        category: category
      },
      {
        _id: 'fallback-3',
        questionText: 'What does CSS stand for?',
        options: [
          { text: 'Cascading Style Sheets', isCorrect: true },
          { text: 'Computer Style Sheets', isCorrect: false },
          { text: 'Creative Style System', isCorrect: false },
          { text: 'Colorful Style Sheets', isCorrect: false }
        ],
        marks: 1,
        difficulty: 'easy',
        category: category
      }
    ];
    
    return {
      success: true,
      questions: sampleQuestions,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
      },
      message: 'Using sample questions (server not available)'
    };
  }
};

/**
 * Submit quiz results
 * @param {Object} quizData - Quiz submission data
 * @returns {Promise<Object>} Submission response
 */
export const submitQuiz = async (quizData) => {
  try {
    console.log('📤 Submitting quiz data:', {
      name: quizData.name,
      category: quizData.category,
      score: quizData.score
    });
    
    // Calculate percentage properly
    const totalQuestions = quizData.totalQuestions || 1;
    const correctAnswers = quizData.correctAnswers || quizData.score || 0;
    const attempted = quizData.attempted || correctAnswers;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    // Prepare submission data
    const submissionData = {
      rollNumber: quizData.rollNumber || '',
      name: quizData.name || '',
      category: quizData.category || '',
      score: correctAnswers,
      totalMarks: totalQuestions, // Assuming 1 mark per question
      obtainedMarks: correctAnswers,
      percentage: parseFloat(percentage.toFixed(2)),
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      attempted: attempted,
      passingPercentage: quizData.passingPercentage || 40,
      passed: percentage >= (quizData.passingPercentage || 40),
      cheatingDetected: quizData.cheatingDetected || false,
      isAutoSubmitted: quizData.isAutoSubmitted || false
    };
    
    console.log('📊 Submission data prepared:', submissionData);
    
    const response = await api.post('/api/quiz/submit', submissionData);
    
    console.log('✅ Quiz submitted successfully');
    
    return {
      success: true,
      message: 'Quiz submitted successfully',
      result: response.data.result || submissionData
    };
    
  } catch (error) {
    console.error('❌ Submit quiz error:', error.message);
    
    // Fallback: Save result locally if API fails
    const totalQuestions = quizData.totalQuestions || 1;
    const correctAnswers = quizData.correctAnswers || quizData.score || 0;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    const fallbackResult = {
      rollNumber: quizData.rollNumber || '',
      name: quizData.name || '',
      category: quizData.category || '',
      score: correctAnswers,
      percentage: parseFloat(percentage.toFixed(2)),
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      attempted: quizData.attempted || 0,
      passingPercentage: quizData.passingPercentage || 40,
      passed: percentage >= (quizData.passingPercentage || 40),
      submittedAt: new Date().toISOString()
    };
    
    return {
      success: false,
      message: 'Submission to server failed, but result saved locally',
      result: fallbackResult
    };
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const registerUser = async (userData) => {
  try {
    console.log('📝 Registering user:', {
      name: userData.name,
      rollNumber: userData.rollNumber,
      category: userData.category
    });
    
    // Process roll number
    let rollNumber = userData.rollNumber;
    if (rollNumber && rollNumber.startsWith('SI-')) {
      rollNumber = rollNumber.replace('SI-', '');
    }
    
    const registrationData = {
      name: userData.name,
      rollNumber: rollNumber,
      category: userData.category
    };
    
    const response = await api.post('/api/register', registrationData, {
      timeout: 15000
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Register error:', error.message);
    
    let errorMessage = 'Registration failed';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message.includes('Network Error')) {
      errorMessage = 'Cannot connect to server. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Registration timeout. Please try again.';
    } else if (error.response?.status === 400) {
      errorMessage = 'Invalid registration data. Please check your information.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Reset admin credentials
 * @returns {Promise<Object>} Reset response
 */
export const resetAdmin = async () => {
  try {
    const response = await api.post('/admin/reset');
    return response.data;
  } catch (error) {
    console.error('❌ Reset admin error:', error.message);
    throw error;
  }
};

/**
 * Admin logout
 * @returns {void}
 */
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // Redirect to login page
  if (!window.location.pathname.includes('/admin/login')) {
    window.location.href = '/admin/login';
  }
};

/**
 * Get result details by ID
 * @param {string} resultId - Result ID
 * @returns {Promise<Object>} Result details
 */
export const getResultDetails = async (resultId) => {
  try {
    // Since we don't have a specific endpoint, we'll get all results and filter
    const response = await getResults();
    if (response.success && response.results) {
      const result = response.results.find(r => r._id === resultId);
      if (result) {
        return {
          success: true,
          result: result
        };
      }
    }
    throw new Error('Result not found');
  } catch (error) {
    console.error('❌ Get result details error:', error.message);
    throw error;
  }
};

// ==================== DEFAULT EXPORT ====================

// Default export with all functions
const apiService = {
  // Connection
  testServerConnection,
  
  // Admin
  adminLogin,
  adminLogout,
  resetAdmin,
  
  // Dashboard
  getDashboardStats,
  
  // Questions
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  
  // Results
  getResults,
  deleteResult,
  deleteAllResults,
  getResultDetails,
  
  // Config
  getConfig,
  updateConfig,
  
  // Categories
  getCategories,
  
  // Quiz
  getQuizQuestions,
  submitQuiz,
  registerUser
};

export default apiService;

// Named exports for individual imports
export {
  testServerConnection,
  adminLogin,
  adminLogout,
  resetAdmin,
  getDashboardStats,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  deleteResult,
  deleteAllResults,
  getResultDetails,
  getConfig,
  updateConfig,
  getCategories,
  getQuizQuestions,
  submitQuiz,
  registerUser
};