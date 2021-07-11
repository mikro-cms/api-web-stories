module.exports = {
  '/status': {
    'get': {
      permission: {
        role_group: '(guest)'
      },
      handler: require('./status')
    },
    'post': {
      permission: {
        role_group: '(admin)'
      },
      handler: require('./status-add')
    }
  }
};
