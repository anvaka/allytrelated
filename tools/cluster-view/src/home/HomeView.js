import React from 'react'
import Scene from '../scene'
import maco from '../utils/maco.js'
import bus from '../bus.js'

export default maco(home);

function home(x) {
  var clusterId = '';

  x.render = () => {
      return (
        <div className='container-fluid'>
          <form className='form-inline' onSubmit={showCluster}>
            <div className='form-group'>
              <label htmlFor='channel-id'>Channel Id</label>
              <input type='text'
                    className='form-control'
                    id='channel-id'
                    placeholder='Channel ID'
                    onChange={updateCluster}
              />
            </div>
            <button type='submit' className='btn btn-default'>Show Cluster</button>
          </form>
          <Scene />
        </div>
      );
  };

  function showCluster(e) {
    e.preventDefault();
    bus.fire('show', clusterId);
  }

  function updateCluster(e) {
    clusterId = e.target.value;
  }
}

