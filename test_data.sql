-- ============================================
-- 答辩管理系统测试数据
-- ============================================

USE defense_management_system;

-- 清空现有数据（可选，如果需要重新开始）
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE defense_materials;
-- TRUNCATE TABLE defense_venues;
-- TRUNCATE TABLE score_criteria;
-- TRUNCATE TABLE defense_scores;
-- TRUNCATE TABLE defense_records;
-- TRUNCATE TABLE notifications;
-- TRUNCATE TABLE group_students;
-- TRUNCATE TABLE defense_group_members;
-- TRUNCATE TABLE defense_groups;
-- TRUNCATE TABLE defense_plans;
-- TRUNCATE TABLE papers;
-- TRUNCATE TABLE notices;
-- TRUNCATE TABLE teachers;
-- TRUNCATE TABLE students;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. 用户数据
-- ============================================
-- 密码都是: 123456 (已加密)
INSERT INTO users (username, password, user_group, status) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'admin', 1),
('teacher001', '123456', 'teacher', 1),
('teacher002', '123456', 'teacher', 1),
('teacher003', '123456', 'teacher', 1),
('student001', '123456', 'student', 1),
('student002', '123456', 'student', 1),
('student003', '123456', 'student', 1),
('student004', '123456', 'student', 1),
('student005', '123456', 'student', 1),
('student006', '123456', 'student', 1),
('student007', '123456', 'student', 1),
('student008', '123456', 'student', 1),
('student009', '123456', 'student', 1),
('student010', '123456', 'student', 1);

-- ============================================
-- 2. 教师数据
-- ============================================
INSERT INTO teachers (teacher_name, teacher_no, gender, phone, email, department, title, user_id) VALUES
('张教授', 'T001', '男', '13800001001', 'zhang@university.edu', '计算机学院', '教授', 2),
('李副教授', 'T002', '女', '13800001002', 'li@university.edu', '计算机学院', '副教授', 3),
('王讲师', 'T003', '男', '13800001003', 'wang@university.edu', '软件学院', '讲师', 4);

-- ============================================
-- 3. 学生数据
-- ============================================
INSERT INTO students (student_name, student_no, gender, phone, email, major, class_name, grade, user_id) VALUES
('陈小明', '2020001', '男', '13900001001', 'chen@student.edu', '计算机科学与技术', '计科2001班', '2020', 5),
('刘小红', '2020002', '女', '13900001002', 'liu@student.edu', '计算机科学与技术', '计科2001班', '2020', 6),
('赵小刚', '2020003', '男', '13900001003', 'zhao@student.edu', '软件工程', '软工2001班', '2020', 7),
('孙小丽', '2020004', '女', '13900001004', 'sun@student.edu', '软件工程', '软工2001班', '2020', 8),
('周小伟', '2020005', '男', '13900001005', 'zhou@student.edu', '计算机科学与技术', '计科2002班', '2020', 9),
('吴小芳', '2020006', '女', '13900001006', 'wu@student.edu', '计算机科学与技术', '计科2002班', '2020', 10),
('郑小强', '2020007', '男', '13900001007', 'zheng@student.edu', '软件工程', '软工2002班', '2020', 11),
('王小娟', '2020008', '女', '13900001008', 'wangxj@student.edu', '软件工程', '软工2002班', '2020', 12),
('李小东', '2020009', '男', '13900001009', 'lixd@student.edu', '计算机科学与技术', '计科2003班', '2020', 13),
('张小梅', '2020010', '女', '13900001010', 'zhangxm@student.edu', '计算机科学与技术', '计科2003班', '2020', 14);

-- ============================================
-- 4. 答辩计划数据
-- ============================================
INSERT INTO defense_plans (plan_name, plan_desc, defense_type, start_time, end_time, status) VALUES
('2024届本科毕业论文答辩', '2024届本科生毕业论文答辩安排', '毕业答辩', '2024-05-15 08:00:00', '2024-05-20 18:00:00', 3),
('2024届硕士论文答辩', '2024届硕士研究生论文答辩安排', '毕业答辩', '2024-05-22 08:00:00', '2024-05-25 18:00:00', 2),
('2024春季学期中期答辩', '2024春季学期研究生中期答辩', '中期答辩', '2024-04-10 08:00:00', '2024-04-15 18:00:00', 3);

-- ============================================
-- 5. 答辩分组数据
-- ============================================
INSERT INTO defense_groups (plan_id, group_name, group_leader, defense_time, defense_location, status) VALUES
(1, '第一答辩组', 1, '2024-05-15 08:00:00', '教学楼A101', 1),
(1, '第二答辩组', 2, '2024-05-15 14:00:00', '教学楼A102', 1),
(1, '第三答辩组', 3, '2024-05-16 08:00:00', '教学楼A103', 1);

-- ============================================
-- 6. 答辩小组成员数据
-- ============================================
INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES
(1, 1, '组长'),
(1, 2, '成员'),
(2, 2, '组长'),
(2, 3, '成员'),
(3, 3, '组长'),
(3, 1, '成员');

-- ============================================
-- 7. 小组学生数据
-- ============================================
INSERT INTO group_students (group_id, student_id, defense_order) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(2, 4, 1),
(2, 5, 2),
(2, 6, 3),
(3, 7, 1),
(3, 8, 2),
(3, 9, 3),
(3, 10, 4);

-- ============================================
-- 8. 通知公告数据
-- ============================================
INSERT INTO notices (notice_title, content, type, notice_publisher, release_time, examine_state, recommend) VALUES
('关于2024届毕业论文答辩的通知', '<p>各位同学：</p><p>2024届本科毕业论文答辩将于5月15日开始，请各位同学做好准备。</p><p>具体安排请查看答辩计划。</p>', '通知', '教务处', NOW(), '已发布', 1),
('答辩材料提交截止时间提醒', '<p>请各位同学注意：</p><p>答辩材料（PPT、论文终稿等）需在答辩前3天提交完毕。</p><p>逾期将影响答辩安排。</p>', '公告', '教务处', NOW(), '已发布', 1),
('答辩场地安排说明', '<p>本次答辩场地安排如下：</p><ul><li>第一组：教学楼A101</li><li>第二组：教学楼A102</li><li>第三组：教学楼A103</li></ul>', '介绍', '教务处', NOW(), '已发布', 0);

-- ============================================
-- 9. 答辩场地数据
-- ============================================
INSERT INTO defense_venues (venue_name, location, capacity, equipment, status) VALUES
('教学楼A101', '教学楼A栋1楼101室', 30, '投影仪、音响、白板', 1),
('教学楼A102', '教学楼A栋1楼102室', 30, '投影仪、音响、白板', 1),
('教学楼A103', '教学楼A栋1楼103室', 25, '投影仪、音响', 1),
('教学楼B201', '教学楼B栋2楼201室', 40, '投影仪、音响、白板、录播设备', 1),
('实验楼C301', '实验楼C栋3楼301室', 20, '投影仪、白板', 1);

-- ============================================
-- 10. 评分标准数据
-- ============================================
INSERT INTO score_criteria (plan_id, criteria_name, criteria_desc, max_score, weight) VALUES
(1, '论文质量', '论文的研究内容、创新性、学术价值', 100, 40),
(1, '答辩表现', '答辩过程中的表达能力、应变能力', 100, 30),
(1, '研究方法', '研究方法的科学性和合理性', 100, 20),
(1, '文献综述', '文献综述的全面性和深度', 100, 10);

-- ============================================
-- 11. 答辩评分数据
-- ============================================
INSERT INTO defense_scores (student_id, teacher_id, group_id, criteria_id, score, comments) VALUES
-- 学生1的评分
(1, 1, 1, 1, 85, '论文质量较好，有一定创新性'),
(1, 1, 1, 2, 88, '答辩表现出色'),
(1, 1, 1, 3, 82, '研究方法合理'),
(1, 1, 1, 4, 86, '文献综述全面'),
-- 学生2的评分
(2, 1, 1, 1, 90, '论文质量优秀'),
(2, 1, 1, 2, 92, '答辩表现优秀'),
(2, 1, 1, 3, 88, '研究方法科学'),
(2, 1, 1, 4, 90, '文献综述深入');

-- ============================================
-- 12. 答辩记录数据
-- ============================================
INSERT INTO defense_records (student_id, group_id, venue_id, start_time, end_time, status, notes) VALUES
(1, 1, 1, '2024-05-15 08:00:00', '2024-05-15 08:30:00', 'completed', '答辩顺利完成'),
(2, 1, 1, '2024-05-15 08:30:00', '2024-05-15 09:00:00', 'completed', '答辩顺利完成'),
(3, 1, 1, '2024-05-15 09:00:00', '2024-05-15 09:30:00', 'completed', '答辩顺利完成'),
(4, 2, 2, '2024-05-15 14:00:00', '2024-05-15 14:30:00', 'in_progress', '答辩进行中'),
(5, 2, 2, '2024-05-15 14:30:00', '2024-05-15 15:00:00', 'pending', '待答辩');

-- ============================================
-- 13. 通知中心数据
-- ============================================
INSERT INTO notifications (user_id, type, title, content, is_read) VALUES
(5, 'defense', '答辩时间通知', '您的答辩时间为2024-05-15 08:00，地点：教学楼A101', 0),
(6, 'defense', '答辩时间通知', '您的答辩时间为2024-05-15 08:30，地点：教学楼A101', 0),
(7, 'defense', '答辩时间通知', '您的答辩时间为2024-05-15 09:00，地点：教学楼A101', 0),
(5, 'system', '材料提交提醒', '请在答辩前3天提交答辩材料', 1),
(2, 'defense', '答辩安排通知', '您被安排为第一答辩组组长', 0);

-- ============================================
-- 14. 答辩材料数据（示例，实际文件需要上传）
-- ============================================
-- 注意：这里只是数据库记录，实际文件需要通过系统上传
INSERT INTO defense_materials (student_id, material_type, material_name, file_name, file_path, file_size, description, upload_time) VALUES
(1, 'thesis', '毕业论文终稿', '陈小明_毕业论文.pdf', '/uploads/thesis_001.pdf', 2048000, '毕业论文终稿', '2024-05-10 10:00:00'),
(1, 'ppt', '答辩PPT', '陈小明_答辩PPT.pptx', '/uploads/ppt_001.pptx', 5120000, '答辩演示文稿', '2024-05-10 11:00:00'),
(2, 'thesis', '毕业论文终稿', '刘小红_毕业论文.pdf', '/uploads/thesis_002.pdf', 2560000, '毕业论文终稿', '2024-05-10 10:30:00'),
(2, 'ppt', '答辩PPT', '刘小红_答辩PPT.pptx', '/uploads/ppt_002.pptx', 4096000, '答辩演示文稿', '2024-05-10 11:30:00');

-- ============================================
-- 完成！
-- ============================================
SELECT '测试数据插入完成！' AS message;

-- 查看插入的数据统计
SELECT 
    (SELECT COUNT(*) FROM users) AS '用户数',
    (SELECT COUNT(*) FROM teachers) AS '教师数',
    (SELECT COUNT(*) FROM students) AS '学生数',
    (SELECT COUNT(*) FROM defense_plans) AS '答辩计划数',
    (SELECT COUNT(*) FROM defense_groups) AS '答辩分组数',
    (SELECT COUNT(*) FROM defense_venues) AS '答辩场地数',
    (SELECT COUNT(*) FROM score_criteria) AS '评分标准数',
    (SELECT COUNT(*) FROM defense_scores) AS '评分记录数',
    (SELECT COUNT(*) FROM defense_records) AS '答辩记录数',
    (SELECT COUNT(*) FROM notifications) AS '通知数',
    (SELECT COUNT(*) FROM defense_materials) AS '答辩材料数';
