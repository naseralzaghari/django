import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      message
      token
      user {
        id
        username
        email
        userType
        firstName
        lastName
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    register(
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
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
`;

export const GET_ME = gql`
  query GetMe {
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
`;

export const GET_ALL_BOOKS = gql`
  query GetAllBooks {
    allBooks {
      id
      title
      author
      isbn
      category
      description
      availableCopies
      totalCopies
      isAvailable
    }
  }
`;

export const GET_AVAILABLE_BOOKS = gql`
  query GetAvailableBooks {
    availableBooks {
      id
      title
      author
      isbn
      category
      availableCopies
      hasPdf
      pdfUrl
      pdfDownloadUrl
    }
  }
`;

export const BORROW_BOOK = gql`
  mutation BorrowBook($bookId: Int!, $days: Int) {
    borrowBook(bookId: $bookId, days: $days) {
      success
      message
      loan {
        id
        dueDate
      }
    }
  }
`;

export const GET_MY_LOANS = gql`
  query GetMyLoans {
    myLoans {
      id
      book {
        id
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
`;

export const RETURN_BOOK = gql`
  mutation ReturnBook($loanId: Int!) {
    returnBook(loanId: $loanId) {
      success
      message
    }
  }
`;

export const CREATE_BOOK = gql`
  mutation CreateBook(
    $title: String!
    $author: String!
    $isbn: String!
    $description: String
    $category: String
    $totalCopies: Int
    $availableCopies: Int
  ) {
    createBook(
      title: $title
      author: $author
      isbn: $isbn
      description: $description
      category: $category
      totalCopies: $totalCopies
      availableCopies: $availableCopies
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
`;

export const GET_ALL_LOANS = gql`
  query GetAllLoans {
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
`;
