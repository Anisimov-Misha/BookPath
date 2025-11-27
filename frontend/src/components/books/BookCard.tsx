'use client';

import { useState } from 'react';
import React from 'react';
import { Book } from '@/types/book';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, BookOpen, Star } from 'lucide-react';
import { useAddToFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/useToast';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const addFavorite = useAddToFavorites();
  const { toast } = useToast();

  // Get cover image - try multiple sources
  React.useEffect(() => {
    setImageLoading(true);
    setImageError(false);
    
    if (book.coverImage) {
      setImageSrc(book.coverImage);
    } else if (book.isbn) {
      // Try to get cover by ISBN as fallback
      setImageSrc(`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`);
    } else {
      setImageSrc(null);
      setImageLoading(false);
    }
  }, [book.coverImage, book.isbn]);

  const handleAddToLibrary = async () => {
    try {
      const bookId = book.openLibraryId || book._id || '';
      if (!bookId) {
        toast.error('Book ID is missing');
        return;
      }

      await addFavorite.mutateAsync({
        bookId,
        status: 'want_to_read',
      });
      toast.success('Added to your library!');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to add to library';
      toast.error(errorMessage);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    setImageSrc(null);
  };

  const hasImage = imageSrc && !imageError;
  const shouldShowLoader = imageLoading && (book.coverImage || book.isbn);
  const shouldShowNoCover = !hasImage && !imageLoading;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[2/3] bg-secondary overflow-hidden">
        {/* Loading State */}
        {shouldShowLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Image */}
        {imageSrc && !imageError && (
          <img
            src={imageSrc}
            alt={book.title}
            className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {/* No Cover State */}
        {shouldShowNoCover && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            <div className="text-center px-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No Cover</p>
            </div>
          </div>
        )}

        {/* Rating Badge */}
        {book.averageRating && hasImage && !imageLoading && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs z-10">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{book.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          by {book.author}
        </p>
        
        {book.publishedYear && (
          <p className="text-xs text-muted-foreground mb-2">
            Published: {book.publishedYear}
          </p>
        )}
        
        {book.genres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.genres.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        
        {book.pages && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>{book.pages} pages</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToLibrary}
          disabled={addFavorite.isPending}
        >
          <Heart className="h-4 w-4 mr-2" />
          {addFavorite.isPending ? 'Adding...' : 'Add to Library'}
        </Button>
      </CardFooter>
    </Card>
  );
}

