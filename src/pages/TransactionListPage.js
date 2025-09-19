import React, { useState, useEffect } from 'react';
import { List, Card, Tabs, message, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { TabPane } = Tabs;

function TransactionListPage() {
  const [buyerTransactions, setBuyerTransactions] = useState([]);
  const [sellerTransactions, setSellerTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const [buyerResponse, sellerResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions/buyer', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/transactions/seller', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setBuyerTransactions(buyerResponse.data);
      setSellerTransactions(sellerResponse.data);
      setLoading(false);
    } catch (error) {
      message.error('获取交易记录失败');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'refunded': return 'volcano';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '处理中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'refunded': return '已退款';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="我购买的项目" key="1">
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={buyerTransactions}
            loading={loading}
            renderItem={transaction => (
              <List.Item>
                <Card
                  title={transaction.MarketplaceProject?.name || '项目已删除'}
                  extra={<Tag color={getStatusColor(transaction.status)}>{getStatusText(transaction.status)}</Tag>}
                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <p><strong>卖家：</strong> {transaction.seller?.username}</p>
                  <p><strong>金额：</strong> ${transaction.amount}</p>
                  <p><strong>交易时间：</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
        
        <TabPane tab="我出售的项目" key="2">
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={sellerTransactions}
            loading={loading}
            renderItem={transaction => (
              <List.Item>
                <Card
                  title={transaction.MarketplaceProject?.name || '项目已删除'}
                  extra={<Tag color={getStatusColor(transaction.status)}>{getStatusText(transaction.status)}</Tag>}
                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <p><strong>买家：</strong> {transaction.buyer?.username}</p>
                  <p><strong>金额：</strong> ${transaction.amount}</p>
                  <p><strong>交易时间：</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default TransactionListPage;