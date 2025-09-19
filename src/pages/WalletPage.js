import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Statistic, List, message, Tabs, Tag } from 'antd';
import { DollarOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { TabPane } = Tabs;

function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const [walletResponse, transactionsResponse] = await Promise.all([
        axios.get('/api/wallet', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/wallet/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setBalance(walletResponse.data.balance);
      setTransactions(transactionsResponse.data);
      setLoading(false);
    } catch (error) {
      message.error('获取钱包信息失败');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>我的钱包</Title>
      
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <Statistic
            title="账户余额"
            value={balance}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            prefix="¥"
          />
          <div style={{ marginTop: '16px' }}>
            <Button type="primary" icon={<PlusOutlined />} style={{ marginRight: '8px' }}>
              充值
            </Button>
            <Button icon={<MinusOutlined />}>
              提现
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="交易记录" key="1">
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={transactions}
            loading={loading}
            renderItem={transaction => (
              <List.Item>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p><strong>{transaction.description}</strong></p>
                      <p>{new Date(transaction.createdAt).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        color: transaction.type === 'income' ? '#3f8600' : '#cf1322',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount}
                      </p>
                      <Tag color={transaction.type === 'income' ? 'green' : 'red'}>
                        {transaction.type === 'income' ? '收入' : '支出'}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
        
        <TabPane tab="充值记录" key="2">
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <DollarOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p style={{ marginTop: '16px' }}>暂无充值记录</p>
          </div>
        </TabPane>
        
        <TabPane tab="提现记录" key="3">
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <DollarOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <p style={{ marginTop: '16px' }}>暂无提现记录</p>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default WalletPage;