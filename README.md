# 用户管理系统

## 项目概述
这是一个基于React和Node.js的用户管理系统，提供用户注册、登录、个人资料管理等功能。

## 功能特性
- 用户认证（QQ OAuth登录）
- 个人资料管理
- 头像上传功能
- 项目管理系统（可选）

## 技术栈
- 前端：React, Ant Design
- 后端：Node.js, Express
- 数据库：MySQL

## 安装指南

### 前置要求
- Node.js 16+
- MySQL 8.0+

### 安装步骤
1. 克隆仓库
```bash
git clone <仓库地址>
```
2. 安装依赖
```bash
cd userManagement
npm install
cd ../userManagement/server
npm install
```
3. 配置环境变量
复制`.env.example`为`.env`并填写实际配置

4. 启动应用
```bash
# 启动前端
cd ../userManagement
npm start

# 启动后端
cd server
npm start
```

## 配置说明

### 必需环境变量
```
QQ_CLIENT_ID=你的QQ应用ID
QQ_CLIENT_SECRET=你的QQ应用密钥
MYSQL_HOST=数据库主机
MYSQL_USER=数据库用户
MYSQL_PASSWORD=数据库密码
MYSQL_DATABASE=数据库名称
```

## 使用说明
1. 访问 `http://localhost:3000`
2. 使用QQ账号登录
3. 在个人资料页面管理您的信息

## 开发指南

### 代码结构
```
userManagement/
├── server/            # 后端代码
│   ├── authRoutes.js   # 认证路由
│   ├── profileRoutes.js # 个人资料路由
│   └── ...
└── src/               # 前端代码
    ├── pages/         # 页面组件
    └── ...
```

## 贡献指南
欢迎提交Pull Request或Issue。
