import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_LOANS } from '../apollo/queries';
import { BookLoan } from '../types';
import LoansTable from '../components/LoansTable';
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
          <LoansTable loans={activeLoans} />
        )}
      </section>

      {/* Loan History Section */}
      <section>
        <h2>Loan History ({returnedLoans.length})</h2>
        {returnedLoans.length === 0 ? (
          <p className="empty-state">No returned loans yet.</p>
        ) : (
          <LoansTable loans={returnedLoans} showReturnDate />
        )}
      </section>
    </div>
  );
};

export default AllLoans;
