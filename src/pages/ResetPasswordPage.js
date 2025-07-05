import React from 'react';
import { Form, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

function ResetPasswordPage() {
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    // Handle reset password logic here
  };

  return (
    <AuthForm
      title="选择新密码"
      onFinish={onFinish}
      footerContent={
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login">返回登录</Link>
        </div>
      }
    >
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入新密码' }]}
      >
        <Input.Password placeholder="新密码" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        hasFeedback
        rules={[
          { required: true, message: '请确认新密码' },
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
        <Input.Password placeholder="确认新密码" />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        重置密码
      </Button>
    </AuthForm>
  );
}

export default ResetPasswordPage;