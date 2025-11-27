import axios from 'axios';

const OPEN_LIBRARY_API = 'https://openlibrary.org';
const COVERS_API = 'https://covers.openlibrary.org/b';

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[]; // Used in search results
  authors?: Array<{ key: string; name: string }>; // Used in subject/works results
  author_key?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number; // Used in search results
  cover_id?: number; // Used in subject/works results
  subject?: string[];
  language?: string[];
  publisher?: string[];
  number_of_pages_median?: number;
  ratings_average?: number;
}

export interface BookSearchResult {
  docs: OpenLibraryBook[];
  numFound: number;
  start: number;
}

export interface WorkDetails {
  title: string;
  description?: string | { value: string };
  covers?: number[];
  subjects?: string[];
  authors?: Array<{ author: { key: string } }>;
  first_publish_date?: string;
  number_of_pages?: number;
  number_of_pages_median?: number;
}

export interface AuthorDetails {
  name: string;
  bio?: string | { value: string };
  birth_date?: string;
  photos?: number[];
}

class OpenLibraryService {
  /**
   * Search for books by query
   */
  async searchBooks(query: string, page = 1, limit = 20): Promise<BookSearchResult> {
    try {
      const offset = (page - 1) * limit;
      const response = await axios.get(`${OPEN_LIBRARY_API}/search.json`, {
        params: {
          q: query,
          limit,
          offset,
          fields: 'key,title,author_name,author_key,first_publish_year,isbn,cover_i,subject,language,publisher,number_of_pages_median,ratings_average',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books');
    }
  }

  /**
   * Get books by subject
   */
  async getBooksBySubject(subject: string, page = 1, limit = 20): Promise<BookSearchResult> {
    try {
      const offset = (page - 1) * limit;
      const response = await axios.get(`${OPEN_LIBRARY_API}/subjects/${subject}.json`, {
        params: {
          limit,
          offset,
        },
      });

      return {
        docs: response.data.works || [],
        numFound: response.data.work_count || 0,
        start: offset,
      };
    } catch (error) {
      console.error('Error getting books by subject:', error);
      throw new Error('Failed to get books by subject');
    }
  }

  /**
   * Get trending books (popular subjects)
   */
  async getTrendingBooks(limit = 20, page = 1): Promise<BookSearchResult> {
    try {
      // Get popular subjects: fiction, romance, mystery, fantasy, etc.
      const popularSubjects = ['fiction', 'fantasy', 'science_fiction', 'mystery', 'romance'];
      const randomSubject = popularSubjects[Math.floor(Math.random() * popularSubjects.length)];
      
      return await this.getBooksBySubject(randomSubject, page, limit);
    } catch (error) {
      console.error('Error getting trending books:', error);
      throw new Error('Failed to get trending books');
    }
  }

  /**
   * Get work details by work ID
   */
  async getWorkDetails(workId: string): Promise<WorkDetails> {
    try {
      const response = await axios.get(`${OPEN_LIBRARY_API}/works/${workId}.json`);
      return response.data;
    } catch (error) {
      console.error('Error getting work details:', error);
      throw new Error('Failed to get work details');
    }
  }

  /**
   * Get number of pages from work editions
   */
  async getPageCountFromEditions(workId: string): Promise<number | null> {
    try {
      const response = await axios.get(`${OPEN_LIBRARY_API}/works/${workId}/editions.json`, {
        params: {
          limit: 10,
          fields: 'number_of_pages'
        }
      });

      if (response.data && response.data.entries) {
        // Find first edition with page count
        for (const edition of response.data.entries) {
          if (edition.number_of_pages && edition.number_of_pages > 0) {
            return edition.number_of_pages;
          }
        }
        // If no exact match, try to get median
        const pageCounts = response.data.entries
          .map((e: any) => e.number_of_pages)
          .filter((p: any) => p && p > 0);
        
        if (pageCounts.length > 0) {
          pageCounts.sort((a: number, b: number) => a - b);
          const medianIndex = Math.floor(pageCounts.length / 2);
          return pageCounts[medianIndex];
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting page count from editions:', error);
      return null;
    }
  }

  /**
   * Get author details by author ID
   */
  async getAuthorDetails(authorId: string): Promise<AuthorDetails> {
    try {
      const response = await axios.get(`${OPEN_LIBRARY_API}/authors/${authorId}.json`);
      return response.data;
    } catch (error) {
      console.error('Error getting author details:', error);
      throw new Error('Failed to get author details');
    }
  }

  /**
   * Get cover image URL
   */
  getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `${COVERS_API}/id/${coverId}-${size}.jpg`;
  }

  /**
   * Get cover image URL by ISBN
   */
  getCoverUrlByISBN(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
    return `${COVERS_API}/isbn/${isbn}-${size}.jpg`;
  }

  /**
   * Get author photo URL
   */
  getAuthorPhotoUrl(photoId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `https://covers.openlibrary.org/a/id/${photoId}-${size}.jpg`;
  }

  /**
   * Transform Open Library book to our format
   * Handles both search results format (cover_i, author_name) and works format (cover_id, authors)
   */
  transformBook(book: OpenLibraryBook) {
    // Get cover image - try cover_i (search results), then cover_id (works), then ISBN
    let coverImage: string | null = null;
    const coverId = book.cover_i || book.cover_id;
    
    if (coverId) {
      coverImage = this.getCoverUrl(coverId, 'M');
    } else if (book.isbn && book.isbn.length > 0) {
      // Try to get cover by ISBN
      coverImage = this.getCoverUrlByISBN(book.isbn[0], 'M');
    }

    // Get author - try author_name (search results), then authors array (works format)
    let author = 'Unknown Author';
    if (book.author_name && book.author_name.length > 0) {
      // Search results format
      author = book.author_name[0];
    } else if (book.authors && book.authors.length > 0) {
      // Works/subject format - authors is an array of objects with name property
      const authorObj = book.authors[0];
      author = (typeof authorObj === 'object' && 'name' in authorObj) 
        ? authorObj.name 
        : 'Unknown Author';
    }

    // Get author key
    let authorKey: string | undefined;
    if (book.author_key && book.author_key.length > 0) {
      authorKey = book.author_key[0];
    } else if (book.authors && book.authors.length > 0) {
      const authorObj = book.authors[0];
      if (typeof authorObj === 'object' && 'key' in authorObj && authorObj.key) {
        authorKey = typeof authorObj.key === 'string' 
          ? authorObj.key.replace('/authors/', '') 
          : undefined;
      }
    }

    return {
      openLibraryId: book.key?.replace('/works/', '') || book.key?.replace('/subjects/', '') || book.key,
      title: book.title || 'Unknown Title',
      author,
      authorKey,
      publishedYear: book.first_publish_year || null,
      isbn: book.isbn?.[0] || null,
      coverImage,
      genres: book.subject?.slice(0, 5) || [],
      language: book.language?.[0] || 'en',
      publisher: book.publisher?.[0] || null,
      pages: book.number_of_pages_median || null,
      averageRating: book.ratings_average || null,
    };
  }

  /**
   * Get recommended books based on subjects
   */
  async getRecommendations(subjects: string[], limit = 10): Promise<any[]> {
    try {
      if (!subjects || subjects.length === 0) {
        // Default recommendations
        const trending = await this.getTrendingBooks(limit, 1);
        return trending.docs.map(book => this.transformBook(book));
      }

      // Pick a random subject from user's interests
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
        .toLowerCase()
        .replace(/\s+/g, '_');

      const result = await this.getBooksBySubject(randomSubject, 1, limit);
      return result.docs.map(book => this.transformBook(book));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // Fallback to trending books
      const trending = await this.getTrendingBooks(limit, 1);
      return trending.docs.map(book => this.transformBook(book));
    }
  }
}

export default new OpenLibraryService();

