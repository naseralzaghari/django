import React from 'react';
import { BookLoan } from '../types';
import StatusBadge from './StatusBadge';

interface LoansTableProps {
  loans: BookLoan[];
  /** When true, shows "Return Date" column instead of "Due Date" */
  showReturnDate?: boolean;
}

const LoansTable: React.FC<LoansTableProps> = ({ loans, showReturnDate = false }) => {
  return (
    <div className="loans-table-container">
      <table className="loans-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Book</th>
            <th>Borrowed Date</th>
            <th>{showReturnDate ? 'Return Date' : 'Due Date'}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan: any) => (
            <tr key={loan.id} className={loan.status === 'overdue' ? 'overdue-row' : ''}>
              <td>
                <div>{loan.user.username}</div>
                <small>{loan.user.email}</small>
              </td>
              <td>
                <div>{loan.book.title}</div>
                <small>by {loan.book.author}</small>
              </td>
              <td>{new Date(loan.borrowedDate).toLocaleDateString()}</td>
              <td>
                {showReturnDate
                  ? (loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'N/A')
                  : new Date(loan.dueDate).toLocaleDateString()
                }
              </td>
              <td>
                <StatusBadge status={loan.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoansTable;
