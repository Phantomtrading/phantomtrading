import {
  fetchAllCryptocurrencies,
  fetchCryptocurrencyById,
  createCryptocurrency,
  updateCryptocurrency,
  deleteCryptocurrency,
  type Cryptocurrency,
  type CreateCryptoRequest,
} from '../api/adminApi';

export const cryptoKeys = {
  all: ['cryptocurrencies'] as const,
  lists: () => [...cryptoKeys.all, 'list'] as const,
  details: () => [...cryptoKeys.all, 'detail'] as const,
  detail: (id: number) => [...cryptoKeys.details(), id] as const,
};

export const getAllCryptocurrencies = async () => {
  return await fetchAllCryptocurrencies();
};

export const getCryptocurrencyById = async (id: number) => {
  return await fetchCryptocurrencyById(id);
};

export const createNewCryptocurrency = async (data: CreateCryptoRequest) => {
  return await createCryptocurrency(data);
};

export const updateExistingCryptocurrency = async (id: number, data: CreateCryptoRequest) => {
  return await updateCryptocurrency(id, data);
};

export const removeCryptocurrency = async (id: number) => {
  return await deleteCryptocurrency(id);
};

export type { Cryptocurrency, CreateCryptoRequest }; 