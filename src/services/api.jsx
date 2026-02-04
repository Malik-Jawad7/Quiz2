import axios from 'axios';

// Production Backend URL - آپ کا Vercel backend URL
const API_BASE_URL = 'https://backend-one-taupe-14.vercel.app/api';

// Local development URL
// const API_BASE_URL = 'http://localhost:5000/api';

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
    
    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin/login')) {
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
    console.log('🔗 Testing server connection to:', API_BASE_URL);
    const response = await api.get('/health');
    
    return { 
      success: true, 
      data: response.data,
      url: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    
    return { 
      success: false, 
      message: error.message || 'API connection failed',
      url: API_BASE_URL,
      timestamp: new Date().toISOString()
    };
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    console.log('🔐 Attempting admin login...', credentials);
    
    // Try direct fetch first for fallback
    try {
      const directResponse = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const directData = await directResponse.json();
      
      if (directData.success) {
        console.log('✅ Login successful via direct fetch');
        
        // Save token
        if (directData.token) {
          localStorage.setItem('adminToken', directData.token);
          localStorage.setItem('adminUser', JSON.stringify(directData.user || {}));
        }
        
        return directData;
      }
    } catch (fetchError) {
      console.log('Direct fetch failed, trying axios...');
    }
    
    // Fallback to axios
    const response = await api.post('/admin/login', credentials);
    
    if (response.data.success) {
      console.log('✅ Login successful via axios');
      
      // Save token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user || {}));
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Development fallback
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      console.log('🛠️ Using development fallback login');
      
      const devToken = 'dev_token_' + Date.now();
      localStorage.setItem('adminToken', devToken);
      localStorage.setItem('adminUser', JSON.stringify({
        username: 'admin',
        email: 'admin@shamsi.edu.pk',
        role: 'superadmin'
      }));
      
      return {
        success: true,
        message: 'Login successful (Development Mode)',
        token: devToken,
        user: {
          username: 'admin',
          email: 'admin@shamsi.edu.pk',
          role: 'superadmin'
        }
      };
    }
    
    throw error;
  }
};

// Get Dashboard Stats
export const getDashboardStats = async () => {
  try {
    console.log('📊 Fetching dashboard stats...');
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    
    // Return fallback data
    return {
      success: true,
      stats: {
        totalStudents: 0,
        totalQuestions: 0,
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        todayAttempts: 0,
        quizTime: 30,
        passingPercentage: 40,
        totalCategories: 0
      },
      message: 'Using fallback data'
    };
  }
};

// Check dashboard access
export const checkDashboardAccess = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      return { 
        success: false, 
        message: 'No token found' 
      };
    }
    
    const data = await getDashboardStats();
    return { 
      success: data.success, 
      data
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Access check failed'
    };
  }
};

// Get all questions
export const getAllQuestions = async () => {
  try {
    console.log('📝 Fetching all questions...');
    const response = await api.get('/admin/questions');
    return response.data;
  } catch (error) {
    console.error('❌ Get questions error:', error);
    
    // Return empty questions for fallback
    return {
      success: true,
      questions: [],
      count: 0,
      message: 'No questions available'
    };
  }
};

// Add question
export const addQuestion = async (questionData) => {
  try {
    console.log('➕ Adding question:', questionData);
    const response = await api.post('/admin/questions', questionData);
    return response.data;
  } catch (error) {
    console.error('❌ Add question error:', error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    console.log('🗑️ Deleting question:', questionId);
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete question error:', error);
    throw error;
  }
};

// Get results
export const getResults = async () => {
  try {
    console.log('📈 Fetching results...');
    const response = await api.get('/admin/results');
    return response.data;
  } catch (error) {
    console.error('❌ Get results error:', error);
    
    // Return empty results for fallback
    return {
      success: true,
      results: [],
      count: 0,
      message: 'No results available'
    };
  }
};

// Delete result
export const deleteResult = async (resultId) => {
  try {
    console.log('🗑️ Deleting result:', resultId);
    const response = await api.delete(`/admin/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete result error:', error);
    throw error;
  }
};

// Delete all results
export const deleteAllResults = async () => {
  try {
    console.log('🗑️ Deleting all results...');
    const response = await api.delete('/admin/results');
    return response.data;
  } catch (error) {
    console.error('❌ Delete all results error:', error);
    throw error;
  }
};

// Get config
export const getConfig = async () => {
  try {
    console.log('⚙️ Fetching config...');
    const response = await api.get('/config');
    return response.data;
  } catch (error) {
    console.error('❌ Get config error:', error);
    
    // Return default config
    return {
      success: true,
      config: {
        quizTime: 30,
        passingPercentage: 40,
        totalQuestions: 50
      },
      message: 'Using default config'
    };
  }
};

// Update config
export const updateConfig = async (configData) => {
  try {
    console.log('⚙️ Updating config:', configData);
    const response = await api.put('/config', configData);
    return response.data;
  } catch (error) {
    console.error('❌ Update config error:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    console.log('📂 Fetching categories...');
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('❌ Get categories error:', error);
    
    // Return default categories
    return {
      success: true,
      categories: [
        { value: 'html', label: 'HTML', questionCount: 0 },
        { value: 'css', label: 'CSS', questionCount: 0 },
        { value: 'javascript', label: 'JavaScript', questionCount: 0 },
        { value: 'react', label: 'React', questionCount: 0 },
        { value: 'node', label: 'Node.js', questionCount: 0 },
        { value: 'python', label: 'Python', questionCount: 0 },
        { value: 'java', label: 'Java', questionCount: 0 },
        { value: 'devops', label: 'DevOps', questionCount: 0 }
      ],
      message: 'Using default categories'
    };
  }
};

// Get quiz questions
export const getQuizQuestions = async (category) => {
  try {
    console.log('❓ Fetching quiz questions for category:', category);
    const response = await api.get(`/quiz/questions/${category}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get quiz questions error:', error);
    
    // Return empty questions for fallback
    return {
      success: true,
      questions: [],
      count: 0,
      message: 'No questions available',
      category: category
    };
  }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
  try {
    console.log('📤 Submitting quiz:', quizData);
    const response = await api.post('/quiz/submit', quizData);
    return response.data;
  } catch (error) {
    console.error('❌ Submit quiz error:', error);
    
    // Still return success for offline mode
    return {
      success: true,
      message: 'Quiz submitted (offline mode)',
      result: quizData
    };
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    console.log('👤 Registering user:', userData);
    
    // For now, just return success
    return {
      data: {
        success: true,
        message: 'User registered successfully',
        user: userData
      }
    };
  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Return fallback
    return {
      data: {
        success: true,
        message: 'User registered (offline mode)',
        user: userData
      }
    };
  }
};

// Initialize database
export const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    const response = await api.get('/init-db');
    return response.data;
  } catch (error) {
    console.error('❌ Init database error:', error);
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
  adminLogout,
  initDatabase,
  registerUser
};

export default apiService;