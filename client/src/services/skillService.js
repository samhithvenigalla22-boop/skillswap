import api from './api';

export const getSkills = async (params = {}) => {
  const response = await api.get('/skills', { params });
  return response.data;
};

export const getSkillById = async (id) => {
  const response = await api.get(`/skills/${id}`);
  return response.data;
};

export const getMySkills = async () => {
  const response = await api.get('/skills/my-skills');
  return response.data;
};

export const createSkill = async (skillData) => {
  const response = await api.post('/skills', skillData);
  return response.data;
};

export const updateSkill = async (id, skillData) => {
  const response = await api.put(`/skills/${id}`, skillData);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await api.delete(`/skills/${id}`);
  return response.data;
};
