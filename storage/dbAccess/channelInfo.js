var Sequelize = require('sequelize');
module.exports = createSchema;

function createSchema(sequelize) {
  return sequelize.define('channel', {
    /**
     * Channel id. Usually something like UC... sometimes
     * SC...
     */
    id: { type: Sequelize.STRING, primaryKey: true},
    /**
     * what's the title of the channel
     */
    title: { type: Sequelize.STRING },
    /**
     * How many subscribers this channel has
     */
    subscribers: {
      type: Sequelize.INTEGER
    },
    /**
     * Youtube has two section of related channels. We are interested only in 
     * the first one (trying to ignore youtube's suggestions since they were
     * not very good).
     */
    relatedTitle: { type: Sequelize.STRING }
  }, {
    timestamps: false,
  });
}
