import { Transaction, PredictionResponse } from '../types';

/** Fetch all stored transactions from MongoDB */
export const getAllTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
  return res.json();
};

/** Trigger Etherscan fetch + store for a wallet address */
export const fetchAndStoreTransactions = async (
  address: string,
  network: string = 'sepolia'
): Promise<string> => {
  const res = await fetch(
    `/api/transactions/fetch?address=${encodeURIComponent(address)}&network=${encodeURIComponent(network)}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
};

/** Run ML prediction for a stored transaction hash */
export const predictTransaction = async (
  hash: string,
  kHops: number = 2
): Promise<PredictionResponse> => {
  const res = await fetch(
    `/api/transactions/predict?hash=${encodeURIComponent(hash)}&kHops=${kHops}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Prediction failed: ${res.status}`);
  }
  return res.json();
};
