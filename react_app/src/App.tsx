import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { Toaster } from 'react-hot-toast';
import client from './apollo/client';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import MyLoans from './pages/MyLoans';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import AllLoans from './pages/AllLoans';
import './App.css';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      <div className="app-container">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Protected routes - All authenticated users */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-loans"
            element={
              <ProtectedRoute>
                <MyLoans />
              </ProtectedRoute>
            }
          />

          {/* Admin only routes */}
          <Route
            path="/admin/add-book"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-book/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <EditBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/all-loans"
            element={
              <ProtectedRoute requiredRole="admin">
                <AllLoans />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'toast-notification',
              success: {
                className: 'toast-success',
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                className: 'toast-error',
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                className: 'toast-loading',
              },
            }}
          />
          <AppContent />
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
