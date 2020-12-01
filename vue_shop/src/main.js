import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
//导入字体图标
import './assets/fonts/iconfont.css'

// 导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // 为请求头对象添加 Token 验证的 Authorization
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})


Vue.prototype.$http = axios


// 手动配置  element-ui    一般是main.js或者index.js   确保在入口文件中修改
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './plugins/element.js'
Vue.use(ElementUI)  // 在全局把ElementUI 注册引用了

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
