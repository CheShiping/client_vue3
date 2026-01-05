# Thesis Management System – Requirements & MVP

## 1. 概览
本系统为基于 Vue 3 的前端应用，采用本地 Mock API 支撑前端开发，目标在于提供论文提交流程、评审流程与基本管理仪表盘的可用原型。角色定义、权限边界以后端实现为准，此处聚焦前端实现与工作流设计。

## 2. 角色与权限（初步）
- 学生/作者（Student/Author）: 提交论文、查看状态、下载/查看附件、编辑草稿（在提交前）
- 评审人（Reviewer）: 查看分配的论文、填写评审意见、提交评审结论
- 管理员/协调人（Admin/Coordinator）: 创建/管理用户、分配评审人、查看整体进度、导出报告

## 3. MVP 功能范围（第一版 releases）
- 鉴权与路由守卫
  - 登录/登出，基于角色的路由权限控制
- 论文管理
  - 提交表单：题名、摘要、关键词、作者、导师、院系、附件（模拟上传）
  - 论文列表：搜索、筛选、按状态排序
  - 论文详情：基本信息、元数据、附件预览/下载、评审记录入口
- 评审工作流
  - 管理员可为论文分配评审人
  - 评审人可查看分配任务，提交评审意见与结论
  - 状态流转：草稿（Draft）/提交（Submitted）/评审中（Under Review）/通过（Accepted）/拒绝（Rejected）
- 数据模型（草案）
  - User: id, name, email, role, department
  - Paper: id, title, abstract, keywords, authors (user ids), supervisorId, status, submissionDate, attachments
  - Review: id, paperId, reviewerId, score, comments, decision, date
  - Assignment: paperId, reviewerId, role
- API/Mock 端点（草案）
  - Auth: POST /api/auth/login
  - Papers: GET/POST /api/papers, GET /api/papers/{id}
  - Reviews: POST /api/papers/{id}/reviews, GET /api/reviews?paperId=
  - Users: GET /api/users
- UI/UX
  - 使用 Element Plus 组件库，确保风格统一
  - 响应式布局，适配常见屏幕
- 验收标准（示例）
  - 登录后能看到按角色授权的菜单与路由
  - 学生可提交论文，列表中可搜索、筛选并查看详情
  - 管理员可分配评审人，评审人可提交评审意见
  - 论文状态能够在 Draft → Submitted → Under Review → Accepted/Rejected 之间正确变更
- 未来可扩展的非 MVP 功能
  - 实时通知、任务提醒
  - 文件存储与实际后端对接
  - 数据导出/导入、仪表盘分析
  - 多语言支持、无障碍优化

## 4. 数据模型（草案）
- User: { id, name, email, role, department }
- Paper: { id, title, abstract, keywords, authors: [id], supervisorId, status, submissionDate, attachments: [filename] }
- Review: { id, paperId, reviewerId, score, comments, decision, date }
- Assignment: { paperId, reviewerId, role }
- Comment: { id, paperId, authorId, content, date }

## 5. API 草案（Mock）
- POST /api/auth/login: 身份验证，返回 token 与用户信息
- GET /api/users: 获取用户列表
- GET /api/papers: 论文列表（支持 status、search、page、size）
- POST /api/papers: 新增论文草稿/提交论文
- GET /api/papers/{id}: 论文详情
- POST /api/papers/{id}/reviews: 提交评审
- GET /api/reviews?paperId=: 根据论文获取评审

## 6. 验收与里程碑
- 验收点1：完成鉴权与路由骨架，能基于角色进入相应页面
- 验收点2：实现论文管理的核心表单、列表、详情页面，以及草稿提交与状态初步变更
- 验收点3：实现评审分配与评审提交，状态流转走通
- 验收点4：Mock API 完整可用，前端可独立完成大部分功能
- 里程碑：阶段性交付文档、组件草图、可运行的 MVP 演示

## 7. 风险与取舍
- 现阶段以前端为主，后端接口为 Mock，后续对接需对接真实后端 API 与鉴权系统
- 权限设计初步以角色为核心，后续可细化为权限矩阵

