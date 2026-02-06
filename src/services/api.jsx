import axios from 'axios';

// Environment detection and configuration
const getApiBaseUrl = () => {
  // For local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // For production - USE YOUR VERCEL BACKEND URL
  return 'https://backend-11cz3rq3m-khalids-projects-3de9ee65.vercel.app';
  // OR use this if above doesn't work:
  // return 'https://backend-one-taupe-14.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌐 Frontend Origin:', window.location.origin);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    const errorStatus = error.response?.status;
    
    console.error(`❌ API Error [${errorStatus}]: ${errorMessage}`);
    
    if (errorStatus === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (window.location.pathname !== '/admin/login' && 
          !window.location.pathname.includes('/register')) {
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

// Test server connection
export const testServerConnection = async () => {
  try {
    console.log('🔍 Testing connection to:', API_BASE_URL);
    
    const response = await api.get('/api/health', { timeout: 10000 });
    
    return {
      success: true,
      data: response.data,
      url: API_BASE_URL,
      message: 'Server connected successfully'
    };
    
  } catch (error) {
    console.error('Server connection failed:', error.message);
    
    return {
      success: false,
      message: 'Cannot connect to server. Please check:',
      details: [
        '1. Backend server is running',
        '2. CORS is properly configured',
        '3. Network connectivity'
      ],
      url: API_BASE_URL,
      error: error.message
    };
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    console.log('🔐 Admin login attempt with:', credentials);
    
    const loginData = {
      username: credentials.username || 'admin',
      password: credentials.password || 'admin123'
    };
    
    const response = await api.post('/admin/login', loginData);
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user || {}));
      console.log('✅ Login successful');
      return response.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
    
  } catch (error) {
    console.error('Login error:', error.message);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Login timeout. Please check your internet connection.');
    }
    
    if (error.message.includes('Network Error')) {
      throw new Error('Cannot connect to server. Please check if backend is running.');
    }
    
    throw new Error('Login failed. Please check your credentials.');
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard error:', error.message);
    throw error;
  }
};

// Get all questions
export const getAllQuestions = async (category = 'all', search = '', page = 1, limit = 100) => {
  try {
    const params = new URLSearchParams({
      category,
      search,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await api.get(`/api/admin/questions?${params}`);
    return response.data;
  } catch (error) {
    console.error('Get questions error:', error.message);
    throw error;
  }
};

// Add question
export const addQuestion = async (questionData) => {
  try {
    const response = await api.post('/api/admin/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('Add question error:', error.message);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/api/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Delete question error:', error.message);
    throw error;
  }
};

// Get results
export const getResults = async () => {
  try {
    const response = await api.get('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('Get results error:', error.message);
    throw error;
  }
};

// Delete result
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/api/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('Delete result error:', error.message);
    throw error;
  }
};

// Delete all results
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('Delete all results error:', error.message);
    throw error;
  }
};

// Get config
export const getConfig = async () => {
  try {
    const response = await api.get('/api/config');
    return response.data;
  } catch (error) {
    console.error('Get config error:', error.message);
    
    return {
      success: false,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
      },
      message: 'Using default config (API failed)'
    };
  }
};

// Update config
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/api/config', configData);
    return response.data;
  } catch (error) {
    console.error('Update config error:', error.message);
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Get categories error:', error.message);
    
    return {
      success: false,
      categories: [
        { value: 'html', label: 'HTML', questionCount: 0 },
        { value: 'css', label: 'CSS', questionCount: 0 },
        { value: 'javascript', label: 'JavaScript', questionCount: 0 },
        { value: 'react', label: 'React.js', questionCount: 0 },
        { value: 'node', label: 'Node.js', questionCount: 0 }
      ],
      message: 'Using default categories (API failed)'
    };
  }
};

// Get quiz questions
export const getQuizQuestions = async (category) => {
  try {
    console.log(`📝 Fetching questions for category: ${category}`);
    
    const response = await api.get(`/api/quiz/questions/${category}`);
    
    if (response.data.success && response.data.questions) {
      const validatedQuestions = response.data.questions.map((question, index) => {
        const options = Array.isArray(question.options) 
          ? question.options.map(option => ({
              text: option.text || '',
              isCorrect: false
            }))
          : [];
        
        return {
          ...question,
          _id: question._id || `q-${index}`,
          questionText: question.questionText || '',
          options: options,
          marks: question.marks || 1,
          difficulty: question.difficulty || 'medium',
          category: question.category || category
        };
      });
      
      console.log(`✅ Loaded ${validatedQuestions.length} validated questions`);
      
      return {
        ...response.data,
        questions: validatedQuestions
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Get quiz questions error:', error);
    throw error;
  }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
  try {
    console.log('📤 Submitting quiz data');
    
    // Calculate percentage properly
    const totalQuestions = quizData.totalQuestions || 1;
    const correctAnswers = quizData.correctAnswers || 0;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    // Prepare submission data
    const submissionData = {
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
    console.error('❌ Submit quiz error:', error);
    
    // Fallback if API fails
    const totalQuestions = quizData.totalQuestions || 1;
    const correctAnswers = quizData.correctAnswers || 0;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    return {
      success: false,
      message: error.message || 'Submission failed, but result saved locally',
      result: {
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
      }
    };
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    console.log('📝 Registering user:', userData);
    
    // Process roll number
    let rollNumber = userData.rollNumber;
    if (rollNumber && rollNumber.startsWith('SI-')) {
      rollNumber = rollNumber.replace('SI-', '');
    }
    
    const registrationData = {
      ...userData,
      rollNumber: rollNumber
    };
    
    const response = await api.post('/api/register', registrationData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error.message);
    
    let errorMessage = 'Registration failed';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message.includes('Network Error')) {
      errorMessage = 'Cannot connect to server. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Registration timeout. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

// Reset admin
export const resetAdmin = async () => {
  try {
    const response = await api.post('/admin/reset');
    return response.data;
  } catch (error) {
    console.error('Reset admin error:', error.message);
    throw error;
  }
};

// Admin logout
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

// Default export
const apiService = {
  testServerConnection,
  adminLogin,
  getDashboardStats,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  deleteResult,
  deleteAllResults,
  getConfig,
  updateConfig,
  getCategories,
  getQuizQuestions,
  submitQuiz,
  registerUser,
  resetAdmin,
  adminLogout
};

export default apiService;