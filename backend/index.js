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
    const { page = 1, size = 10, student_name, student_no, class_name, major_name, grade, state } = req.query;
    const offset = (page - 1) * size;
    
    let query = 'SELECT * FROM students';
    let countQuery = 'SELECT COUNT(*) as total FROM students';
    const params = [];
    const countParams = [];
    
    // 构建查询条件
    if (student_name) {
      query += ' WHERE student_name LIKE ?';
      countQuery += ' WHERE student_name LIKE ?';
      params.push(`%${student_name}%`);
      countParams.push(`%${student_name}%`);
    }
    
    if (student_no) {
      query += query.includes('WHERE') ? ' AND student_no LIKE ?' : ' WHERE student_no LIKE ?';
      countQuery += countQuery.includes('WHERE') ? ' AND student_no LIKE ?' : ' WHERE student_no LIKE ?';
      params.push(`%${student_no}%`);
      countParams.push(`%${student_no}%`);
    }
    
    query += ' LIMIT ? OFFSET ?';
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
    console.error('获取学生列表错误:', error);
    res.json({ error: { code: 500, message: '服务器错误' } });
  }
});

// 教师相关路由
app.get('/api/teacher/list', async (req, res) => {
  try {
    const { page = 1, size = 10, teacher_name, teacher_no, department_name, professional_title, state } = req.query;
    const offset = (page - 1) * size;
    
    let query = 'SELECT * FROM teachers';
    let countQuery = 'SELECT COUNT(*) as total FROM teachers';
    const params = [];
    const countParams = [];
    
    // 构建查询条件
    if (teacher_name) {
      query += ' WHERE teacher_name LIKE ?';
      countQuery += ' WHERE teacher_name LIKE ?';
      params.push(`%${teacher_name}%`);
      countParams.push(`%${teacher_name}%`);
    }
    
    if (teacher_no) {
      query += query.includes('WHERE') ? ' AND teacher_no LIKE ?' : ' WHERE teacher_no LIKE ?';
      countQuery += countQuery.includes('WHERE') ? ' AND teacher_no LIKE ?' : ' WHERE teacher_no LIKE ?';
      params.push(`%${teacher_no}%`);
      countParams.push(`%${teacher_no}%`);
    }
    
    query += ' LIMIT ? OFFSET ?';
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
    console.error('获取教师列表错误:', error);
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

// 答辩分组相关路由
app.get('/api/defense/group/list', async (req, res) => {
  try {
    const { page = 1, size = 10, group_name, plan_id, defense_time, status } = req.query;
    const offset = (page - 1) * size;
    
    let query = 'SELECT * FROM defense_groups';
    let countQuery = 'SELECT COUNT(*) as total FROM defense_groups';
    const params = [];
    const countParams = [];
    
    // 构建查询条件
    const planIdNum = parseInt(plan_id);
    if (!isNaN(planIdNum)) {
      query += ' WHERE plan_id = ?';
      countQuery += ' WHERE plan_id = ?';
      params.push(planIdNum);
      countParams.push(planIdNum);
    }
    
    if (group_name) {
      query += query.includes('WHERE') ? ' AND group_name LIKE ?' : ' WHERE group_name LIKE ?';
      countQuery += countQuery.includes('WHERE') ? ' AND group_name LIKE ?' : ' WHERE group_name LIKE ?';
      params.push(`%${group_name}%`);
      countParams.push(`%${group_name}%`);
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
    console.error('获取答辩分组列表错误:', error);
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

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
