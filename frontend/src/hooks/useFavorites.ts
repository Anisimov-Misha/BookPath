import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useFavorites(status?: string) {
  return useQuery({
    queryKey: ['favorites', status],
    queryFn: () => api.getFavorites(status),
  });
}

export function useFavorite(id: string) {
  return useQuery({
    queryKey: ['favorite', id],
    queryFn: () => api.getFavoriteById(id),
    enabled: !!id,
  });
}

export function useAddToFavorites() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      bookId: string;
      status?: string;
      rating?: number;
      notes?: string;
      review?: string;
    }) => api.addToFavorites(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useUpdateFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        status?: string;
        rating?: number;
        notes?: string;
        review?: string;
        // totalPages is NOT allowed - it's always synced from book.pageCount
      };
    }) => api.updateFavorite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, currentPage }: { id: string; currentPage: number }) => 
      api.updateProgress(id, currentPage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: () => api.getStatistics(),
  });
}

