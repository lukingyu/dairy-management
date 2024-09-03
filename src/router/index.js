import {createRouter, createWebHistory} from "vue-router";
import {useStore} from "vuex";
import axios from "axios";

const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/',
            component:()=>import('../components/management.vue'),
            redirect:"/management/manageIndex"
        },
        {
            path:'/login',
            component:()=>import('../components/login.vue')
        },
        {
            path:"/management",
            component:()=>import('../components/management.vue'),
            children:[
                {
                    path:"",
                    component:()=>import('../pages/manageIndex.vue')
                },
                {
                    path:"manageIndex",
                    component:()=>import('../pages/manageIndex.vue')
                },
                {
                    path:"userInfoManage",
                    component:()=>import('../pages/userInfoManage.vue')
                },
                {
                    path:"brandManage",
                    component:()=>import('../pages/brandManage.vue')
                },
                {
                    path:"categoryManage",
                    component:()=>import('../pages/categoryManage.vue')
                },
                {
                    path:"productUploadManage",
                    component:()=>import('../pages/productUploadManage.vue')
                },
                {
                    path:"productInfoManage",
                    component:()=>import('../pages/productInfoManage.vue')
                },
                {
                    path:"historyDataShow",
                    component:()=>import('../pages/historyDataShow.vue')
                }
            ],
            redirect:'/management/manageIndex'
        },
        {
            path:'/redirectToBrandManage',
            redirect:'/management/brandManage'
        }
    ]
})

//全局前置路由守卫
router.beforeEach((to,from,next)=>{
    const store = useStore()

    if (to.path === '/login'){
        window.localStorage.removeItem("m-jwtStr")
        window.localStorage.removeItem("m-adminId")
        window.localStorage.setItem("m-isAuth","no")
        next()

    }else if(from.path === '/login'){
        next()
    }else {
        if (window.localStorage.getItem("m-isAuth") === "yes"){
            next()
        }
        const jwtStr = window.localStorage.getItem("m-jwtStr")
        if (jwtStr){
            axios.post('/api/admin/checkToken',jwtStr).then((res)=>{
                if (res.data.code === 200 && res.data.data === true){
                    //验证通过
                    localStorage.setItem("m-isAuth","yes")
                    next()
                }else{
                    //验证失败，清除浏览器本地的jwtStr
                    window.localStorage.removeItem("m-jwtStr")
                    window.localStorage.removeItem("m-adminId")
                    localStorage.setItem("m-isAuth","no")
                    next('/login')
                }
            })

            if (window.localStorage.getItem("m-isAuth") === "yes"){
                next()
            }else {
                next('/login')
            }
        }

        next('/login')
    }
})

export default router