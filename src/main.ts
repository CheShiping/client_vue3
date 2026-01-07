import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import { getToken } from './utils/auth'
import { useUserStore } from './stores/user' // 导入用户store
import './styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)

// 应用启动时验证 token 并获取用户信息
if (getToken()) {
  // 等待pinia初始化完成后再获取用户信息
  const userStore = useUserStore()
  userStore.fetchUserInfo()
}


app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')