export default [
  {
    path: '/',
    name: 'landing-page',
    component: require('components/LandingPageView')
  },
  {
    path: '/view-cluster',
    name: 'view-cluster',
    component: require('components/ViewCluster')
  },
  {
    path: '*',
    redirect: '/'
  }
]
