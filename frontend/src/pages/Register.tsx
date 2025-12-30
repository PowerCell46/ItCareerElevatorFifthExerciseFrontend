import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateUsername, validateEmail, validatePassword } from '../utils/validation';
import '../styles/auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (usernameError || emailError || passwordError) {
      setErrors({
        username: usernameError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({ username, email, password });
      navigate('/messenger');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || error.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <form className="auth-card-container" onSubmit={handleSubmit}>
        <div className="header-section">
          <i className="fa-solid fa-user-plus"></i>
          <h1>Register</h1>
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

          <div style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
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
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
