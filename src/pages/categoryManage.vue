<template>
<div style="display: grid;place-items: center">
  <div style="margin-top: 30px;display: grid;place-items: center">
  <el-text style="font-size: 25px;font-family: 钉钉进步体;color: #409EFF">新增分类</el-text>
  <el-form :inline="true" :model="categoryDto" class="add-form" :rules="rules" ref="addCategoryFormRef">
    <el-form-item label="品牌" prop="brandId">
      <el-select
          v-model="brandId"
          placeholder="请选择品牌"
          size="large"
          style="width: 240px"
      >
        <el-option
            v-for="brand in brands"
            :key="brand.id"
            :label="brand.brandName"
            :value="brand.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="分类名" prop="categoryName">
      <el-input v-model="categoryDto.categoryName" size="large" style="width: 240px" placeholder="请先选择品牌，再输入分类名" clearable :disabled="(typeof brandId)==='string'"/>
    </el-form-item>

    <el-form-item  style="display: grid;place-items: center;margin-left: 30px">
      <el-button type="primary" @click="addCategory">添加此分类</el-button>
    </el-form-item>
  </el-form>
  </div>

  <el-divider/>

  <div style="margin-bottom: 20px">
    <el-select
        v-model="brandIdForSearch"
        placeholder="根据品牌查询"
        size="large"
        style="width: 240px"
    >
      <el-option
          v-for="brand in brands"
          :key="brand.id"
          :label="brand.brandName"
          :value="brand.id"
      />
    </el-select>
    <el-input v-model="categoryNameForSearch" size="large" style="width: 240px;margin-left: 20px" placeholder="根据分类名查询" clearable/>
    <el-button type="primary" @click="filterCategories" style="margin-left: 20px" :disabled="brandIdForSearch===''&&categoryNameForSearch===''">查询分类</el-button>
    <el-button type="success" @click="resetResult" style="margin-left: 20px" :disabled="brandIdForSearch===''&&categoryNameForSearch===''">重置</el-button>
  </div>

  <el-table :data="categories" stripe style="width: 50%">
    <el-table-column label="序号" width="100" align="center">
      <template #default="scope">
        {{scope.$index + 1 + (currentPage-1)*pageSize}}
      </template>
    </el-table-column>
    <el-table-column prop="brandName" label="品牌名" width="150"  align="center"/>
    <el-table-column prop="categoryName" label="分类名" width="150"  align="center"/>

    <el-table-column label="Operations" align="center">
      <template #default="scope">
        <el-popconfirm title="你确定删除该分类吗?" @confirm="handleDelete(scope.row)">
          <template #reference>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination background layout="prev, pager, next" :total="total" v-model:page-size="pageSize" :page-count="pageCount" v-model:current-page="currentPage" @current-change="getCategoriesByPage"
                 style="text-align: center;margin-top: 10px"/>
</div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";

let brandId = ref('')
let brands = ref([])

let brandIdForSearch = ref('')
let categoryNameForSearch = ref('')

let categoryDto = reactive({
  categoryName:'',
  brandId:computed(()=>brandId.value)
})

let total = ref(0)
let pageSize = ref(6)
let pageCount = ref(0) //总页数
let currentPage = ref(1)

let categories = ref([])

function getCategoriesByPage(){
  let formData = new FormData()
  formData.append("brandId", brandIdForSearch.value)
  formData.append("categoryName", categoryNameForSearch.value)
  formData.append("pageNum", currentPage.value)
  formData.append("pageSize", pageSize.value)

  axios.post('/api/category/getCategoriesByPage', formData).then((res)=>{
    if (res.data.code===200){
      categories.value = res.data.data.records
      total.value = res.data.data.total
      pageCount.value = res.data.data.pages
    }else {
      ElNotification.error({
        title:"出错了",
        message:"请联系官方"
      })
    }
  })
}

onMounted(()=>{
  axios.get('/api/brand/getAllBrands').then((res)=>{
    if (res.data.code===200){
      brands.value = res.data.data
    }else {
      ElMessage.error("获取所有品牌时出错")
    }
  })
  getCategoriesByPage()
})

function filterCategories(){
  if (brandIdForSearch.value === undefined){
    brandIdForSearch.value = ''
  }
  getCategoriesByPage()
}
function resetResult(){
  brandIdForSearch.value = ''
  categoryNameForSearch.value = ''
  getCategoriesByPage()
}

let addCategoryFormRef = ref(null)

//验证该品牌下此分类是否存在
function validateCategory(rule, value, callback) {
  //根据品牌ID和分类名进行查询
  let formData = new FormData()
  formData.append("brandId", categoryDto.brandId)
  formData.append("categoryName", categoryDto.categoryName)
  axios.post('/api/category/categoryExist', formData).then((res) => {
    const result = res.data.data;
    if (result === true) {
      callback(new Error('此品牌已有该分类'));
    } else {
      callback();
    }
  });
}

const rules = reactive({
  brandId:[
    {required:true,message:'请选择品牌',trigger:'blur'},
  ],
  categoryName:[
    {required:true,message:'请输入分类名',trigger:'blur'},
    {min:1,max:10,message: '分类名的长度必须>=1或者<=10',trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        validateCategory(rule, value, callback);
      },
      trigger: 'blur',
    },
  ],
})

function addCategory(){
  addCategoryFormRef.value.validate((valid)=>{
    if (valid){
      axios.post('/api/category/addCategory', categoryDto).then((res)=>{
        if (res.data.code===200){
          ElMessage.success("分类添加成功")
          //addCategoryFormRef.value.resetField()
          brandId.value=''
          categoryDto.categoryName = ''

          window.location.reload()
        }
      })
    }else {
      ElMessage.warning("请确保无误后再添加分类")
    }
  })
}

function handleDelete(row){
  //先删除内存中的数据
  categories.value = categories.value.filter((category)=>{
    return category.id !== row.id
  })
  //再删除数据库中的数据
  axios.post('/api/category/delCategory/'+ row.id).then((res)=>{
    if (res.data.code === 200){
      ElMessage.success("删除分类成功！")

      window.location.reload()
    }else {
      ElMessage.error("删除失败，请联系官方")
    }
  })
}
</script>

<style scoped>
.add-form{
  margin-top: 20px;
}
</style>