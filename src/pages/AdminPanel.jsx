import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './AdminPanel.css';

// React Icons
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaEdit,
  FaCog,
  FaChartBar,
  FaSync,
  FaSignOutAlt,
  FaSearch,
  FaTrash,
  FaUsers,
  FaQuestionCircle,
  FaChartLine,
  FaStar,
  FaUserGraduate,
  FaClipboardCheck,
  FaTimes,
  FaBars,
  FaCheck,
  FaUser,
  FaServer,
  FaClock,
  FaPercentage,
  FaListOl,
  FaSave,
  FaIdCard,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaDatabase,
  FaSpinner,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye
} from 'react-icons/fa';

// Import logo
import Logo from '../assets/shamsi-logo.jpg';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Configuration state
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 100
  });

  // Add Question State
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    questionText: '',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    marks: 1,
    difficulty: 'medium'
  });
  
  // Results and Questions states
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    todayAttempts: 0
  });
  
  // Filtered results for search
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Categories from API
  const [categories, setCategories] = useState([]);

  // Load data on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      loadAllData();
    }
  }, [navigate]);

  // Filter and sort results when dependencies change
  useEffect(() => {
    let filtered = results;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => 
        result.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Sort results
    filtered.sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? (a.name || '').localeCompare(b.name || '')
          : (b.name || '').localeCompare(a.name || '');
      }
      if (sortConfig.key === 'percentage') {
        return sortConfig.direction === 'asc' 
          ? (a.percentage || 0) - (b.percentage || 0)
          : (b.percentage || 0) - (a.percentage || 0);
      }
      if (sortConfig.key === 'submittedAt') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.submittedAt) - new Date(b.submittedAt)
          : new Date(b.submittedAt) - new Date(a.submittedAt);
      }
      return 0;
    });
    
    setFilteredResults(filtered);
  }, [results, searchTerm, selectedCategory, sortConfig]);

  // Load all data from API
  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load categories first
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.data?.success) {
        setCategories(categoriesResponse.data.categories || []);
      }

      // Load config
      const configResponse = await apiService.getConfig();
      if (configResponse.data?.success) {
        setConfig(configResponse.data.config);
      }

      // Load stats
      const statsResponse = await apiService.getDashboardStats();
      if (statsResponse.data?.success) {
        setStats(statsResponse.data.stats);
      }
      
      // Load questions
      const questionsResponse = await apiService.getAllQuestions();
      if (questionsResponse.data?.success) {
        setQuestions(questionsResponse.data.questions || []);
      }
      
      // Load results
      const resultsResponse = await apiService.getResults();
      if (resultsResponse.data?.success) {
        setResults(resultsResponse.data.results || []);
        setFilteredResults(resultsResponse.data.results || []);
      }
      
      showNotification('Data loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data. Please check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add new question
  const handleAddQuestion = async () => {
    if (!newQuestion.category || !newQuestion.questionText || 
        newQuestion.options.filter(opt => opt.text.trim() === '').length > 0 ||
        newQuestion.options.filter(opt => opt.isCorrect).length !== 1) {
      showNotification('Please fill all fields and select exactly one correct option', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.addQuestion(newQuestion);
      
      if (response.data?.success) {
        // Reload questions
        const questionsResponse = await apiService.getAllQuestions();
        if (questionsResponse.data?.success) {
          setQuestions(questionsResponse.data.questions || []);
        }

        // Reset form
        setNewQuestion({
          category: '',
          questionText: '',
          options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
          marks: 1,
          difficulty: 'medium'
        });

        showNotification('Question added successfully!', 'success');
      } else {
        showNotification(response.data?.message || 'Failed to add question', 'error');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      showNotification('Error adding question: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await apiService.deleteQuestion(questionId);
        
        if (response.data?.success) {
          // Update local state
          const updatedQuestions = questions.filter(q => q._id !== questionId);
          setQuestions(updatedQuestions);
          
          showNotification('Question deleted successfully!', 'success');
        } else {
          showNotification(response.data?.message || 'Failed to delete question', 'error');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        showNotification('Error deleting question: ' + error.message, 'error');
      }
    }
  };

  // Add option field
  const addOption = () => {
    if (newQuestion.options.length < 4) {
      setNewQuestion({
        ...newQuestion,
        options: [...newQuestion.options, { text: '', isCorrect: false }]
      });
    }
  };

  // Remove option field
  const removeOption = (index) => {
    if (newQuestion.options.length > 2) {
      const updatedOptions = [...newQuestion.options];
      updatedOptions.splice(index, 1);
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    }
  };

  // Update option text
  const updateOption = (index, text) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].text = text;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Set correct option
  const setCorrectOption = (index) => {
    const updatedOptions = newQuestion.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Update config
  const handleUpdateConfig = async () => {
    setLoading(true);
    try {
      const response = await apiService.updateConfig(config);
      
      if (response.data?.success) {
        showNotification('Configuration updated successfully!', 'success');
      } else {
        showNotification(response.data?.message || 'Failed to update config', 'error');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      showNotification('Error updating config: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete all results
  const handleDeleteAllResults = async () => {
    if (!window.confirm('Are you sure you want to delete ALL results permanently?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiService.deleteAllResults();
      
      if (response.data?.success) {
        setResults([]);
        setFilteredResults([]);
        
        setStats(prevStats => ({
          ...prevStats,
          totalAttempts: 0,
          todayAttempts: 0,
          averageScore: 0,
          passRate: 0
        }));
        
        showNotification('All results deleted successfully!', 'success');
      } else {
        showNotification(response.data?.message || 'Failed to delete all results', 'error');
      }
    } catch (error) {
      console.error('Error deleting all results:', error);
      showNotification('Error deleting all results: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sort results
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryInfo = (category) => {
    const categoryData = categories.find(c => c.value === category);
    if (categoryData) {
      return categoryData;
    }
    
    const questionsInCategory = questions.filter(q => q.category === category);
    const totalMarks = questionsInCategory.reduce((sum, q) => sum + (q.marks || 1), 0);
    
    return {
      value: category,
      label: category.toUpperCase(),
      questionCount: questionsInCategory.length,
      totalMarks: totalMarks,
      isComplete: totalMarks >= 100
    };
  };

  const renderStatCard = (title, value, icon, color = 'blue', subtitle = '') => {
    return (
      <div className="stat-card">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>
        <div className="stat-content">
          <h3>{value}</h3>
          <p>{title}</p>
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className="mobile-logo">
          <div className="logo-placeholder">
            <img src={Logo} alt="Shamsi Institute" className="logo-img" />
          </div>
          <div className="mobile-title">
            <span>Admin Panel</span>
            <span>Shamsi Institute</span>
          </div>
        </div>
        
        <button 
          className="mobile-refresh"
          onClick={loadAllData}
          disabled={loading}
        >
          {loading ? <FaSpinner className="spinning" /> : <FaSync />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-img-container">
              <img src={Logo} alt="Shamsi Institute" className="logo-img" />
            </div>
            <div className="logo-text">
              <h2>Shamsi Institute</h2>
              <p>Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
          >
            <FaTachometerAlt />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'add-question' ? 'active' : ''}`}
            onClick={() => { setActiveTab('add-question'); setMobileMenuOpen(false); }}
          >
            <FaPlusCircle />
            <span>Add Question</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'manage-questions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manage-questions'); setMobileMenuOpen(false); }}
          >
            <FaEdit />
            <span>Manage Questions ({questions.length})</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => { setActiveTab('results'); setMobileMenuOpen(false); }}
          >
            <FaChartBar />
            <span>Results ({results.length})</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => { setActiveTab('config'); setMobileMenuOpen(false); }}
          >
            <FaCog />
            <span>Configuration</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button 
            onClick={loadAllData} 
            className="refresh-all-btn" 
            disabled={loading}
          >
            {loading ? <FaSpinner className="spinning" /> : <FaSync />}
            <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
          
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
          
          <div className="server-status online">
            <span className="status-dot"></span>
            <span>Database Connected</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <h1>
            {activeTab === 'dashboard' && <><FaTachometerAlt /> Dashboard</>}
            {activeTab === 'add-question' && <><FaPlusCircle /> Add Question</>}
            {activeTab === 'manage-questions' && <><FaEdit /> Manage Questions</>}
            {activeTab === 'config' && <><FaCog /> Configuration</>}
            {activeTab === 'results' && <><FaChartBar /> Results</>}
          </h1>
          
          <div className="top-bar-actions">
            <div className="welcome-message">
              Welcome, <strong>Admin</strong>
            </div>
            <button 
              className="refresh-btn" 
              onClick={loadAllData} 
              disabled={loading}
            >
              {loading ? <FaSpinner className="spinning" /> : <FaSync />} 
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <h2><FaTachometerAlt /> Dashboard Overview</h2>
              <div className="dashboard-actions">
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('add-question')}
                >
                  <FaPlusCircle /> Add Question
                </button>
                <button 
                  className="btn-secondary"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaSync />} 
                  Refresh Data
                </button>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              {renderStatCard('Total Students', stats.totalStudents, <FaUsers />, 'blue')}
              {renderStatCard('Total Questions', stats.totalQuestions, <FaQuestionCircle />, 'green')}
              {renderStatCard('Total Attempts', stats.totalAttempts, <FaClipboardCheck />, 'orange')}
              {renderStatCard('Average Score', `${stats.averageScore}%`, <FaChartLine />, 'purple')}
              {renderStatCard('Pass Rate', `${stats.passRate}%`, <FaStar />, 'yellow')}
              {renderStatCard("Today's Attempts", stats.todayAttempts, <FaUserGraduate />, 'red')}
            </div>

            {/* Quick Summary */}
            <div className="quick-summary">
              <div className="summary-card">
                <h3><FaDatabase /> System Summary</h3>
                <div className="summary-content">
                  <div className="summary-item">
                    <span>Active Categories:</span>
                    <span>{new Set(questions.map(q => q.category)).size}</span>
                  </div>
                  <div className="summary-item">
                    <span>Questions in DB:</span>
                    <span>{questions.length}</span>
                  </div>
                  <div className="summary-item">
                    <span>Last Updated:</span>
                    <span>Just now</span>
                  </div>
                </div>
              </div>
              
              <div className="summary-card">
                <h3><FaClock /> Quiz Settings</h3>
                <div className="summary-content">
                  <div className="summary-item">
                    <span>Quiz Time:</span>
                    <span>{config.quizTime} minutes</span>
                  </div>
                  <div className="summary-item">
                    <span>Passing %:</span>
                    <span>{config.passingPercentage}%</span>
                  </div>
                  <div className="summary-item">
                    <span>Questions per Quiz:</span>
                    <span>{config.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Progress */}
            <div className="category-progress">
              <h3><FaChartBar /> Category Progress (Target: 100 marks each)</h3>
              <div className="progress-grid">
                {categories.slice(0, 12).map(category => {
                  const categoryInfo = getCategoryInfo(category.value || category);
                  const percentage = Math.min((categoryInfo.totalMarks / 100) * 100, 100);
                  
                  return (
                    <div key={category.value || category} className="progress-item">
                      <div className="progress-header">
                        <span className="progress-category">{categoryInfo.label}</span>
                        <span className="progress-count">{categoryInfo.totalMarks}/100</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="progress-info">
                        <span>{categoryInfo.questionCount} questions</span>
                        <span>{Math.max(100 - categoryInfo.totalMarks, 0)} marks to go</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Add Question Tab */}
        {activeTab === 'add-question' && (
          <div className="add-question">
            <div className="section-header">
              <h2><FaPlusCircle /> Add New Question to Database</h2>
              <button onClick={() => setActiveTab('manage-questions')}>
                <FaEye /> View Questions
              </button>
            </div>
            
            <div className="add-question-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => {
                      const categoryInfo = getCategoryInfo(category.value || category);
                      const disabled = categoryInfo.isComplete;
                      return (
                        <option key={category.value || category} value={category.value || category} disabled={disabled}>
                          {categoryInfo.label} ({categoryInfo.totalMarks}/100 marks)
                        </option>
                      );
                    })}
                  </select>
                  <small>Maximum 100 marks per category</small>
                </div>
                
                <div className="form-group">
                  <label>Marks *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newQuestion.marks}
                    onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 1})}
                    required
                  />
                  <small>1-10 marks per question</small>
                </div>
                
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Question Text *</label>
                <textarea
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                  placeholder="Enter your question here..."
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group full-width">
                <label>Options *</label>
                <div className="options-container">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="option-input-group">
                      <div className="option-input">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                        {newQuestion.options.length > 2 && (
                          <button 
                            type="button" 
                            className="remove-option-btn"
                            onClick={() => removeOption(index)}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      <div className="option-actions">
                        <label className="correct-checkbox">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={option.isCorrect}
                            onChange={() => setCorrectOption(index)}
                          />
                          <span>Correct Answer</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  {newQuestion.options.length < 4 && (
                    <button 
                      type="button" 
                      className="add-option-btn"
                      onClick={addOption}
                    >
                      <FaPlusCircle /> Add Option
                    </button>
                  )}
                  
                  <div className="option-help">
                    <FaInfoCircle />
                    <small>Select exactly one correct option. Minimum 2 options required.</small>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleAddQuestion}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaSave />} 
                  {loading ? 'Saving...' : 'Add to Database'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setNewQuestion({
                      category: '',
                      questionText: '',
                      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                      marks: 1,
                      difficulty: 'medium'
                    });
                  }}
                >
                  Clear Form
                </button>
              </div>
            </div>
            
            {/* Category Summary */}
            <div className="category-summary">
              <h3><FaDatabase /> Category Marks Summary</h3>
              <div className="category-grid">
                {categories.map(category => {
                  const categoryInfo = getCategoryInfo(category.value || category);
                  const percentage = Math.min((categoryInfo.totalMarks / 100) * 100, 100);
                  const remaining = Math.max(100 - categoryInfo.totalMarks, 0);
                  
                  return (
                    <div key={category.value || category} className={`category-item ${categoryInfo.isComplete ? 'complete' : ''}`}>
                      <div className="category-header">
                        <span className="category-name">{categoryInfo.label}</span>
                        <span className="category-marks">{categoryInfo.totalMarks}/100</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="category-footer">
                        <span>{remaining} marks available</span>
                        <span className={`status ${categoryInfo.isComplete ? 'complete' : 'incomplete'}`}>
                          {categoryInfo.isComplete ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Manage Questions Tab */}
        {activeTab === 'manage-questions' && (
          <div className="manage-questions">
            <div className="section-header">
              <h2><FaEdit /> Manage Questions ({questions.length})</h2>
              <div className="section-actions">
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('add-question')}
                >
                  <FaPlusCircle /> Add Question
                </button>
                <button 
                  className="btn-secondary"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaSync />} Refresh
                </button>
              </div>
            </div>
            
            <div className="search-filter">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-dropdown">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.value || category} value={category.value || category}>
                      {getCategoryInfo(category.value || category).label} ({questions.filter(q => q.category === (category.value || category)).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="questions-list">
              {questions
                .filter(q => selectedCategory === 'all' || q.category === selectedCategory)
                .filter(q => !searchTerm || q.questionText.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((question, index) => (
                  <div key={question._id} className="question-card">
                    <div className="question-header">
                      <div className="question-tags">
                        <span className="question-tag category">{question.category}</span>
                        <span className="question-tag marks">{question.marks} marks</span>
                        <span className={`question-tag difficulty ${question.difficulty}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <div className="question-actions">
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteQuestion(question._id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    <div className="question-text">
                      <p>{question.questionText}</p>
                    </div>
                    
                    <div className="options-preview">
                      {question.options.map((opt, idx) => (
                        <div key={idx} className={`option-preview ${opt.isCorrect ? 'correct' : ''}`}>
                          <span>{opt.text}</span>
                          {opt.isCorrect && <FaCheck className="correct-mark" />}
                        </div>
                      ))}
                    </div>
                    
                    <div className="question-footer">
                      <span className="created-date">
                        Added: {formatDate(question.createdAt)}
                      </span>
                      <span className="question-id">
                        ID: {question._id?.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                ))}
              
              {questions.length === 0 && (
                <div className="empty-state">
                  <FaQuestionCircle className="empty-state-icon" />
                  <h3>No Questions Found</h3>
                  <p>Add your first question to get started</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('add-question')}
                  >
                    <FaPlusCircle /> Add Question
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab - WITHOUT DELETE BUTTONS */}
        {activeTab === 'results' && (
          <div className="results-page">
            <div className="section-header">
              <h2><FaChartBar /> Quiz Results ({filteredResults.length})</h2>
              <div className="section-actions">
                <button 
                  className="btn-danger"
                  onClick={handleDeleteAllResults}
                  disabled={results.length === 0 || loading}
                >
                  <FaTrash /> Delete All Results
                </button>
                <button 
                  className="btn-primary"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="spinning" /> : <FaSync />} Refresh
                </button>
              </div>
            </div>
            
            <div className="results-controls">
              <div className="search-filter">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search by name, roll number, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-dropdown">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.value || category} value={category.value || category}>
                        {getCategoryInfo(category.value || category).label} ({results.filter(r => r.category === (category.value || category)).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')}>
                      <span>Student</span>
                      {getSortIcon('name')}
                    </th>
                    <th><FaIdCard /> Roll No</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th onClick={() => requestSort('percentage')}>
                      <span>Percentage</span>
                      {getSortIcon('percentage')}
                    </th>
                    <th>Status</th>
                    <th onClick={() => requestSort('submittedAt')}>
                      <span><FaHistory /> Date</span>
                      {getSortIcon('submittedAt')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-state">
                          <FaSearch className="empty-state-icon" />
                          <h3>No Results Found</h3>
                          <p>No quiz results available</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((result) => {
                      const percentage = parseFloat(result.percentage) || 0;
                      const passed = percentage >= config.passingPercentage;
                      
                      return (
                        <tr key={result._id} className={passed ? 'passed-row' : 'failed-row'}>
                          <td>
                            <div className="student-info">
                              <div className="student-avatar">
                                <FaUser />
                              </div>
                              <div>
                                <div className="student-name">{result.name || 'Student'}</div>
                                <div className="roll-number">{result.rollNumber || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td>{result.rollNumber || 'N/A'}</td>
                          <td>
                            <span className="table-category-badge">{result.category || 'General'}</span>
                          </td>
                          <td><strong>{result.score || 0}</strong></td>
                          <td>
                            <span className={`percentage ${passed ? 'pass' : 'fail'}`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${passed ? 'pass' : 'fail'}`}>
                              {passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td>{formatDate(result.submittedAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="results-summary">
              <div className="summary-card">
                <h3><FaChartBar /> Results Summary</h3>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-value">{results.length}</span>
                    <span className="stat-label">Total Results</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{results.filter(r => r.passed || (parseFloat(r.percentage) >= config.passingPercentage)).length}</span>
                    <span className="stat-label">Passed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{results.filter(r => !r.passed && (parseFloat(r.percentage) < config.passingPercentage)).length}</span>
                    <span className="stat-label">Failed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{config.passingPercentage}%</span>
                    <span className="stat-label">Passing %</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="config-page">
            <div className="section-header">
              <h2><FaCog /> System Configuration</h2>
              <button 
                className="btn-primary"
                onClick={handleUpdateConfig}
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinning" /> : <FaSave />} 
                {loading ? 'Saving...' : 'Save to Database'}
              </button>
            </div>
            
            <div className="config-grid">
              <div className="config-card">
                <div className="config-icon">
                  <FaClock />
                </div>
                <div className="config-content">
                  <h3>Quiz Time Limit</h3>
                  <p>Set the maximum time allowed for each quiz attempt</p>
                  <div className="config-input">
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={config.quizTime}
                      onChange={(e) => setConfig({...config, quizTime: parseInt(e.target.value)})}
                    />
                    <span className="config-value">{config.quizTime} minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="config-card">
                <div className="config-icon">
                  <FaPercentage />
                </div>
                <div className="config-content">
                  <h3>Passing Percentage</h3>
                  <p>Minimum percentage required to pass the quiz</p>
                  <div className="config-input">
                    <input
                      type="range"
                      min="30"
                      max="100"
                      step="5"
                      value={config.passingPercentage}
                      onChange={(e) => setConfig({...config, passingPercentage: parseInt(e.target.value)})}
                    />
                    <span className="config-value">{config.passingPercentage}%</span>
                  </div>
                </div>
              </div>
              
              <div className="config-card">
                <div className="config-icon">
                  <FaListOl />
                </div>
                <div className="config-content">
                  <h3>Questions per Quiz</h3>
                  <p>Number of questions in each quiz attempt</p>
                  <div className="config-input">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={config.totalQuestions}
                      onChange={(e) => setConfig({...config, totalQuestions: parseInt(e.target.value)})}
                    />
                    <span className="config-value">{config.totalQuestions} questions</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="config-preview">
              <h3><FaEye /> Configuration Preview</h3>
              <div className="preview-card">
                <div className="preview-item">
                  <span>Quiz Duration:</span>
                  <span className="preview-value">{config.quizTime} minutes</span>
                </div>
                <div className="preview-item">
                  <span>Passing Percentage:</span>
                  <span className="preview-value">{config.passingPercentage}%</span>
                </div>
                <div className="preview-item">
                  <span>Total Questions:</span>
                  <span className="preview-value">{config.totalQuestions}</span>
                </div>
                <div className="preview-item">
                  <span>Current System:</span>
                  <span className="preview-value status-active">Active</span>
                </div>
              </div>
              
              <div className="config-notice">
                <FaInfoCircle />
                <p>Changes will take effect immediately after saving. Existing active quizzes will continue with old settings.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {notification.type === 'success' ? <FaCheckCircle /> : 
               notification.type === 'error' ? <FaTimesCircle /> : 
               notification.type === 'warning' ? <FaExclamationTriangle /> : <FaInfoCircle />}
            </span>
            <span>{notification.message}</span>
          </div>
          <button 
            className="toast-close"
            onClick={() => setNotification(null)}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;