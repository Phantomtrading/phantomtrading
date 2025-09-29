import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { fetchCryptoOptions } from '../api/userApi';

interface CryptoPrice {
  asset: string;
  name: string;
  price: string;
  change: string;
}

const CryptoPricesTable: React.FC = () => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCryptoPrices = async () => {
      try {
        setIsLoading(true);
        const cryptoOptions = await fetchCryptoOptions();
        
        // Transform crypto options to price format
        const priceData: CryptoPrice[] = cryptoOptions.map(crypto => ({
          asset: crypto.symbol,
          name: crypto.name,
          price: 'Loading...', // Real-time price would come from a price API
          change: '0.000%'      // Real-time change would come from a price API
        }));
        
        setCryptoPrices(priceData);
      } catch (err) {
        console.error('Error loading crypto prices:', err);
        setError('Failed to load cryptocurrency data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCryptoPrices();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Real-time Crypto Prices</h3>
        <div className="text-center py-4">Loading cryptocurrency data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Real-time Crypto Prices</h3>
        <div className="text-center py-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Real-time Crypto Prices</h3>
      <Table>
        <TableCaption>Supported cryptocurrencies on our platform</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ASSET</TableHead>
            <TableHead>PRICE (USD)</TableHead>
            <TableHead className="text-right">CHANGE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cryptoPrices.map((crypto) => (
            <TableRow key={crypto.asset}>
              <TableCell className="font-medium">{crypto.asset} - {crypto.name}</TableCell>
              <TableCell>{crypto.price}</TableCell>
              <TableCell className="text-right">{crypto.change}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CryptoPricesTable; 