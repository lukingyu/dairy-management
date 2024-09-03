<template>
  <div style="display: grid;place-items: center">
    <div style="margin-top: 20px">
    <el-input
        v-model="keyword"
        style="width: 240px"
        size="large"
        placeholder="请输入关键字"
        :prefix-icon="Search"
    />
    <el-button :icon="Search" circle size="large" type="success" @click="filterProduct"/>
    </div>
  <el-table :data="products" stripe style="width: 100%;margin-top: 20px">
    <el-table-column label="序号" width="100" align="center">
      <template #default="scope">
        {{scope.$index + 1 + (currentPage-1)*pageSize}}
      </template>
    </el-table-column>
    <el-table-column prop="productName" label="商品名" width="130"  align="center"/>
    <el-table-column prop="brandName" label="品牌" align="center" width="100"/>
    <el-table-column prop="categoryName" label="类别" align="center" width="100"/>
    <el-table-column prop="price" label="价格" align="center" width="100"/>
    <el-table-column prop="imageUrl" label="商品图片" align="center" width="100">
      <template v-slot:default="scope">
        <el-image :src="scope.row.imageUrl" style="height: 30px;margin-top: 5px"/>
      </template>
    </el-table-column>
    <el-table-column prop="introduction" label="介绍" align="center" width="200">
      <template v-slot:default="scope">
        <el-tooltip :content="scope.row.introduction" effect="light">
          <el-text line-clamp="3">{{scope.row.introduction}}</el-text>
        </el-tooltip>
      </template>

    </el-table-column>
    <el-table-column prop="ingredient" label="配料" align="center" width="100">
      <template v-slot:default="scope">
        <el-tooltip :content="scope.row.ingredient" effect="light">
          <el-text line-clamp="3">{{scope.row.ingredient}}</el-text>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column prop="specification" label="规格" align="center" width="100"/>
    <el-table-column prop="shelfLife" label="保质期" align="center" width="100"/>
    <el-table-column label="Operations">
      <template #default="scope">
        <el-button size="small" @click="openEditDialog(scope.row)">修改</el-button>
        <el-popconfirm title="你确定删除该商品吗?" @confirm="handleDelete(scope.row)">
          <template #reference>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-popconfirm>

      </template>
    </el-table-column>
  </el-table>
  <el-pagination background layout="prev, pager, next" :total="total" v-model:page-size="pageSize" :page-count="pageCount" v-model:current-page="currentPage" @current-change="getProductsByPage"
                 style="text-align: center;margin-top: 10px"/>
  </div>

  <!--修改商品信息对话框-->
  <el-dialog v-model="editProDialogVisible" title="修改商品信息" width="500" center>
    <el-form
        ref="editFormRef"
        style="max-width: 400px"
        :model="editProObj"
        :rules="rules"
        label-width="auto"
        class="editForm"
        size="default"
        status-icon
    >
      <el-form-item label="商品名" prop="productName">
        <el-input v-model="editProObj.productName"/>
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="editProObj.price" :precision="2" :step="0.1" :min="0" size="large"/>
      </el-form-item>

      <el-form-item label="商品图片" prop="imageUrl">
        <el-upload
            class="avatar-uploader"
            action=""
            ref="uploadRef"
            :show-file-list="false"
            :limit="1"
            :on-success="handleImageUploadSuccessForEdit"
            :before-upload="beforeImageUpload"
            :http-request="uploadImage"
            list-type="picture"
            accept="image/*"
        >
          <img v-if="editProObj.imageUrl" :src="editProObj.imageUrl" class="avatar" alt=""/>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          <template #tip>
            <el-button type="info" :icon="Delete" circle v-if="editProObj.imageUrl!=='' " @click="delImageForEdit"/>
            <div class="el-upload__tip">只能上传图片,且单张图片大小不能超过10MB</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="商品介绍" prop="introduction">
        <el-input
            v-model="editProObj.introduction"
            maxlength="200"
            style="width: 240px"
            placeholder="请输入商品介绍"
            show-word-limit
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
      <el-form-item label="配料" prop="ingredient">
        <el-input
            v-model="editProObj.ingredient"
            maxlength="200"
            style="width: 240px"
            placeholder="请输入商品配料"
            show-word-limit
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
      <el-form-item label="规格" prop="specification">
        <el-input v-model="editProObj.specification" placeholder="请输入商品规格，如10g*18盒" clearable size="large" style="width: 240px"/>
      </el-form-item>
      <el-form-item label="保质期" prop="shelfLife">
        <el-input v-model="editProObj.shelfLife" placeholder="请输入商品保质期，如6个月" clearable size="large" style="width: 240px"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editProDialogVisible.value = false">关闭</el-button>
        <el-button type="primary" @click="editProduct">修改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {useRouter} from "vue-router";
import {onMounted, reactive, ref} from "vue";
import axios from "axios";
import {Delete, Plus, Search} from "@element-plus/icons-vue";
import {ElMessage, ElNotification} from "element-plus";

const router = useRouter()

let products = ref([])
let total = ref(0)
let pageSize = ref(7)
let pageCount = ref(0) //总页数
let currentPage = ref(1)

let keyword = ref('')

function getProductsByPage(){
  let formData = new FormData()
  formData.append("keyword", keyword.value)
  axios.post('/api/product/getProductsByPage/'+currentPage.value+'/'+pageSize.value, formData).then((res)=>{
    if (res.data.code===200){
      console.log(res.data.data)
      products.value = res.data.data.records
      total.value = res.data.data.total
      pageCount.value = res.data.data.pages
    }
  })
}

onMounted(()=>{
  getProductsByPage()
})

function filterProduct(){
  if (keyword.value.trim() !== ''){
    getProductsByPage()
  }else{
    ElNotification.info({
      title:'哼~',
      message:'你输入了一片空白，我无能为力'
    })
  }
}

const rules = reactive({
  productName: [
    { required: true, message: '请输入商品名', trigger: 'blur' },
    { min: 1, max: 50, message: 'Length should be 1 to 50', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入', trigger: 'blur' },
  ],
  imageUrl: [
    { required: true, message: '请上传图片', trigger: 'blur' },
  ],
  introduction: [
    { required: true, message: '请输入介绍', trigger: 'blur' },
    { min: 1, message: '长度最小为1', trigger: 'blur' },
  ],
  ingredient: [
    { required: true, message: '请输入配料', trigger: 'blur' },
  ],
  specification: [
    { required: true, message: '请输入规格', trigger: 'blur' },
  ],
  shelfLife: [
    { required: true, message: '请输入保质期', trigger: 'blur' },
  ]
})

let editProObj = ref({
  productId:'',
  productName:'',
  brandId:'',
  brandName:'',
  categoryId:'',
  categoryName:'',
  price:NaN,
  imageUrl:'',
  introduction:'',
  ingredient:'',
  specification:'',
  shelfLife:''
})
let editProDialogVisible = ref(false)

function openEditDialog(row){
  for (let pro of products.value){
    if (row.productId === pro.productId){
      editProObj.value.productId = pro.productId
      editProObj.value.productName = pro.productName
      editProObj.value.brandId = pro.brandId
      editProObj.value.brandName = pro.brandName
      editProObj.value.categoryId = pro.categoryId
      editProObj.value.categoryName = pro.categoryName
      editProObj.value.price = pro.price
      editProObj.value.imageUrl = pro.imageUrl
      editProObj.value.introduction = pro.introduction
      editProObj.value.ingredient = pro.ingredient
      editProObj.value.specification = pro.specification
      editProObj.value.shelfLife = pro.shelfLife
    }
  }
  editProDialogVisible.value = true
}

const uploadRef = ref(null)
function handleImageUploadSuccessForEdit(res){
  editProObj.value.imageUrl = res.data.data
  ElMessage({
    message: "商品图片修改成功", type: "success"
  });
  uploadRef.value.clearFiles()
}
function beforeImageUpload(rawFile){
  if(rawFile.size / 1024 / 1024 > 10){
    ElMessage.error("单张图片大小不能超过10MB!");
    return false;
  }
  return true;
}
function uploadImage(options){
  const formData = new FormData();
  formData.append("file", options.file);
  return axios.post('/api/product/uploadProImage', formData);
}
function delImageForEdit(){
  axios.post('/api/product/delProImage', editProObj.value.imageUrl, {
    headers:{
      "Content-Type":"application/json"
    }
  }).then((res)=>{
    if (res.data.code === 200){
      editProObj.value.imageUrl = ''
    }
  })
}

let editFormRef = ref(null)
function editProduct(){
  editFormRef.value.validate((valid)=>{
    if (valid){
      // console.log(products.value)
      // console.log(editProObj.value)
      //先修改内存中的edit对象
      products.value = products.value.map((pro)=>{
        if (pro.productId === editProObj.value.productId){
          pro.productName = editProObj.value.productName
          pro.price = editProObj.value.price
          pro.imageUrl = editProObj.value.imageUrl
          pro.introduction = editProObj.value.introduction
          pro.ingredient = editProObj.value.ingredient
          pro.specification = editProObj.value.specification
          pro.shelfLife = editProObj.value.shelfLife
        }
        return pro;
      })

      //再修改数据库中的数据
      axios.post('/api/product/editProduct', editProObj.value).then((res)=>{
        if (res.data.code === 200){
          ElMessage.success("修改商品信息成功！")
        }
      })
      editProObj.value.productId = ''
      editProObj.value.productName = ''
      editProObj.value.brandId = ''
      editProObj.value.brandName = ''
      editProObj.value.categoryId = ''
      editProObj.value.categoryName = ''
      editProObj.value.price = NaN
      editProObj.value.imageUrl = ''
      editProObj.value.introduction = ''
      editProObj.value.ingredient = ''
      editProObj.value.specification = ''
      editProObj.value.shelfLife = ''

      editProDialogVisible.value = false
    }
  })
}

function handleDelete(row){
  //先删除内存中的数据
  products.value = products.value.filter((pro)=>{
    return pro.productId !== row.productId
  })
  //再删除数据库中的数据
  axios.post('/api/product/delProduct/'+ row.productId).then((res)=>{
    if (res.data.code === 200){
      ElMessage.success("删除商品成功！")

      window.location.reload()
    }else {
      ElMessage.error("删除失败，请联系官方")
    }
  })
}
</script>

<style scoped>
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