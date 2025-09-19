import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Spin, Typography, Select, Switch, Space } from 'antd';
import { RobotOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function AIProjectGenerator() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const projectTypes = [
    { value: 'web', label: 'Web应用' },
    { value: 'mobile', label: '移动应用' },
    { value: 'api', label: 'API服务' },
    { value: 'dataAnalysis', label: '数据分析' },
    { value: 'microservice', label: '微服务' },
    { value: 'desktop', label: '桌面应用' },
  ];
  
  const aiModels = [
    { value: 'gpt-4', label: 'GPT-4 (高级功能)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (快速生成)' },
    { value: 'qwen-max', label: '通义千问 Max (高级功能)' },
    { value: 'qwen-plus', label: '通义千问 Plus (标准功能)' },
    { value: 'qwen-turbo', label: '通义千问 Turbo (快速生成)' },
    { value: 'deepseek-coder', label: 'DeepSeek Coder (代码专精)' },
    { value: 'deepseek-chat', label: 'DeepSeek Chat (通用对话)' },
    { value: 'gemini-pro', label: 'Gemini Pro (通用对话)' },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision (多模态)' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus (高级功能)' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet (标准功能)' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku (快速生成)' },
    { value: 'llama-3-70b', label: 'Llama 3 70B (高级功能)' },
    { value: 'llama-3-8b', label: 'Llama 3 8B (快速生成)' },
  ];
  
  const apiProviders = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'aliyun', label: '阿里云通义千问' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'google', label: 'Google AI (Gemini)' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'meta', label: 'Meta AI (Llama)' },
  ];
  
  // 根据选择的API提供商显示不同的API密钥输入框
  const [selectedApiProvider, setSelectedApiProvider] = useState('openai');
  // 是否使用自定义API密钥
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }
      
      // 如果用户没有选择使用自定义API密钥，则移除相关字段
      const requestData = { ...values };
      if (!useCustomApiKey) {
        delete requestData.openaiApiKey;
        delete requestData.azureApiKey;
        delete requestData.azureEndpoint;
        delete requestData.aliyunApiKey;
        delete requestData.aliyunEndpoint;
        delete requestData.deepseekApiKey;
        delete requestData.deepseekEndpoint;
      }

      const response = await axios.post('http://localhost:5000/api/ai/projects/generate', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('项目生成成功！');
      // 导航到新创建的AI项目详情页面
      navigate(`/ai-projects/${response.data.id}`);
    } catch (error) {
      console.error('项目生成错误:', error);
      
      // 显示更详细的错误信息
      let errorMsg = '项目生成失败，请稍后再试';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMsg = 'API密钥无效或已过期，请检查您的API密钥';
      } else if (error.response?.status === 400) {
        errorMsg = error.response.data.message || 'API参数无效，请检查您的输入';
      } else if (error.response?.status === 429) {
        errorMsg = 'API请求超过限制，请稍后再试';
      } else if (error.message === 'Network Error') {
        errorMsg = '网络错误，无法连接到服务器';
      }
      
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <Title level={2}>
          <RobotOutlined /> AI项目生成器
        </Title>
        <Paragraph>
          通过AI智能助手，只需描述您的项目需求，即可快速生成项目框架和基础代码。
        </Paragraph>
        <Paragraph type="secondary">
          <InfoCircleOutlined /> 您可以使用自己的API密钥和端点，这些信息仅用于当前请求，不会被保存。
        </Paragraph>

        <Spin spinning={loading} tip="AI正在生成您的项目，请稍候...">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="projectName"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="给您的项目起个名字" />
            </Form.Item>

            <Form.Item
              name="projectType"
              label="项目类型"
              rules={[{ required: true, message: '请选择项目类型' }]}
            >
              <Select placeholder="选择项目类型">
                {projectTypes.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="项目描述"
              rules={[{ required: true, message: '请描述您的项目需求' }]}
            >
              <TextArea 
                placeholder="详细描述您的项目需求，例如：我需要一个在线商城，包含用户登录、商品展示、购物车和支付功能..."
                autoSize={{ minRows: 4, maxRows: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="techStack"
              label="技术栈偏好（可选）"
            >
              <TextArea 
                placeholder="例如：React, Node.js, MongoDB..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>
            
            <Form.Item
              name="aiModel"
              label="AI模型"
              initialValue="gpt-4"
            >
              <Select placeholder="选择AI模型">
                {aiModels.map(model => (
                  <Option key={model.value} value={model.value}>{model.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="apiProvider"
              label="API提供商"
              initialValue="openai"
            >
              <Select 
                placeholder="选择API提供商"
                onChange={(value) => setSelectedApiProvider(value)}
              >
                {apiProviders.map(provider => (
                  <Option key={provider.value} value={provider.value}>{provider.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item label="使用自定义API密钥">
              <Space>
                <Switch checked={useCustomApiKey} onChange={(checked) => setUseCustomApiKey(checked)} />
                <span>{useCustomApiKey ? '使用我的API密钥' : '使用系统配置的API密钥'}</span>
              </Space>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                <InfoCircleOutlined style={{ marginRight: '5px' }} />
                {selectedApiProvider === 'openai' && (
                  <>您可以在OpenAI官网获取API密钥：<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></>
                )}
                {selectedApiProvider === 'azure' && (
                  <>您可以在Azure门户获取API密钥和端点：<a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer">portal.azure.com</a></>
                )}
                {selectedApiProvider === 'aliyun' && (
                  <>您可以在阿里云控制台获取通义千问API密钥：<a href="https://dashscope.console.aliyun.com/apiKey" target="_blank" rel="noopener noreferrer">dashscope.console.aliyun.com/apiKey</a></>
                )}
                {selectedApiProvider === 'deepseek' && (
                  <>您可以在DeepSeek官网获取API密钥：<a href="https://platform.deepseek.com/api-keys" target="_blank" rel="noopener noreferrer">platform.deepseek.com/api-keys</a></>
                )}
                {selectedApiProvider === 'google' && (
                  <>您可以在Google AI Studio获取API密钥：<a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">ai.google.dev</a></>
                )}
                {selectedApiProvider === 'anthropic' && (
                  <>您可以在Anthropic控制台获取API密钥：<a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com/account/keys</a></>
                )}
                {selectedApiProvider === 'meta' && (
                  <>您可以在Meta AI开发者平台获取API密钥：<a href="https://llama.meta.com/get-api-key/" target="_blank" rel="noopener noreferrer">llama.meta.com/get-api-key</a></>
                )}
              </div>
            </Form.Item>
            
            {useCustomApiKey && selectedApiProvider === 'openai' && (
              <Form.Item
                name="openaiApiKey"
                label="OpenAI API密钥"
                rules={[{ required: useCustomApiKey && selectedApiProvider === 'openai', message: '请输入OpenAI API密钥' }]}
                extra="您的API密钥仅用于当前请求，不会被保存"
              >
                <Input.Password placeholder="请输入您的OpenAI API密钥" />
              </Form.Item>
            )}
            
            {useCustomApiKey && selectedApiProvider === 'azure' && (
              <>
                <Form.Item
                  name="azureApiKey"
                  label="Azure OpenAI API密钥"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'azure', message: '请输入Azure OpenAI API密钥' }]}
                  extra="您的API密钥仅用于当前请求，不会被保存"
                >
                  <Input.Password placeholder="请输入您的Azure OpenAI API密钥" />
                </Form.Item>
                
                <Form.Item
                  name="azureEndpoint"
                  label="Azure OpenAI 端点"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'azure', message: '请输入Azure OpenAI端点' }]}
                  extra="例如：https://your-resource.openai.azure.com/openai/deployments/your-deployment"
                >
                  <Input placeholder="请输入您的Azure OpenAI端点URL" />
                </Form.Item>
              </>
            )}
            
            {useCustomApiKey && selectedApiProvider === 'aliyun' && (
              <>
                <Form.Item
                  name="aliyunApiKey"
                  label="阿里云通义千问 API密钥"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'aliyun', message: '请输入阿里云通义千问API密钥' }]}
                  extra="您的API密钥仅用于当前请求，不会被保存"
                >
                  <Input.Password placeholder="请输入您的阿里云通义千问API密钥" />
                </Form.Item>
                
                <Form.Item
                  name="aliyunEndpoint"
                  label="阿里云通义千问端点"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'aliyun', message: '请输入阿里云通义千问端点' }]}
                  extra="例如：https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
                >
                  <Input placeholder="请输入阿里云通义千问API端点URL" />
                </Form.Item>
              </>
            )}
            
            {useCustomApiKey && selectedApiProvider === 'deepseek' && (
              <>
                <Form.Item
                  name="deepseekApiKey"
                  label="DeepSeek API密钥"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'deepseek', message: '请输入DeepSeek API密钥' }]}
                  extra="您的API密钥仅用于当前请求，不会被保存"
                >
                  <Input.Password placeholder="请输入您的DeepSeek API密钥" />
                </Form.Item>
                
                <Form.Item
                  name="deepseekEndpoint"
                  label="DeepSeek API端点"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'deepseek', message: '请输入DeepSeek API端点' }]}
                  extra="例如：https://api.deepseek.com/v1/chat/completions"
                >
                  <Input placeholder="请输入DeepSeek API端点URL" />
                </Form.Item>
              </>
            )}
            
            {useCustomApiKey && selectedApiProvider === 'google' && (
              <>
                <Form.Item
                  name="googleApiKey"
                  label="Google AI API密钥"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'google', message: '请输入Google AI API密钥' }]}
                  extra="您的API密钥仅用于当前请求，不会被保存"
                >
                  <Input.Password placeholder="请输入您的Google AI API密钥" />
                </Form.Item>
                
                <Form.Item
                  name="googleEndpoint"
                  label="Google AI API端点"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'google', message: '请输入Google AI API端点' }]}
                  extra="例如：https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
                >
                  <Input placeholder="请输入Google AI API端点URL" />
                </Form.Item>
              </>
            )}
            
            {useCustomApiKey && selectedApiProvider === 'anthropic' && (
              <>
                <Form.Item
                  name="anthropicApiKey"
                  label="Anthropic API密钥"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'anthropic', message: '请输入Anthropic API密钥' }]}
                  extra="您的API密钥仅用于当前请求，不会被保存"
                >
                  <Input.Password placeholder="请输入您的Anthropic API密钥" />
                </Form.Item>
                
                <Form.Item
                  name="anthropicEndpoint"
                  label="Anthropic API端点"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'anthropic', message: '请输入Anthropic API端点' }]}
                  extra="例如：https://api.anthropic.com/v1/messages"
                >
                  <Input placeholder="请输入Anthropic API端点URL" />
                </Form.Item>
              </>
            )}
            
            {useCustomApiKey && selectedApiProvider === 'meta' && (
              <>
                <Form.Item
                  name="metaApiKey"
                  label="Meta AI API密钥"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'meta', message: '请输入Meta AI API密钥' }]}
                  extra="您的API密钥仅用于当前请求，不会被保存"
                >
                  <Input.Password placeholder="请输入您的Meta AI API密钥" />
                </Form.Item>
                
                <Form.Item
                  name="metaEndpoint"
                  label="Meta AI API端点"
                  rules={[{ required: useCustomApiKey && selectedApiProvider === 'meta', message: '请输入Meta AI API端点' }]}
                  extra="例如：https://llama-api.meta.com/v1/chat/completions"
                >
                  <Input placeholder="请输入Meta AI API端点URL" />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                开始生成项目
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default AIProjectGenerator;