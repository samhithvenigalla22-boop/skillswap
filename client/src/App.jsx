import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';

// Layout
import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';

// 18 Application Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ExploreSkillsPage from './pages/ExploreSkillsPage';
import SkillDetailsPage from './pages/SkillDetailsPage';
import MyProfilePage from './pages/MyProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ManageSkillsPage from './pages/ManageSkillsPage';
import SkillMatchesPage from './pages/SkillMatchesPage';
import SwapRequestsPage from './pages/SwapRequestsPage';
import ActiveSwapsPage from './pages/ActiveSwapsPage';
import MessagesPage from './pages/MessagesPage';
import SessionSchedulingPage from './pages/SessionSchedulingPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <BrowserRouter>
              <Routes>
                {/* Main App Layout with Navbar & Footer */}
                <Route path="/" element={<AppLayout />}>
                  {/* Public Pages */}
                  <Route index element={<LandingPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="explore" element={<ExploreSkillsPage />} />
                  <Route path="skills/:id" element={<SkillDetailsPage />} />

                  {/* Protected Member Pages */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <MyProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile/edit"
                    element={
                      <ProtectedRoute>
                        <EditProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="manage-skills"
                    element={
                      <ProtectedRoute>
                        <ManageSkillsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="matches"
                    element={
                      <ProtectedRoute>
                        <SkillMatchesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="swap-requests"
                    element={
                      <ProtectedRoute>
                        <SwapRequestsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="active-swaps"
                    element={
                      <ProtectedRoute>
                        <ActiveSwapsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="messages"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="messages/:swapId"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="sessions"
                    element={
                      <ProtectedRoute>
                        <SessionSchedulingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reviews"
                    element={
                      <ProtectedRoute>
                        <ReviewsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Page */}
                  <Route
                    path="admin"
                    element={
                      <AdminRoute>
                        <AdminDashboardPage />
                      </AdminRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
