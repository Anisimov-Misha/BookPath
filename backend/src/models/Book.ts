import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn?: string;
  openLibraryId?: string;
  genre: string[];
  publishedYear?: number;
  description?: string;
  coverImage?: string;
  pageCount?: number;
  language: string;
  createdAt: Date;
}

const BookSchema = new Schema<IBook>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  isbn: {
    type: String,
    trim: true,
    sparse: true
  },
  openLibraryId: {
    type: String,
    trim: true
  },
  genre: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return Array.isArray(v);
      },
      message: 'Genre must be an array'
    }
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Invalid year'],
    max: [new Date().getFullYear() + 1, 'Year cannot be too far in the future']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  coverImage: {
    type: String,
    trim: true
  },
  pageCount: {
    type: Number,
    min: [0, 'Page count cannot be negative']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'en',
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search
BookSchema.index({ title: 'text', author: 'text', description: 'text' });
BookSchema.index({ genre: 1 });
BookSchema.index({ author: 1 });
// Sparse unique indexes - only index non-null values
BookSchema.index({ openLibraryId: 1 }, { unique: true, sparse: true });
BookSchema.index({ isbn: 1 }, { unique: true, sparse: true });

export default mongoose.model<IBook>('Book', BookSchema);

