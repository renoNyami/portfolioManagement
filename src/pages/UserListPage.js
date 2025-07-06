import React, { useState, useEffect } from 'react';
import { List, Avatar, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch users');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <List
        itemLayout="horizontal"
        dataSource={users}
        loading={loading}
        renderItem={user => (
          <List.Item
            actions={[
              <Link to={`/users/${user.id}/projects`}>
                <Button type="link">View Projects</Button>
              </Link>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={user.avatarUrl} />}
              title={user.username}
              description={user.email}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserListPage;