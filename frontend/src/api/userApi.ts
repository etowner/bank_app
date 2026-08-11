import type { User } from '../lib/types';
import api from './axiosConfig';

export const getUser = async () => {
  const response = await api.get<User>('/api/v1/user');
  return response.data;
};

export const registerUser = async (username: string, password: string) => {
  await api.post(`/api/v1/user/register`, { username, password });
};

export  const loginUser = async (username: string, password: string) => {
  await api.post(`/api/v1/user/login`, { username, password }); 
};

export const logoutUser = async() => {
  await api.post('/logout');
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  await api.put(`/api/v1/user/change-password`, { currentPassword, newPassword });
};

export const changeUsername = async (currentPassword: string, newUsername: string) => {
  await api.put(`/api/v1/user/change-username`, { currentPassword, newUsername });
};

export const deleteUser = async () => {
  await api.delete('/api/v1/user');
};

