# Thesis Management System – Architecture (Current Status & Plan)

Overview
- Frontend: Vue 3 + Vite, Pinia for state management, Element Plus for UI, mock API via本地/插件支持。
- Goal: 以 MVP 为入口，提供论文提交流程、评审与基本管理能力，后续对接真实后端。

Proposed Folder Structure (for reference)
- src/
  - main.ts / main.js: 应用入口
  - router/: 路由与路由守卫
  - store/: Pinia 状态管理
  - views/: 视图页面（论文列表、论文详情、提交表单、审阅区等）
  - components/: 可复用组件
  - api/: 封装 API 调用（mock 和将来真实后端对接的桥接）
  - assets/: 静态资源
  - styles/: 公共样式
  - utils/: 通用工具

状态管理要点
- 使用 Pinia 管理全局状态，如认证信息、当前用户、UI 主题等
- 认证状态影响路由守卫与菜单可见性

认证与路由
- 登录/登出流程，基于角色的路由保护（权限守卫在路由配置实现）
- 未来可扩展多角色权限矩阵

数据模型概要（草案）
- User: { id, name, email, role, department }
- Paper: { id, title, abstract, keywords, authors: [id], supervisorId, status, submissionDate, attachments }
- Review: { id, paperId, reviewerId, score, comments, decision, date }
- Assignment: { paperId, reviewerId, role }
- Comment: { id, paperId, authorId, content, date }

Mock API 方案
- 使用 vite-plugin-mock 或自定义 mock 服务器，提供以下端点的草案实现：
  - POST /api/auth/login
  - GET /api/users
  - GET/POST /api/papers, GET /api/papers/{id}
  - POST /api/papers/{id}/reviews
  - GET /api/reviews?paperId=

开发与测试工作流
- 本地开发通过 npm run dev 启动，路由与页面通过 mock 数据进行验证
- 接口定义将逐步完善，保持向后向前兼容性
- 通过简单的单元测试/组件测试覆盖关键路径

下一步
- 根据需求与实现优先级，逐步落地 MVP 功能并对齐 API 设计与界面实现。
