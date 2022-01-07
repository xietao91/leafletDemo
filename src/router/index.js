import Vue from 'vue'
import Router from 'vue-router'
import notebook1 from '@/components/testDemo/notebook1'
import notebook2 from '@/components/testDemo/notebook2'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/notebook1'
    },{
      path: '/notebook1',
      name: 'notebook1',
      component: notebook1
    },{
      path: '/notebook2',
      name: 'notebook2',
      component: notebook2
    }
  ],
  mode: 'history'
})
