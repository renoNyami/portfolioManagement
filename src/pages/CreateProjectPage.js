import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Select, InputNumber, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function CreateProjectPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/marketplace/projects', {
        ...values,
        status: isPublished ? 'published' : 'draft'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('项目创建成功！');
      navigate(`/marketplace/projects/${response.data.id}`);
    } catch (error) {
      message.error('创建项目失败：' + (error.response?.data?.msg || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>发布新项目</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <TextArea 
              placeholder="详细描述您的项目功能、特点等" 
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="售价 ($)"
            rules={[{ required: true, message: '请输入售价' }]}
          >
            <InputNumber 
              placeholder="售价" 
              style={{ width: '100%' }}
              min={0}
              step={1}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择项目分类">
              <Option value="web">Web应用</Option>
              <Option value="mobile">移动应用</Option>
              <Option value="desktop">桌面应用</Option>
              <Option value="api">API服务</Option>
              <Option value="plugin">插件</Option>
              <Option value="template">模板</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签 (用逗号分隔)"
          >
            <Input placeholder="例如: React, Node.js, MongoDB" />
          </Form.Item>

          <Form.Item
            name="demoUrl"
            label="演示地址"
          >
            <Input placeholder="项目演示地址" />
          </Form.Item>

          <Form.Item
            name="repoUrl"
            label="源码地址"
          >
            <Input placeholder="项目源码仓库地址" />
          </Form.Item>

          <Form.Item label="立即发布">
            <Switch 
              checked={isPublished} 
              onChange={setIsPublished} 
              checkedChildren="是" 
              unCheckedChildren="否" 
            />
            <span style={{ marginLeft: '8px' }}>
              {isPublished ? '项目将立即在市场中展示' : '项目将保存为草稿'}
            </span>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isPublished ? '发布项目' : '保存草稿'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateProjectPage;