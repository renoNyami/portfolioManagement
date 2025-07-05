import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

function RegisterPage() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
  try {
    // 移除确认密码字段
    const { confirmPassword, ...dataToSend } = values;
    
    // 添加username字段（使用邮箱前缀）
    dataToSend.username = values.email.split('@')[0];

    const response = await axios.post('http://localhost:5000/api/auth/register', dataToSend, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      message.success(response.data.message);
      navigate('/login', { state: { email: values.email } });
    } else {
      message.error(response.data.message || '注册失败');
    }
  } catch (error) {
    console.error('Registration error details:', {
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorMsg = error.response?.data?.message 
      || error.response?.data?.error 
      || '注册失败，请稍后重试';
    
    message.error(errorMsg);
  }
};

  return (
    <AuthForm
      title="注册"
      onFinish={onFinish}
      footerContent={
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          已有账号？ <Link to="/login">立即登录</Link>
        </div>
      }
    >
      <Form.Item
        name="email"
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

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        hasFeedback
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致！'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="确认密码" />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        注册
      </Button>
    </AuthForm>
  );
}

export default RegisterPage;