const { body, validationResult } = require('express-validator/check');
const multer = require('multer');
const modelComponent = require('@mikro-cms/models/component');

const uploadImageConfig = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/webstories');
    },
    filename: function (req, file, cb) {
      let fileExtension = '';

      if (file.mimetype === 'image/png') fileExtension = '.png';
      else if (file.mimetype === 'image/jpg') fileExtension = '.jpg';
      else if (file.mimetype === 'image/jpeg') fileExtension = '.jpeg';
      else if (file.mimetype === 'image/svg') fileExtension = '.svg';
      else fileExtension = '.uknown';

      file.extension = fileExtension;

      cb(null, `logo${fileExtension}`);
    }
  }),
  limits: {
    fileSize: 5242880
  },
  fileFilter: function (req, file, cb) {
    const allowedImage = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/svg'
    ];

    if (allowedImage.indexOf(file.mimetype) < 0) {
      cb('webstories.image_format', false);
    } else {
      cb(null, true);
    }
  }
});

const uploadImageResource = uploadImageConfig.single('logo');

function handlerImageUpload(req, res, next) {
  uploadImageResource(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400).json({
        'message': err.message
      });
    } else if (typeof err === 'string') {
      res.status(400).json({
        'message': res.trans(err)
      });
    } else {
      next();
    }
  });
}

async function handlerSettingEdit(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.result = {
      'status': 400,
      'message': res.transValidator(errors.array({ onlyFirstError: true }))
    };

    return next();
  }

  const settingHeader = await modelComponent.findOne({
    'page': req.body.page_id,
    'component_name': 'header'
  });

  if (settingHeader !== null) {
    settingHeader.component_options.title = req.body.title;

    if (req.file) {
      settingHeader.component_options.logo = {
        name: 'logo',
        mime: req.file.mimetype,
        extension: req.file.extension,
        version: settingHeader.component_options.logo.version + 1
      };
    }

    settingHeader.markModified('component_options');

    await settingHeader.save();
  }

  const settingContent = await modelComponent.findOne({
    'page': req.body.page_id,
    'component_name': 'content'
  });

  if (settingContent !== null) {
    settingContent.component_options.type = req.body.type;

    settingContent.markModified('component_options');

    await settingContent.save();
  }

  res.result = {
    'status': 200,
    'message': res.trans('webstories.edit_setting_success')
  };

  return next();
}

module.exports = [
  handlerImageUpload,
  body('page_id')
    .exists({ checkFalsy: true }).withMessage('page.page_id_required'),
  body('title')
    .exists({ checkFalsy: true }).withMessage('webstories.title_required'),
  body('type')
    .exists({ checkFalsy: true }).withMessage('webstories.type_required'),
  handlerSettingEdit
];
