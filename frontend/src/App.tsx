import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Messenger from './pages/Messenger';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <Messenger />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/messenger" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
