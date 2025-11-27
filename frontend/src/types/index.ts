// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  preferences: {
    favoriteGenres: string[];
    favoriteAuthors: string[];
  };
}

// Book types
export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string[];
  publishedYear: number;
  description: string;
  coverImage: string;
  pageCount: number;
  language: string;
  createdAt: string;
}

// Favorite types
export interface ReadingProgress {
  currentPage: number;
  totalPages: number;
  lastUpdated: string;
  progressPercentage: number;
}

export interface Favorite {
  _id: string;
  userId: string;
  bookId: Book;
  status: 'want_to_read' | 'reading' | 'completed' | 'dropped';
  rating?: number;
  addedAt: string;
  completedAt?: string;
  readingProgress: ReadingProgress;
  notes?: string;
  review?: string;
}

// Recommendation types
export interface Recommendation {
  title: string;
  author: string;
  genre: string[];
  reason: string;
  matchScore: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

