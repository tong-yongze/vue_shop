import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
//导入字体图标
import './assets/fonts/iconfont.css'
// 时间过滤器
import './fifler/data'
// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require  styles  导入富文本 对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 导入 NProgress 包对应的js和css
import NProgress from 'nprogress'  // 实现效果
import 'nprogress/nprogress.css'   //  美化进度条

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request 拦截器中 展示进度条  NProgress.start()
axios.interceptors.request.use(config => {
  // 为请求头对象添加 Token 验证的 Authorization
  // console.log(config);
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
// 在 response  拦截器中  隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

// 手动配置  element-ui    一般是main.js或者index.js   确保在入口文件中修改
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './plugins/element.js'
Vue.use(ElementUI)  // 在全局把ElementUI 注册引用了

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 将富文本编辑器 注册全局可用的组件
Vue.use(VueQuillEditor)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
