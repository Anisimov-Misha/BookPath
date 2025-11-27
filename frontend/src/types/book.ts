export interface Book {
  _id?: string;
  openLibraryId?: string;
  title: string;
  author: string;
  authorKey?: string;
  isbn?: string | null;
  publishedYear?: number | null;
  coverImage?: string | null;
  genres?: string[];
  language?: string;
  publisher?: string | null;
  pages?: number | null;
  pageCount?: number | null; // Total number of pages from Open Library
  averageRating?: number | null;
  description?: string;
  subjects?: string[];
  firstPublishDate?: string;
  authorBio?: string;
}

export interface BooksResponse {
  books: Book[];
  total: number;
  page: number;
  pages: number;
}

export interface BookDetailsResponse {
  openLibraryId: string;
  title: string;
  author: string;
  authorBio?: string;
  description: string;
  coverImage?: string | null;
  subjects: string[];
  firstPublishDate?: string;
}


