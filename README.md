# 用户管理系统

## 项目概述
这是一个基于React和Node.js的用户管理系统，提供用户注册、登录、个人资料管理等功能。

## 功能特性
- 用户认证（github OAuth登录）
- 个人资料管理
- 头像上传功能
- 项目管理系统（可选）

## 技术栈
- 前端：React, Ant Design
- 后端：Node.js, Express
- 数据库：MySQL

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

