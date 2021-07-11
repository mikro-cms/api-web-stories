const modelUser = require('@mikro-cms/models/user');
const modelLabel = require('@mikro-cms/models/label');

async function migration() {
  const userAdmin = await modelUser.findOne({
    'user_username': 'admin'
  });

  const labelWebstories = new modelLabel({
    'created_by': userAdmin._id,
    'label_name': 'webstories'
  });

  await labelWebstories.save();
}

module.exports = migration;
