# Library Management System

A full-stack library management system with Django + GraphQL backend and React frontend.

## 🏗️ Architecture

```
.
├── library_project/     # Django backend with GraphQL API
└── react_app/          # React frontend
```

## 🚀 Backend (Django + GraphQL)

### Features
- ✅ GraphQL API with Graphene-Django
- ✅ Role-based access control (Admin & Regular users)
- ✅ Book management (CRUD operations)
- ✅ Borrowing system with due dates
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ Docker support

### Quick Start

#### 1. Start Database
```bash
cd library_project
docker-compose up -d db
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Run Migrations
```bash
python manage.py migrate
```

#### 4. Populate Sample Data
```bash
python manage.py populate_data
```

#### 5. Start Server
```bash
python manage.py runserver
```

**Access:**
- GraphQL API: http://localhost:8000/graphql/
- Admin Panel: http://localhost:8000/admin/

### Test Credentials
**Admin:**
- Username: `admin`
- Password: `admin123`

**Regular Users:**
- Username: `john_doe`, `jane_smith`, `bob_wilson`
- Password: `user123`

## ⚛️ Frontend (React)

### Quick Start
```bash
cd react_app
npm install
npm start
```

**Access:** http://localhost:3000

## 🐳 Docker (Full Stack)

Start everything with Docker:
```bash
cd library_project
docker-compose up --build
```

## 📚 Documentation

- Backend: See `library_project/README.md`
- GraphQL Examples: See `library_project/GRAPHQL_EXAMPLES.md`
- Docker Guide: See `library_project/DOCKER_GUIDE.md`

## 🔧 Tech Stack

### Backend
- Django 5.0
- Graphene-Django (GraphQL)
- PostgreSQL
- Docker
- JWT Authentication

### Frontend
- React
- Apollo Client (GraphQL)
- React Router
- (Add your frontend libraries)

## 📝 API Example

```graphql
# Login
mutation {
  login(username: "admin", password: "admin123") {
    success
    token
  }
}

# Get all books
query {
  allBooks {
    id
    title
    author
    availableCopies
  }
}

# Borrow a book
mutation {
  borrowBook(bookId: 1, days: 14) {
    success
    message
  }
}
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is for educational purposes.
