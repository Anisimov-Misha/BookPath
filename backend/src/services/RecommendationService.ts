import axios from 'axios';
import Favorite from '../models/Favorite';
import User from '../models/User';
import OpenLibraryService from './OpenLibraryService';

// Configuration for AI service
const AI_PROVIDER = process.env.AI_PROVIDER || 'openlibrary'; // 'openai', 'huggingface', 'openlibrary'
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI only if needed
let openai: any = null;
if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai').default;
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  } catch (error) {
    console.warn('OpenAI package not available, using fallback');
  }
}

export interface Recommendation {
  title: string;
  author: string;
  genre: string[];
  reason: string;
  matchScore: number;
}

export class RecommendationService {
  async getRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get user's favorites
      const favorites = await Favorite.find({ userId }).populate('bookId');
      
      // Extract book information
      const readBooks = favorites
        .filter(f => f.status === 'completed' || f.status === 'reading')
        .map(f => {
          const book = f.bookId as any;
          return {
            title: book?.title || 'Unknown',
            author: book?.author || 'Unknown',
            genre: book?.genre || [],
            rating: f.rating
          };
        });
      
      // Use different AI providers based on configuration
      let recommendations: Recommendation[] = [];
      
      try {
        switch (AI_PROVIDER) {
          case 'openai':
            if (openai) {
              recommendations = await this.getOpenAIRecommendations(user, readBooks);
            } else {
              console.warn('OpenAI not configured, using Open Library');
              recommendations = await this.getOpenLibraryRecommendations(user, readBooks, favorites);
            }
            break;
          case 'huggingface':
            recommendations = await this.getHuggingFaceRecommendations(user, readBooks);
            break;
          case 'openlibrary':
          default:
            recommendations = await this.getOpenLibraryRecommendations(user, readBooks, favorites);
            break;
        }
      } catch (error: any) {
        console.error('Error getting recommendations:', error.message);
        // Fallback to Open Library
        recommendations = await this.getOpenLibraryRecommendations(user, readBooks, favorites);
      }
      
      return recommendations;
    } catch (error: any) {
      console.error('❌ Recommendation error:', error.message);
      
      // Fallback to generic recommendations
      return this.getGenericRecommendations();
    }
  }
  
  private createPrompt(user: any, readBooks: any[]): string {
    const bookList = readBooks.map(b => 
      `- "${b.title}" by ${b.author} (Genre: ${b.genre.join(', ')}, Rating: ${b.rating || 'N/A'})`
    ).join('\n');
    
    return `Based on the following books that the user has read and enjoyed:

${bookList}

User's favorite genres: ${user.preferences.favoriteGenres.join(', ') || 'Not specified'}
User's favorite authors: ${user.preferences.favoriteAuthors.join(', ') || 'Not specified'}

Please recommend 5 books that this user would likely enjoy. For each recommendation, provide:
1. Title
2. Author
3. Genre(s)
4. A brief reason why this book matches their preferences (2-3 sentences)
5. A match score from 1-100

Format your response as a JSON array like this:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "genre": ["Genre1", "Genre2"],
    "reason": "Reason for recommendation",
    "matchScore": 95
  }
]`;
  }
  
  private parseRecommendations(responseText: string): Recommendation[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        return recommendations;
      }
      
      throw new Error('Could not parse recommendations');
    } catch (error) {
      console.error('❌ Parse error:', error);
      return this.getGenericRecommendations();
    }
  }
  
  /**
   * Get recommendations using OpenAI (requires API key)
   */
  private async getOpenAIRecommendations(user: any, readBooks: any[]): Promise<Recommendation[]> {
    if (!openai) {
      throw new Error('OpenAI not configured');
    }
    
    const prompt = this.createPrompt(user, readBooks);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable book recommender. Provide book recommendations in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('No response from AI');
    }
    
    return this.parseRecommendations(responseText);
  }

  /**
   * Get recommendations using Hugging Face Inference API (free tier available)
   */
  private async getHuggingFaceRecommendations(user: any, readBooks: any[]): Promise<Recommendation[]> {
    if (!HUGGINGFACE_API_KEY) {
      console.warn('Hugging Face API key not set, falling back to Open Library');
      // Get favorites for filtering
      const favorites = await Favorite.find({ userId: user._id }).populate('bookId');
      return this.getOpenLibraryRecommendations(user, readBooks, favorites);
    }

    try {
      const prompt = this.createPrompt(user, readBooks);
      
      // Use a free model like meta-llama/Llama-2-7b-chat-hf or mistralai/Mistral-7B-Instruct-v0.2
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      const responseText = response.data[0]?.generated_text || '';
      
      if (!responseText) {
        throw new Error('No response from Hugging Face');
      }
      
      return this.parseRecommendations(responseText);
    } catch (error: any) {
      console.error('Hugging Face error:', error.message);
      // Fallback to Open Library
      return this.getOpenLibraryRecommendations(user, readBooks, []);
    }
  }

  /**
   * Get recommendations using Open Library API (completely free, no API key needed)
   * This is the default and most reliable option
   */
  private async getOpenLibraryRecommendations(
    user: any, 
    readBooks: any[], 
    favorites: any[]
  ): Promise<Recommendation[]> {
    try {
      // Extract genres and authors from user's reading history
      const allGenres = new Set<string>();
      const allAuthors = new Set<string>();
      
      readBooks.forEach(book => {
        if (book.genre && Array.isArray(book.genre)) {
          book.genre.forEach((g: string) => allGenres.add(g.toLowerCase()));
        }
        if (book.author) {
          allAuthors.add(book.author);
        }
      });

      // Add user preferences
      if (user.preferences?.favoriteGenres) {
        user.preferences.favoriteGenres.forEach((g: string) => allGenres.add(g.toLowerCase()));
      }
      if (user.preferences?.favoriteAuthors) {
        user.preferences.favoriteAuthors.forEach((a: string) => allAuthors.add(a));
      }

      // Get books from Open Library based on genres
      const genreArray = Array.from(allGenres).slice(0, 3); // Use top 3 genres
      const recommendations: Recommendation[] = [];
      
      if (genreArray.length > 0) {
        // Get books for each genre
        for (const genre of genreArray) {
          try {
            const normalizedGenre = genre.replace(/\s+/g, '_').toLowerCase();
            const result = await OpenLibraryService.getBooksBySubject(normalizedGenre, 1, 5);
            
            const books = result.docs
              .map(book => OpenLibraryService.transformBook(book))
              .filter(book => {
                // Filter out books user already has
                const bookId = book.openLibraryId;
                if (!bookId) return true; // Keep if no ID
                return !favorites.some((f: any) => {
                  const favBook = f.bookId;
                  return favBook?.openLibraryId === bookId || 
                         (favBook?._id && favBook._id.toString() === bookId);
                });
              })
              .slice(0, 2); // Take 2 books per genre
            
            books.forEach(book => {
              recommendations.push({
                title: book.title,
                author: book.author,
                genre: book.genres || [],
                reason: `Recommended based on your interest in ${genre} genre. This book has similar themes and style to books you've enjoyed.`,
                matchScore: 75 + Math.floor(Math.random() * 20) // 75-95
              });
            });
          } catch (error) {
            console.error(`Error fetching books for genre ${genre}:`, error);
          }
        }
      }

      // If we don't have enough recommendations, add trending books
      if (recommendations.length < 5) {
        try {
          const trending = await OpenLibraryService.getTrendingBooks(5 - recommendations.length, 1);
          const trendingBooks = trending.docs.map(book => OpenLibraryService.transformBook(book));
          
          trendingBooks.forEach(book => {
            if (recommendations.length < 5) {
              recommendations.push({
                title: book.title,
                author: book.author,
                genre: book.genres || [],
                reason: 'Popular trending book that many readers are enjoying right now.',
                matchScore: 70
              });
            }
          });
        } catch (error) {
          console.error('Error fetching trending books:', error);
        }
      }

      // If still not enough, use generic recommendations
      if (recommendations.length < 5) {
        const generic = this.getGenericRecommendations();
        recommendations.push(...generic.slice(0, 5 - recommendations.length));
      }

      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Error getting Open Library recommendations:', error);
      return this.getGenericRecommendations();
    }
  }

  private getGenericRecommendations(): Recommendation[] {
    return [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        genre: ["Fiction", "Philosophy"],
        reason: "A thought-provoking novel about life choices and infinite possibilities. Perfect for readers who enjoy contemplative fiction with a touch of magical realism.",
        matchScore: 85
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        genre: ["Science Fiction", "Adventure"],
        reason: "A thrilling space adventure with humor and hard science. Ideal for fans of problem-solving narratives and space exploration.",
        matchScore: 90
      },
      {
        title: "Educated",
        author: "Tara Westover",
        genre: ["Biography", "Memoir"],
        reason: "An inspiring memoir about overcoming obstacles and the transformative power of education. Great for readers interested in personal growth stories.",
        matchScore: 88
      },
      {
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        genre: ["Historical Fiction", "Romance"],
        reason: "A captivating story about a Hollywood icon's life and secrets. Perfect for readers who love character-driven narratives with emotional depth.",
        matchScore: 87
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        genre: ["Self-Help", "Psychology"],
        reason: "A practical guide to building good habits and breaking bad ones. Essential for anyone interested in personal development and productivity.",
        matchScore: 82
      }
    ];
  }
}

export default new RecommendationService();

