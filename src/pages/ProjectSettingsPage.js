import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, List, Modal, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

function ProjectSettingsPage() {
  const [form] = Form.useForm();
  const [projects, setProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const showModal = (project = null) => {
    setEditingProject(project);
    form.setFieldsValue(project || { name: '', demoUrl: '', repoUrl: '', description: '' });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProject(null);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then(async values => {
      try {
        if (editingProject) {
          // Edit existing project
          const response = await fetch(`http://localhost:5000/api/projects/${editingProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(values),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || '更新项目失败');
          }
          const updatedProject = await response.json();
          setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
          message.success('项目更新成功！');
        } else {
          // Add new project
          const response = await fetch('http://localhost:5000/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(values),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || '添加项目失败');
          }
          const newProject = await response.json();
          setProjects([...projects, newProject]);
          message.success('项目添加成功！');
        }
        handleCancel();
      } catch (error) {
        console.error(error);
        message.error(error.message);
      }
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这个项目吗？',
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || '删除项目失败');
          }
          setProjects(projects.filter(p => p.id !== id));
          message.success('项目删除成功！');
        } catch (error) {
          console.error(error);
          message.error(error.message);
        }
      },
    });
  };

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('http://localhost:5000/api/projects/my-projects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || '获取项目失败');
        }
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error(error);
        message.error(error.message);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>项目设置</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: '20px' }}>
          添加新项目
        </Button>

        <List
          bordered
          dataSource={projects}
          renderItem={item => (
            <List.Item
              actions={[
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => showModal(item)}>编辑</Button>
                  <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(item.id)}>删除</Button>
                </Space>
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={
                  <div>
                    <p>作者: {item.User?.username || '未知作者'}</p>
                    <p>演示地址: <a href={item.demoUrl} target="_blank" rel="noopener noreferrer">{item.demoUrl}</a></p>
                    <p>仓库地址: <a href={item.repoUrl} target="_blank" rel="noopener noreferrer">{item.repoUrl}</a></p>
                    <p>{item.description}</p>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        <Modal
          title={editingProject ? '编辑项目' : '添加新项目'}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={editingProject ? '保存' : '添加'}
          cancelText="取消"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称！' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="demoUrl"
              label="演示 URL"
              rules={[{ required: true, message: '请输入演示 URL！' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="repoUrl"
              label="仓库 URL"
              rules={[{ required: true, message: '请输入仓库 URL！' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default ProjectSettingsPage;