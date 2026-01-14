-- 创建数据库
CREATE DATABASE IF NOT EXISTS defense_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE defense_management_system;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    user_group VARCHAR(20) NOT NULL,
    avatar VARCHAR(255),
    state TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_name VARCHAR(50) NOT NULL,
    student_no VARCHAR(20) NOT NULL UNIQUE,
    student_gender VARCHAR(10),
    student_age VARCHAR(10),
    class_name VARCHAR(50),
    major_name VARCHAR(50),
    grade VARCHAR(20),
    state TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建教师表
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    teacher_name VARCHAR(50) NOT NULL,
    teacher_no VARCHAR(20) NOT NULL UNIQUE,
    teacher_gender VARCHAR(10),
    teacher_age VARCHAR(10),
    department_name VARCHAR(50),
    professional_title VARCHAR(50),
    state TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建答辩计划表
CREATE TABLE IF NOT EXISTS defense_plans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_name VARCHAR(100) NOT NULL,
    plan_desc TEXT,
    defense_type VARCHAR(50) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建答辩分组表
CREATE TABLE IF NOT EXISTS defense_groups (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    group_leader INT NOT NULL,
    venue_id INT,
    defense_time DATETIME NOT NULL,
    status TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES defense_plans(plan_id),
    FOREIGN KEY (group_leader) REFERENCES teachers(teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建答辩小组成员表
CREATE TABLE IF NOT EXISTS defense_group_members (
    gt_id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    teacher_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES defense_groups(group_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建小组学生表
CREATE TABLE IF NOT EXISTS group_students (
    gs_id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    student_id INT NOT NULL,
    thesis_title VARCHAR(255) NOT NULL,
    order_num INT NOT NULL,
    status TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES defense_groups(group_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建评分标准表
CREATE TABLE IF NOT EXISTS score_criteria (
    criteria_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    criteria_name VARCHAR(100) NOT NULL,
    criteria_desc TEXT,
    weight DECIMAL(5,2) NOT NULL,
    full_score DECIMAL(5,2) NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES defense_plans(plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建答辩评分表
CREATE TABLE IF NOT EXISTS defense_scores (
    score_id INT PRIMARY KEY AUTO_INCREMENT,
    gs_id INT NOT NULL,
    teacher_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    comment TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gs_id) REFERENCES group_students(gs_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    FOREIGN KEY (criteria_id) REFERENCES score_criteria(criteria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建答辩记录表
CREATE TABLE IF NOT EXISTS defense_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    gs_id INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    process_desc TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gs_id) REFERENCES group_students(gs_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建论文表
CREATE TABLE IF NOT EXISTS papers (
    paper_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    thesis_title VARCHAR(255) NOT NULL,
    thesis_abstract TEXT,
    keywords VARCHAR(255),
    advisor_id INT NOT NULL,
    file_path VARCHAR(255),
    file_size DECIMAL(10,2),
    status TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (advisor_id) REFERENCES teachers(teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建答辩材料表
CREATE TABLE IF NOT EXISTS defense_materials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    paper_id INT NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size DECIMAL(10,2),
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paper_id) REFERENCES papers(paper_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建通知表
CREATE TABLE IF NOT EXISTS notices (
    notice_id INT PRIMARY KEY AUTO_INCREMENT,
    notice_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notice_publisher VARCHAR(50) NOT NULL,
    release_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    examine_state TINYINT DEFAULT 0,
    recommend TINYINT DEFAULT 0,
    read_count INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_user_group ON users(user_group);
CREATE INDEX idx_users_state ON users(state);

CREATE INDEX idx_students_student_no ON students(student_no);
CREATE INDEX idx_students_class_name ON students(class_name);
CREATE INDEX idx_students_major_name ON students(major_name);
CREATE INDEX idx_students_grade ON students(grade);

CREATE INDEX idx_teachers_teacher_no ON teachers(teacher_no);
CREATE INDEX idx_teachers_department_name ON teachers(department_name);
CREATE INDEX idx_teachers_professional_title ON teachers(professional_title);

CREATE INDEX idx_defense_plans_plan_name ON defense_plans(plan_name);
CREATE INDEX idx_defense_plans_defense_type ON defense_plans(defense_type);
CREATE INDEX idx_defense_plans_status ON defense_plans(status);

CREATE INDEX idx_defense_groups_plan_id ON defense_groups(plan_id);
CREATE INDEX idx_defense_groups_defense_time ON defense_groups(defense_time);
CREATE INDEX idx_defense_groups_status ON defense_groups(status);

CREATE INDEX idx_group_students_group_id ON group_students(group_id);
CREATE INDEX idx_group_students_student_id ON group_students(student_id);
CREATE INDEX idx_group_students_order_num ON group_students(order_num);

CREATE INDEX idx_defense_scores_gs_id ON defense_scores(gs_id);
CREATE INDEX idx_defense_scores_teacher_id ON defense_scores(teacher_id);
CREATE INDEX idx_defense_scores_criteria_id ON defense_scores(criteria_id);

CREATE INDEX idx_papers_student_id ON papers(student_id);
CREATE INDEX idx_papers_status ON papers(status);

CREATE INDEX idx_notices_release_time ON notices(release_time);
CREATE INDEX idx_notices_examine_state ON notices(examine_state);
CREATE INDEX idx_notices_recommend ON notices(recommend);

-- 插入示例数据
-- 插入管理员用户
INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES
('admin', '$2a$10$eXm8cF1234567890abcdef', '系统管理员', '13800138000', 'admin@example.com', 'admin', 1);

-- 插入教师用户
INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES
('teacher001', '$2a$10$eXm8cF1234567890abcdef', '张教授', '13800138001', 'teacher001@example.com', 'teacher', 1),
('teacher002', '$2a$10$eXm8cF1234567890abcdef', '李老师', '13800138002', 'teacher002@example.com', 'teacher', 1);

-- 插入学生用户
INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES
('student001', '$2a$10$eXm8cF1234567890abcdef', '王同学', '13800138010', 'student001@example.com', 'student', 1),
('student002', '$2a$10$eXm8cF1234567890abcdef', '赵同学', '13800138011', 'student002@example.com', 'student', 1);

-- 插入教师详情
INSERT INTO teachers (user_id, teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, state) VALUES
(2, '张教授', 'T0001', '男', '50', '计算机科学与技术系', '教授', 1),
(3, '李老师', 'T0002', '女', '35', '软件工程系', '讲师', 1);

-- 插入学生详情
INSERT INTO students (user_id, student_name, student_no, student_gender, student_age, class_name, major_name, grade, state) VALUES
(4, '王同学', 'S20220001', '男', '22', '计算机22-1班', '计算机科学与技术', '2022', 1),
(5, '赵同学', 'S20220002', '女', '21', '计算机22-1班', '计算机科学与技术', '2022', 1);

-- 插入答辩计划
INSERT INTO defense_plans (plan_name, plan_desc, defense_type, start_time, end_time, status) VALUES
('2025年春季答辩计划', '2025年春季学期毕业论文答辩计划', '毕业论文答辩', '2025-05-15 08:00:00', '2025-05-20 18:00:00', 3),
('2025年秋季答辩计划', '2025年秋季学期毕业论文答辩计划', '毕业论文答辩', '2025-11-15 08:00:00', '2025-11-20 18:00:00', 1);

-- 插入答辩分组
INSERT INTO defense_groups (plan_id, group_name, group_leader, venue_id, defense_time, status) VALUES
(1, '第一答辩小组', 1, 1, '2025-05-15 09:00:00', 0),
(1, '第二答辩小组', 2, 2, '2025-05-15 09:00:00', 0);

-- 插入答辩小组成员
INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES
(1, 1, 'leader'),
(1, 2, 'member'),
(2, 2, 'leader'),
(2, 1, 'member');

-- 插入论文信息
INSERT INTO papers (student_id, thesis_title, thesis_abstract, keywords, advisor_id, status) VALUES
(1, '基于Vue3的答辩管理系统设计与实现', '本文设计并实现了一个基于Vue3的答辩管理系统...', 'Vue3,答辩管理,系统设计', 1, 2),
(2, '基于Spring Boot的后端API设计', '本文研究了基于Spring Boot的后端API设计与实现...', 'Spring Boot,API设计,后端开发', 2, 2);

-- 插入小组学生
INSERT INTO group_students (group_id, student_id, thesis_title, order_num, status) VALUES
(1, 1, '基于Vue3的答辩管理系统设计与实现', 1, 0),
(1, 2, '基于Spring Boot的后端API设计', 2, 0);

-- 插入评分标准
INSERT INTO score_criteria (plan_id, criteria_name, criteria_desc, weight, full_score) VALUES
(1, '论文质量', '论文的学术水平和写作质量', 0.4, 40.0),
(1, '答辩表现', '答辩过程中的表现和回答问题的能力', 0.4, 40.0),
(1, '创新点', '论文的创新点和贡献', 0.2, 20.0);

-- 插入通知
INSERT INTO notices (notice_title, content, notice_publisher, release_time, examine_state, recommend) VALUES
('答辩计划通知', '2025年春季答辩计划已发布，请各位同学注意查看...', '系统管理员', NOW(), 1, 1),
('答辩注意事项', '请参加答辩的同学提前准备好答辩PPT和相关材料...', '系统管理员', NOW(), 1, 0);

-- 创建数据库用户并授权
CREATE USER IF NOT EXISTS 'defense_user'@'localhost' IDENTIFIED BY 'defense_password';
GRANT ALL PRIVILEGES ON defense_management_system.* TO 'defense_user'@'localhost';
FLUSH PRIVILEGES;

-- 显示创建的表
SHOW TABLES;
