'use strict';

const _ = require('lodash');

const { hasDraftAndPublish } = require('siapi-utils').contentTypes;

const {
  validateContentTypeInput,
  validateUpdateContentTypeInput,
  validateKind,
} = require('./validation/content-type');

module.exports = {
  async getContentTypes(ctx) {
    const { kind } = ctx.query;

    try {
      await validateKind(kind);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    const contentTypeService = siapi.plugins['content-type-builder'].services.contenttypes;

    const contentTypes = Object.keys(siapi.contentTypes)
      .filter(uid => !kind || _.get(siapi.contentTypes[uid], 'kind', 'collectionType') === kind)
      .map(uid => contentTypeService.formatContentType(siapi.contentTypes[uid]));

    ctx.send({
      data: contentTypes,
    });
  },

  getContentType(ctx) {
    const { uid } = ctx.params;

    const contentType = siapi.contentTypes[uid];

    if (!contentType) {
      return ctx.send({ error: 'contentType.notFound' }, 404);
    }

    const contentTypeService = siapi.plugins['content-type-builder'].services.contenttypes;

    ctx.send({ data: contentTypeService.formatContentType(contentType) });
  },

  async createContentType(ctx) {
    const { body } = ctx.request;

    try {
      await validateContentTypeInput(body);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    try {
      siapi.reload.isWatching = false;

      const contentTypeService = siapi.plugins['content-type-builder'].services.contenttypes;

      const contentType = await contentTypeService.createContentType({
        contentType: body.contentType,
        components: body.components,
      });

      const metricsProperties = {
        kind: contentType.kind,
        hasDraftAndPublish: hasDraftAndPublish(contentType.schema),
      };

      if (_.isEmpty(siapi.api)) {
        await siapi.telemetry.send('didCreateFirstContentType', metricsProperties);
      } else {
        await siapi.telemetry.send('didCreateContentType', metricsProperties);
      }

      setImmediate(() => siapi.reload());

      ctx.send({ data: { uid: contentType.uid } }, 201);
    } catch (error) {
      siapi.log.error(error);
      await siapi.telemetry.send('didNotCreateContentType', { error: error.message });
      ctx.send({ error: error.message }, 400);
    }
  },

  async updateContentType(ctx) {
    const { uid } = ctx.params;
    const { body } = ctx.request;

    if (!_.has(siapi.contentTypes, uid)) {
      return ctx.send({ error: 'contentType.notFound' }, 404);
    }

    try {
      await validateUpdateContentTypeInput(body);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    try {
      siapi.reload.isWatching = false;

      const contentTypeService = siapi.plugins['content-type-builder'].services.contenttypes;

      const component = await contentTypeService.editContentType(uid, {
        contentType: body.contentType,
        components: body.components,
      });

      setImmediate(() => siapi.reload());

      ctx.send({ data: { uid: component.uid } }, 201);
    } catch (error) {
      siapi.log.error(error);
      ctx.send({ error: error.message }, 400);
    }
  },

  async deleteContentType(ctx) {
    const { uid } = ctx.params;

    if (!_.has(siapi.contentTypes, uid)) {
      return ctx.send({ error: 'contentType.notFound' }, 404);
    }

    try {
      siapi.reload.isWatching = false;

      const contentTypeService = siapi.plugins['content-type-builder'].services.contenttypes;

      const component = await contentTypeService.deleteContentType(uid);

      setImmediate(() => siapi.reload());

      ctx.send({ data: { uid: component.uid } });
    } catch (error) {
      siapi.log.error(error);
      ctx.send({ error: error.message }, 400);
    }
  },
};
