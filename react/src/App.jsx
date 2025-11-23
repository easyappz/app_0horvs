import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { ChatPage } from './components/Chat';
import { RegisterPage } from './components/Auth/Register';
import { LoginPage } from './components/Auth/Login';
import { ProfilePage } from './components/Profile';

function App() {
  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(['/', '/register', '/login', '/profile']);
    }
  }, []);

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
                <Link className="app-nav-link" to="/register">
                  Регистрация
                </Link>
                <Link className="app-nav-link" to="/login">
                  Вход
                </Link>
                <Link className="app-nav-link" to="/profile">
                  Профиль
                </Link>
              </nav>
            </div>
          </header>

          <main className="app-main">
            <div className="app-container">
              <Routes>
                <Route path="/" element={<ChatPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
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
