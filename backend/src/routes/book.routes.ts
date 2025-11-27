import { Router } from 'express';
import BookController from '../controllers/bookController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', BookController.getAllBooks.bind(BookController));
router.get('/search', BookController.searchBooks.bind(BookController));
router.get('/details/:workId', BookController.getBookDetails.bind(BookController));
router.get('/:id', BookController.getBookById.bind(BookController));

// Protected routes (admin or authenticated users)
router.post('/', authenticate, BookController.createBook.bind(BookController));
router.put('/:id', authenticate, BookController.updateBook.bind(BookController));
router.delete('/:id', authenticate, BookController.deleteBook.bind(BookController));

export default router;

