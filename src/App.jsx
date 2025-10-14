import { BrowserRouter as Router } from 'react-router-dom';
import Landing from './pages/Landing';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TeamLeadDashboard from './components/teamlead/TeamLead';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import ManagerDashboard from './pages/Manager';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/teamlead" element={<TeamLeadDashboard />} />
          {/* Add other dashboard routes as needed */}
          <Route path="/dashboard/admin" element={<div>Admin Dashboard</div>} />
          <Route path="/dashboard/manager" element={<ManagerDashboard />} />
          <Route path="/dashboard/member" element={<EmployeeDashboard />} />
          <Route path="/dashboard" element={<div>Default Dashboard</div>} />
        </Routes>
      </div>
    </Router>
  );
}
