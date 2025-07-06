import React, { useState, useEffect } from 'react';
import { List, Card, message, Button } from 'antd';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UserProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchUser();
  }, [userId]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/projects`);
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch projects');
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {user && <h2>{user.username}'s Projects</h2>}
        <Button type="primary" onClick={() => navigate(-1)}>Back</Button>
      </div>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={projects}
        loading={loading}
        renderItem={project => (
          <List.Item>
            <Card title={project.name}>
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