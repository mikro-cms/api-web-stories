const { query, validationResult } = require('express-validator/check');
const modelPost = require('@mikro-cms/models/post');
const mockPost = require('./mock/post');

async function handlerListStatus(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.result = {
      'status': 400,
      'message': res.transValidator(errors.array({ onlyFirstError: true }))
    };

    return next();
  }

  const offset = req.query.offset || 0;
  const length = req.query.length || 10;
  const query = {};

  if (req.query.type === 'archived') {
    query['created_at'] = {
      $lt: (Date.now() - (1000 * 60 * 60 * 24))
    };
  } else if (req.query.type === 'lasted') {
    query['created_at'] = {
      $gt: (Date.now() - (1000 * 60 * 60 * 24)),
      $lt: Date.now()
    };
  }

  const posts = await modelPost.find(query, [
    'created_at',
    'updated_at',
    'post_title',
    'post_content',
    'post_status',
    'post_options'
  ])
  .populate({
    path: 'label',
    select: 'label_name'
  })
  .skip(parseInt(offset))
  .limit(parseInt(length));

  if (posts === null) {
    res.result = {
      'posts': [],
      'total': 0
    };

    return next();
  } else {
    for (var postIndex in posts) {
      posts[postIndex] = mockPost(posts[postIndex]);
    }
  }

  const totalPosts = await modelPost.countDocuments(query);

  res.result = {
    'status': 200,
    'posts': posts,
    'total': totalPosts
  };

  next();
}

module.exports = [
  query('offset')
    .optional()
    .isNumeric(),
  query('length')
    .optional()
    .isNumeric(),
  handlerListStatus
];
