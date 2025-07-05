import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  ProjectOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <Sider width={200} className="site-layout-background">
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/dashboard">主页</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />}>
          <Link to="/profile-settings">个人资料</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<ProjectOutlined />}>
          <Link to="/project-settings">项目管理</Link>
        </Menu.Item>
        <Menu.Item key="4">
          <Button type="link" onClick={handleLogout} style={{ padding: 0 }}>退出登录</Button>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}