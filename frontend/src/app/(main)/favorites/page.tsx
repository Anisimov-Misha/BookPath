'use client';

import { useState } from 'react';
import { useFavorites, useUpdateFavorite, useUpdateProgress, useRemoveFavorite } from '@/hooks/useFavorites';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Favorite } from '@/types';
import { BookOpen, Star, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function FavoritesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: favorites, isLoading, error } = useFavorites(statusFilter);
  const updateFavorite = useUpdateFavorite();
  const updateProgress = useUpdateProgress();
  const removeFavorite = useRemoveFavorite();
  const { toast } = useToast();

  const handleStatusChange = async (favoriteId: string, status: string) => {
    try {
      await updateFavorite.mutateAsync({ id: favoriteId, data: { status } as any });
      toast.success('Status updated!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleProgressUpdate = async (favoriteId: string, currentPage: number) => {
    try {
      await updateProgress.mutateAsync({ id: favoriteId, currentPage });
      toast.success('Progress updated!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update progress');
    }
  };

  const handleQuickProgress = async (favoriteId: string, currentPage: number, delta: number) => {
    const newPage = Math.max(0, Math.min(currentPage + delta, 9999));
    await handleProgressUpdate(favoriteId, newPage);
  };

  const handleRatingChange = async (favoriteId: string, rating: number) => {
    try {
      await updateFavorite.mutateAsync({ id: favoriteId, data: { rating } as any });
      toast.success('Rating updated!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update rating');
    }
  };

  const handleRemove = async (favoriteId: string) => {
    if (confirm('Remove this book from your library?')) {
      try {
        await removeFavorite.mutateAsync(favoriteId);
        toast.success('Book removed from library');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to remove book');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Library</h1>
        {/* Status Filter */}
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === '' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'want_to_read' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('want_to_read')}
            >
              Want to Read
            </Button>
            <Button
              variant={statusFilter === 'reading' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('reading')}
            >
              Reading
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'dropped' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('dropped')}
            >
              Dropped
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your library...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load library. Please try again.</p>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites && (
          <div className="space-y-4">
            {favorites.map((favorite: Favorite) => (
              <Card key={favorite._id}>
                <CardHeader>
                  <div className="flex gap-4">
                    <img
                      src={favorite.bookId.coverImage}
                      alt={favorite.bookId.title}
                      className="w-24 h-36 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-book-cover.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <CardTitle>{favorite.bookId.title}</CardTitle>
                      <CardDescription>by {favorite.bookId.author}</CardDescription>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {favorite.bookId.genre.map((g) => (
                          <span key={g} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Reading Progress
                      </span>
                      <span className="text-sm font-semibold">{favorite.readingProgress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 mb-2">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${favorite.readingProgress.progressPercentage}%` }}
                      />
                    </div>
                    
                    {/* Progress Display */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Page {favorite.readingProgress.currentPage} of {favorite.readingProgress.totalPages}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {favorite.readingProgress.totalPages > 0 ? (
                            <>Total: {favorite.readingProgress.totalPages} pages</>
                          ) : (
                            <>Total pages: Not available</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Quick Progress Buttons */}
                    <div className="space-y-2">
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickProgress(favorite._id, favorite.readingProgress.currentPage, -10)}
                          disabled={favorite.readingProgress.currentPage === 0}
                          className="text-xs"
                        >
                          <Minus className="h-3 w-3 mr-1" />
                          -10
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickProgress(favorite._id, favorite.readingProgress.currentPage, -1)}
                          disabled={favorite.readingProgress.currentPage === 0}
                          className="text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickProgress(favorite._id, favorite.readingProgress.currentPage, 1)}
                          disabled={favorite.readingProgress.totalPages > 0 && favorite.readingProgress.currentPage >= favorite.readingProgress.totalPages}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickProgress(favorite._id, favorite.readingProgress.currentPage, 10)}
                          disabled={favorite.readingProgress.totalPages > 0 && favorite.readingProgress.currentPage >= favorite.readingProgress.totalPages}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          +10
                        </Button>
                        {favorite.readingProgress.totalPages > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProgressUpdate(favorite._id, favorite.readingProgress.totalPages)}
                            disabled={favorite.readingProgress.currentPage >= favorite.readingProgress.totalPages}
                            className="text-xs ml-auto"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={favorite.status}
                      onChange={(e) => handleStatusChange(favorite._id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="want_to_read">Want to Read</option>
                      <option value="reading">Reading</option>
                      <option value="completed">Completed</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingChange(favorite._id, rating)}
                          className={`p-1 rounded transition-colors ${
                            favorite.rating && favorite.rating >= rating
                              ? 'text-yellow-400'
                              : 'text-muted-foreground hover:text-yellow-300'
                          }`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              favorite.rating && favorite.rating >= rating ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      ))}
                      {favorite.rating && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({favorite.rating}/5)
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleRemove(favorite._id)}
                  >
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {favorites && favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books in your library yet. Start adding some!</p>
          </div>
        )}
      </main>
    </div>
  );
}

