import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getConfig, 
  updateConfig, 
  getResults, 
  getAllQuestions,
  getDashboardStats,
  addQuestion,
  deleteQuestion,
  deleteResult,
  deleteAllResults,
  adminLogout
} from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Updated categories with more technologies
  const allCategories = [
    'html', 'css', 'javascript', 'react', 'nextjs', 'vue', 'angular',
    'node', 'express', 'python', 'django', 'flask', 'java', 'spring',
    'php', 'laravel', 'mern', 'mongodb', 'mysql', 'postgresql',
    'git', 'docker', 'aws', 'typescript', 'graphql'
  ];
  
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
  
  const [config, setConfig] = useState({
    quizTime: 30,
    passingPercentage: 40,
    totalQuestions: 100
  });
  
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    todayAttempts: 0,
    categoryStats: {},
    categoryMarks: {}
  });
  
  const [categoryMarks, setCategoryMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      loadAllData();
    }
  }, [navigate]);

  useEffect(() => {
    filterResults();
  }, [searchTerm, results]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadConfig(),
        loadResults(),
        loadQuestions(),
        loadDashboardStats()
      ]);
      showNotification('Data loaded successfully');
    } catch (error) {
      console.log('Error loading data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await getConfig();
      if (response.data.success) {
        setConfig(response.data.config);
      }
    } catch (error) {
      console.log('Config not available, using defaults');
    }
  };

  const loadResults = async () => {
    try {
      const response = await getResults();
      if (response.data.success) {
        const resultsWithStatus = response.data.results.map(result => {
          const percentage = parseFloat(result.percentage) || 0;
          const passed = percentage >= config.passingPercentage;
          return {
            ...result,
            passed,
            status: passed ? 'PASS' : 'FAIL'
          };
        });
        setResults(resultsWithStatus);
        setFilteredResults(resultsWithStatus);
      }
    } catch (error) {
      console.log('Results not available');
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await getAllQuestions();
      if (response.data.success) {
        setQuestions(response.data.questions);
        
        // Calculate category marks for all categories
        const marksData = {};
        allCategories.forEach(category => {
          marksData[category] = 0;
        });
        
        response.data.questions.forEach(q => {
          const marks = q.marks || 1;
          marksData[q.category] = (marksData[q.category] || 0) + marks;
        });
        setCategoryMarks(marksData);
      }
    } catch (error) {
      console.log('Questions not available');
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.data.success) {
        setStats(response.data.stats);
        if (response.data.stats.categoryMarks) {
          setCategoryMarks(response.data.stats.categoryMarks);
        }
      }
    } catch (error) {
      console.log('Dashboard stats not available');
    }
  };

  const getCategoryStatus = (category) => {
    const currentMarks = categoryMarks[category] || 0;
    const percentage = (currentMarks / 100) * 100;
    const remaining = 100 - currentMarks;
    
    let status = 'available';
    if (currentMarks >= 100) {
      status = 'ready';
    } else if (currentMarks >= 80) {
      status = 'warning';
    }
    
    return {
      currentMarks,
      percentage,
      remaining,
      status
    };
  };

  const handleUpdateConfig = async () => {
    try {
      const response = await updateConfig(config);
      if (response.data.success) {
        showNotification('Configuration updated successfully!');
        loadAllData();
      }
    } catch (error) {
      showNotification('Error updating configuration', 'error');
    }
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

    const categoryStatus = getCategoryStatus(questionData.category);
    if (categoryStatus.currentMarks + questionData.marks > 100) {
      showNotification(`Cannot add question. ${questionData.category.toUpperCase()} category already has ${categoryStatus.currentMarks}/100 marks. Only ${categoryStatus.remaining} marks remaining.`, 'error');
      return;
    }

    try {
      const response = await addQuestion({
        ...questionData,
        options: validOptions
      });
      
      if (response.data.success) {
        showNotification('✅ Question added successfully!');
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
        loadDashboardStats();
      } else {
        showNotification('Failed to add question: ' + response.data.message, 'error');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      showNotification('Error adding question. Please try again.', 'error');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await deleteQuestion(questionId);
        if (response.data.success) {
          showNotification('✅ Question deleted successfully!');
          loadQuestions();
          loadDashboardStats();
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        showNotification('Error deleting question', 'error');
      }
    }
  };

  const handleDeleteResult = async (resultId, studentName) => {
    if (window.confirm(`Are you sure you want to delete result of ${studentName}?`)) {
      try {
        const response = await deleteResult(resultId);
        if (response.data.success) {
          showNotification(`✅ Result deleted successfully!`);
          loadResults();
        }
      } catch (error) {
        console.error('Error deleting result:', error);
        showNotification('Error deleting result', 'error');
      }
    }
  };

  const handleDeleteAllResults = async () => {
    if (results.length === 0) {
      showNotification('No results to delete', 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ALL ${results.length} results? This action cannot be undone!`)) {
      try {
        const response = await deleteAllResults();
        if (response.data.success) {
          showNotification(`✅ All results deleted successfully! (${results.length} results removed)`);
          loadResults();
        }
      } catch (error) {
        console.error('Error deleting all results:', error);
        showNotification('Error deleting all results', 'error');
      }
    }
  };

  const addOptionField = () => {
    if (questionData.options.length < 6) {
      setQuestionData({
        ...questionData,
        options: [...questionData.options, { text: '', isCorrect: false }]
      });
    } else {
      showNotification('Maximum 6 options allowed', 'warning');
    }
  };

  const removeOptionField = (index) => {
    if (questionData.options.length > 2) {
      const newOptions = questionData.options.filter((_, i) => i !== index);
      setQuestionData({
        ...questionData,
        options: newOptions
      });
    } else {
      showNotification('Minimum 2 options required', 'warning');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterResults = () => {
    if (!searchTerm.trim()) {
      setFilteredResults(results);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = results.filter(result => {
      const percentage = parseFloat(result.percentage) || 0;
      const passed = percentage >= config.passingPercentage;
      const statusText = passed ? 'pass' : 'fail';
      
      return (
        result.name.toLowerCase().includes(term) ||
        result.rollNumber.toLowerCase().includes(term) ||
        result.category.toLowerCase().includes(term) ||
        statusText.includes(term) ||
        (passed ? 'passed' : 'failed').includes(term)
      );
    });
    
    setFilteredResults(filtered);
  };

  const exportResults = () => {
    if (filteredResults.length === 0) {
      showNotification('No results to export', 'warning');
      return;
    }
    
    const csv = [
      ['Name', 'Roll Number', 'Category', 'Score', 'Total Questions', 'Percentage', 'Status', 'Pass/Fail', 'Date'],
      ...filteredResults.map(r => {
        const percentage = parseFloat(r.percentage) || 0;
        const passed = percentage >= config.passingPercentage;
        return [
          r.name,
          r.rollNumber,
          r.category,
          r.score,
          r.totalQuestions || 100,
          `${percentage.toFixed(2)}%`,
          passed ? 'PASSED' : 'FAILED',
          passed ? 'PASS' : 'FAIL',
          formatDate(r.createdAt)
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportQuestions = () => {
    if (questions.length === 0) {
      showNotification('No questions to export', 'warning');
      return;
    }
    
    const csv = [
      ['Category', 'Question', 'Options', 'Correct Answer', 'Marks', 'Difficulty'],
      ...questions.map(q => [
        q.category,
        q.questionText,
        q.options.map(opt => opt.text).join(' | '),
        q.options.find(opt => opt.isCorrect)?.text || '',
        q.marks || 1,
        q.difficulty || 'medium'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-questions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="admin-panel">
      {/* Notification Toast */}
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

      <div className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/images.jpg" alt="Logo" className="logo" />
          <h3>Shamsi Institute</h3>
          <p>Admin Dashboard</p>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'add-questions' ? 'active' : ''}
            onClick={() => setActiveTab('add-questions')}
          >
            ➕ Add Questions
          </button>
          <button 
            className={activeTab === 'manage-questions' ? 'active' : ''}
            onClick={() => setActiveTab('manage-questions')}
          >
            📝 Manage Questions
          </button>
          <button 
            className={activeTab === 'config' ? 'active' : ''}
            onClick={() => setActiveTab('config')}
          >
            ⚙️ Configuration
          </button>
          <button 
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => setActiveTab('results')}
          >
            📈 View Results
          </button>
        </div>
        
        <div className="sidebar-footer">
          <button onClick={loadAllData} className="refresh-btn-small">
            🔄 Refresh All
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🔓 Logout
          </button>
          <div className="server-status">
            <span className="status-dot active"></span>
            <span>Server Online</span>
          </div>
        </div>
      </div>

      <div className="admin-main">
        <div className="main-header">
          <h1>Admin Control Panel</h1>
          <div className="header-actions">
            <button onClick={loadAllData} className="refresh-btn">
              🔄 Refresh All
            </button>
            {loading && <span className="loading-text">Loading...</span>}
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <h2>📊 Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{stats.totalStudents}</h3>
                    <p>Total Students</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <h3>{stats.totalAttempts}</h3>
                    <p>Quiz Attempts</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">❓</div>
                  <div className="stat-info">
                    <h3>{stats.totalQuestions}</h3>
                    <p>Total Questions</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💯</div>
                  <div className="stat-info">
                    <h3>100</h3>
                    <p>Marks per Category</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <h3>{stats.averageScore}%</h3>
                    <p>Average Score</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-info">
                    <h3>{stats.passRate}%</h3>
                    <p>Pass Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add-questions' && (
            <div className="add-questions">
              <h2>➕ Add Questions</h2>
              
              <div className="category-limits">
                <h4>📊 Category Marks Status</h4>
                <div className="limits-grid">
                  {allCategories.map((category) => {
                    const status = getCategoryStatus(category);
                    return (
                      <div key={category} className="limit-item">
                        <span className="limit-category">{category.toUpperCase()}</span>
                        <span className="limit-marks">{status.currentMarks}/100</span>
                        <div className="limit-progress">
                          <div 
                            className="limit-fill"
                            style={{ width: `${status.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="question-form">
                <form onSubmit={handleAddQuestion}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select 
                        value={questionData.category}
                        onChange={(e) => setQuestionData({...questionData, category: e.target.value})}
                      >
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.toUpperCase()} ({getCategoryStatus(cat).currentMarks}/100)
                          </option>
                        ))}
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
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select 
                        value={questionData.difficulty}
                        onChange={(e) => setQuestionData({...questionData, difficulty: e.target.value})}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Question Text</label>
                    <textarea
                      value={questionData.questionText}
                      onChange={(e) => setQuestionData({...questionData, questionText: e.target.value})}
                      placeholder="Enter question text here..."
                      rows="4"
                      required
                    />
                  </div>
                  
                  <div className="options-section">
                    <h4>Options (Mark correct answer)</h4>
                    {questionData.options.map((option, index) => (
                      <div key={index} className="option-item">
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
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...questionData.options];
                            newOptions[index].text = e.target.value;
                            setQuestionData({...questionData, options: newOptions});
                          }}
                          placeholder={`Option ${index + 1}`}
                          required={index < 2}
                        />
                        {questionData.options.length > 2 && (
                          <button 
                            type="button"
                            onClick={() => removeOptionField(index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button type="button" onClick={addOptionField} className="add-btn">
                      + Add Option
                    </button>
                  </div>
                  
                  <button type="submit" className="submit-btn">
                    💾 Add Question
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'manage-questions' && (
            <div className="manage-questions">
              <h2>📝 Manage Questions</h2>
              
              <div className="actions-bar">
                <button onClick={exportQuestions} className="export-btn">
                  📤 Export Questions
                </button>
              </div>
              
              <div className="questions-list">
                {questions.length === 0 ? (
                  <p className="no-data">No questions available</p>
                ) : (
                  questions.map((question, index) => (
                    <div key={question._id || index} className="question-card">
                      <div className="question-header">
                        <span className="category-badge">{question.category}</span>
                        <span className="marks-badge">{question.marks} marks</span>
                        <span className="difficulty-badge">{question.difficulty}</span>
                      </div>
                      <p className="question-text">{question.questionText}</p>
                      <div className="options-list">
                        {question.options.map((opt, idx) => (
                          <div key={idx} className={`option ${opt.isCorrect ? 'correct' : ''}`}>
                            {opt.text}
                            {opt.isCorrect && <span className="correct-mark">✓</span>}
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleDeleteQuestion(question._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="config-page">
              <h2>⚙️ Quiz Configuration</h2>
              
              <div className="config-form">
                <div className="form-group">
                  <label>Quiz Time (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={config.quizTime}
                    onChange={(e) => setConfig({...config, quizTime: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Passing Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.passingPercentage}
                    onChange={(e) => setConfig({...config, passingPercentage: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Questions per Quiz</label>
                  <input
                    type="number"
                    min="1"
                    value={config.totalQuestions}
                    onChange={(e) => setConfig({...config, totalQuestions: parseInt(e.target.value)})}
                  />
                </div>
                
                <button onClick={handleUpdateConfig} className="save-btn">
                  💾 Save Configuration
                </button>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="results-page">
              <h2>📈 Quiz Results</h2>
              
              <div className="results-header">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by name, roll number, category, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                <div className="action-buttons">
                  <button onClick={exportResults} className="export-btn">
                    📤 Export CSV
                  </button>
                  <button onClick={handleDeleteAllResults} className="delete-all-btn">
                    🗑️ Delete All
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
                      <th>Total</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => {
                      const percentage = parseFloat(result.percentage) || 0;
                      const passed = percentage >= config.passingPercentage;
                      const statusText = passed ? '✅ PASS' : '❌ FAIL';
                      const statusClass = passed ? 'status-passed' : 'status-failed';
                      
                      return (
                        <tr key={result._id || index} className={passed ? 'passed-row' : 'failed-row'}>
                          <td>{result.name}</td>
                          <td>{result.rollNumber}</td>
                          <td>
                            <span className="category-tag">{result.category.toUpperCase()}</span>
                          </td>
                          <td>
                            <strong>{result.score}</strong>
                          </td>
                          <td>{result.totalQuestions || 100}</td>
                          <td>
                            <span className={`percentage-display ${passed ? 'percentage-pass' : 'percentage-fail'}`}>
                              {percentage.toFixed(2)}%
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${statusClass}`}>
                              {statusText}
                            </span>
                          </td>
                          <td>{formatDate(result.createdAt)}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteResult(result._id, result.name)}
                              className="delete-btn-small"
                              title="Delete Result"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredResults.length === 0 && (
                  <div className="no-data">
                    <p>No results found</p>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="clear-search-btn"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;