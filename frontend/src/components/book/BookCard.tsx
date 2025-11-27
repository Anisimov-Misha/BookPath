'use client';

import Link from 'next/link';
import { Book } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAddToFavorites } from '@/hooks/useFavorites';
import { useState } from 'react';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const addToFavorites = useAddToFavorites();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToFavorites = async () => {
    setIsAdding(true);
    try {
      await addToFavorites.mutateAsync({ bookId: book._id });
      alert('Book added to favorites!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add book');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="aspect-[2/3] relative mb-4 bg-muted rounded-md overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/default-book-cover.jpg';
            }}
          />
        </div>
        <CardTitle className="line-clamp-2">{book.title}</CardTitle>
        <CardDescription className="line-clamp-1">by {book.author}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-1">
            {book.genre.slice(0, 3).map((g) => (
              <span key={g} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                {g}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground line-clamp-3">{book.description}</p>
          <div className="text-xs text-muted-foreground">
            {book.pageCount} pages • {book.publishedYear}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="gap-2">
        <Link href={`/books/${book._id}`} className="flex-1">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
        <Button
          onClick={handleAddToFavorites}
          isLoading={isAdding}
          disabled={isAdding}
        >
          Add to Library
        </Button>
      </CardFooter>
    </Card>
  );
}

