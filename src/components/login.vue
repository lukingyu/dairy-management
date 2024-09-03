<template>

  <div class="myDiv">
<!--    <font color=#f5f5f5 size="6" style="position: absolute;top: 10%;left: 38%;font-family: 钉钉进步体">国产奶制品管理系统</font>-->
    <span style="font-family: 钉钉进步体;font-size: 33px;color: #f5f5f5;position: absolute;top: 10%;left: 40%">国产奶制品管理系统</span>
  <el-tabs
      v-model="activeName"
      type="card"
      class="demo-tabs"
  >
    <el-tab-pane label="登录" name="登录">
      <el-form
          ref="loginFormEl"
          style="max-width: 600px"
          :model="admin"
          :rules="loginRules"
          label-width="auto"
          :size="'default'"
          status-icon
      >
        <el-form-item label="管理员名称" prop="adminName">
          <el-input v-model="admin.adminName" placeholder="请输入管理员名称"/>
        </el-form-item>
        <el-form-item label="管理员密码" prop="password">
          <el-input v-model="admin.password" type="password" placeholder="请输入管理员密码"/>
        </el-form-item>
        <el-form-item class="loginTwoButton">
          <el-button type="primary" @click="Login()">登录</el-button>
          <el-button @click="resetLoginForm(loginFormEl)">重置</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <el-tab-pane label="注册" name="注册" disabled>
      <el-form
          ref="regFormEl"
          style="max-width: 600px"
          :model="regAdmin"
          :rules="regRules"
          label-width="auto"
          :size="'default'"
          status-icon
      >
        <el-form-item label="注册名称" prop="adminName">
          <el-input v-model="regAdmin.adminName" placeholder="请输入注册名称"/>
        </el-form-item>
        <el-form-item label="注册密码" prop="password">
          <el-input v-model="regAdmin.password" type="password" placeholder="请输入密码"/>
        </el-form-item>
        <el-form-item class="regTwoButton">
          <el-button type="primary" @click="Register()">注册</el-button>
          <el-button @click="resetRegForm(regFormEl)">重置</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>

  </el-tabs>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import router from "@/router/index.js";
import axios from "axios";
import {ElMessage} from "element-plus";

let loginFormEl = ref(null)
let regFormEl = ref(null)

let admin = reactive({
  adminName:'',
  password:''
})
let activeName = '登录'
const loginRules = reactive({
  adminName: [
    { required: true, message: '请输入管理员名', trigger: 'blur' },
    { min: 3, max: 12, message: '你的名字长度肯定是 3-12', trigger: 'blur' },
  ],
  password: [
    {
      required: true, message: '请输入密码', trigger: 'blur',
    },
  ]
})

let regAdmin = reactive({
  adminName:'',
  password:''
})
const regRules = reactive({
  adminName: [
    { required: true, message: '请输入管理员注册名', trigger: 'blur' },
    { min: 3, max: 12, message: '注册名不符合规范，长度应该 3-12', trigger: 'blur' },
  ],
  password: [
    {
      required: true, message: '请输入注册密码', trigger: 'blur',
    },
  ]
})

function resetLoginForm(loginFormEl){
  loginFormEl.resetFields()
}
function resetRegForm(regFormEl){
  regFormEl.resetFields()
}

function Login(){
  loginFormEl.value.validate((valid)=>{
    if(valid){
      //doLogin
      axios.post('/api/admin/login',admin).then((res)=>{
            if (res.data.code === 200){
              window.localStorage.setItem("m-jwtStr", res.data.data.jwtStr)
              window.localStorage.setItem("m-adminId",res.data.data.adminId)
              window.localStorage.setItem("m-isAuth","yes")
              showElMessage("登录成功",'success')
              router.push('/management')
            }else {
              window.localStorage.removeItem("m-jwtStr")
              window.localStorage.setItem("m-isAuth","no")
              showElMessage("登录失败，请重新登录",'error')
              router.push('/login')
            }
          }, (error)=>console.log(error)
      ).catch((error)=>console.log(error))
    }
  })
}
function Register(){
  regFormEl.value.validate((valid)=>{
    if(valid){
      //doRegister
      axios.post('/api/admin/register',regAdmin).then((res)=>{
            if (res.data.code === 200){
              showElMessage("注册成功",'success')
              router.push('/login')
            }else {
              showElMessage("注册失败，请联系管理员",'error')
              router.push('/login')
            }
          }, (error)=>console.log(error)
      ).catch((error)=>console.log(error))
    }
  })
}

//显示消息
function showElMessage(msg, type){
  if (type === 'success'){
    ElMessage({
      message: msg,
      type: "success",
    })
  }
  if (type === 'error'){
    ElMessage.error(msg)
  }
}
</script>

<style scoped>
.demo-tabs{
  position: absolute;
  top: 25%;
  bottom: 25%;
  left: 37%;
  right: 37%;
  background-color: whitesmoke;
  padding: 20px;
  border-color: darkcyan;
  border-radius: 5%;
}
.myDiv{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url("src/assets/images/backimage.png");
  background-size: cover; /* 背景图片覆盖整个div区域 */
}
.regTwoButton{
  padding-left: 75px;
}
.loginTwoButton{
  padding-left: 75px;
}

</style>