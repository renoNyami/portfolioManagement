import React, { useState, useEffect } from 'react';
import { List, Card, Button, Tabs, message, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { TabPane } = Tabs;

function OrderListPage() {
  const [freelancerOrders, setFreelancerOrders] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const [freelancerResponse, clientResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/orders/freelancer', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/orders/client', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setFreelancerOrders(freelancerResponse.data);
      setClientOrders(clientResponse.data);
      setLoading(false);
    } catch (error) {
      message.error('获取订单列表失败');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'accepted': return 'blue';
      case 'in_progress': return 'cyan';
      case 'delivered': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'disputed': return 'volcano';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待接受';
      case 'accepted': return '已接受';
      case 'in_progress': return '进行中';
      case 'delivered': return '已交付';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      case 'disputed': return '争议中';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="我承接的订单" key="1">
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={freelancerOrders}
            loading={loading}
            renderItem={order => (
              <List.Item>
                <Card
                  title={order.Demand?.title}
                  extra={<Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <p><strong>客户：</strong> {order.client?.username}</p>
                  <p><strong>报价：</strong> ${order.price}</p>
                  <p><strong>预计交付时间：</strong> {order.deliveryTime} 天</p>
                  <p><strong>创建时间：</strong> {new Date(order.createdAt).toLocaleString()}</p>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
        
        <TabPane tab="我发布的订单" key="2">
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={clientOrders}
            loading={loading}
            renderItem={order => (
              <List.Item>
                <Card
                  title={order.Demand?.title}
                  extra={<Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <p><strong>承接者：</strong> {order.freelancer?.username}</p>
                  <p><strong>报价：</strong> ${order.price}</p>
                  <p><strong>预计交付时间：</strong> {order.deliveryTime} 天</p>
                  <p><strong>创建时间：</strong> {new Date(order.createdAt).toLocaleString()}</p>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default OrderListPage;