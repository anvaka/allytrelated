import maco from '../utils/maco.js'
import bus from '../bus.js'

export default maco(scene);

function scene(x) {
  x.render = () => null;

  x.componentDidMount = () => {
    bus.on('show', showCluster);
  }

  x.componentWillUnmount = () => {
    bus.off('show', showCluster);
  }

  function showCluster(clusterId) {
    console.log('Show cluster ' + clusterId);
  }
}
