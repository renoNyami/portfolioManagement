import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tag, message, Modal, Form, Input } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { orderId } = useParams();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      message.error('获取订单详情失败');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status, message = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, 
        { status, message },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setOrder(response.data);
      message.success('订单状态更新成功');
      setIsModalVisible(false);
    } catch (error) {
      message.error('更新订单状态失败：' + (error.response?.data?.msg || '未知错误'));
    }
  };

  const showModal = (action) => {
    setModalAction(action);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (modalAction === 'accept') {
        updateOrderStatus('accepted', values.message);
      } else if (modalAction === 'deliver') {
        updateOrderStatus('delivered', values.message);
      } else if (modalAction === 'complete') {
        updateOrderStatus('completed', values.message);
      } else if (modalAction === 'cancel') {
        updateOrderStatus('cancelled', values.message);
      }
    });
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>加载中...</div>;
  }

  if (!order) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>未找到订单</div>;
  }

  const isFreelancer = order.freelancerId === localStorage.getItem('userId');
  const isClient = order.clientIdId === localStorage.getItem('userId');

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
        返回
      </Button>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2}>{order.Demand?.title}</Title>
            <Tag color={
              order.status === 'pending' ? 'orange' : 
              order.status === 'accepted' ? 'blue' : 
              order.status === 'in_progress' ? 'cyan' : 
              order.status === 'delivered' ? 'purple' : 
              order.status === 'completed' ? 'green' : 
              order.status === 'cancelled' ? 'red' : 'volcano'
            }>
              {order.status === 'pending' ? '待接受' : 
               order.status === 'accepted' ? '已接受' : 
               order.status === 'in_progress' ? '进行中' : 
               order.status === 'delivered' ? '已交付' : 
               order.status === 'completed' ? '已完成' : 
               order.status === 'cancelled' ? '已取消' : '争议中'}
            </Tag>
          </div>
        </div>

        <Paragraph style={{ marginTop: '16px' }}>
          <strong>需求描述：</strong>
          {order.Demand?.description}
        </Paragraph>

        <div style={{ marginTop: '16px' }}>
          <p><strong>承接者：</strong> {order.freelancer?.username}</p>
          <p><strong>客户：</strong> {order.client?.username}</p>
          <p><strong>报价：</strong> ${order.price}</p>
          <p><strong>预计交付时间：</strong> {order.deliveryTime} 天</p>
          <p><strong>创建时间：</strong> {new Date(order.createdAt).toLocaleString()}</p>
          {order.message && <p><strong>留言：</strong> {order.message}</p>}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          {isClient && order.status === 'pending' && (
            <Button type="primary" onClick={() => showModal('accept')} style={{ marginRight: '8px' }}>
              接受订单
            </Button>
          )}
          
          {isFreelancer && (order.status === 'accepted' || order.status === 'in_progress') && (
            <Button type="primary" onClick={() => showModal('deliver')} style={{ marginRight: '8px' }}>
              标记为已交付
            </Button>
          )}
          
          {isClient && order.status === 'delivered' && (
            <Button type="primary" onClick={() => showModal('complete')} style={{ marginRight: '8px' }}>
              确认完成
            </Button>
          )}
          
          {(isClient || isFreelancer) && order.status !== 'completed' && order.status !== 'cancelled' && (
            <Button danger onClick={() => showModal('cancel')}>
              取消订单
            </Button>
          )}
        </div>
      </Card>

      <Modal
        title={
          modalAction === 'accept' ? '接受订单' :
          modalAction === 'deliver' ? '标记为已交付' :
          modalAction === 'complete' ? '确认完成' : '取消订单'
        }
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="message"
            label="留言"
          >
            <TextArea placeholder="添加留言（可选）" autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default OrderDetailPage;