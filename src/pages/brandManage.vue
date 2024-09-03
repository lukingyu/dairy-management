<template>
<div style="display: grid;place-items: center">
  <el-button class="addBrandButton" type="primary" @click="openAddBrandDialog">新增品牌</el-button>

  <el-table :data="brands" stripe style="width: 70%">
    <el-table-column label="序号" width="100" align="center">
      <template #default="scope">
        {{scope.$index + 1 + (currentPage-1)*pageSize}}
      </template>
    </el-table-column>
    <el-table-column prop="brandName" label="品牌名" width="150"  align="center"/>
    <el-table-column prop="logoUrl" label="品牌LOGO" align="center" width="100">
      <template v-slot:default="scope">
        <el-image :src="scope.row.logoUrl" style="height: 30px;margin-top: 5px"/>
      </template>
    </el-table-column>
    <el-table-column prop="introduction" label="品牌介绍" align="center" width="400">
      <template v-slot:default="scope">
        <el-tooltip :content="scope.row.introduction" effect="light">
          <el-text line-clamp="3">{{scope.row.introduction}}</el-text>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column label="Operations">
      <template #default="scope">
        <el-button size="small" @click="openEditDialog(scope.$index, scope.row)">修改</el-button>
        <el-popconfirm title="你确定删除该品牌吗?" @confirm="handleDelete(scope.row)">
          <template #reference>
            <el-button
                size="small"
                type="danger"
            >
              删除
            </el-button>
          </template>
        </el-popconfirm>

      </template>
    </el-table-column>
  </el-table>
  <el-pagination background layout="prev, pager, next" :total="total" v-model:page-size="pageSize" :page-count="pageCount" v-model:current-page="currentPage" @current-change="getBrandsByPage"
      style="text-align: center"/>


  <!--新增商品的对话框，不要搞错了！！！！！-->
  <el-dialog v-model="addBrandDialogVisible" title="新增商品品牌" width="500" center>
    <el-form
        ref="addFormRef"
        style="max-width: 400px"
        :model="addBrandDto"
        :rules="addRules"
        label-width="auto"
        class="addForm"
        size="default"
        status-icon
    >
      <el-form-item label="品牌名" prop="brandName">
        <el-input v-model="addBrandDto.brandName" />
      </el-form-item>

      <el-form-item label="上传LOGO" prop="logoUrl">
        <el-upload
            class="avatar-uploader"
            action=""
            ref="addUploadRef"
            :show-file-list="false"
            :limit="1"
            :on-success="handleLogoUploadSuccess"
            :before-upload="beforeLogoUpload"
            :http-request="uploadLogo"
            list-type="picture"
            accept="image/*"
        >
          <img v-if="addBrandDto.logoUrl" :src="addBrandDto.logoUrl" class="avatar" alt=""/>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          <template #tip>
            <el-button type="info" :icon="Delete" circle :disabled="addBrandDto.logoUrl==='' " @click="delLogo"/>
            <div class="el-upload__tip">只能上传图片,且单张图片大小不能超过10MB</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="品牌介绍" prop="introduction">
        <el-input
            v-model="addBrandDto.introduction"
            maxlength="255"
            style="width: 240px"
            placeholder="请输入商品介绍"
            show-word-limit
            type="textarea"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addBrandDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="addBrand">新增</el-button>
      </div>
    </template>
  </el-dialog>

  <!--修改对话框！！！！！-->
  <el-dialog v-model="editBrandDialogVisible" title="修改品牌信息" width="500" center>
    <el-form
        ref="editFormRef"
        style="max-width: 400px"
        :model="editBrandObj"
        :rules="addRules"
        label-width="auto"
        class="editForm"
        size="default"
        status-icon
    >
      <el-form-item label="品牌ID" prop="brandId">
        <el-input v-model="editBrandObj.brandId" disabled/>
      </el-form-item>
      <el-form-item label="品牌名" prop="brandName">
        <el-input v-model="editBrandObj.brandName" />
      </el-form-item>

      <el-form-item label="品牌LOGO" prop="logoUrl">
        <el-upload
            class="avatar-uploader"
            action=""
            ref="uploadRef"
            :show-file-list="false"
            :limit="1"
            :on-success="handleLogoUploadSuccessForEdit"
            :before-upload="beforeLogoUpload"
            :http-request="uploadLogo"
            list-type="picture"
            accept="image/*"
        >
          <img v-if="editBrandObj.logoUrl" :src="editBrandObj.logoUrl" class="avatar" alt=""/>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          <template #tip>
            <el-button type="info" :icon="Delete" circle v-if="editBrandObj.logoUrl!=='' " @click="delLogoForEdit"/>
            <div class="el-upload__tip">只能上传图片,且单张图片大小不能超过10MB</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="品牌介绍" prop="introduction">
        <el-input
            v-model="editBrandObj.introduction"
            maxlength="255"
            style="width: 260px"
            placeholder="请输入商品介绍"
            show-word-limit
            type="textarea"
            rows="4"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editBrandDialogVisible.value = false">关闭</el-button>
        <el-button type="primary" @click="editBrand">修改</el-button>
      </div>
    </template>
  </el-dialog>
</div>
</template>

<script setup>

import {onBeforeUpdate, onMounted, onUpdated, reactive, ref} from "vue";
import {Delete, Plus} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import axios from "axios";
import {useRouter} from "vue-router";
const router = useRouter()

let brands = ref([])
let total = ref(0)
let pageSize = ref(10)
let pageCount = ref(0) //总页数
let currentPage = ref(1)

function getBrandsByPage(){
  axios.get('/api/brand/getBrandsByPage/'+currentPage.value+"/"+pageSize.value).then((res)=>{
    if (res.data.code === 200){
      brands.value = res.data.data.records
      total.value = res.data.data.total
      pageCount.value = res.data.data.pages
    }
  })
}

onMounted(()=>{
  //获取所有的品牌信息
  getBrandsByPage()
})

// onUpdated(()=>{
//   //目的是为了重新获取表格分页数据
//   getBrandsByPage()
// })  //会导致死循环，先不要使用！

let addBrandDto = reactive({
  brandName:'',
  logoUrl:'',
  introduction:''
})

let addBrandDialogVisible = ref(false)
function openAddBrandDialog(){
  //打开对话框
  addBrandDialogVisible.value = true
}

const addRules = reactive({
  brandName: [
    { required: true, message: '请输入品牌名', trigger: 'blur' },
    { min: 1, max: 10, message: 'Length should be 1 to 10', trigger: 'blur' },
  ],
  logoUrl: [
    { required: true, message: '请上传图片', trigger:'blur' },
  ],
  introduction: [
    { required: true, message: '请写商品介绍', trigger: 'blur' },
  ],
})

const addUploadRef = ref(null)
//品牌Logo上传成功后，回调函数
function handleLogoUploadSuccess(res){
  addBrandDto.logoUrl = res.data.data
  ElMessage({
    message: "logo上传成功", type: "success"
  });
  addUploadRef.value.clearFiles()
}

//上传logo之前的回调函数
function beforeLogoUpload(rawFile){
  if(rawFile.size / 1024 / 1024 > 10){
    ElMessage.error("单张图片大小不能超过10MB!");
    return false;
  }
  return true;
}

//上传logo的函数
function uploadLogo(options){
  const formData = new FormData();
  formData.append("file", options.file);
  return axios.post('/api/brand/uploadLogo', formData);
}

//删除上传的Logo
function delLogo(){
  axios.post('/api/brand/delLogo', addBrandDto.logoUrl, {
    headers:{
      "Content-Type":"application/json"
    }
  }).then((res)=>{
    if (res.data.code === 200){
      addBrandDto.logoUrl = ''
    }
  })
}

const addFormRef = ref(null)
//上传品牌信息
function addBrand(){
  addFormRef.value.validate((valid)=>{
    if (valid){
      //表单都合法，才操作

      // //TODO
      // //先修改内存中的数据
      // brands.value.push(addBrandDto) //目前不行，还是修改完数据后，刷新组件吧。
      //再修改数据库中的数据
      axios.post('/api/brand/addBrand', addBrandDto).then((res)=>{
        if (res.data.code === 200){
          ElMessage.success("品牌添加成功")
          //关闭对话框
          addBrandDialogVisible.value = false
          //修改表单绑定的对象数据
          addBrandDto.brandName=''
          addBrandDto.logoUrl=''
          addBrandDto.introduction=''

          window.location.reload()
        }
      })
    }else {
      ElMessage.error("请完善品牌信息")
    }
  })

}

let editBrandDialogVisible = ref(false)

let editBrandObj = ref({
  brandId:'',
  brandName:'',
  logoUrl:'',
  introduction:''
})

//点击编辑的时候，传过去brandId,在数组中查询该id对应的对象，赋给editBrandObj
function openEditDialog(index, row){
  for (let brand of brands.value){
    if (row.brandId === brand.brandId){
      editBrandObj.value.brandId = brand.brandId
      editBrandObj.value.brandName = brand.brandName
      editBrandObj.value.logoUrl = brand.logoUrl
      editBrandObj.value.introduction = brand.introduction
    }
  }
  editBrandDialogVisible.value = true

}
const uploadRef = ref(null)
function handleLogoUploadSuccessForEdit(res){
  editBrandObj.value.logoUrl = res.data.data
  ElMessage({
    message: "logo修改成功", type: "success"
  });
  uploadRef.value.clearFiles()
}
function delLogoForEdit(){
  axios.post('/api/brand/delLogo', editBrandObj.value.logoUrl, {
    headers:{
      "Content-Type":"application/json"
    }
  }).then((res)=>{
    if (res.data.code === 200){
      editBrandObj.value.logoUrl = ''
    }
  })
}

let editFormRef = ref(null)

function editBrand(){
  editFormRef.value.validate((valid)=>{
    if (valid){
      // console.log(brands.value)
      // console.log(editBrandObj.value)
      //先修改内存中的edit对象
      brands.value = brands.value.map((brand)=>{
        if (brand.brandId === editBrandObj.value.brandId){
          brand.brandName = editBrandObj.value.brandName
          brand.logoUrl = editBrandObj.value.logoUrl
          brand.introduction = editBrandObj.value.introduction
        }
        return brand;
      })
      // console.log(brands.value)
      // console.log(editBrandObj.value)
      //再修改数据库中的数据
      axios.post('/api/brand/editBrand', editBrandObj.value).then((res)=>{
        if (res.data.code === 200){
          ElMessage.success("修改品牌信息成功！")
        }
      })
      editBrandObj.value.brandId=''
      editBrandObj.value.brandName=''
      editBrandObj.value.logoUrl=''
      editBrandObj.value.introduction=''

      editBrandDialogVisible.value = false
    }
  })
}

function handleDelete(row){
  //先删除内存中的数据
  brands.value = brands.value.filter((brand)=>{
    return brand.brandId !== row.brandId
  })
  //再删除数据库中的数据
  axios.post('/api/brand/delBrand/'+ row.brandId).then((res)=>{
    if (res.data.code === 200){
      ElMessage.success("删除品牌成功！")

      window.location.reload()
    }else {
      ElMessage.error("删除失败，请联系官方")
    }
  })
}

</script>

<style scoped>
.addBrandButton{
  margin-top: 50px;

}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>