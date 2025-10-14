import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [userData, setUserData] = useState(null);
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
      console.log('Admin fetching tasks from:', `${API_BASE_URL}/tasks/`);
      console.log('Admin token:', authToken);
      const res = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Admin response status:', res.status);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch tasks');
      }
      const data = await res.json();
      console.log('Admin tasks data:', data);
      setTasks(data);
      setError('');
    } catch (err) {
      console.error('Admin fetch tasks error:', err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            {userData && (
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {userData.name || userData.username} ({userData.role})
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['tasks', 'departments', 'roles'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}

        {/* Tasks Section */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
              <button
                onClick={() => {
                  setShowTaskForm(true);
                  setEditingTaskId(null);
                  setNewTask({ title: '', description: '', assigned_to: '', due_date: '', status: 'pending' });
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} /> New Task
              </button>
            </div>

            {showTaskForm && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="col-span-2 border border-gray-300 rounded px-3 py-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="col-span-2 border border-gray-300 rounded px-3 py-2"
                  />
                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="col-span-2 border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingTaskId ? handleUpdateTask : handleCreateTask}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {editingTaskId ? 'Update Task' : 'Create Task'}
                  </button>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No tasks found. {loading ? 'Loading...' : 'Create a new task to get started.'}
                      </td>
                    </tr>
                  ) : (
                    tasks.map(task => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{task.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{task.assigned_to}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(task.due_date).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Departments Section */}
        {activeTab === 'departments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
              <button
                onClick={() => {
                  setShowDeptForm(true);
                  setNewDept({ name: '', location: '' });
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} /> New Department
              </button>
            </div>

            {showDeptForm && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">Create New Department</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Department Name"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newDept.location}
                    onChange={(e) => setNewDept({ ...newDept, location: e.target.value })}
                    className="border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateDepartment}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Create Department
                  </button>
                  <button
                    onClick={() => setShowDeptForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map(dept => (
                <div key={dept.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="font-semibold text-lg text-gray-900">{dept.name}</h3>
                  <p className="text-gray-600 mt-2">Location: {dept.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roles Section */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Roles</h2>
              <button
                onClick={() => {
                  setShowRoleForm(true);
                  setNewRole('');
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} /> New Role
              </button>
            </div>

            {showRoleForm && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">Create New Role</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Role Name"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateRole}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Create Role
                  </button>
                  <button
                    onClick={() => setShowRoleForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map(role => (
                <div key={role.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                  <h3 className="font-semibold text-lg text-gray-900">{role.name}</h3>
                  <p className="text-gray-500 text-sm mt-2">ID: {role.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;