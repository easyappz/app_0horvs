import instance from './axios';

export async function fetchMessages() {
  const response = await instance.get('/api/messages/');
  return response.data;
}

export async function sendMessage(text) {
  const response = await instance.post('/api/messages/', {
    text,
  });

  return response.data;
}
