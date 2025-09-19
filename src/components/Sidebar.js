import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  ProjectOutlined,
  DashboardOutlined,
  TeamOutlined,
  RobotOutlined,
  ShoppingOutlined,
  WalletOutlined
} from '@ant-design/icons';

const { SubMenu } = Menu;
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
        <Menu.Item key="4" icon={<TeamOutlined />}>
          <Link to="/users">用户列表</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<ProjectOutlined />}>
          <Link to="/my-projects">我的项目</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<TeamOutlined />}>
          <Link to="/community">社区讨论</Link>
        </Menu.Item>
        <SubMenu key="ai" icon={<RobotOutlined />} title="AI功能">
          <Menu.Item key="7">
            <Link to="/ai-project-generator">创建AI项目</Link>
          </Menu.Item>
          <Menu.Item key="7.1">
            <Link to="/ai-projects">我的AI项目</Link>
          </Menu.Item>
        </SubMenu>
        
        {/* 新增的交易平台菜单 */}
        <SubMenu key="marketplace" icon={<ShoppingOutlined />} title="交易平台">
          <Menu.Item key="8">
            <Link to="/demands">需求市场</Link>
          </Menu.Item>
          <Menu.Item key="9">
            <Link to="/demands/create">发布需求</Link>
          </Menu.Item>
          <Menu.Item key="10">
            <Link to="/orders">我的订单</Link>
          </Menu.Item>
          <Menu.Item key="11">
            <Link to="/marketplace">项目市场</Link>
          </Menu.Item>
          <Menu.Item key="12">
            <Link to="/marketplace/create">发布项目</Link>
          </Menu.Item>
          <Menu.Item key="13">
            <Link to="/transactions">交易记录</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="14" icon={<WalletOutlined />}>
          <Link to="/wallet">我的钱包</Link>
        </Menu.Item>
        
        <Menu.Item key="15">
          <Button type="link" onClick={handleLogout} style={{ padding: 0 }}>退出登录</Button>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}