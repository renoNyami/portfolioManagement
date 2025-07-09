import React, { useState, useEffect } from 'react';
import { List, Card, message, Button, Input, Modal, Form } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { TextArea } = Input;

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/community/posts');
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch community posts.');
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handlePostSubmit = async (values) => {
    try {
      await axios.post('/api/community/posts', values);
      message.success('Post created successfully!');
      setIsModalVisible(false);
      form.resetFields();
      fetchPosts(); // Refresh posts
    } catch (error) {
      message.error('Failed to create post.');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Community Discussion</h2>
        <Button type="primary" onClick={showModal}>Create New Post</Button>
      </div>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={posts}
        loading={loading}
        renderItem={post => (
          <List.Item>
            <Card
              title={post.title}
              extra={<span>Posted by {post.User ? post.User.username : 'Unknown'} on {moment(post.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>}
              onClick={() => navigate(`/community/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <p>{post.content}</p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Create New Community Post"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePostSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommunityPage;