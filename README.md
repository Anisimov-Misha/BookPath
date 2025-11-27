# 📚 BookPath - Персональний книжковий трекер з AI-рекомендаціями

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

> **Університетський проєкт з курсу "Технології Створення Програмних Продуктів"**  
> Чернівецький національний університет імені Юрія Федьковича

---

## 🎯 Про проєкт

**BookPath** - це сучасний веб-застосунок для управління особистою бібліотекою книг з інтелектуальними AI-рекомендаціями. Система дозволяє відстежувати прогрес читання, отримувати персоналізовані рекомендації та аналізувати статистику вашої читацької активності.

### ✨ Основні можливості

- 📖 **Управління бібліотекою** - додавайте книги в колекцію "Улюблене"
- 🔍 **Потужний пошук** - знаходьте книги за назвою, автором або жанром
- 📊 **Відстеження прогресу** - слідкуйте за тим, скільки ви прочитали
- ⭐ **Оцінювання** - ставте оцінки та пишіть відгуки
- 🤖 **AI-рекомендації** - отримуйте персоналізовані рекомендації від GPT
- 📈 **Статистика** - аналізуйте свої читацькі звички

---

## 🏗️ Архітектура

### Технологічний стек

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Charts**: Recharts

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **AI Integration**: OpenAI API
- **Validation**: Express-validator

#### DevOps
- **Version Control**: Git & GitHub
- **Backend Hosting**: Railway / Render
- **Frontend Hosting**: Vercel
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions (опціонально)

---

## 📂 Структура проєкту

```
tspp/
├── backend/                 # Node.js + Express Backend
│   ├── src/
│   │   ├── config/         # Конфігурація (DB, JWT)
│   │   ├── models/         # Mongoose моделі
│   │   ├── controllers/    # API контролери
│   │   ├── routes/         # Express маршрути
│   │   ├── middleware/     # Middleware (auth, validation)
│   │   ├── services/       # Бізнес-логіка
│   │   ├── utils/          # Допоміжні функції
│   │   └── app.ts          # Головний файл
│   └── package.json
│
├── frontend/                # Next.js Frontend
│   ├── src/
│   │   ├── app/            # Next.js pages (App Router)
│   │   ├── components/     # React компоненти
│   │   ├── lib/            # API клієнт, utilities
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React Context
│   │   └── types/          # TypeScript типи
│   └── package.json
│
├── docs/                    # Документація
├── PROJECT_ANALYSIS.md      # Аналіз проєкту
├── IMPLEMENTATION_PLAN.md   # План реалізації
└── README.md               # Цей файл
```

---

## 🚀 Швидкий старт

### Передумови

- Node.js 18+ та npm/yarn
- MongoDB (локально або MongoDB Atlas)
- OpenAI API ключ (для AI-рекомендацій)

### 1. Клонування репозиторію

```bash
git clone https://github.com...
cd tspp
```

### 2. Налаштування Backend

```bash
cd backend

# Встановлення залежностей
npm install

# Створення .env файлу
cp .env.example .env

# Редагування .env (додайте свої credentials)
nano .env
```

**Backend .env:**
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/bookpath
# або MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookpath

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

OPENAI_API_KEY=your-openai-api-key

FRONTEND_URL=http://localhost:3000
```

```bash
# Запуск Backend
npm run dev
```

Backend буде доступний на `http://localhost:5000`

### 3. Налаштування Frontend

```bash
cd frontend

# Встановлення залежностей
npm install

# Створення .env файлу
cp .env.example .env.local

# Редагування .env.local
nano .env.local
```

**Frontend .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
# Запуск Frontend
npm run dev
```

Frontend буде доступний на `http://localhost:3000`

---

## 📖 Документація

### Для розробників

### API Documentation

#### Authentication

**POST** `/api/auth/register`
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Books

**GET** `/api/books?search=harry&genre=fantasy&limit=20`

**GET** `/api/books/:id`

**POST** `/api/books` (Protected, Admin)
```json
{
  "title": "Harry Potter and the Philosopher's Stone",
  "author": "J.K. Rowling",
  "isbn": "978-0-7475-3269-9",
  "genre": ["Fantasy", "Young Adult"],
  "publishedYear": 1997,
  "description": "...",
  "pageCount": 223,
  "language": "en"
}
```

#### Favorites

**GET** `/api/favorites` (Protected)

**POST** `/api/favorites` (Protected)
```json
{
  "bookId": "6507f1b2c1e2a8d4f8a9b7c3",
  "status": "reading",
  "rating": 5,
  "notes": "Great book!"
}
```

**PATCH** `/api/favorites/:id/progress` (Protected)
```json
{
  "currentPage": 150,
  "totalPages": 223
}
```

#### Recommendations

**GET** `/api/recommendations` (Protected)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "title": "The Lord of the Rings",
        "author": "J.R.R. Tolkien",
        "reason": "Based on your love for fantasy literature...",
        "matchScore": 95
      }
    ]
  }
}
```

---

## 🗄️ База даних

### MongoDB Схеми

#### User
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  passwordHash: String,
  createdAt: Date,
  preferences: {
    favoriteGenres: [String],
    favoriteAuthors: [String]
  }
}
```

#### Book
```javascript
{
  _id: ObjectId,
  title: String,
  author: String,
  isbn: String (unique),
  genre: [String],
  publishedYear: Number,
  description: String,
  coverImage: String,
  pageCount: Number,
  language: String
}
```

#### Favorite
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  bookId: ObjectId (ref: Book),
  status: String, // "want_to_read", "reading", "completed", "dropped"
  rating: Number (1-5),
  addedAt: Date,
  completedAt: Date,
  readingProgress: {
    currentPage: Number,
    totalPages: Number,
    progressPercentage: Number
  },
  notes: String,
  review: String
}
```

---

## 🎨 UI/UX Features

- ✅ **Responsive Design** - працює на всіх пристроях
- ✅ **Loading States** - skeleton loaders
- ✅ **Error Handling** - зрозумілі повідомлення про помилки
- ✅ **Toast Notifications** - інформування користувача
- ✅ **Protected Routes** - перенаправлення неавторизованих користувачів
- ✅ **Pagination** - для великих списків
- ✅ **Infinite Scroll** (опціонально)
- ✅ **Search Debouncing** - оптимізований пошук

---

## 🧪 Тестування

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Component tests
npm run test

# E2E tests
npm run test:e2e
```

## 📊 Прогрес розробки

### Фази реалізації

- [x] Аналіз вимог та проектування
- [ ] Backend розробка
  - [ ] Authentication
  - [ ] Books API
  - [ ] Favorites API
  - [ ] AI Recommendations
  - [ ] Statistics
- [ ] Frontend розробка
  - [ ] Landing Page
  - [ ] Authentication UI
  - [ ] Catalog
  - [ ] Favorites
  - [ ] Recommendations
  - [ ] Statistics
- [ ] Тестування
- [ ] Деплой