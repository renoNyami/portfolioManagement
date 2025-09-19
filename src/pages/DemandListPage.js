import React, { useState, useEffect } from 'react';
import { List, Card, Button, Input, Select, message, Typography, Tag, Space } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

function DemandListPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/demands', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          search: searchTerm,
          minBudget: minBudget || undefined,
          maxBudget: maxBudget || undefined
        }
      });
      setDemands(response.data);
      setLoading(false);
    } catch (error) {
      message.error('获取需求列表失败');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchDemands();
  };

  const handleReset = () => {
    setSearchTerm('');
    setMinBudget('');
    setMaxBudget('');
    setLoading(true);
    fetchDemands();
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>需求市场</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/demands/create')}>
          发布需求
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索需求"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Input
            placeholder="最低预算"
            value={minBudget}
            onChange={e => setMinBudget(e.target.value)}
            style={{ width: 120 }}
          />
          <Input
            placeholder="最高预算"
            value={maxBudget}
            onChange={e => setMaxBudget(e.target.value)}
            style={{ width: 120 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </div>
      </Card>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={demands}
        loading={loading}
        renderItem={demand => (
          <List.Item>
            <Card
              title={demand.title}
              extra={<Tag color="blue">预算: ${demand.budget}</Tag>}
              onClick={() => navigate(`/demands/${demand.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <p>{demand.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color="green">{demand.User?.username}</Tag>
                  {demand.skills && demand.skills.split(',').map((skill, index) => (
                    <Tag key={index} color="cyan">{skill.trim()}</Tag>
                  ))}
                </Space>
                <span>{new Date(demand.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default DemandListPage;