import React, { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, Plus, AlertCircle, CheckCircle, Clock, Settings } from 'lucide-react';
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
  const [previewDoc, setPreviewDoc] = useState(null);

  const colors = {
    primary: '#004A9F',
    secondary: '#00A3C4',
    background: '#F5F7FA',
    accent: '#FACC15',
    text: '#1F2937',
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
    setPreviewDoc({ fileUrl, fileName });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: '#FEE2E2', text: '#DC2626', icon: Clock },
      in_progress: { bg: '#DBEAFE', text: '#2563EB', icon: Settings },
      completed: { bg: '#DCFCE7', text: '#16A34A', icon: CheckCircle },
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
        }}
      >
        <Icon size={14} />
        {status}
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

  return (
    <div
      style={{
        fontFamily: "'Noto Sans', sans-serif",
        minHeight: '100vh',
        backgroundColor: colors.background,
        padding: '24px',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ color: colors.primary, fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
            Employee Dashboard
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '0' }}>
            Track and manage your assigned tasks
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            border: `1px solid #FCA5A5`,
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#DCFCE7',
            border: `1px solid #86EFAC`,
            borderRadius: '8px',
            color: '#16A34A',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Filter Section */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <h2 style={{ color: colors.primary, fontSize: '18px', fontWeight: '700', margin: '0' }}>
          My Tasks
        </h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid #D1D5DB`,
            fontSize: '13px',
            backgroundColor: 'white',
            color: colors.text,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Tasks with Documents */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading && !tasks.length ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
            <FileText size={40} style={{ marginBottom: '12px', opacity: '0.5' }} />
            <p>No tasks assigned yet</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                border: `1px solid #E5E7EB`,
              }}
            >
              {/* Task Header */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: '1' }}>
                    <h3 style={{ color: colors.text, fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>
                      {task.title}
                    </h3>
                    <p style={{ color: '#6B7280', fontSize: '13px', margin: '8px 0', lineHeight: '1.5' }}>
                      {task.description}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#9CA3AF', marginTop: '12px' }}>
                      <span>Sub-task: <strong>{task.sub_task}</strong></span>
                      <span>Due: <strong>{new Date(task.due_date).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '20px 0' }} />

              {/* Documents Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: colors.primary, fontSize: '15px', fontWeight: '700', margin: '0' }}>
                    Task Documents
                  </h4>
                  {isUploadDisabled(task) ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: `1px solid #FCA5A5`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      <AlertCircle size={16} />
                      Upload Blocked
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
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: colors.secondary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = colors.primary;
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = colors.secondary;
                      }}
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                  )}
                </div>

                {!documents[task.id] ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                    <p style={{ fontSize: '13px' }}>Loading documents...</p>
                  </div>
                ) : documents[task.id].length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                    <FileText size={32} style={{ marginBottom: '8px', opacity: '0.5' }} />
                    <p style={{ fontSize: '13px' }}>No documents uploaded yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {documents[task.id].map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          padding: '12px',
                          backgroundColor: '#F9FAFB',
                          border: `1px solid #E5E7EB`,
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ flex: '1', minWidth: '0' }}>
                          <p style={{ color: colors.text, fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.description}
                          </p>
                          <p style={{ color: '#9CA3AF', fontSize: '11px', margin: '0' }}>
                            {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.uploaded_by}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreviewDocument(doc.file, doc.description)}
                          style={{
                            padding: '6px 10px',
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
                            e.currentTarget.style.backgroundColor = colors.primary;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = colors.secondary;
                          }}
                        >
                          <FileText size={14} />
                          Preview
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
            zIndex: '1000',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
            }}
          >
            <h3 style={{ color: colors.primary, fontSize: '20px', fontWeight: '700', margin: '0 0 20px 0' }}>
              Upload Document
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Task: <span style={{ color: colors.secondary }}>{selectedTask?.title}</span>
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
                  padding: '10px',
                  border: `1px solid #D1D5DB`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: "'Noto Sans', sans-serif",
                  boxSizing: 'border-box',
                  minHeight: '100px',
                  resize: 'vertical',
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
                  padding: '20px',
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
                  <Upload size={24} color={colors.secondary} />
                  <span style={{ color: colors.text, fontWeight: '600', fontSize: '14px' }}>
                    Click to upload or drag and drop
                  </span>
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
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
                  backgroundColor: loading ? '#D1D5DB' : colors.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = colors.primary;
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.backgroundColor = colors.secondary;
                }}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
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
            zIndex: '1000',
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '90%',
              maxHeight: '90%',
              width: '900px',
              height: '600px',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: colors.primary, fontSize: '18px', fontWeight: '700', margin: '0' }}>
                {previewDoc.fileName}
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#F3F4F6',
                  color: colors.text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Close
              </button>
            </div>
            <div style={{ flex: '1', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src={previewDoc.fileUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;