<template>
  <el-container class="big-container" >
    <el-aside width="200px" class="el-aside">
      <el-scrollbar>
        <div style="height: 60px;background-color: green;display: grid;place-items: center"><span style="font-family: 钉钉进步体;font-size: 20px;color: antiquewhite">奶制品管理系统</span></div>
        <el-menu :default-openeds="['3','4']" default-active="1" style="background-color: floralwhite">
<!--          <el-sub-menu index="1">
            <template #title>
              <el-icon><message /></el-icon>用户管理
            </template>
            <el-menu-item-group>
              <el-item
              <el-menu-item index="1-1" @click="toUserInfoManage">用户信息管理</el-menu-item>
              <el-menu-item index="1-2">Option 2</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>-->
          <el-menu-item index="1" @click="toManageIndex">
            <el-icon><HomeFilled /></el-icon>首页
          </el-menu-item>
          <el-menu-item index="2" @click="toUserInfoManage">
            <el-icon><UserFilled /></el-icon>用户信息管理
          </el-menu-item>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><Histogram /></el-icon>品牌与分类
            </template>
            <el-menu-item-group>
              <el-menu-item index="3-1" @click="toBrandManage"><el-icon><Setting /></el-icon>品牌管理</el-menu-item>
              <el-menu-item index="3-2" @click="toCategoryManage"><el-icon><Setting /></el-icon>分类管理</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="4">
            <template #title>
              <el-icon><icon-menu /></el-icon>商品管理
            </template>
            <el-menu-item-group>
              <el-menu-item index="4-1" @click="toProductUploadManage"><el-icon><Upload /></el-icon>商品上传</el-menu-item>
              <el-menu-item index="4-2" @click="toProductInfoManage"><el-icon><InfoFilled /></el-icon>商品信息管理</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-menu-item index="5" @click="toHistoryDataShow">
            <el-icon><Clock /></el-icon>历史数据可视化
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
<!--        <div class="toolbar">-->
<!--          <el-dropdown>
            <el-icon style="margin-right: 8px; margin-top: 1px"><User /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>View</el-dropdown-item>
                <el-dropdown-item>Add</el-dropdown-item>
                <el-dropdown-item>Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>管理员：{{adminName}}</span>-->

          <el-dropdown class="el-dropdown">
            <el-icon style="margin-right: 8px; margin-top: 1px"><User /></el-icon>
          <span class="el-dropdown-link">
            管理员：{{adminName}}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="Logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
<!--        </div>-->
      </el-header>

      <el-main>
<!--        <el-scrollbar>
          <el-table :data="tableData">
            <el-table-column prop="date" label="Date" width="140" />
            <el-table-column prop="name" label="Name" width="120" />
            <el-table-column prop="address" label="Address" />
          </el-table>
        </el-scrollbar>-->
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {
  ArrowDown,
  Clock,
  Histogram,
  HomeFilled, InfoFilled,
  Menu as IconMenu,
  Message,
  Setting,
  Upload,
  User,
  UserFilled
} from '@element-plus/icons-vue'
import axios from "axios";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";

const router = useRouter()

let adminName = ref('');
onMounted(()=>{
  axios.get("/api/admin/getAdminNameById/"+window.localStorage.getItem("m-adminId")).then((res)=>{
    if (res.data.code === 200){
      adminName.value = res.data.data
      // adminName.value = '哈哈哈'
      //console.log(adminName)
    }
  })
})
const item = {
  date: '2016-05-02',
  name: 'Tom',
  address: 'No. 189, Grove St, Los Angeles',
}
function Logout(){
  let adminId = window.localStorage.getItem("m-adminId")
  if (adminId){
    axios.post('/api/admin/logout/'+adminId).then((res)=>{
      if (res.data.code === 200){
        window.localStorage.removeItem("m-adminId")
        window.localStorage.removeItem("m-jwtStr")
        window.localStorage.setItem("m-isAuth","no")
        ElMessage({
          message:'退出成功',
          type:'success'
        })
        router.push('/login')
        window.location.reload()
      }else {
        ElMessage({
          message:'退出失败',
          type:'error'
        })
      }
    }).catch((error)=>{console.log(error)})
  }
}

function toManageIndex(){
  router.push("/management/manageIndex")
}
function toUserInfoManage(){
  router.push("/management/userInfoManage")
}

function toBrandManage(){
  router.push("/management/brandManage")
}
function toCategoryManage(){
  router.push("/management/categoryManage")
}
function toProductUploadManage(){
  router.push("/management/productUploadManage")
}
function toProductInfoManage(){
  router.push("/management/productInfoManage")
}
function toHistoryDataShow(){
  router.push("/management/historyDataShow")
}
const tableData = ref(Array.from({ length: 20 }).fill(item))
</script>

<style scoped>
.big-container .el-header {
  position: relative;
  background-color: darkseagreen;
  //color: var(--el-text-color-primary);
  color: darkolivegreen;
}
.big-container .el-aside {
  //color: var(--el-text-color-primary);
  color: darkolivegreen;
  background: darkseagreen;
}
.big-container .el-menu {
  border-right: none;
}
.big-container .el-main {
  padding: 0;
}
.big-container .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
.big-container{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0;
  margin: 0;
}
.el-dropdown{
  position: absolute;
  display: inline;
  right: 20px;
  top:20px
}
.el-dropdown-link{
  color: white;
  cursor: pointer;
}



</style>