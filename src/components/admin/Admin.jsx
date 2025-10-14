import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Eye, EyeOff, LogOut, Users, Building, ClipboardList, Menu, X } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_URL;

  // Roles State
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [showRoleForm, setShowRoleForm] = useState(false);

  // Departments State
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState({ name: '', location: '' });
  const [showDeptForm, setShowDeptForm] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    status: 'pending'
  });
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Get token and user data from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('userData');
    
    if (!token) {
      setError('No authentication token found. Please login again.');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }
    
    setAuthToken(token);
    
    if (userDataStr) {
      try {
        setUserData(JSON.parse(userDataStr));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // Fetch Roles
  const fetchRoles = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/roles/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch roles');
      }
      const data = await res.json();
      setRoles(data);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('login again')) {
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create Role
  const handleCreateRole = async () => {
    if (!newRole.trim()) {
      setError('Role name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/roles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newRole })
      });
      if (!res.ok) throw new Error('Failed to create role');
      await res.json();
      setSuccess('Role created successfully');
      setNewRole('');
      setShowRoleForm(false);
      fetchRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/departments/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch departments');
      }
      const data = await res.json();
      setDepartments(data);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('login again')) {
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create Department
  const handleCreateDepartment = async () => {
    if (!newDept.name.trim() || !newDept.location.trim()) {
      setError('Department name and location are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/departments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDept)
      });
      if (!res.ok) throw new Error('Failed to create department');
      await res.json();
      setSuccess('Department created successfully');
      setNewDept({ name: '', location: '' });
      setShowDeptForm(false);
      fetchDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch tasks');
      }
      const data = await res.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError(err.message);
      if (err.message.includes('login again')) {
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create Task
  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.assigned_to || !newTask.due_date) {
      setError('Title, assigned department, and due date are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });
      if (!res.ok) throw new Error('Failed to create task');
      await res.json();
      setSuccess('Task created successfully');
      setNewTask({ title: '', description: '', assigned_to: '', due_date: '', status: 'pending' });
      setShowTaskForm(false);
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Task
  const handleUpdateTask = async () => {
    if (!editingTaskId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${editingTaskId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });
      if (!res.ok) throw new Error('Failed to update task');
      await res.json();
      setSuccess('Task updated successfully');
      setEditingTaskId(null);
      setNewTask({ title: '', description: '', assigned_to: '', due_date: '', status: 'pending' });
      setShowTaskForm(false);
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setSuccess('Task deleted successfully');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit Task
  const handleEditTask = (task) => {
    setNewTask(task);
    setEditingTaskId(task.id);
    setShowTaskForm(true);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Load initial data when token is available
  useEffect(() => {
    if (authToken) {
      fetchRoles();
      fetchDepartments();
      fetchTasks();
    }
  }, [authToken]);

  // Navigation items
  const navItems = [
    { id: 'tasks', label: 'Task Management', icon: ClipboardList, count: tasks.length },
    { id: 'departments', label: 'Departments', icon: Building, count: departments.length },
    { id: 'roles', label: 'User Roles', icon: Users, count: roles.length }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-['Noto_Sans',_sans-serif]">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#004A9F] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F2937]">KaryaMitra</h1>
                <p className="text-xs text-gray-500">Admin Management Portal</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#004A9F] to-[#00A3C4] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userData?.name?.charAt(0) || userData?.username?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1F2937] truncate">
                  {userData?.name || userData?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-[#004A9F] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#004A9F]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === item.id
                      ? 'bg-white text-[#004A9F]'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-[#004A9F]"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-[#1F2937]">
                {navItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
            
            {/* Stats Overview */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#004A9F]">{tasks.length}</div>
                <div className="text-xs text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00A3C4]">{departments.length}</div>
                <div className="text-xs text-gray-500">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FACC15]">{roles.length}</div>
                <div className="text-xs text-gray-500">User Roles</div>
              </div>
            </div>
          </div>
        </header>

        {/* Alerts */}
        <div className="flex-1 overflow-auto">
          {success && (
            <div className="mx-4 mt-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  {success}
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mx-4 mt-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A9F]"></div>
              </div>
            )}

            {/* Tasks Section */}
            {activeTab === 'tasks' && !loading && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                   
                    <p className="text-gray-600 mt-1">Manage and track all organizational tasks</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTaskForm(true);
                      setEditingTaskId(null);
                      setNewTask({ title: '', description: '', assigned_to: '', due_date: '', status: 'pending' });
                    }}
                    className="flex items-center gap-3 bg-[#004A9F] text-white px-6 py-3 rounded-xl hover:bg-[#003882] shadow-lg transition-all duration-200"
                  >
                    <Plus size={20} />
                    <span className="font-semibold">New Task</span>
                  </button>
                </div>

                {/* Task Form Modal */}
                {showTaskForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-[#1F2937]">
                          {editingTaskId ? 'Edit Task' : 'Create New Task'}
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                          <input
                            type="text"
                            placeholder="Enter task title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004A9F] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            placeholder="Enter task description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            rows="4"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004A9F] focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Department</label>
                            <select
                              value={newTask.assigned_to}
                              onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004A9F] focus:border-transparent"
                            >
                              <option value="">Select Department</option>
                              {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                              value={newTask.status}
                              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004A9F] focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                          <input
                            type="datetime-local"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004A9F] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                        <button
                          onClick={editingTaskId ? handleUpdateTask : handleCreateTask}
                          className="bg-[#004A9F] text-white px-6 py-3 rounded-xl hover:bg-[#003882] font-semibold transition-all duration-200"
                        >
                          {editingTaskId ? 'Update Task' : 'Create Task'}
                        </button>
                        <button
                          onClick={() => setShowTaskForm(false)}
                          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 font-semibold transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tasks Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tasks.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <ClipboardList size={64} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                      <p className="text-gray-600 mb-6">Get started by creating your first task</p>
                      <button
                        onClick={() => setShowTaskForm(true)}
                        className="bg-[#004A9F] text-white px-6 py-3 rounded-xl hover:bg-[#003882] font-semibold"
                      >
                        Create Task
                      </button>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-[#1F2937] truncate flex-1 mr-3">{task.title}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-[#004A9F] hover:text-[#003882] transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-500">Department</span>
                              <span className="text-sm font-semibold text-[#00A3C4]">{task.assigned_to}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-500">Due Date</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-500">Status</span>
                              {getStatusBadge(task.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Departments Section */}
            {activeTab === 'departments' && !loading && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                   
                    <p className="text-gray-600 mt-1">Manage organizational departments and locations</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeptForm(true);
                      setNewDept({ name: '', location: '' });
                    }}
                    className="flex items-center gap-3 bg-[#00A3C4] text-white px-6 py-3 rounded-xl hover:bg-[#0089a8] shadow-lg transition-all duration-200"
                  >
                    <Plus size={20} />
                    <span className="font-semibold">New Department</span>
                  </button>
                </div>

                {/* Department Form Modal */}
                {showDeptForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-[#1F2937]">Create New Department</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                          <input
                            type="text"
                            placeholder="Enter department name"
                            value={newDept.name}
                            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00A3C4] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            placeholder="Enter location"
                            value={newDept.location}
                            onChange={(e) => setNewDept({ ...newDept, location: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00A3C4] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                        <button
                          onClick={handleCreateDepartment}
                          className="bg-[#00A3C4] text-white px-6 py-3 rounded-xl hover:bg-[#0089a8] font-semibold transition-all duration-200"
                        >
                          Create Department
                        </button>
                        <button
                          onClick={() => setShowDeptForm(false)}
                          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 font-semibold transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {departments.map(dept => (
                    <div key={dept.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#00A3C4] to-[#004A9F] rounded-xl flex items-center justify-center">
                          <Building className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[#1F2937]">{dept.name}</h3>
                          <p className="text-gray-600 text-sm flex items-center gap-1">
                            <span>📍</span>
                            {dept.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roles Section */}
            {activeTab === 'roles' && !loading && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                   
                    <p className="text-gray-600 mt-1">Manage system access roles and permissions</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRoleForm(true);
                      setNewRole('');
                    }}
                    className="flex items-center gap-3 bg-[#FACC15] text-gray-900 px-6 py-3 rounded-xl hover:bg-[#e6b800] shadow-lg transition-all duration-200"
                  >
                    <Plus size={20} />
                    <span className="font-semibold">New Role</span>
                  </button>
                </div>

                {/* Role Form Modal */}
                {showRoleForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-[#1F2937]">Create New Role</h3>
                      </div>
                      <div className="p-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                          <input
                            type="text"
                            placeholder="Enter role name"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                        <button
                          onClick={handleCreateRole}
                          className="bg-[#FACC15] text-gray-900 px-6 py-3 rounded-xl hover:bg-[#e6b800] font-semibold transition-all duration-200"
                        >
                          Create Role
                        </button>
                        <button
                          onClick={() => setShowRoleForm(false)}
                          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 font-semibold transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {roles.map(role => (
                    <div key={role.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#FACC15] to-[#FFD700] rounded-xl flex items-center justify-center">
                          <Users className="text-gray-900" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[#1F2937]">{role.name}</h3>
                          <p className="text-gray-500 text-sm">Role ID: {role.id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;