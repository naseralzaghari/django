# GraphQL Queries & Mutations - Quick Reference

## 🔐 STEP 1: Authentication (Required First)

### Login as Admin
```graphql
mutation {
  login(username: "admin", password: "admin123") {
    success
    message
    token
    user {
      id
      username
      userType
    }
  }
}
```

### Login as Regular User
```graphql
mutation {
  login(username: "john_doe", password: "user123") {
    success
    message
    token
  }
}
```

**Important**: Copy the token and add it to HTTP Headers:
```json
{
  "Authorization": "JWT <paste-token-here>"
}
```

---

## 📚 Book Queries (All Users)

### View All Books
```graphql
query {
  allBooks {
    id
    title
    author
    isbn
    category
    availableCopies
    totalCopies
  }
}
```

### Search Books
```graphql
query {
  searchBooks(search: "Harry") {
    id
    title
    author
    description
  }
}
```

### Get Available Books Only
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

---

## ✏️ Book Mutations (Admin Only)

### Create New Book
```graphql
mutation {
  createBook(
    title: "The Art of Programming"
    author: "John Developer"
    isbn: "9789999999999"
    description: "Learn programming best practices"
    category: "Programming"
    totalCopies: 3
    availableCopies: 3
    pages: 450
  ) {
    success
    message
    book {
      id
      title
    }
  }
}
```

### Update Book
```graphql
mutation {
  updateBook(
    id: 1
    availableCopies: 4
    description: "Updated description"
  ) {
    success
    message
  }
}
```

### Delete Book
```graphql
mutation {
  deleteBook(id: 9) {
    success
    message
  }
}
```

---

## 📖 Loan Operations

### Borrow a Book (Any Authenticated User)
```graphql
mutation {
  borrowBook(bookId: 3, days: 14) {
    success
    message
    loan {
      id
      book {
        title
      }
      dueDate
    }
  }
}
```

### View My Loans
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

### Return a Book
```graphql
mutation {
  returnBook(loanId: 1, notes: "Book returned in good condition") {
    success
    message
  }
}
```

### Extend Loan Period
```graphql
mutation {
  extendLoan(loanId: 1, additionalDays: 7) {
    success
    message
    loan {
      dueDate
    }
  }
}
```

---

## 👥 User Queries

### Get Current User Info
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
  }
}
```

### Get All Users (Admin Only)
```graphql
query {
  allUsers {
    id
    username
    email
    userType
    isActive
  }
}
```

---

## 🔧 User Mutations

### Register New User
```graphql
mutation {
  register(
    username: "alice_wonder"
    email: "alice@example.com"
    password: "secure123"
    firstName: "Alice"
    lastName: "Wonder"
  ) {
    success
    message
    token
  }
}
```

### Update My Profile
```graphql
mutation {
  updateUser(
    firstName: "Updated"
    lastName: "Name"
    phone: "+9876543210"
  ) {
    success
    message
  }
}
```

### Update User Role (Admin Only)
```graphql
mutation {
  updateUser(
    id: 2
    userType: "admin"
  ) {
    success
    message
  }
}
```

---

## 📊 Admin Queries

### View All Active Loans
```graphql
query {
  activeLoans {
    id
    user {
      username
      email
    }
    book {
      title
    }
    dueDate
  }
}
```

### View Overdue Loans
```graphql
query {
  overdueLoans {
    id
    user {
      username
      email
      phone
    }
    book {
      title
      isbn
    }
    borrowedDate
    dueDate
    daysUntilDue
  }
}
```

### Get User Loan History
```graphql
query {
  userLoanHistory(userId: 2) {
    id
    book {
      title
    }
    borrowedDate
    returnDate
    status
  }
}
```

---

## 🎯 Complete Workflow Examples

### Example 1: Regular User Borrowing Workflow

1. **Login**
```graphql
mutation {
  login(username: "john_doe", password: "user123") {
    token
  }
}
```

2. **Find Available Books**
```graphql
query {
  availableBooks {
    id
    title
    author
  }
}
```

3. **Borrow a Book**
```graphql
mutation {
  borrowBook(bookId: 6, days: 14) {
    success
    message
  }
}
```

4. **Check My Loans**
```graphql
query {
  myLoans {
    book { title }
    dueDate
    status
  }
}
```

---

### Example 2: Admin Managing Library

1. **Login as Admin**
```graphql
mutation {
  login(username: "admin", password: "admin123") {
    token
  }
}
```

2. **Add New Book**
```graphql
mutation {
  createBook(
    title: "Django for Beginners"
    author: "William Vincent"
    isbn: "9781735467221"
    category: "Programming"
    totalCopies: 5
    availableCopies: 5
  ) {
    success
    book { id title }
  }
}
```

3. **Check Overdue Loans**
```graphql
query {
  overdueLoans {
    user { username email }
    book { title }
    dueDate
  }
}
```

4. **View All Active Loans**
```graphql
query {
  activeLoans {
    user { username }
    book { title }
    dueDate
  }
}
```

---

## 🔍 Combined Queries

You can query multiple things at once:

```graphql
query {
  me {
    username
    userType
  }
  myLoans {
    id
    book { title }
    status
  }
  availableBooks {
    title
    author
  }
}
```

---

## 💡 Tips

1. **Always authenticate first** - Most operations require a valid JWT token
2. **Admin vs Regular** - Test with both user types to see permission differences
3. **Use GraphiQL** - The interface at http://localhost:8000/graphql/ has auto-complete
4. **Check return messages** - The `success` and `message` fields provide helpful feedback
5. **Token in headers** - Don't forget to add the Authorization header after login

---

## 🐛 Troubleshooting

### "Authentication required" error
- Make sure you've logged in and copied the token
- Add token to HTTP Headers in GraphiQL

### "Admin privileges required" error
- You're using a regular user account for an admin-only operation
- Login with admin credentials: username `admin`, password `admin123`

### "Book not available" error
- All copies are currently borrowed
- Check with `availableBooks` query to see what's available

### "You already have an active loan" error
- You already borrowed this book and haven't returned it yet
- Check `myLoans` to see your current loans
