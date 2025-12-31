import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateUsername, validatePassword } from '../utils/validation';
import '../styles/auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      setErrors({
        username: usernameError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ username, password });
      navigate('/messenger');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || error.message || 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <form className="auth-card-container" onSubmit={handleSubmit}>
        <div className="header-section">
          <i className="fa-solid fa-user"></i>
          <h1>Login</h1>
        </div>

        <div className="main-section" style={{ width: '50%' }}>
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className="password-input-wrapper" style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <i
              className="fa-solid fa-eye"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              style={{ cursor: 'pointer' }}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          {errors.general && (
            <div className="error-message" style={{ width: '100%', maxWidth: '300px' }}>
              {errors.general}
            </div>
          )}
        </div>

        <div className="footer-section">
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
