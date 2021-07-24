'use strict';

const _ = require('lodash');

const {
  validateComponentInput,
  validateUpdateComponentInput,
} = require('./validation/component');

/**
 * Components controller
 */

module.exports = {
  /**
   * GET /components handler
   * Returns a list of available components
   * @param {Object} ctx - koa context
   */
  async getComponents(ctx) {
    const componentService =
      siapi.plugins['content-type-builder'].services.components;

    const data = Object.keys(siapi.components).map(uid => {
      return componentService.formatComponent(siapi.components[uid]);
    });

    ctx.send({ data });
  },

  /**
   * GET /components/:uid
   * Returns a specific component
   * @param {Object} ctx - koa context
   */
  async getComponent(ctx) {
    const { uid } = ctx.params;

    const component = siapi.components[uid];

    if (!component) {
      return ctx.send({ error: 'component.notFound' }, 404);
    }

    const componentService =
      siapi.plugins['content-type-builder'].services.components;

    ctx.send({ data: componentService.formatComponent(component) });
  },

  /**
   * POST /components
   * Creates a component and returns its infos
   * @param {Object} ctx - koa context
   */
  async createComponent(ctx) {
    const { body } = ctx.request;

    try {
      await validateComponentInput(body);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    try {
      siapi.reload.isWatching = false;

      const componentService =
        siapi.plugins['content-type-builder'].services.components;

      const component = await componentService.createComponent({
        component: body.component,
        components: body.components,
      });

      setImmediate(() => siapi.reload());

      ctx.send({ data: { uid: component.uid } }, 201);
    } catch (error) {
      siapi.log.error(error);
      ctx.send({ error: error.message }, 400);
    }
  },

  /**
   * PUT /components/:uid
   * Updates a component and return its infos
   * @param {Object} ctx - koa context - enhanced koa context
   */
  async updateComponent(ctx) {
    const { uid } = ctx.params;
    const { body } = ctx.request;

    if (!_.has(siapi.components, uid)) {
      return ctx.send({ error: 'component.notFound' }, 404);
    }

    try {
      await validateUpdateComponentInput(body);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    try {
      siapi.reload.isWatching = false;

      const componentService =
        siapi.plugins['content-type-builder'].services.components;

      const component = await componentService.editComponent(uid, {
        component: body.component,
        components: body.components,
      });

      setImmediate(() => siapi.reload());

      ctx.send({ data: { uid: component.uid } });
    } catch (error) {
      siapi.log.error(error);
      ctx.send({ error: error.message }, 400);
    }
  },

  /**
   * DELETE /components/:uid
   * Deletes a components and returns its old infos
   * @param {Object} ctx - koa context
   */
  async deleteComponent(ctx) {
    const { uid } = ctx.params;

    if (!_.has(siapi.components, uid)) {
      return ctx.send({ error: 'component.notFound' }, 404);
    }

    try {
      siapi.reload.isWatching = false;

      const componentService =
        siapi.plugins['content-type-builder'].services.components;

      const component = await componentService.deleteComponent(uid);

      setImmediate(() => siapi.reload());

      ctx.send({ data: { uid: component.uid } });
    } catch (error) {
      siapi.log.error(error);
      ctx.send({ error: error.message }, 400);
    }
  },
};
