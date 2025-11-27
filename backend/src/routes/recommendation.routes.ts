import { Router } from 'express';
import RecommendationController from '../controllers/recommendationController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticate);

router.get('/', RecommendationController.getRecommendations.bind(RecommendationController));

export default router;

