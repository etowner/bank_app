import type { Account } from '../lib/types';
import api from './axiosConfig';

export const getAccount = async (accountNumber: string) => {
  const response = await api.get<Account>(`/api/v1/account/${accountNumber}`);
  // console.log("getAccount response:", response);
  return response.data;
};

export const createAccount = async (type: string) => {
  const response = await api.post<Account>(`/api/v1/account/open/${type}`);
  // console.log("createAccount response:", response);
  return response.data;
};

export const deleteAccount = async (accountNumber: string) => {
  await api.delete(`/api/v1/account/${accountNumber}/close`);
};

export const deleteAllAccounts = async () => {
  await api.delete('/api/v1/account/close-all');
}