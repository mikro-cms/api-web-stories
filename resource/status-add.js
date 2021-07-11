const { body, validationResult } = require('express-validator/check');
const multer = require('multer');
const { plugin } = require('@mikro-cms/core/apis');
const modelLabel = require('@mikro-cms/models/label');

const uploadImageConfig = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload/webstories');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}.png`);
    }
  }),
  limits: {
    fileSize: 5242880
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/png') {
      cb('webstories.image_format', false);
    } else {
      cb(null, true);
    }
  }
});

const uploadImageResource = uploadImageConfig.single('image');

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

async function handlerAddStatus(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      'message': res.transValidator(errors.array({ onlyFirstError: true }))
    });
  }

  labelWebStories = await modelLabel.findOne({
    'label_name': 'webstories'
  });

  if (labelWebStories === null) {
    return res.status(500).json({
      'message': res.trans('webstories.label_not_found')
    });
  }

  const post = {
    'created_by': res.locals.session.user._id,
    'post_title': 'web stories status',
    'post_content': req.body.content,
    'post_status': 'PUBLISH',
    'post_options': {
      'font': req.body.font,
      'image': typeof req.file !== 'undefined' ? req.file.filename : null,
      'background': req.body.background,
      'caption': req.body.caption
    },
    'label': labelWebStories._id
  };

  const createdPost = await plugin.createPost(post);

  if (createdPost) {
    res.json({
      'message': res.trans('webstories.add_status_success')
    });
  } else {
    res.status(400).json({
      'message': res.trans('webstories.add_status_failed')
    });
  }
}

module.exports = [
  handlerImageUpload,
  body('page_id')
    .exists({ checkFalsy: true }).withMessage('page.page_id_required'),
  body('content')
    .exists({ checkFalsy: false }).withMessage('webstories.content_required'),
  body('font')
    .exists({ checkFalsy: true }).withMessage('webstories.font_required'),
  body('background')
    .exists({ checkFalsy: true }).withMessage('webstories.background_required'),
  body('caption')
    .exists({ checkFalsy: false }).withMessage('webstories.caption_required'),
  handlerAddStatus
];
