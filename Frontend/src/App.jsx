import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Homepage from './pages/homepage'
import LoginSignup from './pages/loginSignup'
import Learningpage from './pages/learningpage'
import Mentorpage from './pages/mentorpage'
import Profile from './pages/Profile'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navebar from './components/navebar'
import Footer from './components/Footer'
import { AnimatePresence } from 'framer-motion'

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/mentor" element={<Mentorpage />} />
        <Route path="/learning" element={
          <ProtectedRoute>
            <Learningpage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      <AuthProvider>
        <Navebar />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <Footer />
      </AuthProvider>
    </div>
  )
}

export default App
