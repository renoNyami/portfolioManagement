import React, { useState, useEffect } from 'react';
import { List, Card, Button, Input, Select, message, Typography, Tag, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

function MarketplacePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/marketplace/projects', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          search: searchTerm,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          category: category || undefined
        }
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      message.error('获取项目列表失败');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchProjects();
  };

  const handleReset = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setCategory('');
    setLoading(true);
    fetchProjects();
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>项目市场</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/marketplace/create')}>
          发布项目
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索项目"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Input
            placeholder="最低价格"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            style={{ width: 120 }}
          />
          <Input
            placeholder="最高价格"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            style={{ width: 120 }}
          />
          <Select
            placeholder="分类"
            value={category}
            onChange={setCategory}
            style={{ width: 120 }}
          >
            <Option value="web">Web应用</Option>
            <Option value="mobile">移动应用</Option>
            <Option value="desktop">桌面应用</Option>
            <Option value="api">API服务</Option>
            <Option value="plugin">插件</Option>
            <Option value="template">模板</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </div>
      </Card>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={projects}
        loading={loading}
        renderItem={project => (
          <List.Item>
            <Card
              title={project.name}
              extra={<Tag color="blue">价格: ${project.price}</Tag>}
              onClick={() => navigate(`/marketplace/projects/${project.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <p>{project.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color="green">{project.User?.username}</Tag>
                  {project.category && <Tag color="cyan">{project.category}</Tag>}
                </Space>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default MarketplacePage;