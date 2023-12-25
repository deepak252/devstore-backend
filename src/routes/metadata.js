const router = require('express').Router();
const {
  getMetadata,
  createMetadata,
  deleteMetadata,
} = require('../controllers/metadataController');

router.get('/', getMetadata);
router.post('/', createMetadata);
router.delete('/:id', deleteMetadata);

module.exports = router;
