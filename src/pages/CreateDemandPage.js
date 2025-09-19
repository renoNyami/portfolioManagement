import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, DatePicker, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { TextArea } = Input;

function CreateDemandPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/demands', values, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('需求发布成功！');
      navigate(`/demands/${response.data.id}`);
    } catch (error) {
      message.error('发布需求失败：' + (error.response?.data?.msg || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>发布新需求</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="title"
            label="需求标题"
            rules={[{ required: true, message: '请输入需求标题' }]}
          >
            <Input placeholder="简要描述您的需求" />
          </Form.Item>

          <Form.Item
            name="description"
            label="详细描述"
            rules={[{ required: true, message: '请输入详细描述' }]}
          >
            <TextArea 
              placeholder="详细描述您的需求，包括功能要求、技术栈偏好等" 
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="budget"
            label="预算 ($)"
            rules={[{ required: true, message: '请输入预算' }]}
          >
            <InputNumber 
              placeholder="预算金额" 
              style={{ width: '100%' }}
              min={0}
              step={10}
            />
          </Form.Item>

          <Form.Item
            name="skills"
            label="所需技能 (用逗号分隔)"
          >
            <Input placeholder="例如: React, Node.js, Python" />
          </Form.Item>

          <Form.Item
            name="deadline"
            label="期望完成时间"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              发布需求
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateDemandPage;