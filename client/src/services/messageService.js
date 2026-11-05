import api from './api';

export const getMessagesBySwapId = async (swapId) => {
  const response = await api.get(`/messages/${swapId}`);
  return response.data;
};

export const sendMessage = async (swapId, message) => {
  const response = await api.post(`/messages/${swapId}`, { message });
  return response.data;
};
