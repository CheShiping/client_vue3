/**
 * MySQL集成验证脚本
 * 用于检查系统是否正确配置并连接到MySQL
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

console.log('========================================');
console.log('MySQL集成验证');
console.log('========================================\n');

// 检查配置
console.log('1. 检查配置文件...');
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ backend/.env 文件存在');
  console.log(`   - 数据库主机: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   - 数据库端口: ${process.env.DB_PORT || '3306'}`);
  console.log(`   - 数据库用户: ${process.env.DB_USER || 'root'}`);
  console.log(`   - 数据库名称: ${process.env.DB_NAME || 'defense_management_system'}`);
} else {
  console.log('   ❌ backend/.env 文件不存在');
  process.exit(1);
}

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'defense_management_system'
};

async function verifyDatabase() {
  let connection;
  
  try {
    console.log('\n2. 测试数据库连接...');
    connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ 成功连接到MySQL数据库');
    
    // 检查数据库是否存在
    console.log('\n3. 检查数据库...');
    const [databases] = await connection.query(
      `SHOW DATABASES LIKE '${dbConfig.database}'`
    );
    
    if (databases.length > 0) {
      console.log(`   ✅ 数据库 ${dbConfig.database} 存在`);
    } else {
      console.log(`   ❌ 数据库 ${dbConfig.database} 不存在`);
      console.log('   请先创建数据库或运行后端服务器自动创建');
      return;
    }
    
    // 检查表
    console.log('\n4. 检查数据表...');
    const [tables] = await connection.query('SHOW TABLES');
    
    const requiredTables = [
      'users',
      'students',
      'teachers',
      'defense_plans',
      'defense_groups',
      'defense_venues',
      'defense_materials',
      'score_criteria',
      'defense_scores',
      'defense_records',
      'notifications'
    ];
    
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    console.log(`   找到 ${existingTables.length} 个数据表`);
    
    let allTablesExist = true;
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} (缺失)`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n   ⚠️  部分表缺失，请运行后端服务器自动创建表');
    }
    
    // 检查数据
    console.log('\n5. 检查测试数据...');
    
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [studentCount] = await connection.query('SELECT COUNT(*) as count FROM students');
    const [teacherCount] = await connection.query('SELECT COUNT(*) as count FROM teachers');
    const [planCount] = await connection.query('SELECT COUNT(*) as count FROM defense_plans');
    
    console.log(`   用户数: ${userCount[0].count}`);
    console.log(`   学生数: ${studentCount[0].count}`);
    console.log(`   教师数: ${teacherCount[0].count}`);
    console.log(`   答辩计划数: ${planCount[0].count}`);
    
    if (userCount[0].count === 0) {
      console.log('\n   ⚠️  数据库中没有数据，请导入测试数据：');
      console.log('   mysql -u root -p111111 < quick_test_data.sql');
    } else {
      console.log('\n   ✅ 数据库中有数据');
    }
    
    // 检查Vite配置
    console.log('\n6. 检查前端配置...');
    const viteConfigPath = path.join(__dirname, 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
      
      if (viteConfig.includes('enable: false')) {
        console.log('   ✅ Mock服务已禁用');
      } else {
        console.log('   ⚠️  Mock服务可能未禁用');
      }
      
      if (viteConfig.includes("'/api'")) {
        console.log('   ✅ API代理已配置');
      } else {
        console.log('   ❌ API代理未配置');
      }
    }
    
    console.log('\n========================================');
    console.log('验证完成！');
    console.log('========================================\n');
    
    if (allTablesExist && userCount[0].count > 0) {
      console.log('✅ 系统已正确配置并连接到MySQL');
      console.log('\n下一步：');
      console.log('1. 启动后端: cd backend && node index.js');
      console.log('2. 启动前端: npm run dev');
      console.log('3. 访问: http://localhost:3005');
      console.log('4. 使用测试账号登录（密码: 123456）');
      console.log('   - 管理员: admin');
      console.log('   - 教师: teacher1, teacher2, teacher3');
      console.log('   - 学生: student1, student2, student3, student4, student5');
    } else {
      console.log('⚠️  系统配置不完整');
      console.log('\n需要完成：');
      if (!allTablesExist) {
        console.log('- 运行后端服务器创建数据表');
      }
      if (userCount[0].count === 0) {
        console.log('- 导入测试数据: mysql -u root -p111111 < quick_test_data.sql');
      }
    }
    
  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    console.log('\n可能的原因：');
    console.log('1. MySQL服务未运行');
    console.log('2. 数据库配置不正确（检查 backend/.env）');
    console.log('3. 数据库用户权限不足');
    console.log('4. 数据库不存在');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyDatabase();
