'use strict';

const validateComponentCategory = require('./validation/component-category');

module.exports = {
  async editCategory(ctx) {
    const { body } = ctx.request;

    try {
      await validateComponentCategory(body);
    } catch (error) {
      return ctx.send({ error }, 400);
    }

    const { name } = ctx.params;

    siapi.reload.isWatching = false;

    const componentCategoryService =
      siapi.plugins['content-type-builder'].services.componentcategories;

    const newName = await componentCategoryService.editCategory(name, body);

    setImmediate(() => siapi.reload());

    ctx.send({ name: newName });
  },

  async deleteCategory(ctx) {
    const { name } = ctx.params;

    siapi.reload.isWatching = false;

    const componentCategoryService =
      siapi.plugins['content-type-builder'].services.componentcategories;

    await componentCategoryService.deleteCategory(name);

    setImmediate(() => siapi.reload());

    ctx.send({ name });
  },
};
