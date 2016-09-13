import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import VueRouter from 'vue-router'

import App from './App'
import 'materialize-css/bin/materialize.css'

Vue.use(Electron)
Vue.use(Resource)
Vue.use(VueRouter)
Vue.config.debug = true

const router = new VueRouter({
  scrollBehavior: () => ({ y: 0 })
})

router.map({
  '/': {
    name: 'home',
    component: require('components/LandingPageView')
  },
  '/view-cluster': {
    component: require('components/ViewCluster'),
    subRoutes: {
      '/': {
        component: require('components/SelectCluster')
      },
      '/:clusterId': {
        component: require('components/GraphView')
      }
    }
  }
})

router.start(App, '#app')
