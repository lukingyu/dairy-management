<template xmlns="http://www.w3.org/1999/html">
<div style="display: grid;place-items: center;position: relative">
  <el-text type="primary" style="font-family: 'HarmonyOS Sans SC Black';font-size: larger;position: absolute;top: 40px" size="large">新增商品</el-text>
  <el-form :inline="true" :model="productDto" ref="addProductFormRef" :rules="addProRules" style="width: 750px;position: absolute;top: 100px" label-width="100">
    <el-form-item label="品牌" prop="brandId">
      <el-select
          v-model="brandId"
          placeholder="请选择品牌"
          size="large"
          style="width: 240px"
          @change="getCategoriesByBrandId"
      >
        <el-option
            v-for="brand in brands"
            :key="brand.id"
            :label="brand.brandName"
            :value="brand.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="商品分类" prop="categoryId">
      <el-select
          v-model="categoryId"
          placeholder="请选择分类"
          size="large"
          style="width: 240px"
      >
        <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.categoryName"
            :value="category.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="商品名" prop="productName">
      <el-input v-model="productDto.productName" placeholder="请输入商品名" clearable size="large" style="width: 240px"/>
    </el-form-item>
    <el-form-item label="价格" prop="price">
      <el-input-number v-model="productDto.price" :precision="2" :step="0.1" :min="0" size="large"/>
    </el-form-item>
    <el-form-item label="商品介绍" prop="introduction">
      <el-input
          v-model="productDto.introduction"
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
          v-model="productDto.ingredient"
          maxlength="200"
          style="width: 240px"
          placeholder="请输入商品配料"
          show-word-limit
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
      />
    </el-form-item>
    <el-form-item label="规格" prop="specification">
      <el-input v-model="productDto.specification" placeholder="请输入商品规格，如10g*18盒" clearable size="large" style="width: 240px"/>
    </el-form-item>
    <el-form-item label="保质期" prop="shelfLife">
      <el-input v-model="productDto.shelfLife" placeholder="请输入商品保质期，如6个月" clearable size="large" style="width: 240px"/>
    </el-form-item>
    <el-form-item label="商品图片" prop="imageUrl">
      <el-upload
          class="avatar-uploader"
          action=""
          ref="uploadRef"
          :show-file-list="false"
          :limit="1"
          :on-success="handleProImageUploadSuccess"
          :before-upload="beforeProImageUpload"
          :http-request="uploadProImage"
          list-type="picture"
          accept="image/*"
      >
        <img v-if="productDto.imageUrl" :src="productDto.imageUrl" class="avatar" alt=""/>
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        <template #tip>
          <el-button type="info" :icon="Delete" circle :disabled="productDto.imageUrl==='' " @click="delProImage"/>
          <div class="el-upload__tip">只能上传图片,且单张图片大小不能超过10MB</div>
        </template>
      </el-upload>
    </el-form-item>

    <el-form-item style="display: block; position:absolute; left: 44%">
      <el-popconfirm
          confirm-button-text="是"
          cancel-button-text="否"
          :icon="InfoFilled"
          icon-color="#626AEF"
          title="你确定添加此商品吗"
          @confirm="addProduct"
      >
        <template #reference>
          <el-button type="primary" size="large">上传商品</el-button>
        </template>
      </el-popconfirm>
    </el-form-item>
  </el-form>
</div>
</template>

<script setup>

import {computed, onMounted, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import {Delete, InfoFilled, Plus} from "@element-plus/icons-vue";

let brandId = ref('')
let categoryId = ref('')

let brands = ref([])
let categories = ref([])

let productDto = reactive({
  brandId:computed(()=>brandId.value),
  categoryId:computed(()=>categoryId.value),
  productName:'',
  price: NaN,
  introduction:'',
  ingredient:'',
  specification:'',
  shelfLife:'',
  imageUrl:''

})
const addProductFormRef = ref(null)
const addProRules = reactive({
  brandId: [
    { required: true, message: '请选择品牌', trigger: 'blur' },
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'blur' },
  ],
  productName: [
    { required: true, message: '请输入商品名', trigger: 'blur' },
    { min: 1, max: 50, message: 'Length should be 1 to 50', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入', trigger: 'blur' },
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
  ],
  imageUrl: [
    { required: true, message: '请上传图片', trigger: 'blur' },
  ]
})

onMounted(()=>{
  axios.get('/api/brand/getAllBrands').then((res)=>{
    if (res.data.code===200){
      brands.value = res.data.data
    }else {
      ElMessage.error("获取所有品牌时出错")
    }
  })
})

//通过品牌ID获取该品牌下的所有分类
function getCategoriesByBrandId(){
  console.log(brandId.value)
  console.log(productDto.brandId)
  if (brandId.value !== '' && brandId.value !== null){
    axios.get('/api/brand/getCategoriesByBrandId/' + brandId.value).then((res)=>{
      if (res.data.code===200){
        categories.value = res.data.data
      }else if(res.data.data===null || res.data.data.size === 0){
        ElMessage.info("该品牌下没有任何分类，请您为该品牌添加分类后继续")
      } else {
        ElMessage.error("获取分类时出错")
      }
    })
  }
}

const uploadRef = ref(null)
function handleProImageUploadSuccess(res){
  productDto.imageUrl = res.data.data
  ElMessage({
    message: "商品图片上传成功", type: "success"
  });
  uploadRef.value.clearFiles()
}
function beforeProImageUpload(rawFile){
  if(rawFile.size / 1024 / 1024 > 10){
    ElMessage.error("单张图片大小不能超过10MB!");
    return false;
  }
  return true;
}
function uploadProImage(options){
  const formData = new FormData();
  formData.append("file", options.file);
  return axios.post('/api/product/uploadProImage', formData);
}
function delProImage(){
  axios.post('/api/product/delProImage', productDto.imageUrl, {
    headers:{
      "Content-Type":"application/json"
    }
  }).then((res)=>{
    if (res.data.code === 200){
      productDto.imageUrl = ''
    }
  })
}


function addProduct(){
  addProductFormRef.value.validate((valid)=>{
    if (valid){
      axios.post('/api/product/addProduct', productDto).then((res)=>{
        if (res.data.code===200){

          brandId.value = ''
          categoryId.value = ''
          productDto.productName = ''
          productDto.price = NaN
          productDto.introduction = ''
          productDto.ingredient = ''
          productDto.specification = ''
          productDto.shelfLife = ''
          productDto.imageUrl = ''

          //window.location.reload() //如果不刷新的话，无法上传商品图片。目前的小BUG。已解决，调用el-upload标签的clearFiles方法即可。

          ElMessage.success("商品添加成功")
        }

      })
    }else {
      ElMessage.error("请完善商品信息后再上传")
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