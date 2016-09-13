export default [
  {
    path: '/',
    name: 'landing-page',
    component: require('components/LandingPageView')
  },
  {
    path: '/view-cluster',
    name: 'view-cluster',
    component: require('components/ViewCluster'),
    children: [{
      path: '',
      component: require('components/SelectCluster')
    }, {
      path: ':clusterId',
      component: require('components/GraphView')
    }]
  },
  {
    path: '*',
    redirect: '/'
  }
]
