import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const CommunityPostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/community/posts/${postId}`);
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch post details.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading post...</div>;
  }

  if (!post) {
    return <div style={{ padding: '24px' }}>Post not found.</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button type="primary" onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        Back
      </Button>
      <Card
        title={post.title}
        extra={<span>Posted by {post.User ? post.User.username : 'Unknown'} on {moment(post.createdAt).format('YYYY-MM-DD HH:mm')}</span>}
      >
        <p>{post.content}</p>
      </Card>
    </div>
  );
};

export default CommunityPostDetailPage;