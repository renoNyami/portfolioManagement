import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import './App.css';

// 导入页面组件
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';
import PortfolioPage from './pages/PortfolioPage';
import DashboardPage from './pages/DashboardPage';
import Sidebar from './components/Sidebar'; // 导入侧边栏组件
import ProtectedRoute from './components/ProtectedRoute'; // 导入ProtectedRoute组件

const { Header, Content } = Layout;

function App() {

  return (
    <Router>
      <Routes>
        {/* 认证相关的路由，不显示侧边栏 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 登录后的路由，显示侧边栏 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
            <Layout style={{ minHeight: '100vh' }}>
              <Sidebar />
              <Layout className="site-layout">

                <Content style={{ margin: '0 16px' }}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile-settings" element={<ProfileSettingsPage />} />
                    <Route path="/project-settings" element={<ProjectSettingsPage />} />
                    <Route path="/portfolio/:userId" element={<PortfolioPage />} />
                    {/* 默认重定向到仪表盘或个人资料页 */}
                    <Route path="*" element={<DashboardPage />} />
                  </Routes>
                </Content>
              </Layout>
            </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;