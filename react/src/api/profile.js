import instance from './axios';

export async function getProfile() {
  const response = await instance.get('/api/profile/');
  return response.data;
}
