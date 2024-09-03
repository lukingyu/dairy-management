<template>

  <el-table :data="filteredUserInfos" style="width: 100%">
    <el-table-column label="id" prop="id" />
    <el-table-column label="用户id" prop="userId" />
    <el-table-column label="用户名" prop="username" />
    <el-table-column label="用户年龄" prop="age" />
    <el-table-column label="用户电话" prop="phone" />
    <el-table-column align="right">
      <template #header>
        <el-input v-model="search" size="small" placeholder="根据用户名搜索" />
      </template>
      <template #default="scope">
        <el-button size="small" plain @click="editRow(scope.row)"
        >编辑</el-button
        >
        <el-popconfirm
            confirm-button-text="删除"
            cancel-button-text="取消"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="您确定删除这条用户信息吗?"
            @confirm="handleDelete(scope.$index, scope.row)"
        >
          <template #reference>
            <el-button
                size="small"
                type="danger"
                disabled
            >删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <!--用于编辑的对话框，要写在一级位置-->
  <el-dialog v-model=dialogVisible>
    <el-form ref="formEl" :model="form" :rules="rules" :label-width="formLabelWidth">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input v-model.number="form.age"></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="submitForm">Save</el-button>
    </div>
  </el-dialog>

</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import axios from "axios";
import {InfoFilled} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";


const search = ref('')
let userInfos = ref([]);
const filteredUserInfos = computed(() =>
    userInfos.value.filter(
        (userInfo) =>
            search.value==='' ||
            userInfo.username.toLowerCase().includes(search.value.toLowerCase())
    )
)
const handleEdit = (index, UserInfo) => {
  console.log(index, UserInfo)
}
const handleDelete = (index, UserInfo) => {
  // console.log(index, UserInfo)
  delete userInfos.value[index]
  //删除数据库数据
  axios.delete('/api/manage/user/deleteUserInfo/'+UserInfo.userId).then((res)=>{
    if (res.data.code === 200){
      showElMessage('删除成功','success')
    }else {
      showElMessage('删除失败，请联系开发人员','error')
    }
  })

}


onMounted(()=>{
  axios.get('/api/manage/user/getUserInfos').then((res)=>{
      if (res.data.code === 200){
        userInfos.value = res.data.data
      }
  })
})
const formEl = ref(null);
const form = ref({});
const dialogVisible = ref(false)

const editRow = (row) => {
  form.value = { ...row };
  dialogVisible.value = true;
};

const submitForm = async () => {
  // const formRef = form;
  await formEl.value.validate((valid) => {
    if (valid) {
      const dataIndex = userInfos.value.indexOf(form.value);
      const tableDataCopy = [...userInfos.value];
      tableDataCopy.splice(dataIndex, 1, form.value);
      userInfos.value = tableDataCopy;
      dialogVisible.value = false;
    }
  });
  //修改数据库中的数据
  await axios.post('/api/manage/user/modifyUserInfo',form.value).then((res)=>{
    if (res.data.code === 200){
      showElMessage('修改成功','success')
    }else{
      showElMessage('修改失败，请联系开发人员','error')
    }
  }).catch((error)=>{console.log(error)})

  window.location.reload()
};
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
const formLabelWidth = '140px'

const rules = {
  username: [
    { required: true, message: 'Please input name', trigger: 'blur' },
    { min:3, max:12,message: '用户名长度不符',trigger: 'blur'}
  ],
  age: [
    { required: true, message: 'Please input age', trigger: 'blur' },
    { type: 'number', message: 'Age must be a number', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: 'Please input phone', trigger: 'blur' },
  ],
};
</script>


<style scoped>

</style>