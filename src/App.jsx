import { BrowserRouter as Router } from 'react-router-dom';
import Landing from './pages/Landing';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TeamLeadDashboard from './pages/TeamLead';

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
          <Route path="/dashboard/manager" element={<div>Manager Dashboard</div>} />
          <Route path="/dashboard/employee" element={<div>Employee Dashboard</div>} />
          <Route path="/dashboard" element={<div>Default Dashboard</div>} />
        </Routes>
      </div>
    </Router>
  );
}