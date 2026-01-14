# 答辩管理系统数据库设计

## 1. 设计概述

根据对答辩管理系统前端代码的分析，设计了一套完整的数据库架构，包含13个核心表，支持用户管理、学生管理、教师管理、答辩计划、答辩分组、评分管理等功能。

## 2. 数据库表结构

### 2.1 用户表 (users)

基础用户信息表，存储所有系统用户的基本信息。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| nickname | VARCHAR(100) | NOT NULL | 昵称 |
| phone | VARCHAR(20) | | 电话 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| user_group | VARCHAR(20) | NOT NULL | 用户组（admin/teacher/student） |
| avatar | VARCHAR(255) | | 头像URL |
| state | TINYINT | DEFAULT 1 | 状态（1-正常，0-禁用） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.2 学生表 (students)

学生详细信息表，关联到用户表。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| student_id | INT | PRIMARY KEY, AUTO_INCREMENT | 学生ID |
| user_id | INT | NOT NULL, FOREIGN KEY REFERENCES users(user_id) | 关联用户ID |
| student_name | VARCHAR(50) | NOT NULL | 学生姓名 |
| student_no | VARCHAR(20) | NOT NULL, UNIQUE | 学号 |
| student_gender | VARCHAR(10) | | 性别 |
| student_age | VARCHAR(10) | | 年龄 |
| class_name | VARCHAR(50) | | 班级 |
| major_name | VARCHAR(50) | | 专业 |
| grade | VARCHAR(20) | | 年级 |
| state | TINYINT | DEFAULT 1 | 状态（1-正常，0-禁用） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.3 教师表 (teachers)

教师详细信息表，关联到用户表。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| teacher_id | INT | PRIMARY KEY, AUTO_INCREMENT | 教师ID |
| user_id | INT | NOT NULL, FOREIGN KEY REFERENCES users(user_id) | 关联用户ID |
| teacher_name | VARCHAR(50) | NOT NULL | 教师姓名 |
| teacher_no | VARCHAR(20) | NOT NULL, UNIQUE | 工号 |
| teacher_gender | VARCHAR(10) | | 性别 |
| teacher_age | VARCHAR(10) | | 年龄 |
| department_name | VARCHAR(50) | | 部门 |
| professional_title | VARCHAR(50) | | 职称 |
| state | TINYINT | DEFAULT 1 | 状态（1-正常，0-禁用） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.4 答辩计划表 (defense_plans)

答辩整体计划信息表。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| plan_id | INT | PRIMARY KEY, AUTO_INCREMENT | 计划ID |
| plan_name | VARCHAR(100) | NOT NULL | 计划名称 |
| plan_desc | TEXT | | 计划描述 |
| defense_type | VARCHAR(50) | NOT NULL | 答辩类型 |
| start_time | DATETIME | NOT NULL | 开始时间 |
| end_time | DATETIME | NOT NULL | 结束时间 |
| status | TINYINT | DEFAULT 0 | 状态（0-草稿，1-审核中，2-已审核，3-已发布，4-已结束） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.5 答辩分组表 (defense_groups)

具体的答辩小组信息，关联到答辩计划。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| group_id | INT | PRIMARY KEY, AUTO_INCREMENT | 小组ID |
| plan_id | INT | NOT NULL, FOREIGN KEY REFERENCES defense_plans(plan_id) | 关联计划ID |
| group_name | VARCHAR(100) | NOT NULL | 小组名称 |
| group_leader | INT | NOT NULL, FOREIGN KEY REFERENCES teachers(teacher_id) | 组长教师ID |
| venue_id | INT | | 场地ID（可扩展） |
| defense_time | DATETIME | NOT NULL | 答辩时间 |
| status | TINYINT | DEFAULT 0 | 状态（0-未开始，1-进行中，2-已结束） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.6 答辩小组成员表 (defense_group_members)

教师在答辩小组中的角色信息，关联到教师和答辩小组。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| gt_id | INT | PRIMARY KEY, AUTO_INCREMENT | 成员ID |
| group_id | INT | NOT NULL, FOREIGN KEY REFERENCES defense_groups(group_id) | 关联小组ID |
| teacher_id | INT | NOT NULL, FOREIGN KEY REFERENCES teachers(teacher_id) | 关联教师ID |
| role | VARCHAR(20) | NOT NULL | 角色（leader-member） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.7 小组学生表 (group_students)

学生在答辩小组中的安排信息，关联到学生和答辩小组。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| gs_id | INT | PRIMARY KEY, AUTO_INCREMENT | 小组学生ID |
| group_id | INT | NOT NULL, FOREIGN KEY REFERENCES defense_groups(group_id) | 关联小组ID |
| student_id | INT | NOT NULL, FOREIGN KEY REFERENCES students(student_id) | 关联学生ID |
| thesis_title | VARCHAR(255) | NOT NULL | 论文题目 |
| order_num | INT | NOT NULL | 答辩顺序 |
| status | TINYINT | DEFAULT 0 | 状态（0-待答辩，1-已答辩，2-缓答辩） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.8 评分标准表 (score_criteria)

答辩评分的标准信息，关联到答辩计划。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| criteria_id | INT | PRIMARY KEY, AUTO_INCREMENT | 标准ID |
| plan_id | INT | NOT NULL, FOREIGN KEY REFERENCES defense_plans(plan_id) | 关联计划ID |
| criteria_name | VARCHAR(100) | NOT NULL | 标准名称 |
| criteria_desc | TEXT | | 标准描述 |
| weight | DECIMAL(5,2) | NOT NULL | 权重 |
| full_score | DECIMAL(5,2) | NOT NULL | 满分 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.9 答辩评分表 (defense_scores)

教师对学生的评分信息，关联到评分标准、教师和小组学生。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| score_id | INT | PRIMARY KEY, AUTO_INCREMENT | 评分ID |
| gs_id | INT | NOT NULL, FOREIGN KEY REFERENCES group_students(gs_id) | 关联小组学生ID |
| teacher_id | INT | NOT NULL, FOREIGN KEY REFERENCES teachers(teacher_id) | 关联教师ID |
| criteria_id | INT | NOT NULL, FOREIGN KEY REFERENCES score_criteria(criteria_id) | 关联标准ID |
| score | DECIMAL(5,2) | NOT NULL | 得分 |
| comment | TEXT | | 评语 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.10 答辩记录表 (defense_records)

答辩过程的记录信息。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| record_id | INT | PRIMARY KEY, AUTO_INCREMENT | 记录ID |
| gs_id | INT | NOT NULL, FOREIGN KEY REFERENCES group_students(gs_id) | 关联小组学生ID |
| start_time | DATETIME | | 开始时间 |
| end_time | DATETIME | | 结束时间 |
| process_desc | TEXT | | 过程描述 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.11 论文表 (papers)

学生论文信息表。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| paper_id | INT | PRIMARY KEY, AUTO_INCREMENT | 论文ID |
| student_id | INT | NOT NULL, FOREIGN KEY REFERENCES students(student_id) | 关联学生ID |
| thesis_title | VARCHAR(255) | NOT NULL | 论文题目 |
| thesis_abstract | TEXT | | 论文摘要 |
| keywords | VARCHAR(255) | | 关键词 |
| advisor_id | INT | NOT NULL, FOREIGN KEY REFERENCES teachers(teacher_id) | 指导教师ID |
| file_path | VARCHAR(255) | | 论文文件路径 |
| file_size | DECIMAL(10,2) | | 文件大小(MB) |
| status | TINYINT | DEFAULT 0 | 状态（0-待提交，1-已提交，2-已通过，3-已驳回） |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.12 答辩材料表 (defense_materials)

答辩相关的材料文件信息。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| material_id | INT | PRIMARY KEY, AUTO_INCREMENT | 材料ID |
| paper_id | INT | NOT NULL, FOREIGN KEY REFERENCES papers(paper_id) | 关联论文ID |
| material_name | VARCHAR(255) | NOT NULL | 材料名称 |
| material_type | VARCHAR(50) | NOT NULL | 材料类型 |
| file_path | VARCHAR(255) | NOT NULL | 文件路径 |
| file_size | DECIMAL(10,2) | | 文件大小(MB) |
| upload_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 上传时间 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 2.13 通知表 (notices)

系统通知信息表。

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| notice_id | INT | PRIMARY KEY, AUTO_INCREMENT | 通知ID |
| notice_title | VARCHAR(255) | NOT NULL | 通知标题 |
| content | TEXT | NOT NULL | 通知内容 |
| notice_publisher | VARCHAR(50) | NOT NULL | 发布人 |
| release_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 发布时间 |
| examine_state | TINYINT | DEFAULT 0 | 审核状态（0-待审核，1-已审核，2-已驳回） |
| recommend | TINYINT | DEFAULT 0 | 是否推荐（0-否，1-是） |
| read_count | INT | DEFAULT 0 | 阅读次数 |
| create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_time | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 3. 关系图

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   users    │────>│  students  │────>│   papers   │
└────────────┘     └────────────┘     └─────┬──────┘
        │                                       │
        ▼                                       ▼
┌────────────┐     ┌────────────┐     ┌──────────────────┐
│  teachers  │────>│defense_plans│────>│defense_groups    │
└────────────┘     └─────┬──────┘     └─────┬──────────┘
                          │                  │
                          ▼                  ▼
                ┌──────────────────┐     ┌──────────────────┐
                │score_criteria    │     │group_students    │
                └──────────┬───────┘     └─────┬──────────┘
                           │                  │
                           ▼                  ▼
                ┌──────────────────┐     ┌──────────────────┐
                │defense_scores    │     │defense_records   │
                └──────────────────┘     └──────────────────┘
```

## 4. 数据存储流程

### 4.1 用户注册与信息存储

1. 用户注册时，系统将用户基本信息存储到 `users` 表
2. 根据用户类型（教师/学生），将详细信息分别存储到 `teachers` 或 `students` 表
3. 两个表通过 `user_id` 字段关联

### 4.2 答辩计划与分组存储

1. 管理员创建答辩计划，信息存储到 `defense_plans` 表
2. 基于答辩计划创建答辩分组，信息存储到 `defense_groups` 表，通过 `plan_id` 关联
3. 为答辩分组分配教师成员，信息存储到 `defense_group_members` 表，通过 `group_id` 和 `teacher_id` 关联
4. 将学生分配到答辩分组，信息存储到 `group_students` 表，通过 `group_id` 和 `student_id` 关联

### 4.3 评分管理数据存储

1. 为答辩计划设置评分标准，信息存储到 `score_criteria` 表，通过 `plan_id` 关联
2. 教师对学生进行评分，信息存储到 `defense_scores` 表，通过 `criteria_id`、`teacher_id` 和 `gs_id` 关联

### 4.4 论文与材料存储

1. 学生提交论文，信息存储到 `papers` 表，通过 `student_id` 关联
2. 学生上传答辩材料，信息存储到 `defense_materials` 表，通过 `paper_id` 关联

### 4.5 通知管理数据存储

1. 管理员发布通知，信息存储到 `notices` 表
2. 通知内容支持富文本格式，存储在 `content` 字段

## 5. 索引设计

为提高查询性能，建议在以下字段上创建索引：

- `users`: `username` (UNIQUE), `user_group`, `state`
- `students`: `student_no` (UNIQUE), `class_name`, `major_name`, `grade`
- `teachers`: `teacher_no` (UNIQUE), `department_name`, `professional_title`
- `defense_plans`: `plan_name`, `defense_type`, `status`
- `defense_groups`: `plan_id`, `defense_time`, `status`
- `group_students`: `group_id`, `student_id`, `order_num`
- `defense_scores`: `gs_id`, `teacher_id`, `criteria_id`
- `papers`: `student_id`, `status`
- `notices`: `release_time`, `examine_state`, `recommend`

## 6. 安全考虑

1. **密码存储**：用户密码使用加盐哈希算法（如bcrypt）存储，确保安全
2. **权限控制**：通过 `user_group` 字段控制用户权限，实现RBAC模型
3. **数据验证**：所有输入数据在存储前进行严格验证，防止SQL注入和XSS攻击
4. **敏感数据保护**：学生和教师的敏感信息（如电话、邮箱）仅授权用户可见
5. **日志记录**：关键操作（如用户登录、数据修改）进行日志记录，便于审计

## 7. 扩展建议

1. **场地管理**：可添加 `venues` 表，管理答辩场地信息，与 `defense_groups` 表关联
2. **成绩统计**：可添加 `score_statistics` 表，存储学生的综合成绩和排名
3. **在线答辩**：可添加 `online_defense` 表，支持在线答辩功能
4. **消息系统**：可添加 `messages` 表，实现用户间的私信功能
5. **数据分析**：可添加数据仓库和分析模块，支持答辩数据分析和报表生成
