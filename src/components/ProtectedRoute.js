import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // 检查是否存在token

  if (!isAuthenticated) {
    // 如果未认证，重定向到登录页面
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
