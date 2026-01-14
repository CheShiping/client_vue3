-- 插入测试学生账号
USE defense_management_system;

-- 1. 插入用户（如果不存在）
INSERT IGNORE INTO users (username, password, nickname, phone, email, user_group, state) 
VALUES ('student1', '123456', '测试学生1', '13800000001', 'student1@test.com', 'student', 1);

-- 2. 获取刚插入的用户ID并插入学生信息
SET @user_id = (SELECT user_id FROM users WHERE username = 'student1');

INSERT IGNORE INTO students (user_id, student_name, student_no, student_gender, student_age, class_name, major_name, grade, state)
VALUES (@user_id, '测试学生1', 'S2024001', '男', '22', '计算机2024-1班', '计算机科学与技术', '2024', 1);

-- 验证插入结果
SELECT u.user_id, u.username, u.user_group, s.student_id, s.student_name, s.student_no
FROM users u
LEFT JOIN students s ON u.user_id = s.user_id
WHERE u.username = 'student1';
