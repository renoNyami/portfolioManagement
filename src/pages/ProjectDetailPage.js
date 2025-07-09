import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, List, Input, Avatar, Form, Typography } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;

const CommentList = ({ comments }) => (
  <List
    dataSource={comments}
    header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
    itemLayout="horizontal"
    renderItem={item => (
      <List.Item>
        <Card style={{ width: '100%' }}>
          <Card.Meta
            avatar={item.avatar}
            title={item.author}
            description={item.datetime}
          />
          <Typography.Paragraph>{item.content}</Typography.Paragraph>
        </Card>
      </List.Item>
    )}
  />
);

const Editor = ({ onChange, onSubmit, submitting, value }) => (
  <>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Add Comment
      </Button>
    </Form.Item>
  </>
);

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    fetchProject();
    fetchComments();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch project details.');
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/comments`);
      setComments(response.data.map(comment => ({
        author: comment.User ? comment.User.username : 'Unknown User',
        avatar: <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" alt="User Avatar" />,
        content: <p>{comment.content}</p>,
        datetime: moment(comment.createdAt).fromNow(),
      })));
    } catch (error) {
      message.error('Failed to fetch comments.');
    }
  };

  const handleSubmit = async () => {
    if (!commentContent) return;

    setSubmitting(true);
    try {
      await axios.post(`/api/projects/${projectId}/comments`, { content: commentContent });
      setCommentContent('');
      message.success('Comment added successfully!');
      fetchComments(); // Refresh comments
    } catch (error) {
      message.error('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setCommentContent(e.target.value);
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading project...</div>;
  }

  if (!project) {
    return <div style={{ padding: '24px' }}>Project not found.</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button type="primary" onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        Back
      </Button>
      <Card title={project.name} style={{ marginBottom: '24px' }}>
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Demo URL:</strong> <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">{project.demoUrl}</a></p>
        <p><strong>Repo URL:</strong> <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">{project.repoUrl}</a></p>
        <p><strong>Created By:</strong> {project.User ? project.User.username : 'Unknown'}</p>
        <p><strong>Created At:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
      </Card>

      <Card title="Comments">
        {comments.length > 0 && <CommentList comments={comments} />}
        <Card>
          <Card.Meta
            avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" alt="User Avatar" />}
            title="Add a comment"
          />
          <Editor
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            value={commentContent}
          />
        </Card>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;