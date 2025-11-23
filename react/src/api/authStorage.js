import instance from './axios';

const TOKEN_KEY = 'authToken';
const USERNAME_KEY = 'authUsername';

export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

export function getUsername() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(USERNAME_KEY);
  } catch (error) {
    return null;
  }
}

export function setAuth(token, username) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      if (username) {
        window.localStorage.setItem(USERNAME_KEY, username);
      }
    } catch (error) {
      // ignore storage errors
    }
  }

  instance.defaults.headers.common.Authorization = 'Bearer ' + token;
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USERNAME_KEY);
    } catch (error) {
      // ignore storage errors
    }
  }

  if (
    instance &&
    instance.defaults &&
    instance.defaults.headers &&
    instance.defaults.headers.common
  ) {
    delete instance.defaults.headers.common.Authorization;
  }
}

export function initAuthFromStorage() {
  const token = getToken();
  const username = getUsername();

  if (token) {
    instance.defaults.headers.common.Authorization = 'Bearer ' + token;
  }

  return { token, username };
}
