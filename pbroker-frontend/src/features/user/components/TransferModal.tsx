import React, { useState } from 'react';
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { type TransferRequest } from '../api/userApi';
import { handleTransfer } from '../services/transactionService';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../../../components/ui/dialog';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [recipientIdentifier, setRecipientIdentifier] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!amount || !recipientIdentifier) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData: TransferRequest = {
        amount: amountNum,
        recipientIdentifier
      };

      await handleTransfer(formData);
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success("Transfer request submitted successfully!");
      setRecipientIdentifier("");
      setAmount("");
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to submit transfer request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-0 p-2">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-xl w-full max-w-full sm:max-w-sm p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 transform transition-all duration-300 ease-out overflow-y-auto max-h-[90vh]">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-2 text-[rgba(0,0,0,0.87)]">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <ArrowLeftRight className="h-4 w-4 text-[rgba(0,0,0,0.87)]" />
              </div>
              Transfer Funds
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">
              Transfer funds to another user's account.
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[rgba(0,0,0,0.87)]">Your Email</span>
                <p className="text-xs text-[rgba(0,0,0,0.87)]">{userEmail}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.87)]">Recipient Email</label>
              <input
                type="email"
                placeholder="Enter recipient's email"
                value={recipientIdentifier}
                onChange={(e) => setRecipientIdentifier(e.target.value)}
                className="w-full h-9 pl-3 pr-3 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm text-[rgba(0,0,0,0.87)] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/20 transition-all duration-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[rgba(0,0,0,0.87)]">Transfer Amount</label>
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <span className="text-xs font-medium text-gray-500">USD</span>
                </div>
              </div>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-600">
                Please ensure the recipient's email is correct. Transfers are processed immediately and cannot be reversed.
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={!amount || !recipientIdentifier || isSubmitting}
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
                "Transfer Funds"
              )}
            </button>
          </div>
        </div>
      </div>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm">
            Are you sure you want to transfer <b>${amount}</b> to <b>{recipientIdentifier}</b>? This action cannot be undone.
          </div>
          <DialogFooter>
            <button
              type="button"
              className="h-9 px-4 rounded-lg bg-gray-200 text-gray-800 text-xs font-medium hover:bg-gray-300 transition"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-9 px-4 rounded-lg bg-[rgba(0,0,0,0.87)] text-white text-xs font-medium hover:bg-black transition"
              onClick={async () => {
                setShowConfirm(false);
                await handleSubmit();
              }}
              disabled={isSubmitting}
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransferModal; 