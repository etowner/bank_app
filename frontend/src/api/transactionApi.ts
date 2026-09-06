import api from './axiosConfig';
import type { Account, Transaction } from '../lib/types';

export const getTransactions = async (accountNumber: string) => {
  const response = await api.get<Transaction[]>(`/api/v1/account/${accountNumber}/transactions`);
//   console.log("getTransactions response:", response);
  return response.data;
};

export const deposit = async (accountNumber: string, amount: number) => {
    const response = await api.post<Account>(
        `/api/v1/account/${accountNumber}/deposit`, amount,
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
};

export const withdraw = async (accountNumber: string, amount: number) => {
    const response = await api.post<Account>(
        `/api/v1/account/${accountNumber}/withdraw`, amount ,
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
};

export const transfer = async (accountNumber1: string, accountNumber2: string, amount: number) => {
    await api.post(
        `/api/v1/account/transfer`, { accountNumber1, accountNumber2, amount},
        { headers: { "Content-Type": "application/json" } }
    );
}