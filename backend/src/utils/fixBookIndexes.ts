import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixBookIndexes() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db?.collection('books');

    if (!collection) {
      console.error('Books collection not found');
      process.exit(1);
    }

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes);

    // Drop old isbn unique index if it exists (non-sparse)
    try {
      await collection.dropIndex('isbn_1');
      console.log('✅ Dropped old isbn_1 index');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  isbn_1 index does not exist, skipping');
      } else {
        console.error('Error dropping isbn_1 index:', error);
      }
    }
    
    // Also try to drop any other isbn indexes
    try {
      const indexes = await collection.indexes();
      for (const index of indexes) {
        if (index.name && index.name.includes('isbn') && index.name !== 'isbn_1') {
          await collection.dropIndex(index.name);
          console.log(`✅ Dropped ${index.name} index`);
        }
      }
    } catch (error: any) {
      console.log('ℹ️  No additional isbn indexes to drop');
    }

    // Create new sparse unique index for isbn
    await collection.createIndex({ isbn: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse unique index for isbn');

    // Drop old openLibraryId index if it exists (non-sparse)
    try {
      await collection.dropIndex('openLibraryId_1');
      console.log('✅ Dropped old openLibraryId_1 index');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  openLibraryId_1 index does not exist, skipping');
      } else {
        console.error('Error dropping openLibraryId_1 index:', error);
      }
    }

    // Create new sparse unique indexes
    try {
      await collection.createIndex({ openLibraryId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created sparse unique index for openLibraryId');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  openLibraryId index already exists');
      } else {
        console.error('Error creating openLibraryId index:', error);
      }
    }
    
    try {
      await collection.createIndex({ isbn: 1 }, { unique: true, sparse: true });
      console.log('✅ Created sparse unique index for isbn');
    } catch (error: any) {
      if (error.code === 85) {
        console.log('ℹ️  isbn index already exists');
      } else {
        console.error('Error creating isbn index:', error);
      }
    }

    // Show final indexes
    const finalIndexes = await collection.indexes();
    console.log('📋 Final indexes:', finalIndexes);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBookIndexes();

