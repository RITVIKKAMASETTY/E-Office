import React, { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, Plus, AlertCircle, CheckCircle, Clock, Settings, LogOut, User, ChevronDown, Filter, Search, Bell, Menu, X } from 'lucide-react';
import empService from '../../services/empservice';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    description: '',
    file: null,
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const colors = {
    primary: '#004A9F',
    secondary: '#00A3C4',
    background: '#F5F7FA',
    accent: '#FACC15',
    text: '#1F2937',
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.getItem('userData');
      
      if (!token || !userDataStr) {
        console.error('Missing authentication data');
        window.location.href = '/login';
        return;
      }

      try {
        const parsedUser = JSON.parse(userDataStr);
        setUserData(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = '/login';
      }
    };
    checkAuth();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('department');
    window.location.href = '/login';
  };

  // Fetch employee tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await empService.getIndividualTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents for all tasks on mount
  useEffect(() => {
    if (tasks.length > 0) {
      tasks.forEach(task => {
        fetchDocuments(task.id);
      });
    }
  }, [tasks.length]);

  const fetchDocuments = async (taskId) => {
    try {
      const data = await empService.getDocumentsByTask(taskId);
      setDocuments(prev => ({ ...prev, [taskId]: data }));
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedTask) {
      setError('Please select a task first');
      return;
    }

    // Check if due date has passed
    const dueDate = new Date(selectedTask.due_date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (currentDate > dueDate) {
      setError('Cannot upload document. The task due date has passed.');
      return;
    }

    if (!uploadData.file) {
      setError('Please select a file');
      return;
    }

    if (!uploadData.description.trim()) {
      setError('Please add a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('taskTitle', selectedTask.title);
      formData.append('file', uploadData.file);
      formData.append('description', uploadData.description);

      await empService.uploadDocument(formData);
      setSuccessMsg('Document uploaded successfully!');
      setUploadData({ description: '', file: null });
      setShowUploadModal(false);

      setTimeout(() => setSuccessMsg(null), 3000);
      fetchDocuments(selectedTask.id);
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setLoading(true);
    setError(null);

    try {
      await empService.updateTask(taskId, { status: newStatus });
      setSuccessMsg('Task status updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = (fileUrl, fileName) => {
    console.log('Opening document:', fileUrl);
    
    if (!fileUrl || fileUrl.trim() === '') {
      setError('Invalid document URL');
      return;
    }

    const url = fileUrl.startsWith('http') ? fileUrl : `https://${fileUrl}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: '#FEF3C7', text: '#92400E', icon: Clock },
      in_progress: { bg: '#DBEAFE', text: '#1E40AF', icon: Settings },
      completed: { bg: '#D1FAE5', text: '#065F46', icon: CheckCircle },
    };

    const statusData = statusMap[status] || { bg: '#F3F4F6', text: '#6B7280', icon: AlertCircle };
    const Icon = statusData.icon;

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: statusData.bg,
          color: statusData.text,
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'capitalize',
          border: `1px solid ${statusData.text}20`,
        }}
      >
        <Icon size={14} />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const isUploadDisabled = (task) => {
    const dueDate = new Date(task.due_date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return currentDate > dueDate;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    
    return { total, completed, inProgress, pending };
  };

  const stats = getTaskStats();

  return (
    <div
      style={{
        fontFamily: "'Noto Sans', sans-serif",
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '280px',
          backgroundColor: 'white',
          borderRight: '1px solid #E5E7EB',
          padding: '24px',
          display: sidebarOpen ? 'block' : 'none',
          position: 'fixed',
          height: '100vh',
          zIndex: 40,
          overflowY: 'auto',
        }}
        className="sidebar"
      >
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: colors.primary, fontSize: '24px', fontWeight: '700', margin: '0' }}>
            TaskFlow
          </h2>
          <p style={{ color: '#6B7280', fontSize: '12px', margin: '4px 0 0 0' }}>
            Employee Portal
          </p>
        </div>

        <nav>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dashboard
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: colors.primary,
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                <FileText size={18} />
                My Tasks
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: '1', 
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
      }}>
        {/* Top Navigation */}
        <header
          style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #E5E7EB',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'white',
                cursor: 'pointer',
                color: colors.text,
              }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '300px',
                  backgroundColor: colors.background,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: 'white',
              cursor: 'pointer',
              color: colors.text,
              position: 'relative',
            }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                backgroundColor: '#EF4444',
                borderRadius: '50%',
              }}></span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', backgroundColor: colors.background, borderRadius: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: colors.text }}>
                  {userData?.name || userData?.email || 'User'}
                </p>
                <p style={{ margin: '0', fontSize: '12px', color: '#6B7280' }}>
                  Employee
                </p>
              </div>
              <ChevronDown size={16} color="#6B7280" />
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#FEE2E2';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#FEF2F2';
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ padding: '32px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: colors.text, fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
              Task Dashboard
            </h1>
            <p style={{ color: '#6B7280', fontSize: '16px', margin: '0' }}>
              Manage your assigned tasks and documents
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '600' }}>Total Tasks</p>
                  <p style={{ color: colors.text, fontSize: '32px', margin: '0', fontWeight: '700' }}>{stats.total}</p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: `${colors.primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText size={24} color={colors.primary} />
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '600' }}>Completed</p>
                  <p style={{ color: '#065F46', fontSize: '32px', margin: '0', fontWeight: '700' }}>{stats.completed}</p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle size={24} color="#065F46" />
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '600' }}>In Progress</p>
                  <p style={{ color: '#1E40AF', fontSize: '32px', margin: '0', fontWeight: '700' }}>{stats.inProgress}</p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Settings size={24} color="#1E40AF" />
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '600' }}>Pending</p>
                  <p style={{ color: '#92400E', fontSize: '32px', margin: '0', fontWeight: '700' }}>{stats.pending}</p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock size={24} color="#92400E" />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#FEF2F2',
                border: `1px solid #FECACA`,
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#D1FAE5',
                border: `1px solid #A7F3D0`,
                borderRadius: '8px',
                color: '#065F46',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <CheckCircle size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tasks Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}>
            {/* Tasks Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: colors.text, fontSize: '20px', fontWeight: '700', margin: '0' }}>
                My Tasks
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: colors.background, borderRadius: '8px' }}>
                  <Filter size={16} color={colors.text} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: colors.text,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div style={{ padding: '8px' }}>
              {loading && !tasks.length ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', border: `3px solid ${colors.background}`, borderTop: `3px solid ${colors.primary}`, borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600' }}>Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                  <FileText size={48} style={{ marginBottom: '16px', opacity: '0.5' }} />
                  <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No tasks found</p>
                  <p style={{ fontSize: '14px' }}>You don't have any tasks assigned yet.</p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '24px',
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: '1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '700', margin: '0' }}>
                            {task.title}
                          </h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                          {task.description}
                        </p>
                        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#6B7280' }}>
                          <span>Sub-task: <strong style={{ color: colors.text }}>{task.sub_task}</strong></span>
                          <span>Due: <strong style={{ color: colors.text }}>{new Date(task.due_date).toLocaleDateString()}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', margin: '0' }}>
                          Documents ({documents[task.id]?.length || 0})
                        </h4>
                        {isUploadDisabled(task) ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 16px',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: `1px solid #FECACA`,
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            <AlertCircle size={16} />
                            Upload Disabled
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowUploadModal(true);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 16px',
                              backgroundColor: colors.primary,
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#003882';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = colors.primary;
                            }}
                          >
                            <Upload size={16} />
                            Upload Document
                          </button>
                        )}
                      </div>

                      {!documents[task.id] ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                          <p style={{ fontSize: '13px' }}>Loading documents...</p>
                        </div>
                      ) : documents[task.id].length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', backgroundColor: colors.background, borderRadius: '8px' }}>
                          <FileText size={24} style={{ marginBottom: '8px', opacity: '0.5' }} />
                          <p style={{ fontSize: '13px' }}>No documents uploaded yet</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                          {documents[task.id].map((doc) => (
                            <div
                              key={doc.id}
                              style={{
                                padding: '16px',
                                backgroundColor: colors.background,
                                border: `1px solid #E5E7EB`,
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ flex: '1', minWidth: '0' }}>
                                <p style={{ color: colors.text, fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {doc.description}
                                </p>
                                <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '0' }}>
                                  {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.uploaded_by}
                                </p>
                              </div>
                              <button
                                onClick={() => handlePreviewDocument(doc.file, doc.description)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: colors.secondary,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  marginLeft: '12px',
                                  transition: 'all 0.3s ease',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#0087A3';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = colors.secondary;
                                }}
                              >
                                <FileText size={14} />
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadData({ description: '', file: null });
                setError(null);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                padding: '8px',
                borderRadius: '4px',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = colors.background;
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ color: colors.primary, fontSize: '24px', fontWeight: '700', margin: '0 0 20px 0' }}>
              Upload Document
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Task: <span style={{ color: colors.secondary, fontWeight: '700' }}>{selectedTask?.title}</span>
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Description *
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                placeholder="Enter document description"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid #D1D5DB`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'Noto Sans', sans-serif",
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical',
                  transition: 'border-color 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Select File *
              </label>
              <div
                style={{
                  border: `2px dashed ${colors.secondary}`,
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#F0F9FC',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#E0F7FA';
                  e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F9FC';
                  e.currentTarget.style.borderColor = colors.secondary;
                }}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Upload size={32} color={colors.secondary} />
                  <span style={{ color: colors.text, fontWeight: '600', fontSize: '16px' }}>
                    Click to upload or drag and drop
                  </span>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>
                    {uploadData.file ? uploadData.file.name : 'PDF, DOC, DOCX, XLS, XLSX, TXT, PNG, JPG'}
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadData({ description: '', file: null });
                  setError(null);
                }}
                style={{
                  flex: '1',
                  padding: '12px 20px',
                  backgroundColor: '#F3F4F6',
                  color: colors.text,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#E5E7EB';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={loading}
                style={{
                  flex: '1',
                  padding: '12px 20px',
                  backgroundColor: loading ? '#D1D5DB' : colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#003882';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.backgroundColor = colors.primary;
                }}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;