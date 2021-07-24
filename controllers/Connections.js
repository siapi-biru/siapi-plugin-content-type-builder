'use strict';

module.exports = {
  async getConnections(ctx) {
    ctx.send({
      connections: Object.keys(siapi.config.get('database.connections')),
    });
  },
};
