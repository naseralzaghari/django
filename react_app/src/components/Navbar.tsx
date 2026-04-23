import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Navbar.css';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  console.log('Navbar - User:', user);
  console.log('Navbar - isAdmin:', isAdmin);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📚 Library System
        </Link>
        
        {user && (
          <>
            <div className="navbar-links">
              <Link to="/">Dashboard</Link>
              <Link to="/books">Books</Link>
              <Link to="/my-loans">My Loans</Link>
              {isAdmin && (
                <>
                  <Link to="/admin/add-book">Add Book</Link>
                  <Link to="/admin/all-loans">All Loans</Link>
                </>
              )}
            </div>
            
            <div className="navbar-user">
              <span className="user-name">
                {user.username}
                <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                  {user.userType}
                </span>
              </span>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
