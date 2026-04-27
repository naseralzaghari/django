import React from 'react';
import { useAuth } from '../auth/AuthContext';
import DashboardCard from '../components/DashboardCard';
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
        <DashboardCard to="/books" icon="📚" title="Browse Books" description="View all available books in the library" />
        <DashboardCard to="/my-loans" icon="📖" title="My Loans" description="View your borrowed books and due dates" />
        {isAdmin && (
          <>
            <DashboardCard to="/admin/add-book" icon="➕" title="Add New Book" description="Add books to the library collection" isAdminCard />
            <DashboardCard to="/admin/all-loans" icon="📋" title="All Loans" description="View all active and overdue loans" isAdminCard />
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
