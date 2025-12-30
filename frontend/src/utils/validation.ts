// Validation regex patterns matching backend validation
export const USERNAME_PATTERN = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,20}$/;
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return 'Username is required.';
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username must be 5-20 characters, contain letters and digits, with at least one uppercase letter and one digit.';
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'Email must be a valid address (example: user@example.com).';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required.';
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return 'Password must be 8-20 characters, contain letters and digits, with at least one uppercase letter and one digit.';
  }
  return null;
};
