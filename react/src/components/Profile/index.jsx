import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../api/profile';
import { getToken } from '../../api/authStorage';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (isMounted) {
          setProfile(data);
          setError('');
        }
      } catch (errorResponse) {
        if (!isMounted) {
          return;
        }

        setError('Не удалось загрузить профиль');

        if (
          errorResponse &&
          errorResponse.response &&
          errorResponse.response.status === 401
        ) {
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div
      data-easytag="id1-src/components/Profile/index.jsx"
      className="page page-profile"
    >
      <h1 className="page-title">Профиль пользователя</h1>

      {loading && <p className="page-subtitle">Загрузка профиля...</p>}

      {!loading && error && <div className="form-error">{error}</div>}

      {!loading && !error && profile && (
        <div className="profile-card">
          <div className="profile-row">
            <span className="profile-label">Имя пользователя:</span>
            <span className="profile-value">{profile.username}</span>
          </div>

          {profile.created_at && (
            <div className="profile-row">
              <span className="profile-label">Дата регистрации:</span>
              <span className="profile-value">{profile.created_at}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
