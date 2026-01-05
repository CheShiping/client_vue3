// 快速检查后端服务是否运行
import * as http from 'http'

const options: http.RequestOptions = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/user/state',
  method: 'GET',
  timeout: 3000
}

const req = http.request(options, (res: http.IncomingMessage) => {
  console.log(`✅ 后端服务运行正常！状态码: ${res.statusCode}`)
  console.log(`   访问地址: http://127.0.0.1:5000`)
  process.exit(0)
})

req.on('error', (e: Error) => {
  console.log('❌ 后端服务未启动或无法连接')
  console.log(`   错误信息: ${e.message}`)
  console.log('\n请执行以下步骤：')
  console.log('1. 确保MySQL服务已启动')
  console.log('2. 确保数据库 CS_58608 已创建')
  console.log('3. 在 server 目录下运行: 运行.bat 或 ./maven/bin/mvn.cmd spring-boot:run')
  process.exit(1)
})

req.on('timeout', () => {
  console.log('❌ 连接超时，后端服务可能未启动')
  req.destroy()
  process.exit(1)
})

req.end()

