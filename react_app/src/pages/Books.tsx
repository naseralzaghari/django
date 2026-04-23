import React from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { GET_AVAILABLE_BOOKS, BORROW_BOOK } from '../apollo/queries';
import { useAuth } from '../auth/AuthContext';
import './Books.css';
import { Book } from '../types';
import './Books.css';

const Books: React.FC = () => {
  const { isAdmin } = useAuth();
  const { data, loading, error, refetch } = useQuery<{ availableBooks: Book[] }>(GET_AVAILABLE_BOOKS);
  const [borrowBook] = useMutation(BORROW_BOOK, {
    onCompleted: () => {
      alert('Book borrowed successfully!');
      refetch();
    },
    onError: (err: any) => {
      alert(`Error: ${err.message}`);
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
            <div key={book.id} className="book-card">
              <div className="book-header">
                <h3>{book.title}</h3>
                <span className="book-author">by {book.author}</span>
              </div>
              <div className="book-details">
                <p><strong>ISBN:</strong> {book.isbn}</p>
                {book.category && <p><strong>Category:</strong> {book.category}</p>}
                <p><strong>Available:</strong> {book.availableCopies} / {book.totalCopies}</p>
              </div>
              
              {book.hasPdf && (
                <div className="pdf-buttons" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={() => window.open(book.pdfUrl, '_blank')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '14px' }}
                  >
                    📄 View PDF
                  </button>
                  <button
                    onClick={() => window.open(book.pdfDownloadUrl, '_blank')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '14px' }}
                  >
                    ⬇️ Download
                  </button>
                </div>
              )}
              
              {isAdmin && (
                <Link 
                  to={`/admin/edit-book/${book.id}`}
                  style={{ 
                    display: 'block',
                    textAlign: 'center',
                    padding: '8px',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    color: '#374151',
                    textDecoration: 'none',
                    marginBottom: '8px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  ✏️ Edit Book
                </Link>
              )}
              
              <button
                onClick={() => handleBorrow(book.id)}
                className="btn-primary btn-borrow"
                disabled={book.availableCopies === 0}
              >
                {book.availableCopies > 0 ? 'Borrow Book' : 'Not Available'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;
