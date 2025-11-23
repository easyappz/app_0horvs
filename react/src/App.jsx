import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { ChatPage } from './components/Chat';
import { RegisterPage } from './components/Auth/Register';
import { LoginPage } from './components/Auth/Login';
import { ProfilePage } from './components/Profile';
import { initAuthFromStorage, clearAuth } from './api/authStorage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const navigate = useNavigate();

  /** Никогда не удаляй этот код */
  useEffect(() => {
    const { token, username } = initAuthFromStorage();

    if (token) {
      setIsAuthenticated(true);
      if (username) {
        setCurrentUsername(username);
      }
    }

    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/profile']);
    }
  }, []);

  const handleAuthSuccess = (username) => {
    setIsAuthenticated(true);
    if (username) {
      setCurrentUsername(username);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setCurrentUsername('');
    navigate('/login');
  };

  return (
    <div data-easytag="id1-src/App.jsx" className="app-root">
      <ErrorBoundary>
        <div className="app-layout">
          <header className="app-header">
            <div className="app-header-inner">
              <div className="app-logo">Групповой чат</div>
              <nav className="app-nav">
                <Link className="app-nav-link" to="/">
                  Главная
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link className="app-nav-link" to="/profile">
                      Профиль
                    </Link>
                    {currentUsername ? (
                      <span className="app-nav-username">{currentUsername}</span>
                    ) : null}
                    <button
                      type="button"
                      className="app-nav-button"
                      onClick={handleLogout}
                    >
                      Выход
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="app-nav-link" to="/register">
                      Регистрация
                    </Link>
                    <Link className="app-nav-link" to="/login">
                      Вход
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          <main className="app-main">
            <div className="app-container">
              <Routes>
                <Route path="/" element={<ChatPage />} />
                <Route
                  path="/register"
                  element={<RegisterPage onAuthSuccess={handleAuthSuccess} />}
                />
                <Route
                  path="/login"
                  element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
                />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </div>
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );
}

export default App;
