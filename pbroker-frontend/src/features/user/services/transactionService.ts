import {  processWithdrawal, processTransfer, fetchCryptoOptions, fetchDepositHistory, fetchWithdrawalHistory, fetchTransferHistory,  type WithdrawRequest, type TransferRequest, type CryptoOption, type DepositHistory, type WithdrawalHistory, type TransferHistory, uploadDepositWithProofs, getDepositProofs, addDepositProofs, downloadDepositProof, deleteDepositProof } from '../api/userApi';

// Accepts: { cryptocurrencyId, amount, transactionHash, proofs }
export const handleDeposit = async (data: {
  cryptocurrencyId: number;
  amount: number;
  transactionHash: string;
  proofs: File[];
}) => {
  try {
    return await uploadDepositWithProofs(data);
  } catch (error) {
    throw error;
  }
};

export const handleWithdrawal = async (data: WithdrawRequest) => {
  try {
    return await processWithdrawal(data);
  } catch (error) {
    throw error;
  }
};

export const handleTransfer = async (data: TransferRequest) => {
  try {
    return await processTransfer(data);
  } catch (error) {
    throw error;
  }
};

export const fetchCryptoOptionsService = async (): Promise<CryptoOption[]> => {
  try {
    return await fetchCryptoOptions();
  } catch (error) {
    throw error;
  }
};

export const fetchDepositHistoryService = async (userId: string | number): Promise<DepositHistory[]> => {
  try {
    return await fetchDepositHistory(userId);
  } catch (error) {
    throw error;
  }
};

export const fetchWithdrawalHistoryService = async (userId: string | number): Promise<WithdrawalHistory[]> => {
  try {
    return await fetchWithdrawalHistory(userId);
  } catch (error) {
    throw error;
  }
};

export const fetchTransferHistoryService = async (userId: string | number): Promise<TransferHistory[]> => {
  try {
    const response = await fetchTransferHistory(Number(userId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDepositProofsService = async (depositId: string | number) => {
  return await getDepositProofs(depositId);
};

export const addDepositProofsService = async (depositId: string | number, files: File[]) => {
  return await addDepositProofs(depositId, files);
};

export const downloadDepositProofService = async (depositId: string | number, fileName: string) => {
  return await downloadDepositProof(depositId, fileName);
};

export const deleteDepositProofService = async (depositId: string | number, fileName: string) => {
  return await deleteDepositProof(depositId, fileName);
}; 