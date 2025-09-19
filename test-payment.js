// 简单的支付功能测试脚本
const axios = require('axios');

// 测试服务器URL
const BASE_URL = 'http://localhost:5000';

// 测试用户token (需要替换为有效的token)
const TEST_TOKEN = 'your_test_token_here';

async function testPayment() {
  try {
    console.log('开始测试支付功能...');
    
    // 1. 测试获取钱包信息
    console.log('1. 测试获取钱包信息...');
    const walletResponse = await axios.get(`${BASE_URL}/api/wallet`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log('钱包信息:', walletResponse.data);
    
    // 2. 测试充值功能
    console.log('2. 测试充值功能...');
    const depositResponse = await axios.post(`${BASE_URL}/api/wallet/deposit`, {
      amount: 100.00,
      paymentMethod: 'alipay'
    }, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log('充值结果:', depositResponse.data);
    
    // 3. 再次获取钱包信息，验证余额是否更新
    console.log('3. 验证余额更新...');
    const updatedWalletResponse = await axios.get(`${BASE_URL}/api/wallet`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log('更新后的钱包信息:', updatedWalletResponse.data);
    
    // 4. 获取交易记录
    console.log('4. 获取交易记录...');
    const transactionsResponse = await axios.get(`${BASE_URL}/api/wallet/transactions`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    console.log('交易记录:', transactionsResponse.data);
    
    console.log('支付功能测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error.response ? error.response.data : error.message);
  }
}

// 运行测试
testPayment();