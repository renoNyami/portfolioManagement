import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Card, Typography, Tag, message, Spin, Empty } from 'antd';
import { PlusOutlined, RobotOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

function AIProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/ai/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setProjects(response.data);
      } catch (error) {
        console.error('获取AI项目列表失败:', error);
        message.error('获取AI项目列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate]);

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/ai-projects/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '项目类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '技术栈',
      dataIndex: 'techStack',
      key: 'techStack',
      render: (techStack) => (
        <>
          {techStack && techStack.split(',').map((tech, index) => (
            <Tag color="green" key={index}>
              {tech.trim()}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'AI模型',
      dataIndex: 'aiModel',
      key: 'aiModel',
      render: (aiModel) => aiModel ? <Tag color="purple">{aiModel}</Tag> : <Tag color="purple">gpt-4</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'generated' ? 'orange' : 'green'}>
          {status === 'generated' ? '已生成' : '已部署'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => navigate(`/ai-projects/${record.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="加载项目中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2}>
            <RobotOutlined /> AI生成的项目
          </Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/ai-project-generator')}
          >
            创建新项目
          </Button>
        </div>

        {projects.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={projects.map(project => ({ ...project, key: project.id }))} 
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty 
            description="暂无AI生成的项目" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
}

export default AIProjectsListPage;