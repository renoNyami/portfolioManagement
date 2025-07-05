import React from 'react';
import { Form, Card, Typography } from 'antd';

const { Title } = Typography;

function AuthForm({ title, children, footerContent, onFinish }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: 400, padding: '20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</Title>
        <Form layout="vertical" onFinish={onFinish}>
          {children}
        </Form>
        {footerContent}
      </Card>
    </div>
  );
}

export default AuthForm;