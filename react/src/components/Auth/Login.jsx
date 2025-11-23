import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { setAuth } from '../../api/authStorage';

export const LoginPage = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(username, password);
      const token = data && data.token ? data.token : '';
      const name = data && data.username ? data.username : username;

      if (token) {
        setAuth(token, name);
        if (typeof onAuthSuccess === 'function') {
          onAuthSuccess(name);
        }
        navigate('/');
      } else {
        setError('Некорректный ответ сервера');
      }
    } catch (errorResponse) {
      let message = 'Ошибка входа';
      const responseData = errorResponse && errorResponse.response && errorResponse.response.data;

      if (responseData && typeof responseData.detail === 'string') {
        message = responseData.detail;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      data-easytag="id1-src/components/Auth/Login.jsx"
      className="page page-login"
    >
      <h1 className="page-title">Вход</h1>
      <p className="page-subtitle">
        Войдите в свой аккаунт, чтобы использовать групповой чат.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="login-username">
            Имя пользователя
          </label>
          <input
            id="login-username"
            type="text"
            className="form-input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="login-password">
            Пароль
          </label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="form-button" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};
