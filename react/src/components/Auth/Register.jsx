import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { setAuth } from '../../api/authStorage';

export const RegisterPage = ({ onAuthSuccess }) => {
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
      const data = await register(username, password);
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
      let message = 'Ошибка регистрации';
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
      data-easytag="id1-src/components/Auth/Register.jsx"
      className="page page-register"
    >
      <h1 className="page-title">Регистрация</h1>
      <p className="page-subtitle">
        Создайте новый аккаунт для участия в групповом чате.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="register-username">
            Имя пользователя
          </label>
          <input
            id="register-username"
            type="text"
            className="form-input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="register-password">
            Пароль
          </label>
          <input
            id="register-password"
            type="password"
            className="form-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="form-button" disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};
