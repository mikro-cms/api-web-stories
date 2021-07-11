const { query, validationResult } = require('express-validator/check');
const modelPost = require('@mikro-cms/models/post');
const mockPost = require('./mock/post');

async function handlerListStatus(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      'message': res.transValidator(errors.array({ onlyFirstError: true }))
    });
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
    res.json({ posts: [], total: 0 });
  } else {
    for (var postIndex in posts) {
      posts[postIndex] = mockPost(posts[postIndex]);
    }
  }

  const totalPosts = await modelPost.countDocuments(query);

  res.json({
    posts: posts,
    total: totalPosts
  });
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
