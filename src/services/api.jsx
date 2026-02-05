import axios from 'axios';

// Use deployed backend URL or localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://backend-one-taupe-14.vercel.app' 
  : 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
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

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.message);
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

// Test server connection
export const testServerConnection = async () => {
  try {
    console.log('Testing connection to:', API_BASE_URL);
    const response = await api.get('/api/health');
    return { 
      success: true, 
      data: response.data,
      url: API_BASE_URL
    };
  } catch (error) {
    console.error('Server connection failed:', error);
    return { 
      success: false, 
      message: error.message || 'API connection failed',
      url: API_BASE_URL
    };
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    console.log('Attempting admin login at:', API_BASE_URL);
    
    // Try both endpoints
    let response;
    try {
      response = await api.post('/admin/login', credentials);
      console.log('Login via /admin/login:', response.data.success);
    } catch (error1) {
      console.log('Trying /api/admin/login as fallback');
      response = await api.post('/api/admin/login', credentials);
    }
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user || {}));
      console.log('Login successful');
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Show specific error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    // If it's a network error, provide a helpful message
    if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please ensure backend is running.`);
    }
    
    throw error;
  }
};

// Check dashboard access
export const checkDashboardAccess = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      return { 
        success: false, 
        message: 'No token found. Please login.' 
      };
    }
    
    // Try to get dashboard stats to verify token
    const response = await api.get('/api/admin/dashboard');
    return { 
      success: response.data.success, 
      data: response.data
    };
  } catch (error) {
    console.error('Access check error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Access check failed'
    };
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
};

// Get all questions
export const getAllQuestions = async (category = 'all') => {
  try {
    const response = await api.get(`/api/admin/questions?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Get questions error:', error);
    throw error;
  }
};

// Add question
export const addQuestion = async (questionData) => {
  try {
    console.log('Sending question to server:', questionData);
    
    const response = await api.post('/api/admin/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('Add question error:', error);
    
    // Show specific error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.message?.includes('Network Error')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please make sure backend is running.`);
    }
    
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/api/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Delete question error:', error);
    throw error;
  }
};

// Get results
export const getResults = async () => {
  try {
    const response = await api.get('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('Get results error:', error);
    throw error;
  }
};

// Delete result
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/api/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('Delete result error:', error);
    throw error;
  }
};

// Delete all results
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/api/admin/results');
    return response.data;
  } catch (error) {
    console.error('Delete all results error:', error);
    throw error;
  }
};

// Get config
export const getConfig = async () => {
  try {
    const response = await api.get('/api/config');
    return response.data;
  } catch (error) {
    console.error('Get config error:', error);
    
    // Return default config if API fails
    return {
      success: true,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
      }
    };
  }
};

// Update config
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/api/config', configData);
    return response.data;
  } catch (error) {
    console.error('Update config error:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Get categories error:', error);
    
    // Return default categories if API fails
    return {
      success: true,
      categories: [
        { value: 'html', label: 'HTML', questionCount: 3 },
        { value: 'css', label: 'CSS', questionCount: 2 },
        { value: 'javascript', label: 'JavaScript', questionCount: 2 }
      ]
    };
  }
};

// Get quiz questions
export const getQuizQuestions = async (category) => {
  try {
    console.log('Fetching questions for category:', category);
    
    const response = await api.get(`/api/quiz/questions/${category}`);
    
    if (!response.data.success && !response.data.questions) {
      throw new Error(response.data.message || 'Failed to get questions');
    }
    
    console.log('Questions received:', response.data.questions?.length || 0);
    return response.data;
  } catch (error) {
    console.error('Get quiz questions error:', error);
    
    // Return sample questions for offline testing
    return {
      success: true,
      questions: [
        {
          questionText: 'What does HTML stand for?',
          options: [
            { text: 'Hyper Text Markup Language', isCorrect: true },
            { text: 'High Tech Modern Language', isCorrect: false },
            { text: 'Hyper Transfer Markup Language', isCorrect: false }
          ],
          marks: 1,
          difficulty: 'easy'
        }
      ],
      count: 1,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 10
      }
    };
  }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/api/quiz/submit', quizData);
    return response.data;
  } catch (error) {
    console.error('Submit quiz error:', error);
    
    // Simulate success for offline testing
    return {
      success: true,
      message: 'Quiz submitted successfully (offline mode)',
      result: {
        name: quizData.name,
        rollNumber: quizData.rollNumber,
        category: quizData.category,
        percentage: quizData.percentage || 0,
        passed: (quizData.percentage || 0) >= 40
      }
    };
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    console.log('Registering user:', userData);
    
    const response = await api.post('/api/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    
    // Show specific error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    // Simulate success for offline testing
    return {
      success: true,
      message: 'Registration successful (offline mode)',
      data: {
        name: userData.name,
        rollNumber: `SI-${userData.rollNumber}`,
        category: userData.category,
        registeredAt: new Date().toISOString()
      }
    };
  }
};

// Get registrations (for admin)
export const getRegistrations = async () => {
  try {
    const response = await api.get('/api/admin/registrations');
    return response.data;
  } catch (error) {
    console.error('Get registrations error:', error);
    throw error;
  }
};

// Initialize database
export const initDatabase = async () => {
  try {
    const response = await api.get('/api/init-db');
    return response.data;
  } catch (error) {
    console.error('Init database error:', error);
    throw error;
  }
};

// Admin logout
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // Redirect to login
  setTimeout(() => {
    window.location.href = '/admin/login';
  }, 500);
};

const apiService = {
  adminLogin,
  testServerConnection,
  getDashboardStats,
  checkDashboardAccess,
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
  initDatabase,
  registerUser,
  getRegistrations,
  adminLogout,
  API_BASE_URL // Export for debugging
};

export default apiService;