import instance from './axios';

export async function register(username, password) {
  const response = await instance.post('/api/register/', {
    username,
    password,
  });

  return response.data;
}

export async function login(username, password) {
  const response = await instance.post('/api/login/', {
    username,
    password,
  });

  return response.data;
}
