var Sequelize = require('sequelize');

module.exports = function createDB(name) {
  return new Sequelize('example', 'username', 'password', {
    host: 'localhost',
    dialect:'sqlite',
    logging: noop,

    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },

    storage: name
  });
}

function noop() { }
