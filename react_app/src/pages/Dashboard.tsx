import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.firstName || user?.username}!</h1>
        <p className="user-role">
          Role: <span className={isAdmin ? 'admin-badge' : 'user-badge'}>
            {user?.userType}
          </span>
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Available to all users */}
        <Link to="/books" className="dashboard-card">
          <div className="card-icon">📚</div>
          <h3>Browse Books</h3>
          <p>View all available books in the library</p>
        </Link>

        <Link to="/my-loans" className="dashboard-card">
          <div className="card-icon">📖</div>
          <h3>My Loans</h3>
          <p>View your borrowed books and due dates</p>
        </Link>

        {/* Admin only */}
        {isAdmin && (
          <>
            <Link to="/admin/add-book" className="dashboard-card admin-card">
              <div className="card-icon">➕</div>
              <h3>Add New Book</h3>
              <p>Add books to the library collection</p>
            </Link>

            <Link to="/admin/all-loans" className="dashboard-card admin-card">
              <div className="card-icon">📋</div>
              <h3>All Loans</h3>
              <p>View all active and overdue loans</p>
            </Link>
          </>
        )}
      </div>

      <div className="features-section">
        <h2>What you can do:</h2>
        <ul>
          <li>✅ Browse available books</li>
          <li>✅ Borrow books for 14 days</li>
          <li>✅ Return borrowed books</li>
          <li>✅ View your loan history</li>
          {isAdmin && (
            <>
              <li>🔧 Add and manage books (Admin)</li>
              <li>🔧 View all user loans (Admin)</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
