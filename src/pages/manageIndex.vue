<template>
  <el-scrollbar class="el-scrollbar">
    <el-text class="el-text" type="success" size="large">欢迎管理员{{adminName}}使用此管理系统！</el-text>
    <el-calendar class="el-calendar" v-model="date" />
  </el-scrollbar>
</template>

<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";

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

const date = ref(new Date())
</script>

<style scoped>
.el-scrollbar{


}
.el-calendar{
  position: absolute;

  top: 0;
  left:500px;
  right: 10px;
}

.el-text{
  position: absolute;
  left: 20px;
  top: 20px;
}

</style>