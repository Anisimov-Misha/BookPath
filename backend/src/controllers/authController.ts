import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import AuthService from '../services/AuthService';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      
      // Validation
      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide username, email, and password'
        });
        return;
      }
      
      const result = await AuthService.register({ username, email, password });
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }
  
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
        return;
      }
      
      const result = await AuthService.login({ email, password });
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }
  
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const user = await AuthService.getUserById(req.user.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile'
      });
    }
  }
  
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const { favoriteGenres, favoriteAuthors } = req.body;
      
      const user = await AuthService.updatePreferences(req.user.userId, {
        favoriteGenres,
        favoriteAuthors
      });
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }
}

export default new AuthController();

