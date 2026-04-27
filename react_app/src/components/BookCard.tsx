import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  isAdmin: boolean;
  onBorrow: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, isAdmin, onBorrow }) => {
  return (
    <div className="book-card">
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
        <div className="pdf-buttons">
          <button
            onClick={() => window.open(book.pdfUrl, '_blank')}
            className="btn-secondary"
          >
            📄 View PDF
          </button>
          <button
            onClick={() => window.open(book.pdfDownloadUrl, '_blank')}
            className="btn-secondary"
          >
            ⬇️ Download
          </button>
        </div>
      )}

      {isAdmin && (
        <Link
          to={`/admin/edit-book/${book.id}`}
          className="edit-book-link"
        >
          ✏️ Edit Book
        </Link>
      )}

      <button
        onClick={() => onBorrow(book.id)}
        className="btn-primary btn-borrow"
        disabled={book.availableCopies === 0}
      >
        {book.availableCopies > 0 ? 'Borrow Book' : 'Not Available'}
      </button>
    </div>
  );
};

export default BookCard;
