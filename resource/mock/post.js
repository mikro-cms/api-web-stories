module.exports = function (post) {
  if (!post) return null;

  return {
    'post_id': post._id,
    'created_at': post.created_at,
    'updated_at': post.updated_at,
    'label_name': post.label.label_name,
    'post_title': post.post_title,
    'post_content': post.post_content,
    'post_status': post.post_status,
    'post_options': post.post_options
  };
};
