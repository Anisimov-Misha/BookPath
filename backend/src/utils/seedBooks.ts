import Book from '../models/Book';
import connectDB from '../config/database';

const sampleBooks = [
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    isbn: "978-0-7475-3269-9",
    genre: ["Fantasy", "Young Adult"],
    publishedYear: 1997,
    description: "Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg",
    pageCount: 223,
    language: "en"
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "978-0-618-34399-6",
    genre: ["Fantasy", "Adventure"],
    publishedYear: 1954,
    description: "One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. In ancient times the Rings of Power were crafted by the Elven-smiths.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/91b0C2YNSrL.jpg",
    pageCount: 1178,
    language: "en"
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    genre: ["Fiction", "Dystopian", "Political"],
    publishedYear: 1949,
    description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
    pageCount: 328,
    language: "en"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    genre: ["Fiction", "Classic"],
    publishedYear: 1960,
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/81aY1lxk+9L.jpg",
    pageCount: 324,
    language: "en"
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    genre: ["Fiction", "Classic"],
    publishedYear: 1925,
    description: "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/81QuEGw8VPL.jpg",
    pageCount: 180,
    language: "en"
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "978-0-441-17271-9",
    genre: ["Science Fiction", "Adventure"],
    publishedYear: 1965,
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/81zN7udGRUL.jpg",
    pageCount: 688,
    language: "en"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "978-0-7352-1129-2",
    genre: ["Self-Help", "Psychology", "Business"],
    publishedYear: 2018,
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
    pageCount: 320,
    language: "en"
  },
  {
    title: "Educated",
    author: "Tara Westover",
    isbn: "978-0-399-59050-4",
    genre: ["Biography", "Memoir"],
    publishedYear: 2018,
    description: "Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/81NuAR3wh3L.jpg",
    pageCount: 334,
    language: "en"
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    isbn: "978-0-525-55948-1",
    genre: ["Fiction", "Fantasy", "Philosophy"],
    publishedYear: 2020,
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/81YkqyaFVEL.jpg",
    pageCount: 304,
    language: "en"
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    isbn: "978-0-593-13520-1",
    genre: ["Science Fiction", "Adventure"],
    publishedYear: 2021,
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.",
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/91aYLFR8CpL.jpg",
    pageCount: 476,
    language: "en"
  }
];

async function seedBooks() {
  try {
    await connectDB();
    
    console.log('🌱 Starting to seed books...');
    
    // Clear existing books (optional)
    const existingCount = await Book.countDocuments();
    if (existingCount > 0) {
      console.log(`📚 Found ${existingCount} existing books. Clearing...`);
      await Book.deleteMany({});
    }
    
    // Insert sample books
    const insertedBooks = await Book.insertMany(sampleBooks);
    
    console.log(`✅ Successfully seeded ${insertedBooks.length} books!`);
    console.log('📖 Books added:');
    insertedBooks.forEach((book, index) => {
      console.log(`   ${index + 1}. ${book.title} by ${book.author}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding books:', error);
    process.exit(1);
  }
}

seedBooks();

