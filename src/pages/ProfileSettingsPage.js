import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Avatar, Card, Typography, message } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { fetchUserProfile, updateUserProfile } from '../api/profileApi';
import axios from 'axios';

const { Title } = Typography;

function ProfileSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchUserProfile();
        if (response.success) {
          const data = response.data;
          form.setFieldsValue({
            username: data.username || data.email,
            jobTitle: data.jobTitle || data.position,
            bio: data.bio || data.biography,
            email: data.email,
            regDate: data.create_time ? new Date(data.create_time).toLocaleDateString() : ''
          });
          setUserData(data);
        } else {
          message.error('获取用户数据失败：' + (response.msg || '未知错误'));
        }
      } catch (error) {
        message.error('获取用户数据失败。');
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [form]);

  const onFinish = async (values) => {
    try {
      // Only send the fields that are meant to be updated
      const { username, jobTitle, bio } = values;
      await updateUserProfile({ username, jobTitle, bio });
      message.success('个人资料更新成功！');
      // Refetch user data to update the displayed information
      const data = await fetchUserProfile();
      setUserData(data); // Update user data with the full response
      form.setFieldsValue(data); // Update form fields with new data
    } catch (error) {
      message.error('更新个人资料失败。');
      console.error('Error updating profile:', error);
    }
  };

  const onFileChange = async (info) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功！');
      // After successful upload, refetch user data to update avatar URL
      try {
        const response = await fetchUserProfile();
        if (response.success) {
          setUserData(response.data); // Update user data with the full response
          form.setFieldsValue(response.data); // Update form fields with new data
        } else {
          message.error('获取最新用户数据失败：' + (response.msg || '未知错误'));
        }
      } catch (error) {
        message.error('获取最新用户数据失败。');
        console.error('Error refetching user data after avatar upload:', error);
      }
    } else if (info.file.status === 'error') {
      message.error('头像上传失败！');
    }
  };

  // 自定义上传函数（关键！）
  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('avatar', file); // 字段名需与后端一致

    try {
      const response = await axios.post(
        'http://localhost:5000/api/profile/avatar',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // 从 localStorage 获取 token
            'Content-Type': 'multipart/form-data', // 必须设置！
          },
        }
      );
      onSuccess(response.data); // 通知 Upload 组件上传成功
    } catch (error) {
      onError(error); // 通知 Upload 组件上传失败
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>个人资料设置</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={userData}
        >
          <Form.Item label="头像">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar size={64} icon={<UserOutlined />} src={userData?.avatarUrl} />
              <Upload
                name="avatar"
                customRequest={customUploadRequest} // 使用自定义上传函数
                listType="picture"
                showUploadList={false}
                onChange={onFileChange}
              >
                <Button icon={<UploadOutlined />}>上传新头像</Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入您的用户名！' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="jobTitle"
            label="职位"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="email" label="电子邮箱">
            <Input readOnly />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存更改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ProfileSettingsPage;

// 在表单中添加只读字段
{/* 在表单中添加只读字段 */ }

