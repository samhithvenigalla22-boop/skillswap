import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const updateUserStatus = async (id, isActive) => {
  const response = await api.put(`/admin/users/${id}/status`, { isActive });
  return response.data;
};

export const getAllSkills = async (params = {}) => {
  const response = await api.get('/admin/skills', { params });
  return response.data;
};

export const deleteSkillByAdmin = async (id) => {
  const response = await api.delete(`/admin/skills/${id}`);
  return response.data;
};
