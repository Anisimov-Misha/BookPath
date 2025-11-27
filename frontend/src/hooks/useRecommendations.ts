import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.getRecommendations(),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

