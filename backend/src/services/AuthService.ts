import User, { IUser } from '../models/User';
import { generateToken } from '../config/jwt';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: data.email },
        { username: data.username }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('Email already registered');
      }
      throw new Error('Username already taken');
    }
    
    // Create new user
    const user = await User.create({
      username: data.username,
      email: data.email,
      passwordHash: data.password // Will be hashed by pre-save hook
    });
    
    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email
    });
    
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }
  
  async login(data: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await User.findOne({ email: data.email });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(data.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email
    });
    
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }
  
  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select('-passwordHash');
  }
  
  async updatePreferences(userId: string, preferences: { favoriteGenres?: string[], favoriteAuthors?: string[] }): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    ).select('-passwordHash');
  }
}

export default new AuthService();

