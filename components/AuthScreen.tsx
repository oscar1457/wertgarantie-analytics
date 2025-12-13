import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, UserPlus, Shield } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { Session, Language, Theme } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (session: Session) => void;
  defaultLang: Language;
  defaultTheme: Theme;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, defaultLang, defaultTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    es: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      username: 'Usuario',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      createAccount: 'Crear cuenta',
      signIn: 'Ingresar',
      welcome: 'Bienvenido',
      secureAccess: 'Acceso seguro a tus análisis',
      passwordMismatch: 'Las contraseñas no coinciden',
      fillFields: 'Por favor completa todos los campos'
    },
    en: {
      login: 'Login',
      register: 'Register',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create account',
      signIn: 'Sign in',
      welcome: 'Welcome',
      secureAccess: 'Secure access to your analytics',
      passwordMismatch: 'Passwords do not match',
      fillFields: 'Please fill all fields'
    },
    de: {
      login: 'Anmelden',
      register: 'Registrieren',
      username: 'Benutzername',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      noAccount: 'Noch kein Konto?',
      hasAccount: 'Bereits ein Konto?',
      createAccount: 'Konto erstellen',
      signIn: 'Einloggen',
      welcome: 'Willkommen',
      secureAccess: 'Sicherer Zugriff auf Ihre Analysen',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      fillFields: 'Bitte füllen Sie alle Felder aus'
    }
  };

  const t = translations[defaultLang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t.fillFields);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await loginUser(username, password);
        if (result.success && result.session) {
          onAuthSuccess(result.session);
        } else {
          setError(result.message);
        }
      } else {
        const result = await registerUser(username, password, {
          language: defaultLang,
          theme: defaultTheme,
          privateMode: false
        });
        if (result.success && result.user) {
          // Auto login after registration
          const loginResult = await loginUser(username, password);
          if (loginResult.success && loginResult.session) {
            onAuthSuccess(loginResult.session);
          }
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t.welcome}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t.secureAccess}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.login}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.username}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                  placeholder="usuario123"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (only for registration) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  {t.signIn}
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  {t.createAccount}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            WertGarantie Analytics © 2025
          </p>
        </div>
      </div>
    </div>
  );
};
