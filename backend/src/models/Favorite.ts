import mongoose, { Document, Schema } from 'mongoose';

export interface IReadingProgress {
  currentPage: number;
  totalPages: number;
  lastUpdated: Date;
  progressPercentage: number;
}

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  status: 'want_to_read' | 'reading' | 'completed' | 'dropped';
  rating?: number;
  addedAt: Date;
  completedAt?: Date;
  readingProgress: IReadingProgress;
  notes?: string;
  review?: string;
}

const ReadingProgressSchema = new Schema<IReadingProgress>({
  currentPage: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Current page cannot be negative']
  },
  totalPages: {
    type: Number,
    required: true,
    min: [0, 'Total pages cannot be negative'],
    default: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%']
  }
}, { _id: false });

const FavoriteSchema = new Schema<IFavorite>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  status: {
    type: String,
    enum: {
      values: ['want_to_read', 'reading', 'completed', 'dropped'],
      message: '{VALUE} is not a valid status'
    },
    required: [true, 'Status is required'],
    default: 'want_to_read'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  readingProgress: {
    type: ReadingProgressSchema,
    required: true,
    default: () => ({
      currentPage: 0,
      totalPages: 0,
      lastUpdated: new Date(),
      progressPercentage: 0
    })
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  review: {
    type: String,
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

// Unique constraint: user can only have one favorite entry per book
FavoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, status: 1 });

// Pre-save middleware to calculate progress percentage
FavoriteSchema.pre('save', function(next) {
  if (this.readingProgress.totalPages > 0) {
    this.readingProgress.progressPercentage = Math.round(
      (this.readingProgress.currentPage / this.readingProgress.totalPages) * 100
    );
  }
  
  // Auto-set completedAt when status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);

