# 我的日历应用

一个简单的个人日历和日记应用，帮助用户记录每天的心情和生活。

## 功能特点

- 用户认证（登录/注册）
- 日历视图
- 日记记录
- 心情追踪
- 响应式设计

## 技术栈

- React 18
- Ant Design 5
- React Router 6
- Axios
- Day.js

## 开始使用

1. 克隆项目
```bash
git clone https://github.com/liangzhenkun/clanderLzk.git
cd clanderLzk
```

2. 安装依赖
```bash
yarn install
```

3. 启动开发服务器
```bash
yarn start
```

4. 构建生产版本
```bash
yarn build
```

## 项目结构

```
src/
├── components/          # 通用组件
├── features/           # 功能模块
├── hooks/             # 自定义 Hooks
├── services/          # API 服务
└── utils/            # 工具函数
```

## 环境变量

创建 `.env` 文件并设置以下变量：

```
REACT_APP_API_URL=http://localhost:3001/api
```

## 部署

项目使用 GitHub Pages 部署：

```bash
yarn deploy
```

## 许可证

MIT
