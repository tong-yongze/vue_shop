import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 手动配置  element-ui    一般是main.js或者index.js   确保在入口文件中修改
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)  // 在全局把ElementUI 注册引用了

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
