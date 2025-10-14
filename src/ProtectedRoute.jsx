import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Check if user is authenticated
  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - allow access
  return children;
};

export default ProtectedRoute;