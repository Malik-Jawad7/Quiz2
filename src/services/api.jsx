import axios from 'axios';

// ================= CONFIGURATION =================
// Production Backend URL
const VERCEL_BACKEND_URL = 'https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app';

// Dynamic URL - production میں Vercel, development میں localhost
const API_BASE_URL = import.meta.env.PROD 
    ? VERCEL_BACKEND_URL 
    : 'http://localhost:5000';

console.log('📡 API Base URL:', API_BASE_URL);

// ========== PUBLIC ROUTES ==========

// Admin login
export const adminLogin = async (loginData) => {
    try {
        console.log('🔗 Admin login API URL:', `${API_BASE_URL}/api/admin/login`);
        console.log('📤 Sending data:', loginData);
        
        const response = await axios.post(`${API_BASE_URL}/api/admin/login`, loginData, {
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Response received:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Admin login error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        
        // Specific error messages
        if (error.response) {
            if (error.response.status === 401) {
                throw new Error('Invalid username or password');
            } else if (error.response.status === 500) {
                throw new Error('Server error. Please try again later.');
            }
        } else if (error.request) {
            throw new Error('Cannot connect to server. Please check your internet connection.');
        }
        
        throw error;
    }
};

// Register User
export const registerUser = async (userData) => {
    try {
        console.log('Registering user with URL:', `${API_BASE_URL}/api/auth/register`);
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
    }
};

// Get questions by category
export const getQuestionsByCategory = async (category) => {
    try {
        console.log('Fetching questions for category:', category);
        const response = await axios.get(`${API_BASE_URL}/api/user/questions/${category}`, {
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Get questions error:', error.response?.data || error.message);
        throw error;
    }
};

// Submit quiz
export const submitQuiz = async (quizData) => {
    try {
        console.log('Submitting quiz data');
        const response = await axios.post(`${API_BASE_URL}/api/user/submit`, quizData, {
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error('Submit quiz error:', error.response?.data || error.message);
        throw error;
    }
};

// Get config (public)
export const getQuizConfig = async () => {
    try {
        console.log('Fetching quiz config from:', `${API_BASE_URL}/api/config`);
        const response = await axios.get(`${API_BASE_URL}/api/config`, {
            timeout: 10000
        });
        return response;
    } catch (error) {
        console.log('Failed to fetch config, using fallback', error.message);
        // Return mock data as fallback
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

// Get result config (public)
export const getResultConfig = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/result-config`, {
            timeout: 10000
        });
        return response;
    } catch (error) {
        console.log('Failed to fetch result config, using fallback', error.message);
        // Return fallback data
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

// ========== ADMIN ROUTES ==========

// Get config (admin)
export const getConfig = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/admin/config`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 10000
        });
        return response;
    } catch (error) {
        console.error('Get config error:', error.message);
        // Return fallback data
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

// Update config
export const updateConfig = async (configData) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.put(`${API_BASE_URL}/api/admin/config`, configData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        return response;
    } catch (error) {
        console.error('Update config error:', error.response?.data || error.message);
        throw error;
    }
};

// Get all questions
export const getAllQuestions = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/admin/questions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Get all questions error:', error.message);
        return {
            data: {
                success: true,
                questions: []
            }
        };
    }
};

// Add question
export const addQuestion = async (questionData) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.post(`${API_BASE_URL}/api/admin/questions`, questionData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Add question error:', error.response?.data || error.message);
        throw error;
    }
};

// Delete question
export const deleteQuestion = async (id) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.delete(`${API_BASE_URL}/api/admin/questions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 10000
        });
        return response;
    } catch (error) {
        console.error('Delete question error:', error.response?.data || error.message);
        throw error;
    }
};

// Get results (users)
export const getResults = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Get results error:', error.message);
        return {
            data: {
                success: true,
                results: []
            }
        };
    }
};

// Get dashboard stats
export const getDashboardStats = async () => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('No admin token found');
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Get dashboard stats error:', error.message);
        // Return fallback data
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

// Health check
export const checkHealth = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, {
            timeout: 10000
        });
        return response;
    } catch (error) {
        console.error('Health check failed:', error.message);
        return {
            data: {
                success: false,
                message: 'Backend is not responding'
            }
        };
    }
};

// Test database connection
export const testDatabase = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/test-db`, {
            timeout: 15000
        });
        return response;
    } catch (error) {
        console.error('Database test failed:', error.message);
        return {
            data: {
                success: false,
                message: 'Database connection failed'
            }
        };
    }
};

// Initialize database with sample data
export const initializeDatabase = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/init`, {
            timeout: 20000
        });
        return response;
    } catch (error) {
        console.error('Initialize database error:', error.message);
        throw error;
    }
};

// ========== HELPER FUNCTIONS ==========

// Check if user is admin
export const isAdminAuthenticated = () => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!token || !adminUser) {
        return false;
    }
    
    try {
        return true;
    } catch (error) {
        return false;
    }
};

// Logout admin
export const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    console.log('Admin logged out');
};

// Get admin info
export const getAdminInfo = () => {
    try {
        const adminUser = localStorage.getItem('adminUser');
        return adminUser ? JSON.parse(adminUser) : null;
    } catch (error) {
        return null;
    }
};