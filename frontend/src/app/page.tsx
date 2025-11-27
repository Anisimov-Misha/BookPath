'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-5xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">BookPath</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal reading journey starts here. Track your progress, discover new books with AI-powered recommendations, and build your dream library.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isAuthenticated ? (
            <>
              <Link href="/catalog">
                <Button size="lg">Browse Catalog</Button>
              </Link>
              <Link href="/favorites">
                <Button size="lg" variant="outline">My Library</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 rounded-lg bg-card">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your reading journey with detailed progress tracking and statistics.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Discover your next favorite book with personalized AI-powered suggestions.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Reading Stats</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your reading habits with beautiful charts and insights.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

