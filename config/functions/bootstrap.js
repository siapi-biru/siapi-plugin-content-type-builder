'use strict';

module.exports = async () => {
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'content-type-builder',
    },
  ];

  await siapi.admin.services.permission.actionProvider.registerMany(actions);
};
