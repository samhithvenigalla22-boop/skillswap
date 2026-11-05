import api from './api';

export const createSwapRequest = async (requestData) => {
  const response = await api.post('/swaps/request', requestData);
  return response.data;
};

export const getSentRequests = async () => {
  const response = await api.get('/swaps/sent');
  return response.data;
};

export const getReceivedRequests = async () => {
  const response = await api.get('/swaps/received');
  return response.data;
};

export const getActiveSwaps = async (status = 'Active') => {
  const response = await api.get('/swaps/active', { params: { status } });
  return response.data;
};

export const getSwapById = async (id) => {
  const response = await api.get(`/swaps/${id}`);
  return response.data;
};

export const acceptSwapRequest = async (id) => {
  const response = await api.put(`/swaps/${id}/accept`);
  return response.data;
};

export const rejectSwapRequest = async (id) => {
  const response = await api.put(`/swaps/${id}/reject`);
  return response.data;
};

export const cancelSwapRequest = async (id) => {
  const response = await api.put(`/swaps/${id}/cancel`);
  return response.data;
};

export const completeSwap = async (id) => {
  const response = await api.put(`/swaps/${id}/complete`);
  return response.data;
};
