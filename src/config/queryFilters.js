const POPULATE_OWNER = {
  path: 'owner',
  select: '_id username name email phone avatarUrl',
  strictPopulate: false,
};

const SELECTED_FIELDS = [
  '_id',
  'name',
  'description',
  'icon',
  'categories',
  'owner',
  'platform',
].join(' ');

module.exports = {
  POPULATE_OWNER,
  SELECTED_FIELDS,
};
