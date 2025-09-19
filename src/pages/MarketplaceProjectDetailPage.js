import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tag, message, Modal, Form, InputNumber } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const { Title, Paragraph } = Typography;

function MarketplaceProjectDetailPage() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { projectId } = useParams();

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/marketplace/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProject(response.data);
      setLoading(false);
    } catch (error) {
      message.error('获取项目详情失败');
      setLoading(false);
    }
  };

  const handlePurchase = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/transactions', {
        projectId: project.id
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('购买成功！项目文件将发送到您的邮箱。');
      setIsModalVisible(false);
      form.resetFields();
      navigate('/transactions');
    } catch (error) {
      message.error('购买失败：' + (error.response?.data?.msg || '未知错误'));
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>;
  }

  if (!project) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>未找到项目</div>;
  }

  const isOwnProject = project.userId === localStorage.getItem('userId');

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        返回
      </Button>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2}>{project.name}</Title>
            <Tag color="blue">价格: ${project.price}</Tag>
            <Tag color={
              project.status === 'draft' ? 'orange' : 
              project.status === 'published' ? 'green' : 
              project.status === 'sold' ? 'purple' : 'red'
            }>
              {project.status === 'draft' ? '草稿' : 
               project.status === 'published' ? '已发布' : 
               project.status === 'sold' ? '已售出' : '已归档'}
            </Tag>
            {project.category && <Tag color="cyan">{project.category}</Tag>}
          </div>
          {!isOwnProject && project.status === 'published' && (
            <Button type="primary" onClick={showModal}>
              立即购买
            </Button>
          )}
        </div>

        <Paragraph style={{ marginTop: '16px' }}>
          <strong>项目描述：</strong>
          {project.description}
        </Paragraph>

        <div style={{ marginTop: '16px' }}>
          <p><strong>发布者：</strong> {project.User?.username}</p>
          <p><strong>发布时间：</strong> {new Date(project.createdAt).toLocaleString()}</p>
          {project.demoUrl && (
            <p>
              <strong>演示地址：</strong>
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                {project.demoUrl}
              </a>
            </p>
          )}
          {project.repoUrl && (
            <p>
              <strong>源码地址：</strong>
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                {project.repoUrl}
              </a>
            </p>
          )}
          {project.tags && (
            <p>
              <strong>标签：</strong>
              {project.tags.split(',').map((tag, index) => (
                <Tag key={index} color="blue">{tag.trim()}</Tag>
              ))}
            </p>
          )}
        </div>
      </Card>

      <Modal
        title="确认购买"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <p>您将购买项目 <strong>{project.name}</strong>，价格为 <strong>${project.price}</strong>。</p>
        <p>购买后，项目文件将发送到您的邮箱。</p>
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePurchase}
        >
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认支付
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MarketplaceProjectDetailPage;