/*
Navicat MySQL Data Transfer

Source Server         : A234
Source Server Version : 80019
Source Host           : localhost:3306
Source Database       : defense_management_system

Target Server Type    : MYSQL
Target Server Version : 80019
File Encoding         : 65001

Date: 2026-01-14 10:57:48
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `defense_groups`
-- ----------------------------
DROP TABLE IF EXISTS `defense_groups`;
CREATE TABLE `defense_groups` (
  `group_id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `group_leader` int NOT NULL,
  `venue_id` int DEFAULT NULL,
  `defense_time` datetime NOT NULL,
  `status` tinyint DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`),
  KEY `plan_id` (`plan_id`),
  KEY `group_leader` (`group_leader`),
  CONSTRAINT `defense_groups_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `defense_plans` (`plan_id`),
  CONSTRAINT `defense_groups_ibfk_2` FOREIGN KEY (`group_leader`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of defense_groups
-- ----------------------------
INSERT INTO `defense_groups` VALUES ('2', '7', '第一答辩小组', '4', '1', '2025-05-15 09:00:00', '0', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `defense_groups` VALUES ('3', '7', '第二答辩小组', '5', '2', '2025-05-15 09:00:00', '0', '2026-01-14 09:11:40', '2026-01-14 09:11:40');

-- ----------------------------
-- Table structure for `defense_group_members`
-- ----------------------------
DROP TABLE IF EXISTS `defense_group_members`;
CREATE TABLE `defense_group_members` (
  `gt_id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `role` varchar(20) NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`gt_id`),
  KEY `group_id` (`group_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `defense_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `defense_groups` (`group_id`),
  CONSTRAINT `defense_group_members_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of defense_group_members
-- ----------------------------
INSERT INTO `defense_group_members` VALUES ('1', '2', '4', 'leader', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `defense_group_members` VALUES ('2', '2', '5', 'member', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `defense_group_members` VALUES ('3', '3', '5', 'leader', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `defense_group_members` VALUES ('4', '3', '4', 'member', '2026-01-14 09:11:40', '2026-01-14 09:11:40');

-- ----------------------------
-- Table structure for `defense_plans`
-- ----------------------------
DROP TABLE IF EXISTS `defense_plans`;
CREATE TABLE `defense_plans` (
  `plan_id` int NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) NOT NULL,
  `plan_desc` text,
  `defense_type` varchar(50) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` tinyint DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of defense_plans
-- ----------------------------
INSERT INTO `defense_plans` VALUES ('7', '2025年春季答辩计划', '2025年春季学期毕业论文答辩计划', 'bachelor', '2025-05-15 08:00:00', '2025-05-20 18:00:00', '3', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `defense_plans` VALUES ('8', '2025年秋季答辩计划', '2025年秋季学期毕业论文答辩计划', 'bachelor', '2025-11-15 08:00:00', '2025-11-20 18:00:00', '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `defense_plans` VALUES ('9', '测试答辩计划', '测试新增答辩计划功能', 'bachelor', '2025-06-01 09:00:00', '2025-06-05 18:00:00', '1', '2026-01-14 09:23:57', '2026-01-14 09:23:57');
INSERT INTO `defense_plans` VALUES ('10', '测试答辩计划', '测试新增答辩计划功能', 'bachelor', '2025-06-01 09:00:00', '2025-06-05 18:00:00', '1', '2026-01-14 10:13:56', '2026-01-14 10:13:56');
INSERT INTO `defense_plans` VALUES ('11', '测试答辩计划', '测试新增答辩计划功能', 'bachelor', '2025-06-01 09:00:00', '2025-06-05 18:00:00', '1', '2026-01-14 10:54:12', '2026-01-14 10:54:12');

-- ----------------------------
-- Table structure for `group_students`
-- ----------------------------
DROP TABLE IF EXISTS `group_students`;
CREATE TABLE `group_students` (
  `gs_id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `student_id` int NOT NULL,
  `thesis_title` varchar(255) NOT NULL,
  `order_num` int NOT NULL,
  `status` tinyint DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`gs_id`),
  KEY `group_id` (`group_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `group_students_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `defense_groups` (`group_id`),
  CONSTRAINT `group_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of group_students
-- ----------------------------
INSERT INTO `group_students` VALUES ('1', '2', '3', '基于Vue3的答辩管理系统设计与实现', '1', '0', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `group_students` VALUES ('2', '2', '4', '基于Spring Boot的后端API设计', '2', '0', '2026-01-14 09:11:40', '2026-01-14 09:11:40');

-- ----------------------------
-- Table structure for `notices`
-- ----------------------------
DROP TABLE IF EXISTS `notices`;
CREATE TABLE `notices` (
  `notice_id` int NOT NULL AUTO_INCREMENT,
  `notice_title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `notice_publisher` varchar(50) NOT NULL,
  `release_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `examine_state` tinyint DEFAULT '0',
  `recommend` tinyint DEFAULT '0',
  `read_count` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of notices
-- ----------------------------
INSERT INTO `notices` VALUES ('1', '答辩计划通知', '2025年春季答辩计划已发布，请各位同学注意查看...', '系统管理员', '2026-01-14 09:11:41', '1', '1', '0', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `notices` VALUES ('2', '答辩注意事项', '请参加答辩的同学提前准备好答辩PPT和相关材料...', '系统管理员', '2026-01-14 09:11:41', '1', '0', '0', '2026-01-14 09:11:40', '2026-01-14 09:11:40');

-- ----------------------------
-- Table structure for `papers`
-- ----------------------------
DROP TABLE IF EXISTS `papers`;
CREATE TABLE `papers` (
  `paper_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `thesis_title` varchar(255) NOT NULL,
  `thesis_abstract` text,
  `keywords` varchar(255) DEFAULT NULL,
  `advisor_id` int NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` decimal(10,2) DEFAULT NULL,
  `status` tinyint DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`paper_id`),
  KEY `student_id` (`student_id`),
  KEY `advisor_id` (`advisor_id`),
  CONSTRAINT `papers_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  CONSTRAINT `papers_ibfk_2` FOREIGN KEY (`advisor_id`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of papers
-- ----------------------------
INSERT INTO `papers` VALUES ('1', '3', '基于Vue3的答辩管理系统设计与实现', '本文设计并实现了一个基于Vue3的答辩管理系统...', 'Vue3,答辩管理,系统设计', '4', null, null, '2', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `papers` VALUES ('2', '4', '基于Spring Boot的后端API设计', '本文研究了基于Spring Boot的后端API设计与实现...', 'Spring Boot,API设计,后端开发', '5', null, null, '2', '2026-01-14 09:11:40', '2026-01-14 09:11:40');

-- ----------------------------
-- Table structure for `students`
-- ----------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `student_name` varchar(50) NOT NULL,
  `student_no` varchar(20) NOT NULL,
  `student_gender` varchar(10) DEFAULT NULL,
  `student_age` varchar(10) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `major_name` varchar(50) DEFAULT NULL,
  `grade` varchar(20) DEFAULT NULL,
  `state` tinyint DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_no` (`student_no`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of students
-- ----------------------------
INSERT INTO `students` VALUES ('3', '12', '王同学', 'S20220001', '男', '22', '计算机22-1班', '计算机科学与技术', '2022', '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `students` VALUES ('4', '13', '赵同学', 'S20220002', '女', '21', '计算机22-1班', '计算机科学与技术', '2022', '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');

-- ----------------------------
-- Table structure for `teachers`
-- ----------------------------
DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `teacher_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `teacher_name` varchar(50) NOT NULL,
  `teacher_no` varchar(20) NOT NULL,
  `teacher_gender` varchar(10) DEFAULT NULL,
  `teacher_age` varchar(10) DEFAULT NULL,
  `department_name` varchar(50) DEFAULT NULL,
  `professional_title` varchar(50) DEFAULT NULL,
  `state` tinyint DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`teacher_id`),
  UNIQUE KEY `teacher_no` (`teacher_no`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of teachers
-- ----------------------------
INSERT INTO `teachers` VALUES ('4', '10', '张教授', 'T0001', '男', '50', '计算机科学与技术系', '教授', '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `teachers` VALUES ('5', '11', '李老师', 'T0002', '女', '35', '软件工程系', '讲师', '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');

-- ----------------------------
-- Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nickname` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `user_group` varchar(20) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `state` tinyint DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'admin', '$2a$10$eXm8cF1234567890abcdef', '系统管理员', '13800138000', 'admin@example.com', 'admin', null, '1', '2026-01-14 08:54:02', '2026-01-14 08:54:02');
INSERT INTO `users` VALUES ('10', 'teacher001', '$2a$10$eXm8cF1234567890abcdef', '张教授', '13800138001', 'teacher001@example.com', 'teacher', null, '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `users` VALUES ('11', 'teacher002', '$2a$10$eXm8cF1234567890abcdef', '李老师', '13800138002', 'teacher002@example.com', 'teacher', null, '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `users` VALUES ('12', 'student001', '$2a$10$eXm8cF1234567890abcdef', '王同学', '13800138010', 'student001@example.com', 'student', null, '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
INSERT INTO `users` VALUES ('13', 'student002', '$2a$10$eXm8cF1234567890abcdef', '赵同学', '13800138011', 'student002@example.com', 'student', null, '1', '2026-01-14 09:11:40', '2026-01-14 09:11:40');
