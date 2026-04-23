import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_LOANS } from '../apollo/queries';
import { BookLoan } from '../types';
import './AdminPages.css';

const AllLoans: React.FC = () => {
  const { data, loading, error } = useQuery<{ allLoans: BookLoan[] }>(GET_ALL_LOANS);

  if (loading) return <div className="loading">Loading loans...</div>;
  if (error) return <div className="error">Error loading loans: {error.message}</div>;

  const loans = data?.allLoans || [];
  
  // Separate active and returned loans
  const activeLoans = loans.filter(loan => loan.status.toLowerCase() !== 'returned');
  const returnedLoans = loans.filter(loan => loan.status.toLowerCase() === 'returned');

  return (
    <div className="admin-page">
      <h1>All Loans</h1>
      <p>{loans.length} total loans ({activeLoans.length} active, {returnedLoans.length} returned)</p>

      {/* Active Loans Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Active Loans ({activeLoans.length})</h2>
        {activeLoans.length === 0 ? (
          <p className="empty-state">No active loans.</p>
        ) : (
          <div className="loans-table-container">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan: any) => (
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
                    <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${loan.status}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Loan History Section */}
      <section>
        <h2>Loan History ({returnedLoans.length})</h2>
        {returnedLoans.length === 0 ? (
          <p className="empty-state">No returned loans yet.</p>
        ) : (
          <div className="loans-table-container">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Borrowed Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {returnedLoans.map((loan: any) => (
                  <tr key={loan.id}>
                    <td>
                      <div>{loan.user.username}</div>
                      <small>{loan.user.email}</small>
                    </td>
                    <td>
                      <div>{loan.book.title}</div>
                      <small>by {loan.book.author}</small>
                    </td>
                    <td>{new Date(loan.borrowedDate).toLocaleDateString()}</td>
                    <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${loan.status}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllLoans;
