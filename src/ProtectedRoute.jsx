import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Check if user is authenticated
  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role (if specified)
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedUserRole = userRole?.toLowerCase().trim();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());
    
    // Handle "Team Leader" special case
    const userRoleForCheck = userRole === "Team Leader" ? "teamleader" : normalizedUserRole;
    
    if (!normalizedAllowedRoles.includes(userRoleForCheck)) {
      // Redirect to appropriate dashboard based on role
      const roleRoutes = {
        admin: "/dashboard/admin",
        manager: "/dashboard/manager",
        member: "/dashboard/member",
        teamleader: "/dashboard/teamlead",
      };
      
      return <Navigate to={roleRoutes[userRoleForCheck] || "/login"} replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;