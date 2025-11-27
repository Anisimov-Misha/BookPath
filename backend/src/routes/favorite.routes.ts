import { Router } from 'express';
import FavoriteController from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticate);

router.post('/', FavoriteController.createFavorite.bind(FavoriteController));
router.get('/', FavoriteController.getFavorites.bind(FavoriteController));
router.get('/statistics', FavoriteController.getStatistics.bind(FavoriteController));
router.get('/:id', FavoriteController.getFavoriteById.bind(FavoriteController));
router.put('/:id', FavoriteController.updateFavorite.bind(FavoriteController));
router.patch('/:id/progress', FavoriteController.updateProgress.bind(FavoriteController));
router.delete('/:id', FavoriteController.deleteFavorite.bind(FavoriteController));

export default router;

