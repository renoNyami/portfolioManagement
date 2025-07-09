import React, { useState, useEffect } from 'react';
import { List, Card, message, Button, Input, Select } from 'antd';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

const UserProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchProjects();
      fetchUser();
    } else {
      fetchCurrentUserProjects();
    }
  }, [userId]);

  const fetchCurrentUserProjects = async () => {
    try {
      const userResponse = await axios.get('/api/auth/me');
      const currentUserId = userResponse.data.id;
      setUser(userResponse.data);
      const projectsResponse = await axios.get(`/api/users/${currentUserId}/projects`);
      setProjects(projectsResponse.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch current user projects');
      setLoading(false);
    }
  };



  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      message.error('Failed to fetch user info');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchProjects(value, category);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    fetchProjects(searchTerm, value);
  };

  const fetchProjects = async (search = '', category = 'all') => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      
      const response = await axios.get(`/api/users/${userId}/projects`, { params });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch projects');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {user && <h2>{user.username}'s Projects</h2>}
        {!userId}
        <Button type="primary" onClick={() => navigate(-1)}>Back</Button>
      </div>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
        <Search
          placeholder="Search projects"
          allowClear
          enterButton="Search"
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 400 }}
        />
        <Select
          defaultValue="all"
          style={{ width: 120 }}
          onChange={handleCategoryChange}
        >
          <Option value="all">All</Option>
          <Option value="my">My Projects</Option>
        </Select>
      </div>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={projects}
        loading={loading}
        renderItem={project => (
          <List.Item>
            <Card
              title={project.name}
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <p>{project.description}</p>
              <p>Created at: {new Date(project.createdAt).toLocaleDateString()}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserProjectsPage;