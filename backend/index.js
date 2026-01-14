import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 全局日期格式化函数：将JavaScript日期格式转换为MySQL DATETIME格式
const formatDateTime = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  // 格式化为 MySQL DATETIME 格式: YYYY-MM-DD HH:MM:SS
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 配置文件上传
const uploadPath = path.join(__dirname, process.env.UPLOAD_PATH || './uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// 确保上传目录存在
import fs from 'fs';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'defense_user',
  database: process.env.DB_NAME || 'defense_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 只有当密码存在时才添加到配置中
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  dbConfig.password = process.env.DB_PASSWORD;
}

// 创建数据库连接池
let pool;

// 先尝试连接到MySQL服务器（不指定数据库）
const serverConfig = {
  ...dbConfig,
  database: undefined // 不指定数据库
};

// 尝试创建数据库并连接
async function initDatabase() {
  try {
    // 连接到MySQL服务器
    const serverConnection = await mysql.createConnection(serverConfig);
    console.log('成功连接到MySQL服务器');
    
    // 创建数据库（如果不存在）
    await serverConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`数据库 ${dbConfig.database} 创建成功（或已存在）`);
    
    // 关闭服务器连接
    await serverConnection.end();
    
    // 创建连接池
    pool = mysql.createPool(dbConfig);
    console.log('数据库连接池创建成功');
    
    // 获取连接
    const connection = await pool.getConnection();
    
    // 直接使用连接池配置的数据库，不需要USE命令
    
    // 创建用户表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('用户表创建成功');
    
    // 创建学生表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('学生表创建成功');
    
    // 创建教师表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('教师表创建成功');
    
    // 创建答辩计划表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('答辩计划表创建成功');
    
    // 创建答辩分组表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('答辩分组表创建成功');
    
    // 创建答辩小组成员表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS defense_group_members (
        gt_id INT PRIMARY KEY AUTO_INCREMENT,
        group_id INT NOT NULL,
        teacher_id INT NOT NULL,
        role VARCHAR(20) NOT NULL,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES defense_groups(group_id),
        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('答辩小组成员表创建成功');
    
    // 创建小组学生表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('小组学生表创建成功');
    
    // 创建论文表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('论文表创建成功');
    
    // 创建通知表
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('通知表创建成功');
    
    // 插入默认管理员用户
    const [existingUsers] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    if (existingUsers.length === 0) {
      await connection.execute(
        'INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin', '$2a$10$eXm8cF1234567890abcdef', '系统管理员', '13800138000', 'admin@example.com', 'admin', 1]
      );
      console.log('默认管理员用户创建成功');
    }
    
    // 插入示例答辩计划数据
    const [existingPlans] = await connection.execute('SELECT * FROM defense_plans LIMIT 1');
    if (existingPlans.length === 0) {
      await connection.execute(
        'INSERT INTO defense_plans (plan_name, plan_desc, defense_type, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['2025年春季答辩计划', '2025年春季学期毕业论文答辩计划', 'bachelor', '2025-05-15 08:00:00', '2025-05-20 18:00:00', 3]
      );
      await connection.execute(
        'INSERT INTO defense_plans (plan_name, plan_desc, defense_type, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['2025年秋季答辩计划', '2025年秋季学期毕业论文答辩计划', 'bachelor', '2025-11-15 08:00:00', '2025-11-20 18:00:00', 1]
      );
      console.log('示例答辩计划数据创建成功');
    }
    
    // 测试连接
    await connection.ping();
    connection.release();
    console.log('数据库连接测试成功');
    
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    console.warn('警告：数据库连接失败，请检查配置文件中的数据库信息是否正确');
    console.warn('系统将继续运行，但所有需要数据库的功能将无法正常工作');
    
    // 即使数据库初始化失败，也要创建一个连接池（可能会失败，但至少尝试）
    try {
      pool = mysql.createPool(dbConfig);
    } catch (poolError) {
      console.error('数据库连接池创建失败:', poolError);
    }
    
    return false;
  }
}

// 初始化数据库
initDatabase();

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: '答辩管理系统后端服务运行中' });
});

// 数据库状态检查路由（用于调试）
app.get('/api/db-status', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ error: { code: 500, message: '数据库连接池未初始化' } });
    }
    
    const connection = await pool.getConnection();
    
    // 获取所有表
    const [tables] = await connection.query('SHOW TABLES');
    
    // 获取答辩计划表数据
    const [plans] = await connection.query('SELECT * FROM defense_plans');
    
    connection.release();
    
    res.json({
      result: {
        database: 'defense_management_system',
        tables: tables.map((table) => Object.values(table)[0]),
        defense_plans_count: plans.length,
        defense_plans: plans
      }
    });
  } catch (error) {
    console.error('数据库状态检查失败:', error);
    res.json({ error: { code: 500, message: '数据库状态检查失败', details: error.message } });
  }
});

// 用户认证路由
app.post('/api/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return res.json({ error: { code: 401, message: '用户名或密码错误' } });
    }
    
    const user = rows[0];
    // 实际项目中应该使用bcrypt比较密码
    // 这里暂时简化处理，因为数据库中的密码是哈希值，但用户输入的是明文密码
    if (username === 'admin' && password !== 'admin123') {
      return res.json({ error: { code: 401, message: '用户名或密码错误' } });
    }
    
    // 生成token（实际项目中应该使用JWT）
    const token = 'mock_token_' + Date.now();
    
    res.json({
      result: {
        obj: {
          token,
          user_id: user.user_id,
          username: user.username,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          user_group: user.user_group,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 获取用户信息
app.get('/api/user/info', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.json({ error: { code: 401, message: '未授权' } });
    }
    
    // 实际项目中应该验证token
    // 这里简单模拟，返回第一个用户信息
    const [rows] = await pool.query('SELECT * FROM users LIMIT 1');
    
    if (rows.length === 0) {
      return res.json({ error: { code: 404, message: '用户不存在' } });
    }
    
    const user = rows[0];
    res.json({
      result: {
        obj: {
          user_id: user.user_id,
          username: user.username,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          user_group: user.user_group,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 学生相关路由
app.get('/api/student/list', async (req, res) => {
  try {
    const { page = 1, size = 10, student_name, student_no } = req.query;
    const offset = (page - 1) * size;

    let baseQuery = 'FROM students s LEFT JOIN users u ON s.user_id = u.user_id ';
    let whereClauses = [];
    const params = [];

    if (student_name) {
      whereClauses.push('s.student_name LIKE ?');
      params.push(`%${student_name}%`);
    }
    if (student_no) {
      whereClauses.push('s.student_no LIKE ?');
      params.push(`%${student_no}%`);
    }

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') + ' ' : '';

    const selectSql =
      'SELECT ' +
      's.student_id, s.user_id, s.student_name, s.student_no, s.student_gender, s.student_age, ' +
      's.class_name, s.major_name, s.grade, s.state, s.create_time, s.update_time, ' +
      'u.phone AS phone, u.email AS email ' +
      baseQuery + whereSql + 'ORDER BY s.create_time DESC LIMIT ? OFFSET ?';
    const countSql = 'SELECT COUNT(*) AS total ' + baseQuery + whereSql;

    const queryParams = [...params, parseInt(size), offset];
    const [rows] = await pool.query(selectSql, queryParams);
    const [countResult] = await pool.query(countSql, params);

    console.log('查询参数:', req.query);
    if (rows && rows.length > 0) {
      console.log('字段名:', Object.keys(rows[0]));
    }
    console.log('后端查询结果:', rows);
    res.json({
      result: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 获取学生详情API
app.get('/api/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT s.*, u.phone, u.email FROM students s LEFT JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?';
    const [rows] = await pool.execute(sql, [id]);
    if (rows.length === 0) {
      return res.json({ error: { code: 404, message: '学生不存在' } });
    }
    res.json({ result: rows[0] });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 根据用户ID获取学生信息API
app.get('/api/student/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = 'SELECT s.*, u.phone, u.email FROM students s LEFT JOIN users u ON s.user_id = u.user_id WHERE s.user_id = ?';
    const [rows] = await pool.execute(sql, [userId]);
    if (rows.length === 0) {
      return res.json({ error: { code: 404, message: '学生不存在' } });
    }
    res.json({ result: rows[0] });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 新增学生信息API
app.post('/api/student', async (req, res) => {
  try {
    const { student_name, student_no, student_gender, student_age, class_name, major_name, grade, user_id, state = 1 } = req.body;
    
    // 验证必填字段
    if (!student_name || !student_no || !user_id) {
      return res.json({ error: { code: 400, message: '缺少必填字段' } });
    }
    
    // 执行插入
    const [result] = await pool.execute(
      'INSERT INTO students (student_name, student_no, student_gender, student_age, class_name, major_name, grade, user_id, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_name, student_no, student_gender, student_age, class_name, major_name, grade, user_id, state]
    );
    
    res.json({
      result: {
        student_id: result.insertId,
        student_name,
        student_no,
        student_gender,
        student_age,
        class_name,
        major_name,
        grade,
        user_id,
        state
      }
    });
  } catch (error) {
    console.error('新增学生信息错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 更新学生信息API
app.put('/api/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, student_no, student_gender, student_age, class_name, major_name, grade, state } = req.body;
    
    // 验证必填字段
    if (!student_name || !student_no) {
      return res.json({ error: { code: 400, message: '缺少必填字段' } });
    }
    
    // 执行更新
    await pool.execute(
      'UPDATE students SET student_name = ?, student_no = ?, student_gender = ?, student_age = ?, class_name = ?, major_name = ?, grade = ?, state = ? WHERE student_id = ?',
      [student_name, student_no, student_gender, student_age, class_name, major_name, grade, state, id]
    );
    
    // 返回更新后的完整数据
    const [rows] = await pool.execute('SELECT * FROM students WHERE student_id = ?', [id]);
    
    res.json({ result: rows[0] });
  } catch (error) {
    console.error('更新学生信息错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 删除学生信息API
app.delete('/api/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否存在关联的论文
    const [paperRows] = await pool.execute('SELECT COUNT(*) as count FROM papers WHERE student_id = ?', [id]);
    if (paperRows[0].count > 0) {
      return res.json({ error: { code: 400, message: '该学生下存在论文，无法删除' } });
    }
    
    // 检查是否存在关联的小组学生
    const [groupStudentRows] = await pool.execute('SELECT COUNT(*) as count FROM group_students WHERE student_id = ?', [id]);
    if (groupStudentRows[0].count > 0) {
      return res.json({ error: { code: 400, message: '该学生已分配到答辩小组，无法删除' } });
    }
    
    // 执行删除
    await pool.execute('DELETE FROM students WHERE student_id = ?', [id]);
    
    res.json({ result: { message: '删除成功' } });
  } catch (error) {
    console.error('删除学生信息错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 教师相关路由
app.get('/api/teacher/list', async (req, res) => {
  try {
    const { page = 1, size = 10, teacher_name, teacher_no } = req.query;
    const offset = (page - 1) * size;

    let baseQuery = 'FROM teachers t LEFT JOIN users u ON t.user_id = u.user_id ';
    let whereClauses = [];
    const params = [];

    if (teacher_name) {
      whereClauses.push('t.teacher_name LIKE ?');
      params.push(`%${teacher_name}%`);
    }
    if (teacher_no) {
      whereClauses.push('t.teacher_no LIKE ?');
      params.push(`%${teacher_no}%`);
    }

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') + ' ' : '';
    const selectSql = 'SELECT t.*, u.phone, u.email ' + baseQuery + whereSql + 'ORDER BY t.create_time DESC LIMIT ? OFFSET ?';
    const countSql = 'SELECT COUNT(*) AS total ' + baseQuery + whereSql;

    const queryParams = [...params, parseInt(size), offset];
    const [rows] = await pool.query(selectSql, queryParams);
    const [countResult] = await pool.query(countSql, params);

    res.json({
      result: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 获取教师详情API
app.get('/api/teacher/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT t.*, u.phone, u.email FROM teachers t LEFT JOIN users u ON t.user_id = u.user_id WHERE t.teacher_id = ?';
    const [rows] = await pool.execute(sql, [id]);
    if (rows.length === 0) {
      return res.json({ error: { code: 404, message: '教师不存在' } });
    }
    res.json({ result: rows[0] });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 新增教师API
app.post('/api/teacher', async (req, res) => {
  try {
    const { teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, user_id, state = 1 } = req.body;
    
    // 验证必填字段
    if (!teacher_name || !teacher_no || !user_id) {
      return res.json({ error: { code: 400, message: '缺少必填字段' } });
    }
    
    // 执行插入
    const [result] = await pool.execute(
      'INSERT INTO teachers (teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, user_id, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, user_id, state]
    );
    
    res.json({
      result: {
        teacher_id: result.insertId,
        teacher_name,
        teacher_no,
        teacher_gender,
        teacher_age,
        department_name,
        professional_title,
        user_id,
        state
      }
    });
  } catch (error) {
    console.error('新增教师错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 更新教师API
app.put('/api/teacher/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, state } = req.body;
    
    // 验证必填字段
    if (!teacher_name || !teacher_no) {
      return res.json({ error: { code: 400, message: '缺少必填字段' } });
    }
    
    // 执行更新
    await pool.execute(
      'UPDATE teachers SET teacher_name = ?, teacher_no = ?, teacher_gender = ?, teacher_age = ?, department_name = ?, professional_title = ?, state = ? WHERE teacher_id = ?',
      [teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, state, id]
    );
    
    // 返回更新后的完整数据
    const [rows] = await pool.execute('SELECT * FROM teachers WHERE teacher_id = ?', [id]);
    
    res.json({ result: rows[0] });
  } catch (error) {
    console.error('更新教师错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 删除教师API
app.delete('/api/teacher/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否存在关联的答辩分组组长
    const [groupLeaderRows] = await pool.execute('SELECT COUNT(*) as count FROM defense_groups WHERE group_leader = ?', [id]);
    if (groupLeaderRows[0].count > 0) {
      return res.json({ error: { code: 400, message: '该教师是答辩分组组长，无法删除' } });
    }
    
    // 检查是否存在关联的答辩小组成员
    const [groupMemberRows] = await pool.execute('SELECT COUNT(*) as count FROM defense_group_members WHERE teacher_id = ?', [id]);
    if (groupMemberRows[0].count > 0) {
      return res.json({ error: { code: 400, message: '该教师是答辩小组成员，无法删除' } });
    }
    
    // 执行删除
    await pool.execute('DELETE FROM teachers WHERE teacher_id = ?', [id]);
    
    res.json({ result: { message: '删除成功' } });
  } catch (error) {
    console.error('删除教师错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 答辩计划相关路由
app.get('/api/defense/plan/list', async (req, res) => {
  try {
    const { page = 1, size = 10, plan_name, defense_type, start_time, end_time, status } = req.query;
    const offset = (page - 1) * size;
    
    let query = 'SELECT * FROM defense_plans';
    let countQuery = 'SELECT COUNT(*) as total FROM defense_plans';
    const params = [];
    const countParams = [];
    
    // 构建查询条件
    if (plan_name) {
      query += ' WHERE plan_name LIKE ?';
      countQuery += ' WHERE plan_name LIKE ?';
      params.push(`%${plan_name}%`);
      countParams.push(`%${plan_name}%`);
    }
    
    // 只有当status是有效数字时才添加到查询条件
    const statusNum = parseInt(status);
    if (!isNaN(statusNum)) {
      query += query.includes('WHERE') ? ' AND status = ?' : ' WHERE status = ?';
      countQuery += countQuery.includes('WHERE') ? ' AND status = ?' : ' WHERE status = ?';
      params.push(statusNum);
      countParams.push(statusNum);
    }
    
    query += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(size), offset);
    
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    
    res.json({
      result: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    console.error('获取答辩计划列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 获取答辩计划详情API
app.get('/api/defense/plan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM defense_plans WHERE plan_id = ?', [id]);
    
    if (rows.length === 0) {
      return res.json({ error: { code: 404, message: '答辩计划不存在' } });
    }
    
    res.json({ result: rows[0] });
  } catch (error) {
    console.error('获取答辩计划详情错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 新增答辩计划API
app.post('/api/defense/plan', async (req, res) => {
  try {
    const { plan_name, plan_desc, defense_type, start_time, end_time, status = 1 } = req.body;
    
    // 验证必填字段
    if (!plan_name || !defense_type || !start_time || !end_time) {
      return res.json({ error: { code: 400, message: '缺少必填字段' } });
    }
    
    // 删除重复的局部formatDateTime函数定义，使用全局的formatDateTime函数
    
    // 执行插入
    const [result] = await pool.execute(
      'INSERT INTO defense_plans (plan_name, plan_desc, defense_type, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [plan_name, plan_desc, defense_type, formatDateTime(start_time), formatDateTime(end_time), status]
    );
    
    res.json({
      result: {
        plan_id: result.insertId,
        plan_name,
        plan_desc,
        defense_type,
        start_time,
        end_time,
        status
      }
    });
  } catch (error) {
    console.error('新增答辩计划错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 更新答辩计划API
app.put('/api/defense/plan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_name, plan_desc, defense_type, start_time, end_time, status } = req.body;
    
    // 验证必填字段
    if (!plan_name || !defense_type || !start_time || !end_time) {
      return res.json({ error: { code: 400, message: '缺少必填字段' } });
    }
    
    // 删除重复的局部formatDateTime函数定义，使用全局的formatDateTime函数
    
    // 执行更新
    await pool.execute(
      'UPDATE defense_plans SET plan_name = ?, plan_desc = ?, defense_type = ?, start_time = ?, end_time = ?, status = ? WHERE plan_id = ?',
      [plan_name, plan_desc, defense_type, formatDateTime(start_time), formatDateTime(end_time), status, id]
    );
    
    // 返回更新后的完整数据
    const [rows] = await pool.execute('SELECT * FROM defense_plans WHERE plan_id = ?', [id]);
    
    res.json({ result: rows[0] });
  } catch (error) {
    console.error('更新答辩计划错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 删除答辩计划API
app.delete('/api/defense/plan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否存在关联的答辩分组
    const [groupRows] = await pool.execute('SELECT COUNT(*) as count FROM defense_groups WHERE plan_id = ?', [id]);
    if (groupRows[0].count > 0) {
      return res.json({ error: { code: 400, message: '该答辩计划下存在答辩分组，无法删除' } });
    }
    
    // 执行删除
    await pool.execute('DELETE FROM defense_plans WHERE plan_id = ?', [id]);
    
    res.json({ result: { message: '删除成功' } });
  } catch (error) {
    console.error('删除答辩计划错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 审核答辩计划API
app.put('/api/defense/plan/audit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 验证状态值
    if (![2, 4].includes(status)) {
      return res.json({ error: { code: 400, message: '无效的审核状态' } });
    }
    
    // 执行更新
    await pool.execute('UPDATE defense_plans SET status = ? WHERE plan_id = ?', [status, id]);
    
    // 返回更新后的完整数据
    const [rows] = await pool.execute('SELECT * FROM defense_plans WHERE plan_id = ?', [id]);
    
    res.json({ result: rows[0] });
  } catch (error) {
    console.error('审核答辩计划错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 发布答辩计划API
app.put('/api/defense/plan/publish/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 执行更新（状态3表示已发布）
    await pool.execute('UPDATE defense_plans SET status = 3 WHERE plan_id = ?', [id]);
    
    // 返回更新后的完整数据
    const [rows] = await pool.execute('SELECT * FROM defense_plans WHERE plan_id = ?', [id]);
    
    res.json({ result: rows[0] });
  } catch (error) {
    console.error('发布答辩计划错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 答辩分组相关路由
app.get('/api/defense/group/list', async (req, res) => {
  try {
    const { page = 1, size = 10, group_name, plan_id, defense_time, status } = req.query;
    const offset = (page - 1) * size;

    let baseQuery =
      'FROM defense_groups g ' +
      'LEFT JOIN defense_plans p ON g.plan_id = p.plan_id ' +
      'LEFT JOIN teachers t ON g.group_leader = t.teacher_id ';

    let whereClauses = [];
    let params = [];

    const planIdNum = parseInt(plan_id);
    if (!isNaN(planIdNum)) {
      whereClauses.push('g.plan_id = ?');
      params.push(planIdNum);
    }

    if (group_name) {
      whereClauses.push('g.group_name LIKE ?');
      params.push(`%${group_name}%`);
    }

    const statusNum = parseInt(status);
    if (!isNaN(statusNum)) {
      whereClauses.push('g.status = ?');
      params.push(statusNum);
    }

    const whereSql = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') + ' ' : '';

    const selectSql =
      'SELECT g.*, p.plan_name, t.teacher_name AS group_leader_name, ' +
      "CASE g.venue_id WHEN 1 THEN '学术楼101' WHEN 2 THEN '学术楼102' WHEN 3 THEN '学术楼201' WHEN 4 THEN '学术楼202' WHEN 5 THEN '学术楼301' ELSE CONCAT('地点', g.venue_id) END AS venue_name " +
      baseQuery +
      whereSql +
      'ORDER BY g.create_time DESC LIMIT ? OFFSET ?';

    const countSql = 'SELECT COUNT(*) AS total ' + baseQuery + whereSql;

    const queryParams = [...params, parseInt(size), offset];

    const [rows] = await pool.query(selectSql, queryParams);
    const [countResult] = await pool.query(countSql, params);

    res.json({
      result: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.get('/api/defense/group/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql =
      'SELECT g.*, p.plan_name, t.teacher_name AS group_leader_name, ' +
      "CASE g.venue_id WHEN 1 THEN '学术楼101' WHEN 2 THEN '学术楼102' WHEN 3 THEN '学术楼201' WHEN 4 THEN '学术楼202' WHEN 5 THEN '学术楼301' ELSE CONCAT('地点', g.venue_id) END AS venue_name " +
      'FROM defense_groups g ' +
      'LEFT JOIN defense_plans p ON g.plan_id = p.plan_id ' +
      'LEFT JOIN teachers t ON g.group_leader = t.teacher_id ' +
      'WHERE g.group_id = ?';
    const [rows] = await pool.execute(sql, [id]);
    if (!rows.length) {
      return res.json({ error: { code: 404, message: '未找到' } });
    }
    res.json({ result: rows[0] });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.post('/api/defense/group', async (req, res) => {
  try {
    const { plan_id, group_name, group_leader, venue_id, defense_time, status = 1 } = req.body;
    if (!plan_id || !group_name || !group_leader || !venue_id || !defense_time) {
      return res.json({ error: { code: 400, message: '参数错误' } });
    }
    const [result] = await pool.execute(
      'INSERT INTO defense_groups (plan_id, group_name, group_leader, venue_id, defense_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [plan_id, group_name, group_leader, venue_id, formatDateTime(defense_time), status]
    );
    res.json({
      result: {
        group_id: result.insertId,
        plan_id,
        group_name,
        group_leader,
        venue_id,
        defense_time,
        status
      }
    });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.put('/api/defense/group/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_id, group_name, group_leader, venue_id, defense_time, status } = req.body;
    if (!plan_id || !group_name || !group_leader || !venue_id || !defense_time) {
      return res.json({ error: { code: 400, message: '参数错误' } });
    }
    await pool.execute(
      'UPDATE defense_groups SET plan_id = ?, group_name = ?, group_leader = ?, venue_id = ?, defense_time = ?, status = ? WHERE group_id = ?',
      [plan_id, group_name, group_leader, venue_id, formatDateTime(defense_time), status, id]
    );
    const [rows] = await pool.execute('SELECT * FROM defense_groups WHERE group_id = ?', [id]);
    res.json({ result: rows[0] });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.delete('/api/defense/group/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();
    await connection.execute('DELETE FROM defense_group_members WHERE group_id = ?', [id]);
    await connection.execute('DELETE FROM group_students WHERE group_id = ?', [id]);
    await connection.execute('DELETE FROM defense_groups WHERE group_id = ?', [id]);
    await connection.commit();
    res.json({ result: { message: '删除成功' } });
  } catch (error) {
    try { await connection.rollback(); } catch (e) {}
    res.json({ error: { code: 500, message: '服务器错误' } });
  } finally {
    connection.release();
  }
});

app.get('/api/defense/group/members/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const sql =
      'SELECT gm.*, t.teacher_name FROM defense_group_members gm ' +
      'LEFT JOIN teachers t ON gm.teacher_id = t.teacher_id ' +
      'WHERE gm.group_id = ?';
    const [rows] = await pool.execute(sql, [groupId]);
    res.json({ result: { list: rows } });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.post('/api/defense/group/member', async (req, res) => {
  try {
    const { group_id, teacher_id, role } = req.body;
    if (!group_id || !teacher_id || !role) {
      return res.json({ error: { code: 400, message: '参数错误' } });
    }
    const [result] = await pool.execute(
      'INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES (?, ?, ?)',
      [group_id, teacher_id, role]
    );
    res.json({ result: { gt_id: result.insertId } });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.post('/api/defense/group/members/batch', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { group_id, members } = req.body;
    if (!group_id || !Array.isArray(members)) {
      return res.json({ error: { code: 400, message: '参数错误' } });
    }
    await connection.beginTransaction();
    for (const m of members) {
      await connection.execute(
        'INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES (?, ?, ?)',
        [group_id, m.teacher_id, m.role]
      );
    }
    await connection.commit();
    res.json({ result: { message: '批量添加成功' } });
  } catch (error) {
    try { await connection.rollback(); } catch (e) {}
    res.json({ error: { code: 500, message: '服务器错误' } });
  } finally {
    connection.release();
  }
});

app.delete('/api/defense/group/member/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM defense_group_members WHERE gt_id = ?', [id]);
    res.json({ result: { message: '删除成功' } });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.get('/api/defense/group/students/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const sql =
      'SELECT gs.*, s.student_name FROM group_students gs ' +
      'LEFT JOIN students s ON gs.student_id = s.student_id ' +
      'WHERE gs.group_id = ? ORDER BY gs.order_num ASC';
    const [rows] = await pool.execute(sql, [groupId]);
    res.json({ result: { list: rows } });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.post('/api/defense/group/student', async (req, res) => {
  try {
    const { group_id, student_id, thesis_title, order_num, status = 0 } = req.body;
    if (!group_id || !student_id || !thesis_title || !order_num) {
      return res.json({ error: { code: 400, message: '参数错误' } });
    }
    const [result] = await pool.execute(
      'INSERT INTO group_students (group_id, student_id, thesis_title, order_num, status) VALUES (?, ?, ?, ?, ?)',
      [group_id, student_id, thesis_title, order_num, status]
    );
    res.json({ result: { gs_id: result.insertId } });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.post('/api/defense/group/students/batch', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { group_id, students } = req.body;
    if (!group_id || !Array.isArray(students)) {
      return res.json({ error: { code: 400, message: '参数错误' } });
    }
    await connection.beginTransaction();
    for (const s of students) {
      await connection.execute(
        'INSERT INTO group_students (group_id, student_id, thesis_title, order_num, status) VALUES (?, ?, ?, ?, ?)',
        [group_id, s.student_id, s.thesis_title, s.order_num, 0]
      );
    }
    await connection.commit();
    res.json({ result: { message: '批量添加成功' } });
  } catch (error) {
    try { await connection.rollback(); } catch (e) {}
    res.json({ error: { code: 500, message: '服务器错误' } });
  } finally {
    connection.release();
  }
});

app.delete('/api/defense/group/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM group_students WHERE gs_id = ?', [id]);
    res.json({ result: { message: '删除成功' } });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

app.put('/api/defense/group/student/order', async (req, res) => {
  try {
    const { gs_id, order_num } = req.body;
    if (!gs_id || typeof order_num === 'undefined') {
      return res.json({ error: { code: 400, message: '参数错误' } });
    }
    await pool.execute('UPDATE group_students SET order_num = ? WHERE gs_id = ?', [order_num, gs_id]);
    res.json({ result: { message: '更新成功' } });
  } catch (error) {
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 通知相关路由
app.get('/api/notice/list', async (req, res) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const offset = (page - 1) * size;
    
    const query = 'SELECT * FROM notices ORDER BY release_time DESC LIMIT ? OFFSET ?';
    const countQuery = 'SELECT COUNT(*) as total FROM notices';
    
    const [rows] = await pool.query(query, [parseInt(size), offset]);
    const [countResult] = await pool.query(countQuery);
    
    res.json({
      result: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 获取单个公告详情API
app.get('/api/notice/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM notices WHERE notice_id = ?', [id]);
    
    if (rows.length === 0) {
      return res.json({ error: { code: 404, message: '公告不存在' } });
    }
    
    res.json({ result: rows[0] });
  } catch (error) {
    console.error('获取公告详情错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 评分列表API（返回空列表）
app.get('/api/score/list', async (req, res) => {
  try {
    const { page = 1, size = 10, thesis_title } = req.query;
    
    res.json({
      result: {
        list: [],
        total: 0,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    console.error('获取评分列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 答辩评分列表API（返回空列表）
app.get('/api/defense/score/list', async (req, res) => {
  try {
    const { page = 1, size = 10, student_name, group_id, scored } = req.query;
    
    res.json({
      result: {
        list: [],
        total: 0,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    console.error('获取答辩评分列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 答辩记录列表API（返回空列表）
app.get('/api/defense/record/list', async (req, res) => {
  try {
    const { page = 1, size = 10, student_name, group_id, defense_date } = req.query;
    
    res.json({
      result: {
        list: [],
        total: 0,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    console.error('获取答辩记录列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 兼容旧的答辩列表API（现在应该使用答辩计划或答辩分组）
app.get('/api/defense/list', async (req, res) => {
  try {
    // 直接重定向到答辩计划列表
    return res.redirect('/api/defense/plan/list?' + new URLSearchParams(req.query));
  } catch (error) {
    console.error('获取答辩列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 论文列表API
app.get('/api/paper/list', async (req, res) => {
  try {
    const { page = 1, size = 10, student_name, thesis_title } = req.query;
    const offset = (page - 1) * size;
    
    let query = 'SELECT * FROM papers';
    let countQuery = 'SELECT COUNT(*) as total FROM papers';
    const params = [];
    const countParams = [];
    
    // 构建查询条件
    if (thesis_title) {
      query += ' WHERE thesis_title LIKE ?';
      countQuery += ' WHERE thesis_title LIKE ?';
      params.push(`%${thesis_title}%`);
      countParams.push(`%${thesis_title}%`);
    }
    
    query += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(size), offset);
    
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    
    res.json({
      result: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    console.error('获取论文列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 生成示例数据API
app.post('/api/generate-sample-data', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // 按照正确的外键约束顺序删除数据
    // 先删除有外键依赖的表
    await connection.execute('DELETE FROM defense_group_members');
    await connection.execute('DELETE FROM group_students');
    await connection.execute('DELETE FROM papers');
    await connection.execute('DELETE FROM defense_groups');
    await connection.execute('DELETE FROM defense_plans');
    await connection.execute('DELETE FROM teachers');
    await connection.execute('DELETE FROM students');
    await connection.execute('DELETE FROM users WHERE user_id > 1'); // 保留默认管理员
    await connection.execute('DELETE FROM notices');
    
    // 1. 生成用户数据
    // 插入教师用户
    await connection.execute(
      'INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['teacher001', '$2a$10$eXm8cF1234567890abcdef', '张教授', '13800138001', 'teacher001@example.com', 'teacher', 1]
    );
    const [teacher1Result] = await connection.execute('SELECT LAST_INSERT_ID() as user_id');
    const teacher1UserId = teacher1Result[0].user_id;
    
    await connection.execute(
      'INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['teacher002', '$2a$10$eXm8cF1234567890abcdef', '李老师', '13800138002', 'teacher002@example.com', 'teacher', 1]
    );
    const [teacher2Result] = await connection.execute('SELECT LAST_INSERT_ID() as user_id');
    const teacher2UserId = teacher2Result[0].user_id;
    
    // 插入学生用户
    await connection.execute(
      'INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['student001', '$2a$10$eXm8cF1234567890abcdef', '王同学', '13800138010', 'student001@example.com', 'student', 1]
    );
    const [student1Result] = await connection.execute('SELECT LAST_INSERT_ID() as user_id');
    const student1UserId = student1Result[0].user_id;
    
    await connection.execute(
      'INSERT INTO users (username, password, nickname, phone, email, user_group, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['student002', '$2a$10$eXm8cF1234567890abcdef', '赵同学', '13800138011', 'student002@example.com', 'student', 1]
    );
    const [student2Result] = await connection.execute('SELECT LAST_INSERT_ID() as user_id');
    const student2UserId = student2Result[0].user_id;
    
    // 2. 生成教师数据
    await connection.execute(
      'INSERT INTO teachers (user_id, teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [teacher1UserId, '张教授', 'T0001', '男', '50', '计算机科学与技术系', '教授', 1]
    );
    const [teacher1IdResult] = await connection.execute('SELECT LAST_INSERT_ID() as teacher_id');
    const teacher1Id = teacher1IdResult[0].teacher_id;
    
    await connection.execute(
      'INSERT INTO teachers (user_id, teacher_name, teacher_no, teacher_gender, teacher_age, department_name, professional_title, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [teacher2UserId, '李老师', 'T0002', '女', '35', '软件工程系', '讲师', 1]
    );
    const [teacher2IdResult] = await connection.execute('SELECT LAST_INSERT_ID() as teacher_id');
    const teacher2Id = teacher2IdResult[0].teacher_id;
    
    // 3. 生成学生数据
    await connection.execute(
      'INSERT INTO students (user_id, student_name, student_no, student_gender, student_age, class_name, major_name, grade, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student1UserId, '王同学', 'S20220001', '男', '22', '计算机22-1班', '计算机科学与技术', '2022', 1]
    );
    const [student1IdResult] = await connection.execute('SELECT LAST_INSERT_ID() as student_id');
    const student1Id = student1IdResult[0].student_id;
    
    await connection.execute(
      'INSERT INTO students (user_id, student_name, student_no, student_gender, student_age, class_name, major_name, grade, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student2UserId, '赵同学', 'S20220002', '女', '21', '计算机22-1班', '计算机科学与技术', '2022', 1]
    );
    const [student2IdResult] = await connection.execute('SELECT LAST_INSERT_ID() as student_id');
    const student2Id = student2IdResult[0].student_id;
    
    // 4. 生成答辩计划数据
    await connection.execute(
      'INSERT INTO defense_plans (plan_name, plan_desc, defense_type, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['2025年春季答辩计划', '2025年春季学期毕业论文答辩计划', 'bachelor', '2025-05-15 08:00:00', '2025-05-20 18:00:00', 3]
    );
    const [plan1Result] = await connection.execute('SELECT LAST_INSERT_ID() as plan_id');
    const plan1Id = plan1Result[0].plan_id;
    
    await connection.execute(
      'INSERT INTO defense_plans (plan_name, plan_desc, defense_type, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['2025年秋季答辩计划', '2025年秋季学期毕业论文答辩计划', 'bachelor', '2025-11-15 08:00:00', '2025-11-20 18:00:00', 1]
    );
    const [plan2Result] = await connection.execute('SELECT LAST_INSERT_ID() as plan_id');
    const plan2Id = plan2Result[0].plan_id;
    
    // 5. 生成答辩分组数据
    await connection.execute(
      'INSERT INTO defense_groups (plan_id, group_name, group_leader, venue_id, defense_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [plan1Id, '第一答辩小组', teacher1Id, 1, '2025-05-15 09:00:00', 0]
    );
    const [group1Result] = await connection.execute('SELECT LAST_INSERT_ID() as group_id');
    const group1Id = group1Result[0].group_id;
    
    await connection.execute(
      'INSERT INTO defense_groups (plan_id, group_name, group_leader, venue_id, defense_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [plan1Id, '第二答辩小组', teacher2Id, 2, '2025-05-15 09:00:00', 0]
    );
    const [group2Result] = await connection.execute('SELECT LAST_INSERT_ID() as group_id');
    const group2Id = group2Result[0].group_id;
    
    // 6. 生成论文数据
    await connection.execute(
      'INSERT INTO papers (student_id, thesis_title, thesis_abstract, keywords, advisor_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [student1Id, '基于Vue3的答辩管理系统设计与实现', '本文设计并实现了一个基于Vue3的答辩管理系统...', 'Vue3,答辩管理,系统设计', teacher1Id, 2]
    );
    const [paper1Result] = await connection.execute('SELECT LAST_INSERT_ID() as paper_id');
    const paper1Id = paper1Result[0].paper_id;
    
    await connection.execute(
      'INSERT INTO papers (student_id, thesis_title, thesis_abstract, keywords, advisor_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [student2Id, '基于Spring Boot的后端API设计', '本文研究了基于Spring Boot的后端API设计与实现...', 'Spring Boot,API设计,后端开发', teacher2Id, 2]
    );
    const [paper2Result] = await connection.execute('SELECT LAST_INSERT_ID() as paper_id');
    const paper2Id = paper2Result[0].paper_id;
    
    // 7. 生成答辩小组成员数据
    await connection.execute(
      'INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES (?, ?, ?)',
      [group1Id, teacher1Id, 'leader']
    );
    await connection.execute(
      'INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES (?, ?, ?)',
      [group1Id, teacher2Id, 'member']
    );
    await connection.execute(
      'INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES (?, ?, ?)',
      [group2Id, teacher2Id, 'leader']
    );
    await connection.execute(
      'INSERT INTO defense_group_members (group_id, teacher_id, role) VALUES (?, ?, ?)',
      [group2Id, teacher1Id, 'member']
    );
    
    // 8. 生成小组学生数据
    await connection.execute(
      'INSERT INTO group_students (group_id, student_id, thesis_title, order_num, status) VALUES (?, ?, ?, ?, ?)',
      [group1Id, student1Id, '基于Vue3的答辩管理系统设计与实现', 1, 0]
    );
    await connection.execute(
      'INSERT INTO group_students (group_id, student_id, thesis_title, order_num, status) VALUES (?, ?, ?, ?, ?)',
      [group1Id, student2Id, '基于Spring Boot的后端API设计', 2, 0]
    );
    
    // 9. 生成通知数据
    await connection.execute(
      'INSERT INTO notices (notice_title, content, notice_publisher, release_time, examine_state, recommend) VALUES (?, ?, ?, ?, ?, ?)',
      ['答辩计划通知', '2025年春季答辩计划已发布，请各位同学注意查看...', '系统管理员', new Date(), 1, 1]
    );
    await connection.execute(
      'INSERT INTO notices (notice_title, content, notice_publisher, release_time, examine_state, recommend) VALUES (?, ?, ?, ?, ?, ?)',
      ['答辩注意事项', '请参加答辩的同学提前准备好答辩PPT和相关材料...', '系统管理员', new Date(), 1, 0]
    );
    
    connection.release();
    
    res.json({
      result: {
        message: '示例数据生成成功！',
        data: {
          users: 5,
          teachers: 2,
          students: 2,
          defense_plans: 2,
          defense_groups: 2,
          defense_group_members: 4,
          papers: 2,
          group_students: 2,
          notices: 2
        }
      }
    });
  } catch (error) {
    console.error('生成示例数据错误:', error);
    res.json({ error: { code: 500, message: '生成示例数据失败', details: error.message } });
  }
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
