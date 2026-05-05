import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE = 'http://localhost:5001/api';

const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
};

export const api = {
  // Projects
  getProjects: async () => {
    const headers = await getHeaders();
    return axios.get(`${API_BASE}/projects`, { headers });
  },
  createProject: async (projectData) => {
    const headers = await getHeaders();
    return axios.post(`${API_BASE}/projects`, projectData, { headers });
  },
  addProjectMember: async (projectId, userId, role) => {
    const headers = await getHeaders();
    return axios.post(`${API_BASE}/projects/${projectId}/members`, { user_id: userId, role }, { headers });
  },
  removeProjectMember: async (projectId, userId) => {
    const headers = await getHeaders();
    return axios.delete(`${API_BASE}/projects/${projectId}/members/${userId}`, { headers });
  },

  // Tasks
  getTasks: async (projectId) => {
    const headers = await getHeaders();
    return axios.get(`${API_BASE}/projects/${projectId}/tasks`, { headers });
  },
  createTask: async (taskData) => {
    const headers = await getHeaders();
    return axios.post(`${API_BASE}/tasks`, taskData, { headers });
  },
  updateTask: async (taskId, updates) => {
    const headers = await getHeaders();
    return axios.patch(`${API_BASE}/tasks/${taskId}`, updates, { headers });
  },
  deleteTask: async (taskId) => {
    const headers = await getHeaders();
    return axios.delete(`${API_BASE}/tasks/${taskId}`, { headers });
  },

  // Users
  updateUserRole: async (userId, role) => {
    const headers = await getHeaders();
    return axios.patch(`${API_BASE}/users/${userId}/role`, { role }, { headers });
  },

  // Stats
  getStats: async () => {
    const headers = await getHeaders();
    return axios.get(`${API_BASE}/stats`, { headers });
  }
};
