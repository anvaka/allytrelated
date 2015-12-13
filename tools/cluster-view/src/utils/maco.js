import React from 'react'

export default maco;

function maco(factory) {
  class ClassWrapper extends React.Component {
    constructor() {
      super();
      factory.call(this, this);
    }
  }

  return ClassWrapper;
}
