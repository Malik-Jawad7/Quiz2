// frontend/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getConfig, 
  updateConfig, 
  getResults, 
  getAllQuestions,
  addQuestion,
  deleteQuestion,
  deleteAllQuestions,
  deleteResult,
  deleteAllResults,
  exportQuestionsToCSV,
  adminLogout
} from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [questionData, setQuestionData] = useState({
    category: 'mern',
    questionText: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    marks: 1,
    difficulty: 'medium'
  });
  
  const [results, setResults] = useState([]);
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 100,
    maxMarks: 100
  });
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);
  const [categoryLimits] = useState({
    html: 100,
    css: 100,
    javascript: 100,
    react: 100,
    mern: 100,
    node: 100,
    mongodb: 100,
    express: 100
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterResults();
  }, [searchTerm, results]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const checkAuthentication = () => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminToken && adminUser) {
      setIsAuthenticated(true);
    } else {
      navigate('/admin/login');
    }
  };

  const loadAllData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadConfig(),
        loadResults(),
        loadQuestions()
      ]);
      showNotification('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await getConfig();
      if (response.data?.success) {
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadResults = async () => {
    try {
      const response = await getResults();
      if (response.data?.success) {
        setResults(response.data.results || []);
        setFilteredResults(response.data.results || []);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await getAllQuestions();
      if (response.data?.success) {
        setQuestions(response.data.questions || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const checkCategoryLimit = (category, marks) => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const currentTotalMarks = categoryQuestions.reduce((sum, q) => sum + q.marks, 0);
    const newTotalMarks = currentTotalMarks + marks;
    
    if (newTotalMarks > categoryLimits[category]) {
      return {
        allowed: false,
        current: currentTotalMarks,
        limit: categoryLimits[category],
        remaining: categoryLimits[category] - currentTotalMarks
      };
    }
    
    return {
      allowed: true,
      current: currentTotalMarks,
      limit: categoryLimits[category],
      remaining: categoryLimits[category] - currentTotalMarks
    };
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!questionData.questionText.trim()) {
      showNotification('Question text is required', 'error');
      return;
    }
    
    const validOptions = questionData.options.filter(opt => opt.text.trim() !== '');
    if (validOptions.length < 2) {
      showNotification('At least 2 options are required', 'error');
      return;
    }
    
    const hasCorrect = validOptions.some(opt => opt.isCorrect);
    if (!hasCorrect) {
      showNotification('Please mark one option as correct', 'error');
      return;
    }
    
    const limitCheck = checkCategoryLimit(questionData.category, questionData.marks);
    if (!limitCheck.allowed) {
      showNotification(
        `Cannot add question! Category "${questionData.category}" has reached its limit.`,
        'error'
      );
      return;
    }
    
    try {
      const response = await addQuestion({
        ...questionData,
        options: validOptions
      });
      
      if (response.data.success) {
        showNotification(`Question added successfully!`);
        setQuestionData({
          category: 'mern',
          questionText: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          marks: 1,
          difficulty: 'medium'
        });
        loadQuestions();
      }
    } catch (error) {
      showNotification('Error adding question', 'error');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await deleteQuestion(questionId);
        if (response.data.success) {
          showNotification('Question deleted successfully!');
          loadQuestions();
        }
      } catch (error) {
        showNotification('Error deleting question', 'error');
      }
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (questions.length === 0) {
      showNotification('No questions to delete', 'error');
      return;
    }
    
    const confirmationMessage = `Are you sure you want to delete ALL ${questions.length} questions?\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmationMessage)) {
      showNotification('Deletion cancelled', 'info');
      return;
    }
    
    setIsDeletingAll(true);
    try {
      const response = await deleteAllQuestions();
      
      if (response.data?.success) {
        showNotification(`All ${questions.length} questions deleted successfully!`);
        await loadQuestions();
      }
    } catch (error) {
      console.error('Error deleting all questions:', error);
      showNotification('Error deleting all questions', 'error');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteResult = async (resultId, studentName) => {
    if (window.confirm(`Are you sure you want to delete result of ${studentName}?`)) {
      try {
        const response = await deleteResult(resultId);
        if (response.data.success) {
          showNotification('Result deleted successfully!');
          loadResults();
        }
      } catch (error) {
        showNotification('Error deleting result', 'error');
      }
    }
  };

  const handleDeleteAllResults = async () => {
    if (window.confirm('Are you sure you want to delete ALL results?')) {
      try {
        const response = await deleteAllResults();
        if (response.data.success) {
          showNotification('All results deleted successfully!');
          loadResults();
        }
      } catch (error) {
        showNotification('Error deleting all results', 'error');
      }
    }
  };

  const handleUpdateConfig = async () => {
    try {
      const response = await updateConfig(config);
      if (response.data.success) {
        showNotification('Configuration updated successfully!');
      }
    } catch (error) {
      showNotification('Error updating configuration', 'error');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      adminLogout();
      navigate('/admin/login');
    }
  };

  const filterResults = () => {
    if (!searchTerm.trim()) {
      setFilteredResults(results);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = results.filter(result => 
      result.name?.toLowerCase().includes(term) ||
      result.rollNumber?.toLowerCase().includes(term) ||
      result.category?.toLowerCase().includes(term)
    );
    
    setFilteredResults(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportQuestions = async () => {
    try {
      const response = await exportQuestionsToCSV();
      if (response.data?.success) {
        showNotification('Questions exported successfully!');
      } else {
        showNotification('Export feature not available yet', 'warning');
      }
    } catch (error) {
      showNotification('Error exporting questions', 'error');
    }
  };

  if (!isAuthenticated && loading) {
    return (
      <div className="admin-loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Authenticating...</h3>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getCategoryStats = () => {
    const stats = {};
    questions.forEach(q => {
      if (!stats[q.category]) {
        stats[q.category] = { count: 0, totalMarks: 0 };
      }
      stats[q.category].count++;
      stats[q.category].totalMarks += q.marks;
    });
    
    return Object.entries(stats).map(([category, data]) => ({
      category,
      count: data.count,
      totalMarks: data.totalMarks,
      percentage: (data.totalMarks / categoryLimits[category] * 100).toFixed(1),
      remaining: categoryLimits[category] - data.totalMarks
    }));
  };

  const getDashboardStats = () => {
    const passed = results.filter(r => r.passed).length;
    const averageScore = results.length > 0 
      ? (results.reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0) / results.length).toFixed(1)
      : 0;
    
    return [
      { 
        title: 'Total Results', 
        value: results.length, 
        icon: '📊',
        color: '#4f46e5'
      },
      { 
        title: 'Total Questions', 
        value: questions.length, 
        icon: '❓',
        color: '#10b981'
      },
      { 
        title: 'Pass Rate', 
        value: `${results.length > 0 ? ((passed / results.length) * 100).toFixed(1) : 0}%`, 
        icon: '🎯',
        color: '#f59e0b'
      },
      { 
        title: 'Avg. Score', 
        value: `${averageScore}%`, 
        icon: '⭐',
        color: '#8b5cf6'
      }
    ];
  };

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {notification.type === 'success' ? '✅' : 
               notification.type === 'error' ? '❌' : 
               notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button className="toast-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">S</div>
            {!sidebarCollapsed && (
              <div className="logo-text">
                <h3>Shamsi Institute</h3>
                <p>Admin Panel</p>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <h4>Administrator</h4>
              <p>Super Admin</p>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                title="Dashboard"
              >
                <span className="nav-icon">📊</span>
                {!sidebarCollapsed && <span className="nav-text">Dashboard</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'add-questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-questions')}
                title="Add Questions"
              >
                <span className="nav-icon">➕</span>
                {!sidebarCollapsed && <span className="nav-text">Add Questions</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'manage-questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage-questions')}
                title="Manage Questions"
              >
                <span className="nav-icon">📝</span>
                {!sidebarCollapsed && <span className="nav-text">Manage Questions</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
                onClick={() => setActiveTab('results')}
                title="Results"
              >
                <span className="nav-icon">📈</span>
                {!sidebarCollapsed && <span className="nav-text">Results</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => setActiveTab('config')}
                title="Configuration"
              >
                <span className="nav-icon">⚙️</span>
                {!sidebarCollapsed && <span className="nav-text">Configuration</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={loadAllData} className="refresh-btn" title="Refresh Data">
            <span className="btn-icon">🔄</span>
            {!sidebarCollapsed && <span className="btn-text">Refresh Data</span>}
          </button>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <span className="btn-icon">🚪</span>
            {!sidebarCollapsed && <span className="btn-text">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'add-questions' && 'Add New Question'}
              {activeTab === 'manage-questions' && 'Question Management'}
              {activeTab === 'results' && 'Quiz Results'}
              {activeTab === 'config' && 'System Configuration'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'dashboard' && 'Overview of system statistics and quick actions'}
              {activeTab === 'add-questions' && 'Create new quiz questions (Max 100 marks per category)'}
              {activeTab === 'manage-questions' && 'Manage existing questions and categories'}
              {activeTab === 'results' && 'View and manage student quiz results'}
              {activeTab === 'config' && 'Configure system settings and parameters'}
            </p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={activeTab !== 'results'}
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="header-badges">
              <span className="badge">
                <span className="badge-icon">👥</span>
                <span className="badge-text">{results.length} Students</span>
              </span>
              <span className="badge">
                <span className="badge-icon">❓</span>
                <span className="badge-text">{questions.length} Questions</span>
              </span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner-large"></div>
              <p>Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="dashboard-tab">
                  <div className="stats-grid">
                    {getDashboardStats().map((stat, index) => (
                      <div key={index} className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}20` }}>
                          <span className="stat-icon">{stat.icon}</span>
                        </div>
                        <div className="stat-content">
                          <h3>{stat.value}</h3>
                          <p>{stat.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dashboard-content">
                    <div className="section-card">
                      <div className="section-header">
                        <h3>Category Limits</h3>
                        <span className="section-subtitle">Maximum 100 marks per category</span>
                      </div>
                      <div className="section-body">
                        <div className="category-meters">
                          {getCategoryStats().map((stat) => (
                            <div key={stat.category} className="category-meter">
                              <div className="meter-header">
                                <span className="meter-label">{stat.category.toUpperCase()}</span>
                                <span className="meter-value">{stat.totalMarks}/{categoryLimits[stat.category]}</span>
                              </div>
                              <div className="meter-bar">
                                <div 
                                  className={`meter-fill ${stat.percentage >= 100 ? 'full' : stat.percentage >= 80 ? 'warning' : ''}`}
                                  style={{ width: `${stat.percentage}%` }}
                                ></div>
                              </div>
                              <div className="meter-footer">
                                <span className={`meter-status ${stat.percentage >= 100 ? 'error' : stat.percentage >= 80 ? 'warning' : 'success'}`}>
                                  {stat.remaining} marks available
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="section-card">
                      <div className="section-header">
                        <h3>Quick Actions</h3>
                      </div>
                      <div className="section-body">
                        <div className="quick-actions-grid">
                          <button onClick={() => setActiveTab('add-questions')} className="quick-action-btn">
                            <span className="action-icon">➕</span>
                            <span className="action-text">Add Question</span>
                          </button>
                          <button onClick={() => setActiveTab('manage-questions')} className="quick-action-btn">
                            <span className="action-icon">📝</span>
                            <span className="action-text">Manage Questions</span>
                          </button>
                          <button onClick={() => setActiveTab('results')} className="quick-action-btn">
                            <span className="action-icon">📈</span>
                            <span className="action-text">View Results</span>
                          </button>
                          <button onClick={() => setActiveTab('config')} className="quick-action-btn">
                            <span className="action-icon">⚙️</span>
                            <span className="action-text">Settings</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'add-questions' && (
                <div className="form-tab">
                  <div className="form-container">
                    <div className="form-header">
                      <h2>Add New Question</h2>
                      <p>Create a new question for your quiz</p>
                    </div>
                    
                    <form onSubmit={handleAddQuestion} className="question-form">
                      <div className="form-section">
                        <div className="form-section-header">
                          <h3>Question Details</h3>
                          <div className="category-limit-info">
                            <div className="limit-indicator">
                              <span className="limit-label">Category Limit:</span>
                              <span className="limit-value">
                                {checkCategoryLimit(questionData.category, 0).current}/{categoryLimits[questionData.category]} marks
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Category</label>
                            <select 
                              value={questionData.category}
                              onChange={(e) => setQuestionData({...questionData, category: e.target.value})}
                              className="form-select"
                            >
                              <option value="html">HTML ({checkCategoryLimit('html', 0).remaining} marks left)</option>
                              <option value="css">CSS ({checkCategoryLimit('css', 0).remaining} marks left)</option>
                              <option value="javascript">JavaScript ({checkCategoryLimit('javascript', 0).remaining} marks left)</option>
                              <option value="react">React ({checkCategoryLimit('react', 0).remaining} marks left)</option>
                              <option value="mern">MERN ({checkCategoryLimit('mern', 0).remaining} marks left)</option>
                              <option value="node">Node.js ({checkCategoryLimit('node', 0).remaining} marks left)</option>
                              <option value="mongodb">MongoDB ({checkCategoryLimit('mongodb', 0).remaining} marks left)</option>
                              <option value="express">Express.js ({checkCategoryLimit('express', 0).remaining} marks left)</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label>Difficulty</label>
                            <select 
                              value={questionData.difficulty}
                              onChange={(e) => setQuestionData({...questionData, difficulty: e.target.value})}
                              className="form-select"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label>Marks</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={questionData.marks}
                              onChange={(e) => setQuestionData({...questionData, marks: parseInt(e.target.value)})}
                              className="form-input"
                            />
                            <div className="limit-check">
                              {checkCategoryLimit(questionData.category, questionData.marks).allowed ? (
                                <span className="check-valid">✓ Available</span>
                              ) : (
                                <span className="check-invalid">✗ Exceeds limit</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Question Text *</label>
                          <textarea
                            value={questionData.questionText}
                            onChange={(e) => setQuestionData({...questionData, questionText: e.target.value})}
                            placeholder="Enter the question text here..."
                            rows="4"
                            className="form-textarea"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-section">
                        <h3>Options (Select the correct answer)</h3>
                        <div className="options-container">
                          {questionData.options.map((option, index) => (
                            <div key={index} className="option-item">
                              <div className="option-header">
                                <div className="option-number">Option {index + 1} {index < 2 && '*'}</div>
                                <label className="correct-option-label">
                                  <input
                                    type="radio"
                                    name="correctOption"
                                    checked={option.isCorrect}
                                    onChange={() => {
                                      const newOptions = questionData.options.map((opt, i) => ({
                                        ...opt,
                                        isCorrect: i === index
                                      }));
                                      setQuestionData({...questionData, options: newOptions});
                                    }}
                                  />
                                  <span>Correct Answer</span>
                                </label>
                              </div>
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...questionData.options];
                                  newOptions[index].text = e.target.value;
                                  setQuestionData({...questionData, options: newOptions});
                                }}
                                placeholder={`Enter option ${index + 1} text...`}
                                className="option-input"
                                required={index < 2}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setQuestionData({
                          category: 'mern',
                          questionText: '',
                          options: [
                            { text: '', isCorrect: false },
                            { text: '', isCorrect: false },
                            { text: '', isCorrect: false },
                            { text: '', isCorrect: false }
                          ],
                          marks: 1,
                          difficulty: 'medium'
                        })}>
                          Clear Form
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary"
                          disabled={!checkCategoryLimit(questionData.category, questionData.marks).allowed}
                        >
                          Save Question
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'manage-questions' && (
                <div className="manage-questions-tab">
                  <div className="tab-header">
                    <div className="header-content">
                      <h2>Question Bank</h2>
                      <p>Total {questions.length} questions in database</p>
                    </div>
                    <div className="header-actions">
                      <button onClick={exportQuestions} className="btn-secondary" disabled={questions.length === 0}>
                        Export Questions
                      </button>
                      <button 
                        onClick={handleDeleteAllQuestions} 
                        className="btn-danger"
                        disabled={questions.length === 0 || isDeletingAll}
                      >
                        {isDeletingAll ? 'Deleting...' : 'Delete All Questions'}
                      </button>
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <h3>No questions found</h3>
                      <p>Start by adding your first question</p>
                      <button onClick={() => setActiveTab('add-questions')} className="btn-primary">
                        Add Question
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="questions-table-container">
                        <table className="questions-table">
                          <thead>
                            <tr>
                              <th>Question</th>
                              <th>Category</th>
                              <th>Difficulty</th>
                              <th>Marks</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {questions.slice(0, 25).map((question) => {
                              const categoryUsed = questions
                                .filter(q => q.category === question.category)
                                .reduce((sum, q) => sum + q.marks, 0);
                              
                              return (
                                <tr key={question._id}>
                                  <td>
                                    <div className="question-cell">
                                      <div className="question-text">
                                        {question.questionText.substring(0, 80)}...
                                      </div>
                                      <div className="correct-answer">
                                        Correct: {question.options.find(opt => opt.isCorrect)?.text.substring(0, 40)}...
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="category-cell">
                                      <span className="category-badge">{question.category}</span>
                                      <div className="category-stats">
                                        <span className="category-marks">{categoryUsed}/{categoryLimits[question.category]}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`difficulty-badge ${question.difficulty}`}>
                                      {question.difficulty}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="marks-badge">{question.marks}</span>
                                  </td>
                                  <td>
                                    <button 
                                      onClick={() => handleDeleteQuestion(question._id)}
                                      className="delete-btn"
                                      title="Delete question"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {questions.length > 25 && (
                          <div className="table-footer">
                            <p>Showing 25 of {questions.length} questions</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="results-tab">
                  <div className="tab-header">
                    <div className="header-content">
                      <h2>Quiz Results</h2>
                      <p>{filteredResults.length} results found</p>
                    </div>
                    <div className="header-actions">
                      <button className="btn-secondary" onClick={() => alert('Export feature coming soon!')}>
                        Export CSV
                      </button>
                      <button className="btn-danger" onClick={handleDeleteAllResults} disabled={results.length === 0}>
                        Delete All Results
                      </button>
                    </div>
                  </div>

                  <div className="results-table-container">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Roll No</th>
                          <th>Category</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.slice(0, 50).map((result) => {
                          const percentage = parseFloat(result.percentage) || 0;
                          const passed = result.passed || percentage >= config.passingPercentage;
                          
                          return (
                            <tr key={result._id}>
                              <td>{result.name}</td>
                              <td>{result.rollNumber}</td>
                              <td>
                                <span className="category-tag">{result.category.toUpperCase()}</span>
                              </td>
                              <td>
                                <div className="score-cell">
                                  {result.score}/{result.totalMarks || 100}
                                </div>
                              </td>
                              <td>
                                <div className="percentage-cell">
                                  <span className="percentage-value">{percentage.toFixed(1)}%</span>
                                </div>
                              </td>
                              <td>
                                <span className={`status-badge ${passed ? 'passed' : 'failed'}`}>
                                  {passed ? 'PASS' : 'FAIL'}
                                </span>
                              </td>
                              <td>
                                <div className="date-cell">
                                  {formatDate(result.createdAt)}
                                </div>
                              </td>
                              <td>
                                <button 
                                  className="delete-btn-small"
                                  onClick={() => handleDeleteResult(result._id, result.name)}
                                  title="Delete result"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {filteredResults.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>No results found</h3>
                        <p>No quiz results available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'config' && (
                <div className="config-tab">
                  <div className="config-container">
                    <div className="config-section">
                      <h2>System Configuration</h2>
                      
                      <div className="config-form">
                        <div className="config-item">
                          <label>Quiz Duration (minutes)</label>
                          <input
                            type="number"
                            min="5"
                            max="180"
                            value={config.quizTime}
                            onChange={(e) => setConfig({...config, quizTime: parseInt(e.target.value)})}
                            className="config-input"
                          />
                          <span className="config-hint">Time limit for each quiz attempt</span>
                        </div>
                        
                        <div className="config-item">
                          <label>Passing Percentage (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={config.passingPercentage}
                            onChange={(e) => setConfig({...config, passingPercentage: parseInt(e.target.value)})}
                            className="config-input"
                          />
                          <span className="config-hint">Minimum score required to pass</span>
                        </div>
                        
                        <div className="config-item">
                          <label>Questions per Quiz</label>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={config.totalQuestions}
                            onChange={(e) => setConfig({...config, totalQuestions: parseInt(e.target.value)})}
                            className="config-input"
                          />
                          <span className="config-hint">Number of questions in each quiz</span>
                        </div>
                        
                        <div className="config-item">
                          <label>Maximum Marks</label>
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={config.maxMarks}
                            onChange={(e) => setConfig({...config, maxMarks: parseInt(e.target.value)})}
                            className="config-input"
                          />
                          <span className="config-hint">Total marks for the quiz</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="config-actions">
                      <button onClick={loadConfig} className="btn-secondary">
                        Reset Changes
                      </button>
                      <button onClick={handleUpdateConfig} className="btn-primary">
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;