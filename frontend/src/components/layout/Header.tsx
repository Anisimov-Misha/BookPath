'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { BookOpen, Home, Heart, Sparkles, BarChart3, User, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  if (!isAuthenticated) {
    return (
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
              <BookOpen className="h-6 w-6 text-primary" />
              <span>BookPath</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/catalog" className="flex items-center gap-2 text-2xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>BookPath</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/catalog"
              className={`flex items-center gap-2 transition-colors hover:text-primary ${
                isActive('/catalog') ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              Catalog
            </Link>
            
            <Link 
              href="/favorites"
              className={`flex items-center gap-2 transition-colors hover:text-primary ${
                isActive('/favorites') ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Heart className="h-4 w-4" />
              My Library
            </Link>
            
            <Link 
              href="/recommendations"
              className={`flex items-center gap-2 transition-colors hover:text-primary ${
                isActive('/recommendations') ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Recommendations
            </Link>
            
            <Link 
              href="/statistics"
              className={`flex items-center gap-2 transition-colors hover:text-primary ${
                isActive('/statistics') ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Stats
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md bg-secondary">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex items-center gap-4 overflow-x-auto pb-2">
          <Link 
            href="/catalog"
            className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap transition-colors ${
              isActive('/catalog') 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Home className="h-4 w-4" />
            Catalog
          </Link>
          
          <Link 
            href="/favorites"
            className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap transition-colors ${
              isActive('/favorites') 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Heart className="h-4 w-4" />
            Library
          </Link>
          
          <Link 
            href="/recommendations"
            className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap transition-colors ${
              isActive('/recommendations') 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI
          </Link>
          
          <Link 
            href="/statistics"
            className={`flex items-center gap-2 px-3 py-2 rounded-md whitespace-nowrap transition-colors ${
              isActive('/statistics') 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Stats
          </Link>
        </nav>
      </div>
    </header>
  );
}

