import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import BookService from '../services/BookService';

export class BookController {
  async createBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bookData = req.body;
      
      const book = await BookService.createBook(bookData);
      
      res.status(201).json({
        success: true,
        data: book,
        message: 'Book created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create book'
      });
    }
  }
  
  async getAllBooks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { search, genre, author, limit, page } = req.query;
      
      // Use Open Library API instead of local database
      const result = await BookService.searchBooksFromAPI({
        search: search as string,
        genre: genre as string,
        author: author as string,
        limit: limit ? parseInt(limit as string) : undefined,
        page: page ? parseInt(page as string) : undefined
      });
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get books'
      });
    }
  }
  
  async getBookDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { workId } = req.params;
      
      if (!workId) {
        res.status(400).json({
          success: false,
          message: 'Work ID is required'
        });
        return;
      }
      
      const bookDetails = await BookService.getBookDetailsFromAPI(workId);
      
      res.status(200).json({
        success: true,
        data: bookDetails
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get book details'
      });
    }
  }
  
  async getBookById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const book = await BookService.getBookById(id);
      
      if (!book) {
        res.status(404).json({
          success: false,
          message: 'Book not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: book
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get book'
      });
    }
  }
  
  async updateBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const book = await BookService.updateBook(id, updateData);
      
      if (!book) {
        res.status(404).json({
          success: false,
          message: 'Book not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: book,
        message: 'Book updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update book'
      });
    }
  }
  
  async deleteBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await BookService.deleteBook(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Book not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Book deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete book'
      });
    }
  }
  
  async searchBooks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }
      
      const books = await BookService.searchBooks(q as string);
      
      res.status(200).json({
        success: true,
        data: books
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Search failed'
      });
    }
  }
}

export default new BookController();

