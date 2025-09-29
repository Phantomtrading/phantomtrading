import React, { useState, useEffect } from 'react';
import { Copy, Check, Coins, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { type CryptoOption } from '../api/userApi';
import { handleDeposit, fetchCryptoOptionsService } from '../services/transactionService';
import { useAuthStore } from '../../auth/store/store';
import { useQueryClient } from '@tanstack/react-query';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofOfDeposit, setProofOfDeposit] = useState<File[]>([]);
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [isLoadingCryptoOptions, setIsLoadingCryptoOptions] = useState(true);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        setIsLoadingCryptoOptions(true);
        try {
          const options = await fetchCryptoOptionsService();
          setCryptoOptions(options);
        } catch (error) {
          console.error("Error fetching crypto options:", error);
          toast.error("Failed to load cryptocurrency options.");
        } finally {
          setIsLoadingCryptoOptions(false);
        }
      };
      fetchOptions();
    } else {
      // Reset state when modal closes
      setSelectedCrypto(null);
      setAmount("");
      setTransactionHash("");
      setProofOfDeposit([]);
      setCryptoOptions([]);
      setIsLoadingCryptoOptions(true); // Reset loading state for next open
    }
  }, [isOpen]);

  const handleCopyAddress = async () => {
    if (selectedCrypto) {
      try {
        await navigator.clipboard.writeText(selectedCrypto.address);
        setCopied(true);
        toast.success("Address copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy address");
      }
    }
  };

  const calculateMonthlyProfit = () => {
    if (!selectedCrypto || !amount) return "0.00";
    const profit = (parseFloat(amount) * selectedCrypto.expectedMonthlyProfit) / 100;
    return profit.toFixed(2);
  };

  const handleSubmit = async () => {
    if (!selectedCrypto || !amount || proofOfDeposit.length === 0 || !transactionHash) {
      toast.error("Please fill in all fields, upload proof of deposit, and enter the transaction hash");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to make a deposit");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleDeposit({
        cryptocurrencyId: Number(selectedCrypto.id),
        amount: parseFloat(amount),
        transactionHash,
        proofs: proofOfDeposit,
      });

      queryClient.invalidateQueries({ queryKey: ['deposits', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transfers', user?.id] });

      toast.success("Deposit request submitted successfully!");
      setSelectedCrypto(null);
      setAmount("");
      setTransactionHash("");
      setProofOfDeposit([]);
      onClose();
    } catch (error) {
      console.error("Deposit submission error:", error);
      toast.error("Failed to submit deposit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-0 p-2">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl w-full max-w-full sm:max-w-sm p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 transform transition-all duration-300 ease-out overflow-y-auto max-h-[90vh]">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 text-[rgba(0,0,0,0.87)]">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Coins className="h-4 w-4 text-[rgba(0,0,0,0.87)]" />
            </div>
            Deposit Funds
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">
            Select your preferred cryptocurrency and enter the amount you wish to deposit.
          </p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.87)]">Select Cryptocurrency</label>
            <div className="relative">
              <select
                value={selectedCrypto?.id || ""}
                onChange={(e) => {
                  const crypto = cryptoOptions.find(c => c.id === e.target.value);
                  setSelectedCrypto(crypto || null);
                }}
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm text-[rgba(0,0,0,0.87)] focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/20 appearance-none cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoadingCryptoOptions}
              >
                <option value="">Select a cryptocurrency</option>
                {cryptoOptions.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.87)]">
              Enter Amount (in USDT)
              <span className="block text-[0.85em] font-normal text-gray-500 mt-0.5">
                Enter the USDT-equivalent value of the crypto you deposited.
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full h-9 pl-3 pr-10 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm text-[rgba(0,0,0,0.87)] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/20 transition-all duration-200"
              />
              {selectedCrypto && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  {/* <span className="text-xs font-medium text-gray-500">{selectedCrypto.symbol}</span> */}
                </div>
              )}
            </div>
          </div>

          {/* Transaction Hash Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.87)]">Transaction Hash</label>
            <input
              type="text"
              placeholder="Enter transaction hash (e.g., 0xabc123def456ghi789)"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="w-full h-9 pl-3 pr-3 rounded-lg border border-gray-200 bg-white font-mono text-xs sm:text-sm text-[rgba(0,0,0,0.87)] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/20 transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the transaction hash from your wallet after sending the funds.
            </p>
          </div>

          {selectedCrypto && amount && (
            <div className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs font-medium text-[rgba(0,0,0,0.87)]">Monthly Profit</span>
              <p className="text-xs sm:text-sm font-semibold text-[rgba(0,0,0,0.87)]">
                {calculateMonthlyProfit()} {selectedCrypto.symbol}
              </p>
            </div>
          )}
          {selectedCrypto && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.87)]">Copy Address Here</label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    value={selectedCrypto.address}
                    readOnly
                    className="w-full h-9 pl-3 pr-10 rounded-lg border border-gray-200 bg-gray-50 font-mono text-xs text-[rgba(0,0,0,0.87)] focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/20"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <span className="text-xs font-medium text-gray-400">TRC20</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="h-9 w-full sm:w-9 shrink-0 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[rgba(0,0,0,0.87)]" />
                  ) : (
                    <Copy className="h-4 w-4 text-[rgba(0,0,0,0.87)]" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Send the exact amount to this address. Make sure to use the correct network.
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[rgba(0,0,0,0.87)]">Upload Proof of Deposit</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const newFiles = Array.from(e.target.files);
                    setProofOfDeposit(prev => {
                      const combined = [...prev, ...newFiles];
                      // Remove duplicates by name
                      const unique = Array.from(new Map(combined.map(f => [f.name, f])).values());
                      if (unique.length > 3) {
                        toast.warning("You can only upload up to 3 images.");
                        return unique.slice(0, 3);
                      }
                      return unique;
                    });
                  }}
                  className="w-full h-9 pl-3 pr-3 rounded-lg border border-gray-200 bg-white text-xs text-[rgba(0,0,0,0.87)] focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/20 transition-all duration-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[rgba(0,0,0,0.87)] file:text-white hover:file:bg-black file:transition-colors file:duration-200"
                />
              </div>
            </div>
            {proofOfDeposit.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5 p-2 rounded-md bg-gray-50 border border-gray-200">
                {proofOfDeposit.map((file, idx) => (
                  <div key={idx} className="flex flex-col items-center relative group">
                    <svg className="h-3 w-3 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs text-[rgba(0,0,0,0.87)] truncate max-w-[80px]">{file.name}</p>
                    {file.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Proof Preview"
                        className="h-16 w-auto rounded border border-gray-200 object-contain mt-1"
                      />
                    )}
                    <button
                      type="button"
                      aria-label="Remove image"
                      className="absolute top-0 right-0 bg-white rounded-full p-0.5 shadow hover:bg-gray-100 border border-gray-300 text-gray-500 group-hover:opacity-100 opacity-80 transition"
                      onClick={() => setProofOfDeposit(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 sm:mt-6">
          <button
            type="button"
            onClick={handleSubmit}  
            disabled={!selectedCrypto || !amount || proofOfDeposit.length === 0 || !transactionHash || isSubmitting}
            className="w-full h-9 text-xs sm:text-sm font-medium inline-flex items-center justify-center rounded-lg bg-[rgba(0,0,0,0.87)] text-white hover:bg-black active:bg-black/90 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;