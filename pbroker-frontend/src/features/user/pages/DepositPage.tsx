import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  address: string;
  expectedMonthlyProfit: number;
}

const cryptoOptions: CryptoOption[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    expectedMonthlyProfit: 2.5
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    expectedMonthlyProfit: 3.2
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    expectedMonthlyProfit: 1.8
  }
];

const DepositPage: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!selectedCrypto || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to submit deposit request
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      toast.success("Deposit request submitted successfully!");
      // Reset form
      setSelectedCrypto(null);
      setAmount("");
    } catch (error) {
      toast.error("Failed to submit deposit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            Select your preferred cryptocurrency and enter the amount you wish to deposit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crypto Selection */}
          <div className="space-y-2">
            <Label htmlFor="crypto">Select Cryptocurrency</Label>
            <Select
              value={selectedCrypto?.id}
              onValueChange={(value) => {
                const crypto = cryptoOptions.find(c => c.id === value);
                setSelectedCrypto(crypto || null);
              }}
            >
              <SelectTrigger id="crypto">
                <SelectValue placeholder="Select a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {cryptoOptions.map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Expected Monthly Profit */}
          {selectedCrypto && amount && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <AlertCircle className="h-5 w-5" />
                <p>
                  Expected Monthly Profit: {calculateMonthlyProfit()} {selectedCrypto.symbol}
                  <span className="text-sm ml-2">
                    ({selectedCrypto.expectedMonthlyProfit}% monthly)
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Admin Wallet Address */}
          {selectedCrypto && (
            <div className="space-y-2">
              <Label>Admin Wallet Address</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={selectedCrypto.address}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Send the exact amount to this address. Make sure to use the correct network.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!selectedCrypto || !amount || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositPage; 