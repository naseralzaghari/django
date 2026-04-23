# Library Management System - Django + GraphQL

A full-featured library management system built with Django, GraphQL (Graphene), and PostgreSQL. The system supports role-based access control with admin and regular user types.

## 🚀 Features

### User Management
- **Admin Users**: Full CRUD access to books, users, and loans
- **Regular Users**: Can view books, borrow books, and return books
- User authentication with JWT tokens
- User profile management

### Book Management
- Complete CRUD operations for books (admin only)
- Book search by title, author, ISBN, and category
- Track available copies and total inventory
- Book details include publisher, publication date, description, pages, language, and cover image

### Loan System
- Borrow books with automatic due date calculation
- Return books with date tracking
- Extend loan periods
- Track active, overdue, and returned loans
- Automatic inventory management

## 📋 Prerequisites

- Python 3.10+
- Docker and Docker Compose
- PostgreSQL (via Docker)

## 🛠️ Installation

### 1. Navigate to Project Directory
```bash
cd /home/naseralzaghari/Desktop/django/library_project
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env` and update if needed:
```bash
cp .env.example .env
```

### 4. Start PostgreSQL Database
```bash
docker-compose up -d
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Populate Sample Data
```bash
python manage.py populate_data
```

### 7. Start Development Server
```bash
python manage.py runserver
```

Access the application at: **http://localhost:8000/graphql/**

## 🔐 Test Credentials

### Admin User
- **Username**: `admin`
- **Password**: `admin123`

### Regular Users
- **Username**: `john_doe`, `jane_smith`, or `bob_wilson`
- **Password**: `user123`

## 📚 GraphQL API Documentation

### Authentication

#### Register a New User
```graphql
mutation {
  register(
    username: "newuser"
    email: "newuser@example.com"
    password: "password123"
    firstName: "New"
    lastName: "User"
  ) {
    success
    message
    token
    user {
      id
      username
      email
      userType
    }
  }
}
```

#### Login
```graphql
mutation {
  login(username: "admin", password: "admin123") {
    success
    message
    token
    user {
      id
      username
      email
      userType
    }
  }
}
```

**Note**: After login, use the token in your request headers:
```
Authorization: JWT <your-token-here>
```

### User Queries

#### Get Current User
```graphql
query {
  me {
    id
    username
    email
    firstName
    lastName
    userType
    phone
    address
  }
}
```

#### Get All Users (Admin Only)
```graphql
query {
  allUsers {
    id
    username
    email
    userType
    createdAt
  }
}
```

### Book Queries

#### Get All Books
```graphql
query {
  allBooks {
    id
    title
    author
    isbn
    publisher
    description
    category
    totalCopies
    availableCopies
    pages
    language
    isAvailable
  }
}
```

#### Get Single Book
```graphql
query {
  book(id: 1) {
    id
    title
    author
    isbn
    description
    availableCopies
  }
}
```

#### Search Books
```graphql
query {
  searchBooks(search: "Harry Potter") {
    id
    title
    author
    isbn
  }
}
```

#### Get Books by Category
```graphql
query {
  booksByCategory(category: "Fantasy") {
    id
    title
    author
    category
  }
}
```

#### Get Available Books
```graphql
query {
  availableBooks {
    id
    title
    author
    availableCopies
  }
}
```

### Book Mutations (Admin Only)

#### Create Book
```graphql
mutation {
  createBook(
    title: "New Book Title"
    author: "Author Name"
    isbn: "9781234567890"
    publisher: "Publisher Name"
    description: "Book description"
    category: "Fiction"
    totalCopies: 5
    availableCopies: 5
    pages: 300
    language: "English"
  ) {
    success
    message
    book {
      id
      title
      author
    }
  }
}
```

#### Update Book
```graphql
mutation {
  updateBook(
    id: 1
    title: "Updated Title"
    description: "Updated description"
    availableCopies: 3
  ) {
    success
    message
    book {
      id
      title
      availableCopies
    }
  }
}
```

#### Delete Book
```graphql
mutation {
  deleteBook(id: 1) {
    success
    message
  }
}
```

### Loan Queries

#### Get My Loans
```graphql
query {
  myLoans {
    id
    book {
      title
      author
    }
    borrowedDate
    dueDate
    returnDate
    status
    daysUntilDue
    isOverdue
  }
}
```

#### Get All Loans (Admin Only)
```graphql
query {
  allLoans {
    id
    user {
      username
      email
    }
    book {
      title
      author
    }
    borrowedDate
    dueDate
    status
  }
}
```

#### Get Active Loans (Admin Only)
```graphql
query {
  activeLoans {
    id
    user {
      username
    }
    book {
      title
    }
    dueDate
  }
}
```

#### Get Overdue Loans (Admin Only)
```graphql
query {
  overdueLoans {
    id
    user {
      username
      email
    }
    book {
      title
    }
    borrowedDate
    dueDate
  }
}
```

### Loan Mutations

#### Borrow a Book
```graphql
mutation {
  borrowBook(bookId: 1, days: 14) {
    success
    message
    loan {
      id
      book {
        title
      }
      borrowedDate
      dueDate
      status
    }
  }
}
```

#### Return a Book
```graphql
mutation {
  returnBook(loanId: 1, notes: "Book in good condition") {
    success
    message
    loan {
      id
      returnDate
      status
    }
  }
}
```

#### Extend Loan Period
```graphql
mutation {
  extendLoan(loanId: 1, additionalDays: 7) {
    success
    message
    loan {
      id
      dueDate
      status
    }
  }
}
```

### User Management Mutations

#### Update User Profile
```graphql
mutation {
  updateUser(
    email: "newemail@example.com"
    firstName: "Updated"
    lastName: "Name"
    phone: "+1234567890"
  ) {
    success
    message
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

#### Update Another User (Admin Only)
```graphql
mutation {
  updateUser(
    id: 2
    userType: "admin"
  ) {
    success
    message
    user {
      id
      username
      userType
    }
  }
}
```

#### Delete User (Admin Only)
```graphql
mutation {
  deleteUser(id: 2) {
    success
    message
  }
}
```

## 🔒 Permission Model

### Admin Users (`user_type: "admin"`)
- ✅ Create, update, and delete books
- ✅ View all users and loans
- ✅ Update user roles
- ✅ Delete users
- ✅ View overdue and active loans
- ✅ Borrow and return books

### Regular Users (`user_type: "regular"`)
- ✅ View all books
- ✅ Search books
- ✅ Borrow available books
- ✅ Return their own books
- ✅ View their own loans
- ✅ Extend their own loans
- ✅ Update their own profile
- ❌ Cannot create, update, or delete books
- ❌ Cannot view other users' information
- ❌ Cannot view other users' loans

## 🏗️ Project Structure

```
library_project/
├── books/                      # Books app
│   ├── models.py              # Book model
│   ├── schema.py              # GraphQL schema for books
│   ├── admin.py               # Admin interface
│   └── management/
│       └── commands/
│           └── populate_data.py
├── users/                      # Users app
│   ├── models.py              # Custom User model
│   ├── schema.py              # GraphQL schema for users
│   ├── admin.py               # Admin interface
│   └── permissions.py         # Authentication decorators
├── loans/                      # Loans app
│   ├── models.py              # BookLoan model
│   ├── schema.py              # GraphQL schema for loans
│   └── admin.py               # Admin interface
├── library_project/           # Project settings
│   ├── settings.py            # Django settings
│   ├── schema.py              # Root GraphQL schema
│   └── urls.py                # URL configuration
├── docker-compose.yml         # PostgreSQL container
├── requirements.txt           # Python dependencies
└── .env                       # Environment variables
```

## 🗄️ Database Schema

### User Model
- username, email, password (hashed)
- first_name, last_name
- user_type (admin/regular)
- phone, address
- created_at, updated_at

### Book Model
- title, author, isbn
- publisher, publication_date
- description, category
- total_copies, available_copies
- pages, language, cover_image
- created_at, updated_at

### BookLoan Model
- user (ForeignKey to User)
- book (ForeignKey to Book)
- borrowed_date, due_date, return_date
- status (active/returned/overdue)
- notes
- created_at, updated_at

## 🔌 React Integration

The API is configured with CORS to allow requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`

### Example React Integration

```javascript
// Apollo Client setup
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `JWT ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

## 🧪 Testing

### Using GraphiQL Interface
Navigate to `http://localhost:8000/graphql/` to access the interactive GraphiQL interface.

### Testing Workflow
1. Login as admin or regular user
2. Copy the token from the response
3. Add to HTTP Headers in GraphiQL:
   ```json
   {
     "Authorization": "JWT <your-token-here>"
   }
   ```
4. Execute queries and mutations

## 📦 Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f

# Rebuild container
docker-compose up -d --build
```

## 🛠️ Management Commands

```bash
# Create superuser
python manage.py createsuperuser

# Populate sample data
python manage.py populate_data

# Access Django admin
# Navigate to http://localhost:8000/admin/
```

## 📝 Notes

- The database runs on port **5433** (not the default 5432) to avoid conflicts
- JWT tokens have a 1-hour expiration by default
- Books automatically track inventory when borrowed/returned
- Loans automatically update to 'overdue' status when past due date
- GraphiQL interface is enabled in development for easy testing

## 🚀 Deployment Considerations

For production deployment:
1. Set `DEBUG=False` in settings
2. Configure proper `ALLOWED_HOSTS`
3. Use environment variables for sensitive data
4. Set up proper database backups
5. Use a production-grade web server (gunicorn/uwsgi)
6. Configure HTTPS
7. Set appropriate JWT expiration times
8. Enable database connection pooling

## 📄 License

This project is provided as-is for educational and development purposes.
