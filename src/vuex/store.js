import {createStore} from "vuex";

const store = createStore({
    state:{
        isAuth:false,

    },
    actions:{

    },
    mutations:{

        SET_ISAUTH(state, value){
            state.isAuth = value
        },

    },
    getters:{

    }

})

export default store