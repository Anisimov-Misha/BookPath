'use client';

import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function RecommendationsPage() {
  const { data: recommendations, isLoading, error } = useRecommendations();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-muted-foreground mt-2">
            Personalized book suggestions just for you
          </p>
        </div>
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Generating recommendations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load recommendations. Please try again.</p>
          </div>
        )}

        {/* Recommendations List */}
        {recommendations && (
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{rec.title}</CardTitle>
                      <CardDescription>by {rec.author}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{rec.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">Match Score</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.genre.map((g) => (
                      <span key={g} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                        {g}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground">{rec.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {recommendations && recommendations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Add some books to your library to get personalized recommendations!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

