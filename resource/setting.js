const { query, validationResult } = require('express-validator/check')
const modelComponent = require('@mikro-cms/models/component');
const mockSetting = require('./mock/setting')

async function handlerSetting(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.result = {
      'status': 400,
      'message': res.transValidator(errors.array({ onlyFirstError: true }))
    };

    return next();
  }

  const query = {
    'page': req.query.page_id
  };

  const components = await modelComponent.find(query, [
    'component_name',
    'component_options'
  ]);

  if (components === null) {
    res.result = {
      'status': 400,
      'message': res.trans('webstories.setting_empty')
    }
  } else {
    let setting = {};

    for (var component of components) {
      setting = {
        ...setting,
        ...mockSetting(component)
      };
    }

    res.result = {
      'status': 200,
      'setting': setting
    }
  }

  return next();
}

module.exports = [
  query('page_id')
    .exists({ checkFalsy: true }).withMessage('page.page_id_required'),
  handlerSetting
];
