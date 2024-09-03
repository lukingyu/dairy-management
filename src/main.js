import { createApp } from 'vue'
import App from './App.vue'
import router from "./router/index.js"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import store from './vuex/store.js'

const appObj = createApp(App);
// 使用ElementPlus插件
appObj.use(ElementPlus)
// 使用vuex中的store实例
appObj.use(store)
// 使用router实例
appObj.use(router)

appObj.mount("#root")
