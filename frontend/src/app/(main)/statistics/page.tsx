'use client';

import { useStatistics } from '@/hooks/useFavorites';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { BookOpen, CheckCircle, Clock, Star } from 'lucide-react';

export default function StatisticsPage() {
  const { data: stats, isLoading, error } = useStatistics();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Reading Statistics</h1>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading statistics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load statistics. Please try again.</p>
          </div>
        )}

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Books */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In your library
                </p>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Books finished
                </p>
              </CardContent>
            </Card>

            {/* Currently Reading */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reading</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.reading}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In progress
                </p>
              </CardContent>
            </Card>

            {/* Average Rating */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Out of 5 stars
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Reading Status</CardTitle>
                <CardDescription>Distribution of books by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Want to Read</span>
                    <span className="text-sm font-semibold">{stats.wantToRead}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reading</span>
                    <span className="text-sm font-semibold text-blue-600">{stats.reading}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="text-sm font-semibold text-green-600">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dropped</span>
                    <span className="text-sm font-semibold text-red-600">{stats.dropped}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reading Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Reading Progress</CardTitle>
                <CardDescription>Your reading achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Pages Read</span>
                      <span className="font-semibold">{stats.totalPagesRead.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span className="font-semibold">
                        {stats.total > 0 
                          ? `${Math.round((stats.completed / stats.total) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    {stats.total > 0 && (
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.round((stats.completed / stats.total) * 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {stats && stats.total === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No books yet!</p>
            <p className="text-muted-foreground">
              Add some books to your library to see statistics.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

