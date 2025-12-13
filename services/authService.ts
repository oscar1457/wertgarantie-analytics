import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { User, Session, UserSettings } from '../types';

const USERS_STORAGE_KEY = 'wertgarantie_users';
const SESSION_STORAGE_KEY = 'wertgarantie_session';
const ENCRYPTION_KEY = 'wertgarantie_secure_key_2025'; // En producción, esto debería ser más seguro

// Encrypt data
export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

// Decrypt data
export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Get all users (encrypted)
const getUsers = (): User[] => {
  try {
    const encrypted = localStorage.getItem(USERS_STORAGE_KEY);
    if (!encrypted) return [];

    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// Save users (encrypted)
const saveUsers = (users: User[]): void => {
  try {
    const json = JSON.stringify(users);
    const encrypted = encryptData(json);
    localStorage.setItem(USERS_STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Register new user
export const registerUser = async (
  username: string,
  password: string,
  settings: UserSettings
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const users = getUsers();

    // Check if username already exists
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username already exists' };
    }

    // Validate password strength
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser: User = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      passwordHash,
      createdAt: Date.now(),
      settings
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'User registered successfully', user: newUser };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

// Login user
export const loginUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; message: string; session?: Session }> => {
  try {
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Create session
    const session: Session = {
      userId: user.id,
      username: user.username,
      isAuthenticated: true,
      settings: user.settings
    };

    // Save session
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    return { success: true, message: 'Login successful', session };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
};

// Get current session
export const getCurrentSession = (): Session | null => {
  try {
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) return null;

    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Logout
export const logout = (): void => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

// Update user settings
export const updateUserSettings = (userId: string, settings: UserSettings): boolean => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) return false;

    users[userIndex].settings = settings;
    saveUsers(users);

    // Update session
    const session = getCurrentSession();
    if (session && session.userId === userId) {
      session.settings = settings;
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

// Check if any users exist
export const hasUsers = (): boolean => {
  return getUsers().length > 0;
};

// Get user by ID
export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

// Delete user
export const deleteUser = (userId: string): boolean => {
  try {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);

    if (filtered.length === users.length) return false;

    saveUsers(filtered);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};
