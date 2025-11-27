import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import RecommendationService from '../services/RecommendationService';

export class RecommendationController {
  async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const recommendations = await RecommendationService.getRecommendations(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: {
          recommendations,
          count: recommendations.length
        },
        message: 'Recommendations generated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get recommendations'
      });
    }
  }
}

export default new RecommendationController();

