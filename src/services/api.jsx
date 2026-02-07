import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.vercel.app' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ==================== API FUNCTIONS ====================

// Test Server Connection
export const testServerConnection = async () => {
  try {
    const response = await api.get('/api/health');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Admin Login
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Get Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load stats');
  }
};

// Get All Questions
export const getAllQuestions = async (category = 'all', search = '', page = 1, limit = 100) => {
  try {
    const response = await api.get('/api/admin/questions', {
      params: { category, search, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load questions');
  }
};

// Add Question
export const addQuestion = async (questionData) => {
  try {
    const response = await api.post('/api/admin/questions', questionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add question');
  }
};

// Delete Question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/api/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete question');
  }
};

// Get Results
export const getResults = async () => {
  try {
    const response = await api.get('/api/admin/results');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load results');
  }
};

// Delete Result
export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/api/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete result');
  }
};

// Delete All Results
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/api/admin/results');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete all results');
  }
};

// Get Configuration
export const getConfig = async () => {
  try {
    const response = await api.get('/api/config');
    return response.data;
  } catch (error) {
    console.error('Config error:', error);
    return {
      success: false,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
      }
    };
  }
};

// Update Configuration
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/api/config', configData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update config');
  }
};

// Get Categories
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Categories error:', error);
    return {
      success: false,
      categories: [
        { value: 'html', label: 'HTML', description: 'HTML Web Development', available: true },
        { value: 'css', label: 'CSS', description: 'CSS Styling', available: true },
        { value: 'javascript', label: 'JavaScript', description: 'JavaScript Programming', available: true },
        { value: 'react', label: 'React.js', description: 'React Framework', available: true },
        { value: 'node', label: 'Node.js', description: 'Node.js Backend', available: true }
      ]
    };
  }
};

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Get Quiz Questions
export const getQuizQuestions = async (category) => {
  try {
    const response = await api.get(`/api/quiz/questions/${category}`);
    
    if (response.data.success && response.data.questions) {
      // Validate questions
      const validatedQuestions = response.data.questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          text: option.text || '',
          isCorrect: option.isCorrect || false
        }))
      }));
      
      return {
        ...response.data,
        questions: validatedQuestions
      };
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load questions');
  }
};

// Submit Quiz
export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/api/quiz/submit', quizData);
    return response.data;
  } catch (error) {
    // Fallback: Save locally if API fails
    const totalQuestions = quizData.totalQuestions || 1;
    const correctAnswers = quizData.correctAnswers || 0;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    const localResult = {
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
    
    localStorage.setItem('quizResult', JSON.stringify(localResult));
    
    return {
      success: false,
      message: 'Submitted locally (API failed)',
      result: localResult
    };
  }
};

// Reset Admin
export const resetAdmin = async () => {
  try {
    const response = await api.post('/admin/reset');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset admin');
  }
};

// Admin Logout
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

// Export all functions
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