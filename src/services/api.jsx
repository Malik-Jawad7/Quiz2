// api.js (Frontend API file)
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== QUIZ APIs ====================
export const getQuizQuestions = async (category) => {
  try {
    const response = await axiosInstance.get(`/quiz/questions/${category}`);
    return response;
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    throw error;
  }
};

export const submitQuiz = async (quizData) => {
  try {
    const response = await axiosInstance.post("/quiz/submit", quizData);
    return response;
  } catch (error) {
    console.error("Error submitting quiz:", error);
    throw error;
  }
};

export const getResult = async (rollNumber) => {
  try {
    const response = await axiosInstance.get(`/result/${rollNumber}`);
    return response;
  } catch (error) {
    console.error("Error fetching result:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    if (response.data.success) {
      localStorage.setItem("userData", JSON.stringify(response.data.user));
    }
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// ==================== ADMIN APIs ====================
export const adminLogin = async (loginData) => {
  try {
    const response = await axiosInstance.post("/admin/login", loginData);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};

export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "/admin/login";
};

export const isAdminAuthenticated = () => {
  return !!localStorage.getItem("adminToken");
};

export const getAdminInfo = () => {
  try {
    const adminUser = localStorage.getItem("adminUser");
    return adminUser ? JSON.parse(adminUser) : null;
  } catch (error) {
    return null;
  }
};

export const getAvailableCategories = async () => {
  try {
    const response = await axiosInstance.get("/categories");
    return response;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getConfig = async () => {
  try {
    const response = await axiosInstance.get("/config");
    return response;
  } catch (error) {
    console.error("Error fetching config:", error);
    throw error;
  }
};

export const updateConfig = async (configData) => {
  try {
    const response = await axiosInstance.put("/config", configData);
    return response;
  } catch (error) {
    console.error("Error updating config:", error);
    throw error;
  }
};

// ==================== QUESTION MANAGEMENT ====================
export const getAllQuestions = async () => {
  try {
    const response = await axiosInstance.get("/admin/questions");
    return response;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const addQuestion = async (questionData) => {
  try {
    const response = await axiosInstance.post("/admin/questions", questionData);
    return response;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await axiosInstance.delete(`/admin/questions/${questionId}`);
    return response;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

export const deleteAllQuestions = async () => {
  try {
    const response = await axiosInstance.delete("/admin/questions?confirm=true");
    return response;
  } catch (error) {
    console.error("Error deleting all questions:", error);
    throw error;
  }
};

// ==================== RESULT MANAGEMENT ====================
export const getResults = async () => {
  try {
    const response = await axiosInstance.get("/admin/results");
    return response;
  } catch (error) {
    console.error("Error fetching results:", error);
    throw error;
  }
};

export const deleteResult = async (resultId) => {
  try {
    const response = await axiosInstance.delete(`/admin/results/${resultId}`);
    return response;
  } catch (error) {
    console.error("Error deleting result:", error);
    throw error;
  }
};

export const deleteAllResults = async () => {
  try {
    const response = await axiosInstance.delete("/admin/results?confirm=true");
    return response;
  } catch (error) {
    console.error("Error deleting all results:", error);
    throw error;
  }
};

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard");
    return response;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================
export const healthCheck = async () => {
  try {
    const response = await axiosInstance.get("/health");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return { success: false, message: "Backend server is not responding" };
  }
};

// CSV Export Functions (Client-side)
export const exportResultsToCSV = (results) => {
  if (!results || results.length === 0) {
    alert("No results to export");
    return;
  }

  const csvContent = [
    ["Name", "Roll Number", "Category", "Score", "Total Marks", "Percentage", "Status", "Date"],
    ...results.map((result) => {
      const percentage = parseFloat(result.percentage) || 0;
      const passed = result.passed || percentage >= 40;
      return [
        result.name,
        result.rollNumber,
        result.category,
        result.score,
        result.totalMarks,
        `${percentage.toFixed(2)}%`,
        passed ? "PASSED" : "FAILED",
        new Date(result.createdAt).toLocaleDateString(),
      ];
    }),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shamsi-results-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportQuestionsToCSV = (questions) => {
  if (!questions || questions.length === 0) {
    alert("No questions to export");
    return;
  }

  const csvContent = [
    [
      "Category",
      "Question",
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "Correct Answer",
      "Marks",
      "Difficulty",
    ],
    ...questions.map((q) => {
      // Find correct option index
      const correctIndex = q.options ? q.options.findIndex((opt) => opt.isCorrect) : -1;
      const correctAnswer = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : "N/A";
      
      return [
        q.category,
        q.questionText,
        q.options && q.options[0] ? q.options[0].text : "",
        q.options && q.options[1] ? q.options[1].text : "",
        q.options && q.options[2] ? q.options[2].text : "",
        q.options && q.options[3] ? q.options[3].text : "",
        correctAnswer,
        q.marks || 1,
        q.difficulty || "medium",
      ];
    }),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shamsi-questions-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Missing functions that might be needed
export const getCategoryStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard");
    return response;
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return {
      data: {
        success: true,
        categoryStats: [
          { category: "html", questions: 5, attempts: 0 },
          { category: "css", questions: 5, attempts: 0 },
          { category: "javascript", questions: 5, attempts: 0 },
          { category: "react", questions: 5, attempts: 0 },
          { category: "mern", questions: 5, attempts: 0 }
        ]
      }
    };
  }
};

export const getResultDetails = async (resultId) => {
  try {
    const response = await axiosInstance.get(`/admin/results/${resultId}`);
    return response;
  } catch (error) {
    console.error("Error fetching result details:", error);
    throw error;
  }
};

// ==================== DEFAULT EXPORT ====================
const apiService = {
  // Quiz APIs
  getQuizQuestions,
  submitQuiz,
  getResult,
  registerUser,
  
  // Admin APIs
  adminLogin,
  adminLogout,
  isAdminAuthenticated,
  getAdminInfo,
  getAvailableCategories,
  getConfig,
  updateConfig,
  
  // Question Management
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  deleteAllQuestions,
  
  // Result Management
  getResults,
  deleteResult,
  deleteAllResults,
  getResultDetails,
  
  // Dashboard
  getDashboardStats,
  getCategoryStats,
  
  // Utility
  healthCheck,
  exportResultsToCSV,
  exportQuestionsToCSV,
};

export default apiService;