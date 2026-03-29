import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider, useAuth } from './utils/authContext';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import IdeaDetail from './pages/IdeaDetail';
import AddIdea from './pages/AddIdea';
import EditIdea from './pages/EditIdea';
import MyIdeas from './pages/MyIdeas';
import MyCommentedIdeas from './pages/MyCommentedIdeas';
import UsersManagement from './pages/admin/UsersManagement';
import IdeasManagement from './pages/admin/IdeasManagement';
import CommentsManagement from './pages/admin/CommentsManagement';
import AdminManagement from './pages/admin/AdminManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import LandingPage from './pages/LandingPage';

// Protected Route Component - for authenticated users only
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Auth Route Component - for non-authenticated users only
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// App Routes Component
const AppRoutes = () => {
  const { logout } = useAuth();

  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route
        path="/"
        element={
          <AuthRoute>
            <LandingPage />
          </AuthRoute>
        }
      />

      {/* Auth Routes - No Layout */}
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        }
      />
      <Route path="/login" element={<Navigate to="/auth" replace />} />

      {/* Protected Routes - With Layout and Sidebar */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout onLogout={logout}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-ideas" element={<MyIdeas />} />
                <Route path="/my-commented-ideas" element={<MyCommentedIdeas />} />
                <Route path="/ideas/new" element={<AddIdea />} />
                <Route path="/ideas/:id/edit" element={<EditIdea />} />
                <Route path="/ideas/:id" element={<IdeaDetail />} />
                
                {/* Admin Routes */}
                <Route path="/admin/users" element={<UsersManagement />} />
                <Route path="/admin/ideas" element={<IdeasManagement />} />
                <Route path="/admin/posts" element={<CommentsManagement />} />
                <Route path="/admin/categories" element={<CategoriesManagement />} />
                <Route path="/admin/admins" element={<AdminManagement />} />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;