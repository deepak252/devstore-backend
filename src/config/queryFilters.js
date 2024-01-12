export const POPULATE_OWNER = {
  path: 'owner',
  select: '_id username name email phone avatarUrl',
  strictPopulate: false
};

export const SELECTED_FIELDS = [
  '_id',
  'name',
  'description',
  'icon',
  'categories',
  'owner',
  'platform'
].join(' ');
