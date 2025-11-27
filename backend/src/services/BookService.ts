import Book, { IBook } from '../models/Book';
import OpenLibraryService from './OpenLibraryService';

export interface CreateBookData {
  title: string;
  author: string;
  isbn: string;
  genre: string[];
  publishedYear: number;
  description: string;
  coverImage?: string;
  pageCount: number;
  language?: string;
}

export interface SearchQuery {
  search?: string;
  genre?: string;
  author?: string;
  limit?: number;
  page?: number;
}

export class BookService {
  /**
   * Search books from Open Library API
   */
  async searchBooksFromAPI(query: SearchQuery) {
    const limit = query.limit || 20;
    const page = query.page || 1;
    
    try {
      let result;
      
      if (query.search) {
        // Search by text query
        result = await OpenLibraryService.searchBooks(query.search, page, limit);
      } else if (query.genre) {
        // Search by genre/subject
        result = await OpenLibraryService.getBooksBySubject(query.genre, page, limit);
      } else {
        // Get trending books
        result = await OpenLibraryService.getTrendingBooks(limit, page);
      }
      
      const books = result.docs.map(book => OpenLibraryService.transformBook(book));
      
      return {
        books,
        total: result.numFound,
        page,
        pages: Math.ceil(result.numFound / limit)
      };
    } catch (error) {
      console.error('Error searching books from API:', error);
      throw new Error('Failed to search books');
    }
  }
  
  /**
   * Get book details from Open Library
   */
  async getBookDetailsFromAPI(workId: string) {
    try {
      // Normalize workId - remove /works/ prefix if present
      const normalizedWorkId = workId.replace(/^\/?(works|subjects)\//, '');
      console.log(`Fetching work details for ID: ${normalizedWorkId}`);
      
      const work = await OpenLibraryService.getWorkDetails(normalizedWorkId);
      
      if (!work) {
        throw new Error('Work not found');
      }
      
      // Get author details if available
      let authorName = 'Unknown Author';
      let authorBio = null;
      
      if (work.authors && work.authors.length > 0 && work.authors[0].author) {
        const authorKey = work.authors[0].author.key?.replace('/authors/', '') || '';
        if (authorKey) {
          try {
            const author = await OpenLibraryService.getAuthorDetails(authorKey);
            if (author && author.name) {
              authorName = author.name;
              authorBio = typeof author.bio === 'string' ? author.bio : author.bio?.value;
            }
          } catch (err) {
            console.error('Error fetching author details:', err);
            // Continue with default author name
          }
        }
      }
      
      const description = typeof work.description === 'string' 
        ? work.description 
        : work.description?.value || 'No description available';
      
      // Get number of pages - try work details first, then editions API
      let pageCount = work.number_of_pages || work.number_of_pages_median || null;
      
      // If not found in work details, try to get from editions
      if (!pageCount) {
        try {
          pageCount = await OpenLibraryService.getPageCountFromEditions(normalizedWorkId);
        } catch (error) {
          console.error('Error getting page count from editions:', error);
        }
      }
      
      return {
        openLibraryId: normalizedWorkId,
        title: work.title || 'Unknown Title',
        author: authorName,
        authorBio,
        description,
        coverImage: work.covers && work.covers.length > 0 
          ? OpenLibraryService.getCoverUrl(work.covers[0], 'L')
          : null,
        subjects: work.subjects?.slice(0, 10) || [],
        firstPublishDate: work.first_publish_date,
        pageCount: pageCount,
      };
    } catch (error: any) {
      console.error('Error getting book details:', error);
      const errorMessage = error?.response?.status === 404 
        ? `Book with ID ${workId} not found in Open Library` 
        : error?.message || 'Failed to get book details from Open Library';
      throw new Error(errorMessage);
    }
  }
  

  async createBook(data: CreateBookData): Promise<IBook> {
    const book = await Book.create(data);
    return book;
  }
  
  async getAllBooks(query: SearchQuery): Promise<{ books: IBook[], total: number, page: number, pages: number }> {
    const limit = query.limit || 20;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    
    let filter: any = {};
    
    // Text search
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    
    // Genre filter
    if (query.genre) {
      filter.genre = query.genre;
    }
    
    // Author filter
    if (query.author) {
      filter.author = new RegExp(query.author, 'i');
    }
    
    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return {
      books,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }
  
  async getBookById(bookId: string): Promise<IBook | null> {
    return await Book.findById(bookId);
  }
  
  async updateBook(bookId: string, data: Partial<CreateBookData>): Promise<IBook | null> {
    return await Book.findByIdAndUpdate(
      bookId,
      { $set: data },
      { new: true, runValidators: true }
    );
  }
  
  async deleteBook(bookId: string): Promise<boolean> {
    const result = await Book.findByIdAndDelete(bookId);
    return result !== null;
  }
  
  async searchBooks(searchTerm: string): Promise<IBook[]> {
    return await Book.find({
      $text: { $search: searchTerm }
    }).limit(20);
  }
  
  async getBooksByGenre(genre: string): Promise<IBook[]> {
    return await Book.find({ genre }).limit(20);
  }
  
  async getBooksByAuthor(author: string): Promise<IBook[]> {
    return await Book.find({ 
      author: new RegExp(author, 'i') 
    }).limit(20);
  }
}

export default new BookService();

