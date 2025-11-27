import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import FavoriteService from '../services/FavoriteService';

export class FavoriteController {
  async createFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const { bookId, status, rating, notes, review } = req.body;
      
      if (!bookId) {
        res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
        return;
      }
      
      const favorite = await FavoriteService.createFavorite({
        userId: req.user.userId,
        bookId,
        status,
        rating,
        notes,
        review
      });
      
      res.status(201).json({
        success: true,
        data: favorite,
        message: 'Book added to favorites'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add favorite'
      });
    }
  }
  
  async getFavorites(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const { status } = req.query;
      
      const favorites = await FavoriteService.getFavoritesByUserId(
        req.user.userId,
        status as string
      );
      
      res.status(200).json({
        success: true,
        data: favorites
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get favorites'
      });
    }
  }
  
  async getFavoriteById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const { id } = req.params;
      
      const favorite = await FavoriteService.getFavoriteById(id, req.user.userId);
      
      if (!favorite) {
        res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: favorite
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get favorite'
      });
    }
  }
  
  async updateFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const { id } = req.params;
      const updateData = req.body;
      
      const favorite = await FavoriteService.updateFavorite(
        id,
        req.user.userId,
        updateData
      );
      
      if (!favorite) {
        res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: favorite,
        message: 'Favorite updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update favorite'
      });
    }
  }
  
  async updateProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const { id } = req.params;
      const { currentPage } = req.body;
      
      if (currentPage === undefined) {
        res.status(400).json({
          success: false,
          message: 'Current page is required'
        });
        return;
      }
      
      const favorite = await FavoriteService.updateProgress(
        id,
        req.user.userId,
        { currentPage }
      );
      
      if (!favorite) {
        res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: favorite,
        message: 'Reading progress updated'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update progress'
      });
    }
  }
  
  async deleteFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const { id } = req.params;
      
      const deleted = await FavoriteService.deleteFavorite(id, req.user.userId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Book removed from favorites'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete favorite'
      });
    }
  }
  
  async getStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const stats = await FavoriteService.getStatistics(req.user.userId);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get statistics'
      });
    }
  }
}

export default new FavoriteController();

