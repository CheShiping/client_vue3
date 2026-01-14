# 答辩管理系统 - MySQL集成说明

## ✅ 系统已完全集成MySQL

您的系统已经完全集成了MySQL数据库，不再使用mock数据。以下是详细说明：

## 📋 当前配置状态

### 1. 后端配置（backend/index.js）

✅ **已连接MySQL**
- 使用 `mysql2/promise` 连接池
- 数据库：`defense_management_system`
- 用户：`root`
- 密码：`111111`（在 `backend/.env` 中配置）

✅ **所有API都使用MySQL**
- 用户认证
- 学生管理
- 教师管理
- 答辩计划
- 答辩分组
- 答辩材料
- 答辩场地
- 评分标准
- 答辩评分
- 答辩记录
- 通知系统
- 统计分析

### 2. 前端配置

✅ **Mock已禁用**
- `vite.config.ts` 中 `viteMockServe` 的 `enable: false`
- 所有请求通过 `/api` 代理到后端

✅ **API请求配置**
- 基础URL：`/api`
- 代理目标：`http://127.0.0.1:5000`
- 自动添加认证token

### 3. 数据库配置文件

**backend/.env**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=111111
DB_NAME=defense_management_system
UPLOAD_PATH=./uploads
```

## 🚀 使用步骤

### 步骤1：导入测试数据

```bash
# 方法1：使用MySQL命令行
mysql -u root -p111111 < quick_test_data.sql

# 方法2：在MySQL客户端中执行
USE defense_management_system;
source quick_test_data.sql;
```

### 步骤2：启动后端服务器

```bash
cd backend
node index.js
```

后端将运行在：http://localhost:5000

### 步骤3：启动前端服务器

```bash
npm run dev
```

前端将运行在：http://localhost:3005（或其他可用端口）

### 步骤4：登录测试

使用测试账号登录（密码都是：123456）：
- 管理员：`admin`
- 教师：`teacher1`, `teacher2`, `teacher3`
- 学生：`student1`, `student2`, `student3`, `student4`, `student5`

## 📊 数据流程

```
前端 (Vue3) 
  ↓ HTTP请求 (/api/*)
Vite代理 (localhost:3005)
  ↓ 转发到
后端 (Express) (localhost:5000)
  ↓ SQL查询
MySQL数据库 (defense_management_system)
  ↓ 返回数据
后端处理并返回JSON
  ↓
前端接收并显示
```

## 🔍 验证MySQL集成

### 1. 检查后端连接

启动后端后，应该看到：
```
后端服务运行在 http://localhost:5000
成功连接到MySQL服务器
数据库 defense_management_system 创建成功（或已存在）
数据库连接池创建成功
用户表创建成功
学生表创建成功
教师表创建成功
...
数据库连接测试成功
```

### 2. 测试API请求

在浏览器中访问：
```
http://localhost:5000/api/user/health
```

应该返回：
```json
{
  "result": {
    "status": "ok",
    "message": "服务运行正常"
  }
}
```

### 3. 测试登录

使用测试账号登录系统，检查：
- ✅ 能否成功登录
- ✅ 能否看到用户信息
- ✅ 能否查看数据列表
- ✅ 能否进行CRUD操作

## 📝 API端点列表

### 用户相关
- `POST /api/user/login` - 用户登录
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/password` - 修改密码
- `PUT /api/user/info` - 更新用户信息

### 学生管理
- `GET /api/student/list` - 获取学生列表
- `GET /api/student/:id` - 获取学生详情
- `POST /api/student` - 添加学生
- `PUT /api/student/:id` - 更新学生
- `DELETE /api/student/:id` - 删除学生

### 教师管理
- `GET /api/teacher/list` - 获取教师列表
- `GET /api/teacher/:id` - 获取教师详情
- `POST /api/teacher` - 添加教师
- `PUT /api/teacher/:id` - 更新教师
- `DELETE /api/teacher/:id` - 删除教师

### 答辩计划
- `GET /api/defense/plan/list` - 获取答辩计划列表
- `GET /api/defense/plan/:id` - 获取答辩计划详情
- `POST /api/defense/plan` - 创建答辩计划
- `PUT /api/defense/plan/:id` - 更新答辩计划
- `DELETE /api/defense/plan/:id` - 删除答辩计划

### 答辩分组
- `GET /api/defense/group/list` - 获取答辩分组列表
- `GET /api/defense/group/:id` - 获取答辩分组详情
- `POST /api/defense/group` - 创建答辩分组
- `PUT /api/defense/group/:id` - 更新答辩分组
- `DELETE /api/defense/group/:id` - 删除答辩分组

### 答辩材料
- `GET /api/defense/material/list` - 获取材料列表
- `POST /api/defense/material/upload` - 上传材料
- `GET /api/defense/material/download/:id` - 下载材料
- `DELETE /api/defense/material/:id` - 删除材料

### 答辩场地
- `GET /api/defense/venue/list` - 获取场地列表
- `POST /api/defense/venue` - 添加场地
- `PUT /api/defense/venue/:id` - 更新场地
- `DELETE /api/defense/venue/:id` - 删除场地

### 评分标准
- `GET /api/defense/criteria/list` - 获取评分标准列表
- `POST /api/defense/criteria` - 添加评分标准
- `PUT /api/defense/criteria/:id` - 更新评分标准
- `DELETE /api/defense/criteria/:id` - 删除评分标准

### 答辩评分
- `GET /api/defense/score/list` - 获取评分列表
- `POST /api/defense/score` - 提交评分
- `GET /api/defense/score/final/:studentId` - 获取最终成绩

### 通知系统
- `GET /api/notification/list` - 获取通知列表
- `POST /api/notification/send` - 发送通知
- `PUT /api/notification/read/:id` - 标记已读
- `PUT /api/notification/read-all` - 全部标记已读

### 统计分析
- `GET /api/statistics/defense-completion` - 答辩完成统计
- `GET /api/statistics/score-distribution` - 成绩分布统计

## ⚠️ 注意事项

### 1. Mock数据已禁用
- `vite.config.ts` 中的 `viteMockServe` 已设置 `enable: false`
- `mock/` 目录中的文件不再使用
- 所有数据都从MySQL数据库读取

### 2. 数据库连接
- 确保MySQL服务正在运行
- 确保数据库用户名和密码正确（backend/.env）
- 确保数据库 `defense_management_system` 已创建

### 3. 端口配置
- 后端：5000
- 前端：3005（或其他可用端口）
- 确保端口没有被占用

### 4. 跨域配置
- 后端已启用CORS
- 前端使用Vite代理，无需额外配置

## 🔧 故障排除

### 问题1：无法连接数据库

**解决方案：**
1. 检查MySQL服务是否运行
2. 检查 `backend/.env` 中的数据库配置
3. 检查数据库用户权限

### 问题2：登录失败

**解决方案：**
1. 确保已导入测试数据
2. 检查用户名和密码是否正确
3. 查看后端控制台的错误信息

### 问题3：API请求404

**解决方案：**
1. 确保后端服务器正在运行
2. 检查Vite代理配置
3. 检查API路径是否正确

### 问题4：数据不显示

**解决方案：**
1. 检查数据库中是否有数据
2. 查看浏览器控制台的网络请求
3. 查看后端控制台的日志

## 📞 技术支持

如果遇到问题：
1. 检查后端控制台日志
2. 检查浏览器控制台错误
3. 检查MySQL数据库连接
4. 查看网络请求响应

---

**系统已完全集成MySQL，可以正常使用！** 🎉
