import { fetchAllDeposits, fetchDepositsCount, updateDepositStatus, fetchUserTotalDepositAmount, type DepositQueryParams } from '../api/adminApi';

export const getAllDeposits = async (params?: DepositQueryParams) => {
  try {
    return await fetchAllDeposits(params);
  } catch (error) {
    throw error;
  }
};

export const updateDeposit = async (depositId: string, status: string) => {
  try {
    return await updateDepositStatus(depositId, status);
  } catch (error) {
    throw error;
  }
};

export const getDepositsCount = async () => {
    return await fetchDepositsCount();
  };

export const getUserTotalDepositAmount = async (userId: number) => {
  try {
    return await fetchUserTotalDepositAmount(userId);
  } catch (error) {
    throw error;
  }
};