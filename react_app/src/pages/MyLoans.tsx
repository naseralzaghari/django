import React from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { GET_MY_LOANS, RETURN_BOOK } from '../apollo/queries';
import { BookLoan } from '../types';
import './MyLoans.css';

const MyLoans: React.FC = () => {
  const { data, loading, error, refetch } = useQuery<{ myLoans: BookLoan[] }>(GET_MY_LOANS);
  const [returnBook] = useMutation(RETURN_BOOK, {
    onCompleted: () => {
      toast.success('Book returned successfully!');
      refetch();
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const handleReturn = async (loanId: string) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      await returnBook({ variables: { loanId: parseInt(loanId) } });
    }
  };

  if (loading) return <div className="loading">Loading your loans...</div>;
  if (error) return <div className="error">Error loading loans: {error.message}</div>;

  const loans: BookLoan[] = data?.myLoans || [];
  const activeLoans = loans.filter(loan => loan.status.toLowerCase() !== 'returned');
  const completedLoans = loans.filter(loan => loan.status.toLowerCase() === 'returned');

  return (
    <div className="my-loans-page">
      <h1>My Borrowed Books</h1>

      <section className="loans-section">
        <h2>Active Loans ({activeLoans.length})</h2>
        {activeLoans.length === 0 ? (
          <p className="empty-state">You have no active loans.</p>
        ) : (
          <div className="loans-grid">
            {activeLoans.map((loan) => (
              <div key={loan.id} className={`loan-card ${loan.isOverdue ? 'overdue' : ''}`}>
                <div className="loan-header">
                  <h3>{loan.book.title}</h3>
                  <span className={`status-badge ${loan.status}`}>{loan.status}</span>
                </div>
                <p className="book-author">by {loan.book.author}</p>
                <div className="loan-dates">
                  <p><strong>Borrowed:</strong> {new Date(loan.borrowedDate).toLocaleDateString()}</p>
                  <p><strong>Due:</strong> {new Date(loan.dueDate).toLocaleDateString()}</p>
                  {loan.isOverdue ? (
                    <p className="overdue-warning">⚠️ {Math.abs(loan.daysUntilDue)} days overdue!</p>
                  ) : (
                    <p className="days-remaining">{loan.daysUntilDue} days remaining</p>
                  )}
                </div>
                <button
                  onClick={() => handleReturn(loan.id)}
                  className="btn-primary btn-return"
                >
                  Return Book
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="loans-section">
        <h2>Loan History ({completedLoans.length})</h2>
        {completedLoans.length === 0 ? (
          <p className="empty-state">No previous loans.</p>
        ) : (
          <div className="history-list">
            {completedLoans.map((loan) => (
              <div key={loan.id} className="history-item">
                <div>
                  <strong>{loan.book.title}</strong>
                  <span className="author"> by {loan.book.author}</span>
                </div>
                <div className="history-dates">
                  <span>Borrowed: {new Date(loan.borrowedDate).toLocaleDateString()}</span>
                  {loan.returnDate && (
                    <span> | Returned: {new Date(loan.returnDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyLoans;
