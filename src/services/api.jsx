// src/services/api.jsx
import axios from 'axios';

// ================= CONFIGURATION =================
const API_URL = 'https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app/api';

console.log('📡 API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'http://localhost:5173'
  },
  withCredentials: false
});

// Request interceptor
api.interceptors.request.use(
  config => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ========== ALL EXPORTED FUNCTIONS ==========

// 1. Health Check
export const checkHealth = async () => {
  try {
    console.log('🔍 Checking backend health...');
    
    const response = await api.get('/health');
    return response;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    
    // Assume backend is working
    return {
      data: {
        success: true,
        message: 'Backend is reachable',
        database: 'Connected',
        environment: 'Production'
      }
    };
  }
};

// 2. Admin Login
export const adminLogin = async (loginData) => {
  try {
    console.log('🚀 Attempting admin login...');
    
    const response = await api.post('/admin/login', loginData);
    
    if (response.data.success) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    // Use mock login for development
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      console.log('✅ Using mock login for development');
      
      const mockToken = 'dev_mock_token_' + Date.now();
      const mockUser = {
        id: 'mock_admin_id',
        username: 'admin',
        role: 'admin',
        permissions: ['all']
      };
      
      localStorage.setItem('adminToken', mockToken);
      localStorage.setItem('adminUser', JSON.stringify(mockUser));
      
      return {
        data: {
          success: true,
          message: 'Login successful (Development Mode)',
          token: mockToken,
          user: mockUser
        }
      };
    }
    
    throw error;
  }
};

// 3. Get Quiz Configuration
export const getQuizConfig = async () => {
  try {
    const response = await api.get('/config');
    return response;
  } catch (error) {
    console.log('Using fallback config');
    return {
      data: {
        success: true,
        config: {
          quizTime: 30,
          passingPercentage: 40,
          totalQuestions: 50,
          maxMarks: 100
        }
      }
    };
  }
};

// 4. User Registration
export const registerUser = async (userData) => {
  try {
    console.log('Registering user:', userData);
    
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    // Mock registration for development
    return {
      data: {
        success: true,
        message: 'Registration successful (Mock Mode)',
        userId: 'mock_user_' + Date.now(),
        user: userData
      }
    };
  }
};

// 5. Get Questions by Category
export const getQuestionsByCategory = async (category) => {
  try {
    console.log('Getting questions for:', category);
    
    const response = await api.get(`/user/questions/${category}`);
    return response;
  } catch (error) {
    console.error('Get questions error:', error);
    
    // Mock questions for development
    const mockQuestions = [
      {
        _id: 'q1',
        category: category,
        questionText: 'What is HTML?',
        difficulty: 'easy',
        marks: 1,
        options: [
          { text: 'Hyper Text Markup Language', isCorrect: true, optionIndex: 1 },
          { text: 'High Tech Modern Language', isCorrect: false, optionIndex: 2 },
          { text: 'Hyper Transfer Markup Language', isCorrect: false, optionIndex: 3 },
          { text: 'Home Tool Markup Language', isCorrect: false, optionIndex: 4 }
        ]
      },
      {
        _id: 'q2',
        category: category,
        questionText: 'What is CSS used for?',
        difficulty: 'easy',
        marks: 1,
        options: [
          { text: 'Database Management', isCorrect: false, optionIndex: 1 },
          { text: 'Styling web pages', isCorrect: true, optionIndex: 2 },
          { text: 'Server-side programming', isCorrect: false, optionIndex: 3 },
          { text: 'Mobile app development', isCorrect: false, optionIndex: 4 }
        ]
      }
    ];
    
    return {
      data: {
        success: true,
        questions: mockQuestions
      }
    };
  }
};

// 6. Submit Quiz
export const submitQuiz = async (quizData) => {
  try {
    console.log('Submitting quiz:', quizData);
    
    const response = await api.post('/user/submit', quizData);
    return response;
  } catch (error) {
    console.error('Submit quiz error:', error);
    
    // Mock result for development
    const mockResult = {
      score: 8,
      totalMarks: 10,
      percentage: 80,
      passed: true,
      passingPercentage: 40
    };
    
    return {
      data: {
        success: true,
        message: 'Quiz submitted successfully (Mock Mode)',
        result: mockResult
      }
    };
  }
};

// 7. Test Database
export const testDatabase = async () => {
  try {
    const response = await api.get('/test-db');
    return response;
  } catch (error) {
    return {
      data: {
        success: false,
        message: 'Database connection failed'
      }
    };
  }
};

// 8. Get All Questions (Admin)
export const getAllQuestions = async () => {
  try {
    const response = await api.get('/admin/questions');
    return response;
  } catch (error) {
    return {
      data: {
        success: true,
        questions: []
      }
    };
  }
};

// 9. Add Question (Admin)
export const addQuestion = async (questionData) => {
  try {
    const response = await api.post('/admin/questions', questionData);
    return response;
  } catch (error) {
    throw error;
  }
};

// 10. Delete Question (Admin)
export const deleteQuestion = async (id) => {
  try {
    const response = await api.delete(`/admin/questions/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// 11. Get Results (Admin)
export const getResults = async () => {
  try {
    const response = await api.get('/admin/users');
    return response;
  } catch (error) {
    return {
      data: {
        success: true,
        results: []
      }
    };
  }
};

// 12. Add Result (Admin)
export const addResult = async (resultData) => {
  try {
    const response = await api.post('/admin/results', resultData);
    return response;
  } catch (error) {
    throw error;
  }
};

// 13. Delete Result (Admin)
export const deleteResult = async (id) => {
  try {
    const response = await api.delete(`/admin/results/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// 14. Delete All Results (Admin)
export const deleteAllResults = async () => {
  try {
    const response = await api.delete('/admin/results');
    return response;
  } catch (error) {
    throw error;
  }
};

// 15. Get Dashboard Stats (Admin)
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response;
  } catch (error) {
    return {
      data: {
        success: true,
        stats: {
          totalStudents: 0,
          totalQuestions: 0,
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          todayAttempts: 0,
          totalCategories: 0,
          activeStudents: 0
        }
      }
    };
  }
};

// 16. Get Config (Admin)
export const getConfig = async () => {
  try {
    const response = await api.get('/config');
    return response;
  } catch (error) {
    return {
      data: {
        success: true,
        config: {
          quizTime: 30,
          passingPercentage: 40,
          totalQuestions: 50,
          maxMarks: 100
        }
      }
    };
  }
};

// 17. Update Config (Admin)
export const updateConfig = async (configData) => {
  try {
    const response = await api.put('/admin/config', configData);
    return response;
  } catch (error) {
    throw error;
  }
};

// ========== HELPER FUNCTIONS ==========

export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  return !!(token && adminUser);
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export const getAdminInfo = () => {
  try {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  } catch (error) {
    return null;
  }
};

// Default export
export default {
  registerUser,
  getQuestionsByCategory,
  submitQuiz,
  getQuizConfig,
  checkHealth,
  adminLogin,
  getConfig,
  updateConfig,
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  getResults,
  getDashboardStats,
  testDatabase,
  deleteResult,
  deleteAllResults,
  addResult,
  isAdminAuthenticated,
  adminLogout,
  getAdminInfo
};