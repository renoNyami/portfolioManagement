import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthForm from '../components/AuthForm';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const [githubLoading, setGithubLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', values, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error('登录失败：未收到认证令牌');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.msg || '登录失败，请稍后再试。');
    }
  };

  return (
    <AuthForm
      title="登录"
      onFinish={onFinish}
      footerContent={
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          没有账号？ <Link to="/register">立即注册</Link>
        </div>
      }
    >
      <Form.Item
        name="email"
        initialValue={initialEmail}
        rules={[{ required: true, message: '请输入邮箱地址' }]}
      >
        <Input placeholder="邮箱地址" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password placeholder="密码" />
      </Form.Item>

      <Button type="primary" htmlType="submit" block style={{ marginBottom: '10px' }}>
        登录
      </Button>

      <Button
        icon={<GithubOutlined />}
        block
        onClick={() => {
          setGithubLoading(true);
          window.location.href = 'http://localhost:5000/api/auth/github';
        }}
        loading={githubLoading}
      >
        使用 GitHub 登录
      </Button>

      <div style={{ marginTop: '10px', textAlign: 'right' }}>
        <Link to="/forgot-password">忘记密码？</Link>
      </div>
    </AuthForm>
  );
}

export default LoginPage;