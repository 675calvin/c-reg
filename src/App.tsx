import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import './styles/themes.css';

// Components
import Dashboard from "./components/Dashboard";
import AddCorrespondence from "./components/AddCorrespondence";
import CorrespondenceDetail from "./components/CorrespondenceDetail";
import UserSettings from "./components/UserSettings";
import WelcomeScreen from "./components/WelcomeScreen";
import SignIn from "./components/SignIn";
import BottomTabBar from "./components/BottomTabBar";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'jungle'>('light');

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setTheme(userData.preferences?.theme || 'light');
        }
      });
      return () => unsubscribe();
    } else {
      setTheme('light');
    }
  }, [user]);

  return (
    <div className={`app flex flex-col min-h-screen theme-${theme}`}>
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/add-correspondence" element={
            <ProtectedRoute>
              <AddCorrespondence />
            </ProtectedRoute>
          } />
          <Route path="/correspondence/:id" element={
            <ProtectedRoute>
              <CorrespondenceDetail />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {user && <BottomTabBar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;