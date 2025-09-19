import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Tabs, message, Spin, Collapse, Tag } from 'antd';
import { DownloadOutlined, CodeOutlined, RobotOutlined } from '@ant-design/icons';
import axios from 'axios';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

function AIProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/ai/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setProject(response.data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.response?.data?.message || '获取项目失败');
        message.error('获取项目失败');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const downloadProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/ai/projects/${projectId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('项目下载成功');
    } catch (error) {
      console.error('下载项目失败:', error);
      message.error('下载项目失败');
    }
  };

  const deployProject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/ai/projects/${projectId}/deploy`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('项目部署请求已提交');
      // 更新项目状态
      setProject(prev => ({ ...prev, status: 'deployed' }));
    } catch (error) {
      console.error('部署项目失败:', error);
      message.error('部署项目失败');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="加载项目中..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Title level={3}>项目加载失败</Title>
        <Paragraph>{error || '无法找到该项目'}</Paragraph>
        <Button type="primary" onClick={() => navigate('/ai-project-generator')}>
          返回AI项目生成器
        </Button>
      </div>
    );
  }

  // 解析项目内容
  const projectContent = typeof project.content === 'string' 
    ? JSON.parse(project.content) 
    : project.content;

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Title level={2}>
              <RobotOutlined /> {project.name}
            </Title>
            <div>
              <Tag color="blue">{project.type}</Tag>
              {project.techStack && project.techStack.split(',').map((tech, index) => (
                <Tag key={index} color="green">{tech.trim()}</Tag>
              ))}
              <Tag color={project.status === 'generated' ? 'orange' : 'green'}>
                {project.status === 'generated' ? '已生成' : '已部署'}
              </Tag>
              {project.aiModel && (
                <Tag color="purple">{project.aiModel}</Tag>
              )}
              {project.apiProvider && (
                <Tag color="cyan">{project.apiProvider}</Tag>
              )}
            </div>
          </div>
          <div>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={downloadProject}
              style={{ marginRight: '10px' }}
            >
              下载项目
            </Button>
            <Button 
              type="default" 
              icon={<CodeOutlined />} 
              onClick={deployProject}
              disabled={project.status === 'deployed'}
            >
              {project.status === 'deployed' ? '已部署' : '部署项目'}
            </Button>
          </div>
        </div>

        <Paragraph>
          <strong>项目描述：</strong> {project.description}
        </Paragraph>

        <Tabs defaultActiveKey="1">
          <TabPane tab="项目结构" key="1">
            <Paragraph>
              <pre>{projectContent.description || '无项目结构描述'}</pre>
            </Paragraph>
          </TabPane>
          <TabPane tab="代码文件" key="2">
            <Collapse accordion>
              {projectContent.files && projectContent.files.map((file, index) => (
                <Panel header={file.name} key={index}>
                  <SyntaxHighlighter language={file.language || 'javascript'} style={docco}>
                    {file.content}
                  </SyntaxHighlighter>
                </Panel>
              ))}
            </Collapse>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default AIProjectDetailPage;