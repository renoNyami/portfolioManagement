import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message, List, Card, Typography, Space, Input } from 'antd';

const { Title } = Typography;
const { Search } = Input;

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard', { replace: true });
      message.success('GitHub登录成功！');
    }

    async function fetchProjects() {
      try {
        const response = await fetch('http://localhost:5000/api/projects', {
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
  }, [location, navigate]);

  useEffect(() => {
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      project.description.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projects, searchText]);

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>所有项目</Title>
        <Search
          placeholder="搜索项目名称或描述"
          allowClear
          enterButton
          size="large"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ marginBottom: '24px' }}
        />
        <List
          bordered
          dataSource={searchText ? filteredProjects : projects}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={
                  <div>
                    <p>作者邮箱: {item.User.email}</p>
                    <p>作者: {item.User.username}</p>
                    <p>演示地址: <a href={item.demoUrl} target="_blank" rel="noopener noreferrer">{item.demoUrl}</a></p>
                    <p>仓库地址: <a href={item.repoUrl} target="_blank" rel="noopener noreferrer">{item.repoUrl}</a></p>
                    <p>{item.description}</p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export default DashboardPage;