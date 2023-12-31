const POPULATE_USER = {
  path: 'owner',
  select: '-password',
  strictPopulate: false,
};

const SELECTED_FIELDS = [
  '_id',
  'name',
  'description',
  'icon',
  'categories',
  'owner',
].join(' ');

module.exports = {
  POPULATE_USER,
  SELECTED_FIELDS,
};
