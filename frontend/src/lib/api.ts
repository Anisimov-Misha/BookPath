import axios, { AxiosError, AxiosInstance } from 'axios';
import { 
  User, 
  Book, 
  Favorite, 
  Recommendation,
  ApiResponse, 
  LoginCredentials, 
  RegisterData,
  AuthResponse
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<any>>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  }

  async updateProfile(preferences: { favoriteGenres?: string[]; favoriteAuthors?: string[] }): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>('/auth/profile', preferences);
    return response.data.data!;
  }

  // Books
  async getBooks(params?: { search?: string; genre?: string; author?: string; page?: number; limit?: number }): Promise<{
    books: Book[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await this.client.get<ApiResponse<any>>('/books', { params });
    return response.data.data!;
  }

  async getBookById(id: string): Promise<Book> {
    const response = await this.client.get<ApiResponse<Book>>(`/books/${id}`);
    return response.data.data!;
  }

  async getBookDetails(workId: string): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>(`/books/details/${workId}`);
    return response.data.data!;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const response = await this.client.get<ApiResponse<Book[]>>('/books/search', {
      params: { q: query }
    });
    return response.data.data!;
  }

  async createBook(bookData: Partial<Book>): Promise<Book> {
    const response = await this.client.post<ApiResponse<Book>>('/books', bookData);
    return response.data.data!;
  }

  // Favorites
  async getFavorites(status?: string): Promise<Favorite[]> {
    const response = await this.client.get<ApiResponse<Favorite[]>>('/favorites', {
      params: status ? { status } : undefined
    });
    return response.data.data!;
  }

  async getFavoriteById(id: string): Promise<Favorite> {
    const response = await this.client.get<ApiResponse<Favorite>>(`/favorites/${id}`);
    return response.data.data!;
  }

  async addToFavorites(data: {
    bookId: string;
    status?: string;
    rating?: number;
    notes?: string;
    review?: string;
  }): Promise<Favorite> {
    const response = await this.client.post<ApiResponse<Favorite>>('/favorites', data);
    return response.data.data!;
  }

  async updateFavorite(id: string, data: {
    status?: string;
    rating?: number;
    notes?: string;
    review?: string;
    // totalPages is NOT allowed - it's always synced from book.pageCount
  }): Promise<Favorite> {
    const response = await this.client.put<ApiResponse<Favorite>>(`/favorites/${id}`, data);
    return response.data.data!;
  }

  async updateProgress(id: string, currentPage: number): Promise<Favorite> {
    const response = await this.client.patch<ApiResponse<Favorite>>(`/favorites/${id}/progress`, {
      currentPage
    });
    return response.data.data!;
  }

  async removeFavorite(id: string): Promise<void> {
    await this.client.delete(`/favorites/${id}`);
  }

  async getStatistics(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/favorites/statistics');
    return response.data.data!;
  }

  // Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    const response = await this.client.get<ApiResponse<{ recommendations: Recommendation[] }>>('/recommendations');
    return response.data.data!.recommendations;
  }
}

export const api = new ApiClient();
export default api;

