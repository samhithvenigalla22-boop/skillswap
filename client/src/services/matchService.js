import api from './api';

export const getMatches = async () => {
  const response = await api.get('/matches');
  return response.data;
};

export const getMatchWithUser = async (userId) => {
  const response = await api.get(`/matches/${userId}`);
  return response.data;
};
