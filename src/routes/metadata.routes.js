import { Router } from 'express';
import {
  getMetadata,
  createMetadata,
  deleteMetadata
} from '../controllers/metadata.controller.js';

const router = Router();

router.get('/', getMetadata);
router.post('/', createMetadata);
router.delete('/:id', deleteMetadata);

export default router;
