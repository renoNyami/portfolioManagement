import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tag, message, Form, InputNumber, Input, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

function DemandDetailPage() {
  const [demand, setDemand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { demandId } = useParams();

  useEffect(() => {
    fetchDemand();
  }, [demandId]);

  const fetchDemand = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/demands/${demandId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDemand(response.data);
      setLoading(false);
    } catch (error) {
      message.error('获取需求详情失败');
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

  const handleBid = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/orders', {
        demandId: demand.id,
        price: values.price,
        deliveryTime: values.deliveryTime,
        message: values.message
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('投标成功！');
      setIsModalVisible(false);
      form.resetFields();
      navigate('/orders');
    } catch (error) {
      message.error('投标失败：' + (error.response?.data?.msg || '未知错误'));
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>;
  }

  if (!demand) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>未找到需求</div>;
  }

  const isOwnDemand = demand.userId === localStorage.getItem('userId');

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        返回
      </Button>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2}>{demand.title}</Title>
            <Tag color="blue">预算: ${demand.budget}</Tag>
            <Tag color={
              demand.status === 'open' ? 'green' : 
              demand.status === 'in_progress' ? 'orange' : 
              demand.status === 'completed' ? 'blue' : 'red'
            }>
              {demand.status === 'open' ? '开放中' : 
               demand.status === 'in_progress' ? '进行中' : 
               demand.status === 'completed' ? '已完成' : '已取消'}
            </Tag>
          </div>
          {!isOwnDemand && demand.status === 'open' && (
            <Button type="primary" onClick={showModal}>
              我要接单
            </Button>
          )}
        </div>

        <Paragraph style={{ marginTop: '16px' }}>
          <strong>详细描述：</strong>
          {demand.description}
        </Paragraph>

        <div style={{ marginTop: '16px' }}>
          <p><strong>发布者：</strong> {demand.User?.username}</p>
          <p><strong>发布时间：</strong> {new Date(demand.createdAt).toLocaleString()}</p>
          {demand.deadline && <p><strong>截止时间：</strong> {new Date(demand.deadline).toLocaleString()}</p>}
          {demand.skills && (
            <p>
              <strong>所需技能：</strong>
              {demand.skills.split(',').map((skill, index) => (
                <Tag key={index} color="cyan">{skill.trim()}</Tag>
              ))}
            </p>
          )}
        </div>
      </Card>

      <Modal
        title="投标信息"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBid}
        >
          <Form.Item
            name="price"
            label="报价 ($)"
            rules={[{ required: true, message: '请输入报价' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="deliveryTime"
            label="预计交付时间 (天)"
            rules={[{ required: true, message: '请输入预计交付时间' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="message"
            label="留言"
          >
            <TextArea placeholder="给需求发布者留言" autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交投标
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DemandDetailPage;