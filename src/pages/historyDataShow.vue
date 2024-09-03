<template>
<div>
  <!--第一排的大div-->
  <div style="display: flex;justify-content: center;align-items: center;margin-top: 40px">
    <!-- 累计收入 -->
    <div style="display: inline-block;margin-right: 80px">
      <el-card style="width: 230px;background-color: whitesmoke" class="incomeCard">
        <div class="all-income-body">
          <el-icon size="30" style="margin-right: 5px" color="#7B68EE"><Coin /></el-icon><span>累计收入：</span><span>{{allIncome}}</span><span>元</span>
        </div>
      </el-card>
    </div>
    <!--本店累计订单数-->
    <div style="display: inline-block;margin-left: 80px;margin-right: 80px">
      <el-card style="width: 230px;background-color: whitesmoke" class="orderNumCard">
        <div class="order-num-body">
          <el-icon size="30" style="margin-right: 5px" color="#7B68EE"><Tickets /></el-icon><span>销售累计订单数：</span><span>{{allOrderNum}}</span>
        </div>
      </el-card>
    </div>
    <!--总用户人数-->
    <div style="display: inline-block;margin-left: 80px">
      <el-card style="width: 230px;background-color: whitesmoke" class="userNumCard">
        <div class="user-num-body">
          <el-icon size="30" style="margin-right: 5px" color="#7B68EE"><User /></el-icon><span>用户总人数：</span><span>{{allUserNum}}</span>
        </div>
      </el-card>
    </div>
  </div>

  <!--第二排的大div-->
  <div style="display: flex;justify-content: center;align-items: center;margin-top: 40px">
    <!-- 商品销量，柱状图 -->
    <div style="display: inline-block;margin-right: 80px">
      <el-card style="width: 500px;background-color: white" class="pnasbCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px"><Histogram /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">奶制品销量排行</span>
          </div>
        </template>
        <div id="productNameAndSumBar" style="height: 400px">
        </div>
      </el-card>
    </div>
    <!--不同省份的销量占比，饼图-->
    <div style="display: inline-block;margin-left: 80px">
      <el-card style="width: 500px;background-color: white" class="pspCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px"><MapLocation /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">不同省份销售热度占比</span>
          </div>
        </template>
        <div id="provinceSumPie" style="height: 400px">
        </div>
      </el-card>
    </div>
  </div>

  <!--第三排的大div-->
  <div style="display: flex;justify-content: center;align-items: center;margin-top: 40px">
    <!--收入和时间，曲线图-->
    <div style="display: inline-block;margin-right: 80px">
      <el-card style="width: 500px;background-color: white" class="iatlCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px"><DataLine /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">近期收入随时间的变化</span>
          </div>
        </template>
        <div id="incomeAndTimeLine" style="height: 400px">
        </div>
      </el-card>
    </div>
    <!--商品平均评分排行，柱状图-->
    <div style="display: inline-block;margin-left: 80px">
      <el-card style="width: 500px;background-color: white" class="pagbCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px"><DataLine /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">奶制品平均评分排行榜</span>
          </div>
        </template>
        <div id="productAvgGradeBar" style="height: 400px">
        </div>
      </el-card>
    </div>
  </div>

  <!--第四排的大div-->
  <div style="display: flex;justify-content: center;align-items: center;margin-top: 40px;margin-bottom: 80px">
    <!--用户订单数量，（活跃用户）。玫瑰图（本质上还是饼图）-->
    <div style="display: inline-block;margin-right: 80px">
      <el-card style="width: 500px;background-color: white" class="uospCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px"><Ship /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">活跃用户</span>
          </div>
        </template>
        <div id="userOrderSumPie" style="height: 400px">
        </div>
      </el-card>
    </div>
    <!--优质用户，平均评分在4.0及以上的用户。雷达图-->
    <div style="display: inline-block;margin-left: 80px">
      <el-card style="width: 500px;background-color: white" class="gurCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px"><Medal /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">优质用户评分贡献度</span>
          </div>
        </template>
        <div id="goodUserRadar" style="height: 400px">
        </div>
      </el-card>
    </div>
  </div>
</div>
</template>

<script setup>
import {Coin, DataLine, Histogram, MapLocation, Medal, Ship, Tickets, User} from "@element-plus/icons-vue";
import axios from "axios";
import {onMounted, ref} from "vue";
import * as echarts from 'echarts'

let allIncome = ref(null)
let allOrderNum = ref(null)
let allUserNum = ref(null)
let productNameAndSumList = ref([])
let provinceSumList = ref([])
let incomeAndTimeList = ref([])
let productAvgGradeList = ref([])
let userOrderSumList = ref([])
let goodUserList = ref([])

onMounted(async ()=>{
  await getAllIncome()
  await getAllOrderNum()
  await getAllUserNum()
  await getProductNameAndSumList()
  await getProvinceSumList()
  await getIncomeAndTimeList()
  await getProductAvgGradeList()
  await getUserOrderSumList()
  await getGoodUserList()
})

async function getAllIncome(){
  await axios.get('/api/show/getAllIncome').then((res)=>{
    if (res.data.code===200){
      allIncome.value = res.data.data
    }
  })
  //await console.log(allIncome.value)
}
async function getAllOrderNum(){
  await axios.get('/api/show/getAllOrderNum').then((res)=>{
    if (res.data.code===200){
      allOrderNum.value = res.data.data
    }
  })
  //await console.log(allOrderNum.value)
}
async function getAllUserNum(){
  await axios.get('/api/show/getAllUserNum').then((res)=>{
    if (res.data.code===200){
      allUserNum.value = res.data.data
    }
  })
  //await console.log(allUserNum.value)
}
async function getProductNameAndSumList(){
  await axios.get('/api/show/getProductNameAndSumList').then((res)=>{
    if (res.data.code===200){
      productNameAndSumList.value = res.data.data
    }
  })
  //await console.log(productNameAndSumList.value)
  let bar = await echarts.init(document.getElementById("productNameAndSumBar"), null, {height:400,width:500})
  bar.setOption({
    xAxis: {
      type:"category",
      data: productNameAndSumList.value.map(p => p.productName),
      axisPointer:{
        type:'shadow'
      },
      axisLabel: {
        interval: 0,
        rotate: 30,
        //多出字可以省略显示成点
        formatter: function (params){
          var index = 6; //字数为6个超出就显示成点
          var newstr = '';
          for(var i = 0; i< params.length; i += index){
            var tmp = params.substring(i, i+index);
            newstr += tmp +'';
          }
          if( newstr.length > 6)
            return newstr.substring(0, 6) + '...';
          else
            return '\n'+newstr;
        },
      }
    },
    yAxis: {},
    series: [
      {
        type: 'bar',
        data: productNameAndSumList.value.map(p => p.sum),
        itemStyle: {
          color:"#5F9EA0",
          barBorderRadius: 5,
          borderWidth: 1,
          borderType: 'solid',
          borderColor: '#73c0de',
          shadowColor: '#5470c6',
          shadowBlur: 3
        }
      }
    ],
    grid:{
      containLabel:true,
      top:30,
      bottom:20,
      left:30,
      right:30
    }
  })
}
async function getProvinceSumList(){
  await axios.get('/api/show/getProvinceSumList').then((res)=>{
    if (res.data.code===200){
      provinceSumList.value = res.data.data
    }
  })
  //await console.log(provinceSumList.value)
  let pie = await echarts.init(document.getElementById("provinceSumPie"), null, {height:400,width:500})
  pie.setOption({
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        data: provinceSumList.value.map(p => {
          return {value:p.sum, name:p.province}
        }),
        radius: '65%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ],
    grid:{
      containLabel:true,
      left:30,
      right:30
    }
  })
}

async function getIncomeAndTimeList(){
  await axios.get('/api/show/getIncomeAndTimeList').then((res)=>{
    if (res.data.code === 200){
      incomeAndTimeList.value = res.data.data
    }
  })
  //await console.log(incomeAndTimeList.value)
  let line = await echarts.init(document.getElementById("incomeAndTimeLine"), null, {height:400,width:500})
  line.setOption({
    xAxis: {
      type: 'category',
      data: incomeAndTimeList.value.map(i => i.time),
      axisLabel:{
        interval:0,
        rotate:30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: incomeAndTimeList.value.map(i => i.income),
        type: 'line',
        lineStyle: {
          normal: {
            color: '#5F9EA0',
            width: 4,
            type: 'dashed'
          }
        }
      }
    ],
    grid:{
      containLabel:true,
      top:30,
      bottom:30
    },
    tooltip:{}
  })
}

async function getProductAvgGradeList(){
  await axios.get('/api/show/getProductAvgGradeList').then((res)=>{
    if (res.data.code===200){
      productAvgGradeList.value = res.data.data
    }
  })
  //await console.log(productAvgGradeList.value)
  let bar = await echarts.init(document.getElementById("productAvgGradeBar"), null, {height:400, width:500})
  bar.setOption({
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: productAvgGradeList.value.sort((a,b)=>a.avgGrade-b.avgGrade).map(p=>p.productName),
      axisLabel: {
        formatter: function(value) {
          return value.length > 5 ? value.slice(0, 5) + '...' : value;
        }
      }
    },
    series: [
      {
        data: productAvgGradeList.value.sort((a,b)=>a.avgGrade-b.avgGrade).map(p=>p.avgGrade),
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(220, 220, 220, 0.8)'
        },
        barWidth:'40%',
        itemStyle: {
          color:"#D2691E",
          barBorderRadius: 5,
          borderWidth: 1,
          borderType: 'solid',
          borderColor: '#73c0de',
          shadowColor: '#5470c6',
          shadowBlur: 3
        }
      }
    ],
    grid:{
      containLabel:true,
      top:30,
      bottom:30
    },
    tooltip:{}
  })
}

async function getUserOrderSumList(){
  await axios.get('/api/show/getUserOrderSumList').then((res)=>{
    if (res.data.code===200){
      userOrderSumList.value = res.data.data
    }
  })
  //await console.log(userOrderSumList.value)
  let pie = await echarts.init(document.getElementById("userOrderSumPie"), null, {height:400,width:500})
  pie.setOption({
    toolbox: {
      show: true,
    },
    series: [
      {
        type: 'pie',
        radius: [40, 170],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        data: userOrderSumList.value.map(u=>{
          return {value:u.orderSum, name:u.username}
        })
      }
    ],
    grid:{
      containLabel:true,
    },
    tooltip:{}
  })
}

async function getGoodUserList(){
  await axios.get('/api/show/getGoodUserList').then((res)=>{
    if (res.data.code===200){
      goodUserList.value = res.data.data
    }
  })
  //await console.log(goodUserList.value)
  let radar = await echarts.init(document.getElementById("goodUserRadar"), null, {height:400,width:500})
  radar.setOption({
    radar: {
      center: ['50%', '50%'],
      splitNumber: 4,
      shape: 'circle', // 雷达图形状
      indicator: goodUserList.value.map(g=>{
        return {name:g.username, max:5}
      }),
      // 统一设置name的样式（也可以在每个name上单独设置）
      name: {
        // 雷达图各类别名称文本颜色
        textStyle: {
          color: '#808000'
        }
      },
      // 坐标轴轴线相关设置(竖线)axisLine（中心散发的线）
      axisLine: {
        show: true,
        lineStyle: {
          color: '#7367f088'
          // width: 1,
          // type: 'solid'
        }
      },
      // 坐标轴在 grid 区域中的分隔线（圆圈）
      splitLine: {
        lineStyle: {
          color: '#7367f066',
        }
      },
    },
    series: [
      {
        type: 'radar',
        areaStyle: {
          // 填充区颜色
          color: '#7367f066',
        },
        // 线条样式
        lineStyle: {
          normal: {
            color: '#7367f0',
            width: 1
          }
        },
        symbol: 'circle', // 拐点形状，rect=矩形，circle=圆形
        // 拐点的大小
        symbolSize: 4,
        // 小圆点（拐点）设置为白色
        itemStyle: {
          color: '#7367f0'
        },
        data: [
          {
            value: goodUserList.value.map(g=>g.avgGrade),
            name: '贡献度'
          }
        ]
      }
    ],
    // 在圆点上显示相关数据
    label: {
      show: false,
      color: '#7367f0',
      fontSize: 12
    },
    tooltip:{}
  })
}
</script>

<style scoped>
.all-income-body{
  display: flex;
  justify-content: center;
  align-items: center;
}
.order-num-body{
  display: flex;
  justify-content: center;
  align-items: center;
}
.user-num-body{
  display: flex;
  justify-content: center;
  align-items: center;
}
.card-header{
  display: flex;
  justify-content: center;
  align-items: center;
}
.pnasbCard:deep(.el-card__body){
  padding: 0;
  height: 400px;
  display: grid;
  place-items: center;
}
.pspCard:deep(.el-card__body){
  padding: 0;
  height: 400px;
  display: grid;
  place-items: center;
}
.iatlCard:deep(.el-card__body){
  padding: 0;
  height: 400px;
  display: grid;
  place-items: center;
}
.pagbCard:deep(.el-card__body){
  padding: 0;
  height: 400px;
  display: grid;
  place-items: center;
}
.uospCard:deep(.el-card__body){
  padding: 0;
  height: 400px;
  display: grid;
  place-items: center;
}
.gurCard:deep(.el-card__body){
  padding: 0;
  height: 400px;
  display: grid;
  place-items: center;
}
</style>