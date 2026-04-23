# Library Management System - React Frontend

A React TypeScript application with Apollo Client for managing a library system with role-based access control.

## Features

### Regular User Features
- **Register & Login**: Create an account and authenticate with JWT
- **Browse Books**: View all available books in the library
- **Borrow Books**: Borrow available books
- **View My Loans**: Track active and past loans
- **Return Books**: Return borrowed books

### Admin Features
- All regular user features, plus:
- **Add Books**: Create new book entries in the system
- **Edit Books**: Update book details and upload/replace PDFs
- **Delete Books**: Remove books from the system
- **View All Loans**: Monitor all loans across all users
- **PDF Management**: Upload, view, and download book PDFs (stored in AWS S3/LocalStack)

## Tech Stack

- **React 18** with TypeScript
- **Apollo Client** for GraphQL
- **React Router** for navigation
- **JWT Authentication** with localStorage persistence
- **Role-Based Access Control** (Admin/Regular user)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Django backend running at \`http://localhost:8000\`

## Installation

1. Navigate to the react_app directory:
\`\`\`bash
cd react_app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. (Optional) Create a \`.env\` file for custom configuration:
\`\`\`env
REACT_APP_GRAPHQL_URL=http://localhost:8000/graphql/
\`\`\`

## Running the Application

1. Make sure the Django backend is running:
\`\`\`bash
cd ../library_project
docker-compose up -d
\`\`\`

2. **Populate seed data** (First time only):
\`\`\`bash
docker exec library_web python manage.py populate_data
\`\`\`
This creates demo users (admin, john_doe, jane_smith, bob_wilson) and sample books.

3. In a new terminal, start the React development server:
\`\`\`bash
cd react_app
npm start
\`\`\`

4. Open your browser and navigate to:
\`\`\`
http://localhost:3000
\`\`\`

## Project Structure

\`\`\`
src/
├── apollo/
│   ├── client.ts          # Apollo Client configuration
│   └── queries.ts         # GraphQL queries and mutations
├── auth/
│   ├── AuthContext.tsx    # Authentication context provider
│   └── ProtectedRoute.tsx # Route protection component
├── components/
│   ├── Navbar.tsx         # Navigation bar
│   └── Navbar.css
├── pages/
│   ├── Login.tsx          # Login page
│   ├── Register.tsx       # Registration page
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Books.tsx          # Browse books page
│   ├── MyLoans.tsx        # User's loans page
│   ├── AddBook.tsx        # Admin: Add book page
│   ├── AllLoans.tsx       # Admin: All loans page
│   └── *.css              # Page styles
├── types/
│   └── index.ts           # TypeScript interfaces
├── App.tsx                # Main app component with routing
└── index.tsx              # App entry point
\`\`\`

## Demo Credentials

**Note:** Run `docker exec library_web python manage.py populate_data` to create demo users and sample books.

### Admin User
- **Username**: admin
- **Password**: admin123

### Regular Users
- **Username**: john_doe, jane_smith, or bob_wilson
- **Password**: user123 (for all regular users)

## Available Routes

### Public Routes
- \`/\` - Login page
- \`/register\` - Registration page

### Protected Routes (Authenticated Users)
- \`/dashboard\` - Main dashboard
- \`/books\` - Browse available books
- \`/my-loans\` - View personal loans

### Admin-Only Routes
- `/admin/add-book` - Add new books
- `/admin/edit-book/:id` - Edit existing books and manage PDFs
- `/admin/all-loans` - View all system loans

## GraphQL Operations

### Queries
- \`GET_ME\` - Get current user profile
- \`GET_AVAILABLE_BOOKS\` - Get all books with available copies
- \`GET_MY_LOANS\` - Get current user's loans
- \`GET_ALL_LOANS\` - Get all loans (admin only)

### Mutations
- \`LOGIN_MUTATION\` - Authenticate user and get JWT token
- \`REGISTER_MUTATION\` - Create new user account
- \`BORROW_BOOK\` - Borrow a book
- \`RETURN_BOOK\` - Return a borrowed book
- \`CREATE_BOOK\` - Add new book (admin only)

## Authentication Flow

1. User logs in with username/password
2. Backend returns JWT token
3. Token stored in localStorage
4. Token added to all GraphQL requests via Authorization header
5. User state maintained in React Context
6. Protected routes check authentication and role

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The optimized production build will be in the \`build/\` directory.

## Troubleshooting

### Cannot connect to backend
- Ensure Django server is running on port 8000
- Check CORS settings in Django \`settings.py\`
- Verify GraphQL endpoint: \`http://localhost:8000/graphql/\`

### Login fails
- Check browser console for errors
- Verify credentials with demo accounts
- Ensure JWT authentication is configured in Django

### Books not showing
- Run Django management command to populate seed data:
  \`\`\`bash
  docker exec library_web python manage.py populate_data
  \`\`\`
- This creates 8 sample books and 4 demo users

### Authentication persists after logout
- Clear browser localStorage
- Hard refresh the page (Ctrl+Shift+R)

## Development Notes

- JWT tokens expire after 1 hour
- Role-based access enforced on both frontend (routing) and backend (GraphQL)
- Apollo Client configured with error handling and cache management
- TypeScript strict mode enabled for type safety

## Future Enhancements

- [ ] Book search and filtering
- [ ] Pagination for large book lists
- [ ] User profile management
- [ ] Book categories and tags
- [ ] Overdue loan notifications
- [x] ~~Admin: Edit and delete books~~ ✅ **DONE**
- [x] ~~PDF upload for books~~ ✅ **DONE**
- [x] ~~View/Download book PDFs~~ ✅ **DONE**
- [ ] Admin: User management
- [ ] Dark mode theme
- [ ] Mobile-responsive improvements
