import Favorite, { IFavorite } from '../models/Favorite';
import Book from '../models/Book';
import mongoose from 'mongoose';
import BookService from './BookService';

export interface CreateFavoriteData {
  userId: string;
  bookId: string;
  status?: 'want_to_read' | 'reading' | 'completed' | 'dropped';
  rating?: number;
  notes?: string;
  review?: string;
}

export interface UpdateFavoriteData {
  status?: 'want_to_read' | 'reading' | 'completed' | 'dropped';
  rating?: number;
  notes?: string;
  review?: string;
  // totalPages is NOT allowed - it's always synced from book.pageCount
}

export interface UpdateProgressData {
  currentPage: number;
}

export class FavoriteService {
  /**
   * Normalize Open Library ID - remove /works/ prefix if present
   */
  private normalizeOpenLibraryId(id: string): string {
    // Remove /works/ or /subjects/ prefix if present
    return id.replace(/^\/?(works|subjects)\//, '');
  }

  /**
   * Get or create book from Open Library ID or MongoDB ObjectId
   */
  private async getOrCreateBook(bookId: string): Promise<mongoose.Types.ObjectId> {
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(bookId) && bookId.length === 24) {
      const book = await Book.findById(bookId);
      if (!book) {
        throw new Error('Book not found');
      }
      return book._id;
    }

    // It's an Open Library ID - normalize it first
    const normalizedId = this.normalizeOpenLibraryId(bookId);
    let book = await Book.findOne({ openLibraryId: normalizedId });
    
    if (!book) {
      // Fetch book details from Open Library API
      try {
        console.log(`Fetching book details for Open Library ID: ${normalizedId}`);
        const bookDetails = await BookService.getBookDetailsFromAPI(normalizedId);
        
        // Create book in database
        const bookData: any = {
          title: bookDetails.title || 'Unknown Title',
          author: bookDetails.author || 'Unknown Author',
          openLibraryId: normalizedId,
          genre: bookDetails.subjects || [],
          language: 'en'
        };

        // Add optional fields only if they exist (don't set to null/undefined)
        if (bookDetails.firstPublishDate) {
          const year = parseInt(bookDetails.firstPublishDate.split('-')[0]);
          if (!isNaN(year)) bookData.publishedYear = year;
        }
        if (bookDetails.description) bookData.description = bookDetails.description;
        if (bookDetails.coverImage) bookData.coverImage = bookDetails.coverImage;
        if (bookDetails.pageCount && bookDetails.pageCount > 0) {
          bookData.pageCount = bookDetails.pageCount;
          console.log(`Setting pageCount for book ${normalizedId}: ${bookDetails.pageCount}`);
        } else {
          console.log(`No pageCount found for book ${normalizedId} in bookDetails`);
        }
        // Explicitly don't set isbn if it doesn't exist - let it be undefined
        
        book = await Book.create(bookData);
        console.log(`Created book ${normalizedId} with pageCount: ${book.pageCount || 'not set'}`);
      } catch (error: any) {
        console.error('Error creating book from Open Library:', error);
        const errorMessage = error?.message || 'Unknown error';
        console.error('Error details:', {
          bookId: normalizedId,
          errorMessage,
          stack: error?.stack
        });
        throw new Error(`Failed to fetch book details from Open Library: ${errorMessage}`);
      }
    }
    
    return book._id;
  }

  async createFavorite(data: CreateFavoriteData): Promise<IFavorite> {
    // Get or create book (handles both ObjectId and Open Library ID)
    const bookObjectId = await this.getOrCreateBook(data.bookId);
    
    // Find the book to get pageCount for reading progress
    const book = await Book.findById(bookObjectId);
    if (!book) {
      throw new Error('Book not found after creation');
    }
    
    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      userId: data.userId,
      bookId: bookObjectId
    });
    
    if (existingFavorite) {
      throw new Error('Book already in favorites');
    }
    
    // Create favorite with reading progress
    // Get totalPages from book.pageCount (from Open Library API)
    // If not available, try to get from book.pages (from search results)
    // Default to 1 if neither is available
    let totalPages = 1;
    if (book.pageCount && book.pageCount > 0) {
      totalPages = book.pageCount;
      console.log(`Using pageCount from book: ${totalPages}`);
    } else if ((book as any).pages && (book as any).pages > 0) {
      totalPages = (book as any).pages;
      console.log(`Using pages from book: ${totalPages}`);
    } else {
      console.log(`No pageCount found, using default: ${totalPages}`);
    }
    
    const favorite = await Favorite.create({
      userId: data.userId,
      bookId: bookObjectId,
      status: data.status || 'want_to_read',
      rating: data.rating,
      notes: data.notes,
      review: data.review,
      readingProgress: {
        currentPage: 0,
        totalPages: totalPages,
        lastUpdated: new Date(),
        progressPercentage: 0
      }
    });
    
    return await favorite.populate('bookId');
  }
  
  async getFavoritesByUserId(userId: string, status?: string): Promise<IFavorite[]> {
    const query: any = { userId };
    
    if (status) {
      query.status = status;
    }
    
    const favorites = await Favorite.find(query)
      .populate('bookId')
      .sort({ addedAt: -1 });
    
    // Sync totalPages with book data for all favorites
    for (const favorite of favorites) {
      const book = favorite.bookId as any;
      if (book) {
        // Try to get pageCount from book data
        let bookPageCount = book.pageCount || null;
        
        // If book doesn't have pageCount, try to get it from Open Library
        if (!bookPageCount && book.openLibraryId) {
          try {
            const bookDetails = await BookService.getBookDetailsFromAPI(book.openLibraryId);
            if (bookDetails.pageCount && bookDetails.pageCount > 0) {
              // Update book in database
              book.pageCount = bookDetails.pageCount;
              await book.save();
              bookPageCount = bookDetails.pageCount;
            }
          } catch (error) {
            console.error(`Error fetching page count for book ${book.openLibraryId}:`, error);
          }
        }
        
        // Update totalPages if we have valid pageCount
        if (bookPageCount && bookPageCount > 0) {
          if (favorite.readingProgress.totalPages !== bookPageCount) {
            favorite.readingProgress.totalPages = bookPageCount;
            // Recalculate progress percentage
            favorite.readingProgress.progressPercentage = Math.round(
              (favorite.readingProgress.currentPage / favorite.readingProgress.totalPages) * 100
            );
            await favorite.save();
          }
        }
      }
    }
    
    return favorites;
  }
  
  async getFavoriteById(favoriteId: string, userId: string): Promise<IFavorite | null> {
    return await Favorite.findOne({ _id: favoriteId, userId }).populate('bookId');
  }
  
  async updateFavorite(favoriteId: string, userId: string, data: UpdateFavoriteData): Promise<IFavorite | null> {
    const favorite = await Favorite.findOne({ _id: favoriteId, userId }).populate('bookId');
    
    if (!favorite) {
      return null;
    }
    
    // Update basic fields
    if (data.status !== undefined) favorite.status = data.status;
    if (data.rating !== undefined) favorite.rating = data.rating;
    if (data.notes !== undefined) favorite.notes = data.notes;
    if (data.review !== undefined) favorite.review = data.review;
    
    // Always sync totalPages with book data (from Open Library API)
    const book = favorite.bookId as any;
    if (book) {
      const bookPageCount = book.pageCount || book.pages || null;
      if (bookPageCount && bookPageCount > 0) {
        favorite.readingProgress.totalPages = bookPageCount;
      }
    }
    
    // Recalculate progress percentage
    if (favorite.readingProgress.totalPages > 0) {
      favorite.readingProgress.progressPercentage = Math.round(
        (favorite.readingProgress.currentPage / favorite.readingProgress.totalPages) * 100
      );
    }
    
    await favorite.save();
    
    return await favorite.populate('bookId');
  }
  
  async updateProgress(favoriteId: string, userId: string, data: UpdateProgressData): Promise<IFavorite | null> {
    const favorite = await Favorite.findOne({ _id: favoriteId, userId }).populate('bookId');
    
    if (!favorite) {
      return null;
    }
    
    // Sync totalPages with book data before updating
    const book = favorite.bookId as any;
    if (book) {
      const bookPageCount = book.pageCount || book.pages || null;
      if (bookPageCount && bookPageCount > 0) {
        favorite.readingProgress.totalPages = bookPageCount;
      }
    }
    
    favorite.readingProgress.currentPage = data.currentPage;
    favorite.readingProgress.lastUpdated = new Date();
    
    // Recalculate progress percentage
    if (favorite.readingProgress.totalPages > 0) {
      favorite.readingProgress.progressPercentage = Math.round(
        (favorite.readingProgress.currentPage / favorite.readingProgress.totalPages) * 100
      );
    }
    
    // Auto-update status to 'reading' if starting to read
    if (data.currentPage > 0 && favorite.status === 'want_to_read') {
      favorite.status = 'reading';
    }
    
    // Auto-update status to 'completed' if finished
    if (favorite.readingProgress.totalPages > 0 && 
        data.currentPage >= favorite.readingProgress.totalPages && 
        favorite.status === 'reading') {
      favorite.status = 'completed';
    }
    
    await favorite.save();
    
    return await favorite.populate('bookId');
  }
  
  async deleteFavorite(favoriteId: string, userId: string): Promise<boolean> {
    const result = await Favorite.findOneAndDelete({ _id: favoriteId, userId });
    return result !== null;
  }
  
  async getStatistics(userId: string): Promise<any> {
    const favorites = await Favorite.find({ userId });
    
    const stats = {
      total: favorites.length,
      wantToRead: favorites.filter(f => f.status === 'want_to_read').length,
      reading: favorites.filter(f => f.status === 'reading').length,
      completed: favorites.filter(f => f.status === 'completed').length,
      dropped: favorites.filter(f => f.status === 'dropped').length,
      averageRating: 0,
      totalPagesRead: 0,
      genreDistribution: {} as any
    };
    
    // Calculate average rating
    const ratedBooks = favorites.filter(f => f.rating);
    if (ratedBooks.length > 0) {
      stats.averageRating = ratedBooks.reduce((sum, f) => sum + (f.rating || 0), 0) / ratedBooks.length;
    }
    
    // Calculate total pages read
    stats.totalPagesRead = favorites
      .filter(f => f.status === 'completed')
      .reduce((sum, f) => sum + f.readingProgress.currentPage, 0);
    
    return stats;
  }
}

export default new FavoriteService();

