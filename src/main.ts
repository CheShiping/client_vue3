import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useUserStore } from '@/stores/user' // 导入用户store
import './styles/index.scss'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 在应用启动时检查并获取用户信息
const userStore = useUserStore()
if (userStore.token) {
  // 如果有token，获取用户信息
  userStore.fetchUserInfo().catch(error => {
    console.error('初始化获取用户信息失败:', error)
  })
}

app.mount('#app')