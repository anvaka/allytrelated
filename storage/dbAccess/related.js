/**
 * Represents a single channel info related to another channel.
 * Channel is considered related if they appear on the list of related channels
 */
var Sequelize = require('sequelize');
module.exports = createSchema;

function createSchema(sequelize) {
  return sequelize.define('related', {
    fromId: { type: Sequelize.STRING, unique: 'compositeIndex' },
    toId: { type: Sequelize.STRING, unique: 'compositeIndex' }
  }, {
    tableName: 'related',
    timestamps: false,
  });
}
