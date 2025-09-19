const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const AIProject = require('./models/AIProject');
const User = require('./models/User');
const auth = require('./middleware/auth');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

// AI项目生成API
router.post('/projects/generate', auth, async (req, res) => {
  try {
    const { projectName, projectType, projectDescription, techStack, apiProvider, model, useCustomApiKey, openaiApiKey, azureApiKey, azureEndpoint, aliyunApiKey, aliyunEndpoint, deepseekApiKey, deepseekEndpoint, googleApiKey, googleEndpoint, anthropicApiKey, anthropicEndpoint, metaApiKey, metaEndpoint } = req.body;
    const userId = req.user.id;

    // 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    // 验证API提供商和密钥
    if (apiProvider === 'openai' && openaiApiKey) {
      // 验证OpenAI API密钥格式
      if (!openaiApiKey.startsWith('sk-') || openaiApiKey.length < 20) {
        return res.status(400).json({ success: false, message: 'OpenAI API密钥格式无效' });
      }
    } else if (apiProvider === 'azure' && (azureApiKey || azureEndpoint)) {
      // 验证Azure API密钥和端点
      if (azureApiKey && azureApiKey.length < 10) {
        return res.status(400).json({ success: false, message: 'Azure API密钥格式无效' });
      }
      if (azureEndpoint && !azureEndpoint.includes('azure.com')) {
        return res.status(400).json({ success: false, message: 'Azure端点URL格式无效' });
      }
    } else if (apiProvider === 'aliyun' && (req.body.aliyunApiKey || req.body.aliyunEndpoint)) {
      // 验证阿里云通义千问API密钥和端点
      const { aliyunApiKey, aliyunEndpoint } = req.body;
      if (aliyunApiKey && aliyunApiKey.length < 10) {
        return res.status(400).json({ success: false, message: '阿里云API密钥格式无效' });
      }
      if (aliyunEndpoint && !aliyunEndpoint.includes('aliyuncs.com')) {
        return res.status(400).json({ success: false, message: '阿里云端点URL格式无效' });
      }
    } else if (apiProvider === 'deepseek' && (req.body.deepseekApiKey || req.body.deepseekEndpoint)) {
      // 验证DeepSeek API密钥和端点
      const { deepseekApiKey, deepseekEndpoint } = req.body;
      if (deepseekApiKey && deepseekApiKey.length < 10) {
        return res.status(400).json({ success: false, message: 'DeepSeek API密钥格式无效' });
      }
      if (deepseekEndpoint && !deepseekEndpoint.includes('deepseek.com')) {
        return res.status(400).json({ success: false, message: 'DeepSeek端点URL格式无效' });
      }
    } else if (apiProvider === 'google' && (req.body.googleApiKey || req.body.googleEndpoint)) {
      // 验证Google API密钥和端点
      const { googleApiKey, googleEndpoint } = req.body;
      if (googleApiKey && googleApiKey.length < 10) {
        return res.status(400).json({ success: false, message: 'Google API密钥格式无效' });
      }
      if (googleEndpoint && !googleEndpoint.includes('googleapis.com')) {
        return res.status(400).json({ success: false, message: 'Google端点URL格式无效' });
      }
    } else if (apiProvider === 'anthropic' && (req.body.anthropicApiKey || req.body.anthropicEndpoint)) {
      // 验证Anthropic API密钥和端点
      const { anthropicApiKey, anthropicEndpoint } = req.body;
      if (anthropicApiKey && anthropicApiKey.length < 10) {
        return res.status(400).json({ success: false, message: 'Anthropic API密钥格式无效' });
      }
      if (anthropicEndpoint && !anthropicEndpoint.includes('anthropic.com')) {
        return res.status(400).json({ success: false, message: 'Anthropic端点URL格式无效' });
      }
    } else if (apiProvider === 'meta' && (req.body.metaApiKey || req.body.metaEndpoint)) {
      // 验证Meta API密钥和端点
      const { metaApiKey, metaEndpoint } = req.body;
      if (metaApiKey && metaApiKey.length < 10) {
        return res.status(400).json({ success: false, message: 'Meta API密钥格式无效' });
      }
      if (metaEndpoint && !metaEndpoint.includes('meta.com')) {
        return res.status(400).json({ success: false, message: 'Meta端点URL格式无效' });
      }
    }
    
    // 调用AI服务生成项目框架
    const aiResponse = await generateProjectWithAI(projectDescription, projectType, techStack, model, apiProvider, openaiApiKey, azureApiKey, azureEndpoint, aliyunApiKey, aliyunEndpoint, deepseekApiKey, deepseekEndpoint, googleApiKey, googleEndpoint, anthropicApiKey, anthropicEndpoint, metaApiKey, metaEndpoint);
    
    if (!aiResponse.success) {
      return res.status(500).json({ 
        success: false, 
        message: aiResponse.error || 'AI生成项目失败' 
      });
    }

    // 创建项目记录 - 不保存敏感的API密钥信息
    const project = await AIProject.create({
      id: uuidv4(),
      name: projectName,
      description,
      type: projectType,
      techStack: techStack || '',
      content: JSON.stringify(aiResponse.content),
      userId: userId,
      aiModel: aiModel || 'gpt-4',
      apiProvider: apiProvider || 'openai',
      status: 'generated',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: '项目生成成功',
      projectId: project.id
    });

  } catch (error) {
    console.error('AI项目生成错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误，项目生成失败' 
    });
  }
});

// 使用AI生成项目框架
async function generateProjectWithAI(description, projectType, techStack, aiModel = 'gpt-4', apiProvider = 'openai', openaiApiKey = null, azureApiKey = null, azureEndpoint = null, aliyunApiKey = null, aliyunEndpoint = null, deepseekApiKey = null, deepseekEndpoint = null, googleApiKey = null, googleEndpoint = null, anthropicApiKey = null, anthropicEndpoint = null, metaApiKey = null, metaEndpoint = null) {
  try {
    // 根据API提供商选择不同的API端点和配置
    let apiEndpoint;
    let apiKey;
    let headers = {};
    let requestBody = {};
    const systemPrompt = "你是一个专业的项目架构师和代码生成器。根据用户的需求描述，生成项目结构和关键代码文件。请提供完整的项目结构和主要文件的代码实现。";
    const userPrompt = `请为我生成一个${projectType}项目，项目描述：${description}${techStack ? `，使用以下技术栈：${techStack}` : ''}`;
    
    if (apiProvider === 'openai') {
      apiEndpoint = 'https://api.openai.com/v1/chat/completions';
      // 优先使用用户提供的API密钥，如果没有则使用环境变量中的密钥
      apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      requestBody = {
        model: aiModel || 'gpt-4',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      };
    } else if (apiProvider === 'azure') {
      // 优先使用用户提供的端点和API密钥，如果没有则使用环境变量中的配置
      apiEndpoint = azureEndpoint || process.env.AZURE_OPENAI_ENDPOINT;
      apiKey = azureApiKey || process.env.AZURE_OPENAI_API_KEY;
      headers = {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      };
      requestBody = {
        model: aiModel || 'gpt-4',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      };
    } else if (apiProvider === 'aliyun') {
      // 阿里云通义千问API
      apiEndpoint = aliyunEndpoint || process.env.ALIYUN_QWEN_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
      apiKey = aliyunApiKey || process.env.ALIYUN_QWEN_API_KEY;
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      // 通义千问API请求格式
      requestBody = {
        model: aiModel || 'qwen-max',
        input: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 4000
        }
      };
    } else if (apiProvider === 'deepseek') {
      // DeepSeek API
      apiEndpoint = deepseekEndpoint || process.env.DEEPSEEK_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions';
      apiKey = deepseekApiKey || process.env.DEEPSEEK_API_KEY;
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      requestBody = {
        model: aiModel || 'deepseek-coder',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      };
    } else if (apiProvider === 'google') {
      // Google API
      apiEndpoint = googleEndpoint || process.env.GOOGLE_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
      apiKey = googleApiKey || process.env.GOOGLE_API_KEY;
      headers = {
        'Content-Type': 'application/json'
      };
      requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      };
      // 添加API密钥到URL查询参数
      apiEndpoint = `${apiEndpoint}?key=${apiKey}`;
    } else if (apiProvider === 'anthropic') {
      // Anthropic API
      apiEndpoint = anthropicEndpoint || process.env.ANTHROPIC_ENDPOINT || 'https://api.anthropic.com/v1/messages';
      apiKey = anthropicApiKey || process.env.ANTHROPIC_API_KEY;
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };
      requestBody = {
        model: aiModel || 'claude-3-opus-20240229',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      };
    } else if (apiProvider === 'meta') {
      // Meta API
      apiEndpoint = metaEndpoint || process.env.META_ENDPOINT || 'https://api.meta.ai/v1/chat/completions';
      apiKey = metaApiKey || process.env.META_API_KEY;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      requestBody = {
        model: aiModel || 'llama-3-70b-instruct',
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      };
    } else {
      return { success: false, error: '不支持的API提供商' };
    }
    
    if (!apiKey) {
      return { success: false, error: 'AI服务配置缺失，请提供有效的API密钥' };
    }

    // 使用用户选择的模型
    const model = aiModel || 'gpt-4';
    
    const response = await axios.post(apiEndpoint, requestBody, { headers });

    let aiContent;
    
    // 根据不同的API提供商解析响应
    if (apiProvider === 'openai' || apiProvider === 'azure' || apiProvider === 'deepseek' || apiProvider === 'meta') {
      // OpenAI、Azure、DeepSeek和Meta的响应格式类似
      aiContent = response.data.choices[0].message.content;
    } else if (apiProvider === 'aliyun') {
      // 阿里云通义千问的响应格式
      aiContent = response.data.output.text || response.data.output.message || response.data.output.content;
    } else if (apiProvider === 'google') {
      // Google Gemini的响应格式
      aiContent = response.data.candidates[0].content.parts[0].text;
    } else if (apiProvider === 'anthropic') {
      // Anthropic Claude的响应格式
      aiContent = response.data.content[0].text;
    } else {
      throw new Error('不支持的API提供商响应格式');
    }
    
    // 解析AI返回的内容，提取项目结构和代码
    const parsedContent = parseAIResponse(aiContent);
    
    return {
      success: true,
      content: parsedContent
    };

  } catch (error) {
    console.error('AI服务调用错误:', error);
    
    // 提供更详细的错误信息
    let errorMessage = '调用AI服务失败';
    
    if (error.response) {
      // API返回了错误响应
      if (error.response.status === 401) {
        errorMessage = 'API密钥无效或已过期';
      } else if (error.response.status === 429) {
        errorMessage = 'API请求超过限制，请稍后再试';
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error.message || error.response.data.error;
      }
      
      // 针对不同API提供商的特定错误处理
      if (apiProvider === 'google' && error.response.data?.error) {
        errorMessage = `Google AI错误: ${error.response.data.error.message || '未知错误'}`;
      } else if (apiProvider === 'anthropic' && error.response.data?.error) {
        errorMessage = `Anthropic错误: ${error.response.data.error.message || '未知错误'}`;
      } else if (apiProvider === 'meta' && error.response.data?.error) {
        errorMessage = `Meta AI错误: ${error.response.data.error.message || '未知错误'}`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '无法连接到AI服务，请检查网络或API端点';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

// 解析AI返回的内容
function parseAIResponse(aiContent) {
  // 这里应该实现解析逻辑，将AI返回的文本转换为结构化数据
  // 简单示例：假设AI返回的是JSON格式的项目结构
  try {
    // 尝试直接解析为JSON
    if (aiContent.includes('```json') && aiContent.includes('```')) {
      const jsonContent = aiContent.split('```json')[1].split('```')[0].trim();
      return JSON.parse(jsonContent);
    }
    
    // 如果不是JSON格式，则进行基本解析
    return {
      description: aiContent,
      files: extractFilesFromMarkdown(aiContent)
    };
  } catch (error) {
    console.error('解析AI响应失败:', error);
    return { rawContent: aiContent };
  }
}

// 从Markdown中提取文件
function extractFilesFromMarkdown(markdown) {
  const files = [];
  const codeBlockRegex = /```([\w-]+)\s*([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const language = match[1];
    const content = match[2].trim();
    
    // 尝试从代码块前的文本中提取文件名
    const beforeCodeBlock = markdown.substring(0, match.index).split('\n');
    let fileName = '';
    
    // 查找最近的可能是文件名的行
    for (let i = beforeCodeBlock.length - 1; i >= 0; i--) {
      const line = beforeCodeBlock[i].trim();
      if (line && !line.startsWith('#') && !line.startsWith('```') && line.includes('.')) {
        fileName = line.split('/').pop().replace(':', '').trim();
        break;
      }
    }
    
    if (!fileName && language) {
      // 如果没找到文件名，根据语言生成一个默认文件名
      const extensions = {
        js: 'index.js',
        javascript: 'index.js',
        html: 'index.html',
        css: 'styles.css',
        python: 'main.py',
        java: 'Main.java',
        // 添加更多语言映射
      };
      fileName = extensions[language] || `file.${language}`;
    }
    
    files.push({
      name: fileName || `file-${files.length + 1}`,
      language,
      content
    });
  }
  
  return files;
}

// 获取用户的所有AI项目
router.get('/projects', auth, async (req, res) => {
  try {
    const projects = await AIProject.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    console.error('获取AI项目列表失败:', error);
    res.status(500).json({ message: '获取AI项目列表失败' });
  }
});

// 获取单个AI项目详情
router.get('/projects/:id', auth, async (req, res) => {
  try {
    const project = await AIProject.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    res.json(project);
  } catch (error) {
    console.error('获取AI项目详情失败:', error);
    res.status(500).json({ message: '获取AI项目详情失败' });
  }
});

// 下载AI项目
router.get('/projects/:id/download', auth, async (req, res) => {
  try {
    const project = await AIProject.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 解析项目内容
    const projectContent = typeof project.content === 'string' 
      ? JSON.parse(project.content) 
      : project.content;

    // 创建一个临时目录来存储项目文件
    const tempDir = path.join(__dirname, 'temp', `project-${project.id}`);
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'));
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // 创建项目文件
    if (projectContent.files && Array.isArray(projectContent.files)) {
      for (const file of projectContent.files) {
        const filePath = path.join(tempDir, file.name);
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, file.content);
      }
    }

    // 创建README.md文件
    fs.writeFileSync(
      path.join(tempDir, 'README.md'),
      `# ${project.name}\n\n${project.description}\n\n## 技术栈\n\n${project.techStack}\n\n## 项目结构\n\n${projectContent.description || '无项目结构描述'}`
    );

    // 创建zip文件
    const zipPath = path.join(__dirname, 'temp', `${project.name}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // 发送zip文件
      res.download(zipPath, `${project.name}.zip`, (err) => {
        if (err) {
          console.error('发送下载文件失败:', err);
        }
        // 清理临时文件
        setTimeout(() => {
          try {
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir, { recursive: true });
          } catch (e) {
            console.error('清理临时文件失败:', e);
          }
        }, 1000);
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  } catch (error) {
    console.error('下载AI项目失败:', error);
    res.status(500).json({ message: '下载AI项目失败' });
  }
});

// 部署AI项目
router.post('/projects/:id/deploy', auth, async (req, res) => {
  try {
    const project = await AIProject.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 更新项目状态为已部署
    await project.update({ status: 'deployed' });

    // 这里可以添加实际的部署逻辑，例如将项目部署到云服务器或容器平台
    // 为了简化示例，我们只是更新了状态

    res.json({ message: '项目部署成功', project });
  } catch (error) {
    console.error('部署AI项目失败:', error);
    res.status(500).json({ message: '部署AI项目失败' });
  }
});

module.exports = router;