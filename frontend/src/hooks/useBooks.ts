import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Book } from '@/types';

export function useBooks(params?: { search?: string; genre?: string; author?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => api.getBooks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true, // Show previous data while loading new page
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => api.getBookById(id),
    enabled: !!id,
  });
}

export function useBookDetails(workId: string) {
  return useQuery({
    queryKey: ['book', 'details', workId],
    queryFn: () => api.getBookDetails(workId),
    enabled: !!workId,
  });
}

export function useSearchBooks(query: string) {
  return useQuery({
    queryKey: ['books', 'search', query],
    queryFn: () => api.searchBooks(query),
    enabled: query.length > 2,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookData: Partial<Book>) => api.createBook(bookData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

