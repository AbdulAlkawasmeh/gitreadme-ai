import React, { useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './Homepage';
import Dashboard from './Dashboard';
import ReadmePage from './Readme';
// src/App.jsx

const ClerkProtectedRoute = ({ children }) => (
  <>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
    <SignedIn>
      {children}
    </SignedIn>
  </>
);

function AuthWatcher() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return null;
}

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <AuthWatcher />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/readme" element={<ReadmePage />} />
          <Route path="/dashboard" element={
            <ClerkProtectedRoute>
              <Dashboard />
            </ClerkProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}
