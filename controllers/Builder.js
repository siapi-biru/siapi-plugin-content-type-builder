'use strict';

module.exports = {
  getReservedNames(ctx) {
    ctx.body = siapi.plugins['content-type-builder'].services.builder.getReservedNames();
  },
};
