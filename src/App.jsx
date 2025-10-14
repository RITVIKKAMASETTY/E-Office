import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute'; 
import Map from './components/Map'; // Adjust path as needed
// import { BrowserRouter as Router } from 'react-router-dom';
// import Landing from './pages/Landing';
// import { Routes, Route } from 'react-router-dom';
// import Login from './pages/Login';
// import TeamLeadDashboard from './components/teamlead/TeamLead';
// import EmployeeDashboard from './components/employee/EmployeeDashboard';
// import ManagerDashboard from './pages/Manager'
// import AdminDashboard from './components/admin/Admin';


// export default function App() {
//   return (
//     <Router>
//       <div className="min-h-screen flex flex-col">
//         <Routes>
//           <Route path="/" element={<Landing />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/dashboard/teamlead" element={<TeamLeadDashboard />} />
//           {/* Add other dashboard routes as needed */}
//           <Route path="/dashboard/manager" element={<ManagerDashboard />} />
//           <Route path="/dashboard/admin" element={<AdminDashboard />} />
        
//           <Route path="/dashboard/manager" element={<div>Manager Dashboard</div>} />

//           <Route path="/dashboard/member" element={<EmployeeDashboard />} />
//           <Route path="/dashboard" element={<div>Default Dashboard</div>} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }




import Landing from './pages/Landing';
import Login from './pages/Login';
import TeamLeadDashboard from './components/teamlead/TeamLead';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import ManagerDashboard from './pages/Manager'
import AdminDashboard from './components/admin/Admin';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Require authentication */}
        <Route 
          path="/dashboard/teamlead" 
          element={
            <ProtectedRoute allowedRoles={['teamleader', 'Team Leader']}>
              <TeamLeadDashboard />
            </ProtectedRoute>
          } 
        />
      <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />  
        
        
        <Route 
          path="/dashboard/member" 
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/manager" 
          element={
            <ProtectedRoute allowedRoles={['manager', 'Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Root route - Landing page */}
        <Route path="/" element={<Landing />} />
        <Route path="/maps" element={<Map/>} />
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
