import React from 'react';
import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

function ForgotPasswordPage() {
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    // Handle forgot password logic here
  };

  return (
    <AuthForm
      title="忘记密码"
      onFinish={onFinish}
      footerContent={
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login">返回登录</Link>
        </div>
      }
    >
      <Form.Item
        name="email"
        rules={[{ required: true, message: '请输入邮箱地址' }]}
      >
        <Input placeholder="邮箱地址" />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        重置密码
      </Button>
    </AuthForm>
  );
}

export default ForgotPasswordPage;