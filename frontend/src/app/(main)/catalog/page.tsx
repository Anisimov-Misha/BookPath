'use client';

import { useState } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/books/BookCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CatalogPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useBooks({ search, genre, page, limit: 12 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleGenreChange = (newGenre: string) => {
    setGenre(newGenre === genre ? '' : newGenre);
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const genres = [
    'fiction', 'fantasy', 'science_fiction', 'mystery', 'romance', 
    'thriller', 'horror', 'biography', 'history', 'philosophy'
  ];

  return (
    <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Book Catalog</h1>
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Genre Filters */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold mb-3">Browse by Genre:</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <Button
                  key={g}
                  variant={genre === g ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGenreChange(g)}
                >
                  {g.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading books...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load books. Please try again.</p>
          </div>
        )}

        {/* Books Grid */}
        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.books.map((book, index) => (
                <BookCard key={book.openLibraryId || book._id || index} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage(p => {
                      const newPage = Math.max(1, p - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      return newPage;
                    });
                  }}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage(p => {
                      const newPage = Math.min(data.pages, p + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      return newPage;
                    });
                  }}
                  disabled={page === data.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
            
            {/* Results info */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing {data.books.length} of {data.total.toLocaleString()} books
            </div>
          </>
        )}

        {/* Empty State */}
        {data && data.books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No books found. Try adjusting your search.</p>
          </div>
        )}
        </main>
      </div>
  );
}

