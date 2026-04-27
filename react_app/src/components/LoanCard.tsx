import React from 'react';
import { BookLoan } from '../types';
import StatusBadge from './StatusBadge';

interface LoanCardProps {
  loan: BookLoan;
  onReturn: (loanId: string) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onReturn }) => {
  return (
    <div className={`loan-card ${loan.isOverdue ? 'overdue' : ''}`}>
      <div className="loan-header">
        <h3>{loan.book.title}</h3>
        <StatusBadge status={loan.status} />
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
        onClick={() => onReturn(loan.id)}
        className="btn-primary btn-return"
      >
        Return Book
      </button>
    </div>
  );
};

export default LoanCard;
