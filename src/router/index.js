import Vue from 'vue'
import VueRouter from 'vue-router'
import Signin from '@/views/Signin'
import Signup from '@/views/Signup'
import List from '@/views/List'
import MyPage from '@/views/MyPage'
import Detail from '@/views/Detail'
import RequestPurchase from '@/views/RequestPurchase'
import RequestList from '@/views/RequestList'
import RequestDetail from '@/views/RequestDetail'
import Administration from '@/views/Administration'
import firebase from 'firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'List',
    component: List,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: Detail,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/requestPurchase',
    name: 'RequestPurchase',
    component: RequestPurchase,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/requestList',
    name: 'RequestList',
    component: RequestList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/requestDetail/:id',
    name: 'RequestDetail',
    component: RequestDetail,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/administration',
    name: 'Administration',
    component: Administration,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '*',
    redirect: '/'
  }]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  let isLogin = false

  const userAuth = function () {
    return new Promise(function (resolve, reject) {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          isLogin = true
        }
        resolve()
      })
    })
  }

  const routing = function () {
    return new Promise(function (resolve, reject) {
      if (isLogin) {
        if (to.name === 'Signin' || to.name === 'Signup') {
          next({
            path: '/'
          })
        } else {
          next()
        }
      } else {
        if (to.name === 'Signin' || to.name === 'Signup') {
          next()
        } else {
          next({
            path: '/signin'
          })
        }
      }
    })
  }

  // 認証処理完了を待ってからルーティングする
  userAuth().then(routing)
})

export default router
