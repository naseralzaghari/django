import React from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { GET_AVAILABLE_BOOKS, BORROW_BOOK } from '../apollo/queries';
import { useAuth } from '../auth/AuthContext';
import { Book } from '../types';
import BookCard from '../components/BookCard';
import './Books.css';

const Books: React.FC = () => {
  const { isAdmin } = useAuth();
  const { data, loading, error } = useQuery<{ availableBooks: Book[] }>(GET_AVAILABLE_BOOKS);
  const [borrowBook] = useMutation(BORROW_BOOK, {
    refetchQueries: [{ query: GET_AVAILABLE_BOOKS }],
    onCompleted: () => {
      toast.success('Book borrowed successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const handleBorrow = async (bookId: string) => {
    if (window.confirm('Do you want to borrow this book for 14 days?')) {
      await borrowBook({ variables: { bookId: parseInt(bookId), days: 14 } });
    }
  };

  if (loading) return <div className="loading">Loading books...</div>;
  if (error) return <div className="error">Error loading books: {error.message}</div>;

  const books: Book[] = data?.availableBooks || [];

  return (
    <div className="books-page">
      <div className="page-header">
        <h1>Available Books</h1>
        <p>{books.length} books available for borrowing</p>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books available at the moment.</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isAdmin={isAdmin}
              onBorrow={handleBorrow}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;
