import React from 'react';
import { Layout, Card, Avatar, Typography, Divider, List, Button, Space } from 'antd';
import { UserOutlined, MailOutlined, GithubOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

function PortfolioPage() {
  // Mock data for demonstration
  const userProfile = {
    name: 'John Doe',
    jobTitle: 'Software Engineer',
    bio: 'Passionate about building scalable web applications with a focus on clean code and user experience. Always eager to learn new technologies and contribute to open-source projects.',
    email: 'john.doe@example.com',
    avatarUrl: 'https://via.placeholder.com/150',
  };

  const userProjects = [
    {
      id: 1,
      name: 'Project Alpha',
      demoUrl: 'http://demo.alpha.com',
      repoUrl: 'http://repo.alpha.com',
      description: 'A web application built with React and Node.js for task management.',
    },
    {
      id: 2,
      name: 'Project Beta',
      demoUrl: 'http://demo.beta.com',
      repoUrl: 'http://repo.beta.com',
      description: 'An e-commerce platform developed using Next.js and Stripe for payments.',
    },
    {
      id: 3,
      name: 'Project Gamma',
      demoUrl: 'http://demo.gamma.com',
      repoUrl: 'http://repo.gamma.com',
      description: 'A mobile application for fitness tracking, developed with React Native.',
    },
  ];

  const handleContact = () => {
    window.location.href = `mailto:${userProfile.email}`;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>{userProfile.name} 的作品集</Title>
          <Button type="primary" icon={<MailOutlined />} onClick={handleContact}>
            联系我
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '24px auto' }}>
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Avatar size={128} icon={<UserOutlined />} src={userProfile.avatarUrl} />
            <div>
              <Title level={2} style={{ margin: 0 }}>{userProfile.name}</Title>
              <Paragraph type="secondary" style={{ fontSize: '1.2em' }}>{userProfile.jobTitle}</Paragraph>
              <Paragraph>{userProfile.bio}</Paragraph>
              <Space>
                <Button type="link" icon={<MailOutlined />} onClick={handleContact}>Email</Button>
                <Button type="link" icon={<GithubOutlined />}>GitHub</Button>
              </Space>
            </div>
          </div>
        </Card>

        <Divider>我的项目</Divider>

        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 3,
          }}
          dataSource={userProjects}
          renderItem={item => (
            <List.Item>
              <Card
                title={item.name}
                actions={[
                  <Button type="link" href={item.demoUrl} target="_blank" rel="noopener noreferrer">演示</Button>,
                  <Button type="link" href={item.repoUrl} target="_blank" rel="noopener noreferrer">仓库</Button>,
                ]}
              >
                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '更多' }}>
                  {item.description}
                </Paragraph>
              </Card>
            </List.Item>
          )}
        />
      </Content>
      <Footer style={{ textAlign: 'center' }}>User Portfolio Management App ©2023 Created by You</Footer>
    </Layout>
  );
}

export default PortfolioPage;