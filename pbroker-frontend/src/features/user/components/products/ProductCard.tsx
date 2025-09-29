import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, DollarSign } from 'lucide-react';
import type { Product } from '../../api/productsApi';

interface ProductCardProps {
  product: Product;
  onInvest: (product: Product) => void;
}

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

// const formatDuration = (days: number) => {
//   if (days === 1) return `${days} day`;
//   if (days < 30) return `${days} days`;
//   if (days < 365) return `${Math.floor(days / 30)} months`;
//   return `${Math.floor(days / 365)} years`;
// };

const ProductCard: React.FC<ProductCardProps> = ({ product, onInvest }) => {
  const isActive = product.isActive;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-gray-800 border-gray-700 hover:bg-gray-750">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <CardTitle className="text-lg text-white">{product.name}</CardTitle>
              <Badge className={`mt-1 ${getStatusColor(product.isActive)}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-gray-400 mt-3">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Daily Rate</p>
                <p className="font-semibold text-green-500">{product.dailyRoiRate}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold text-blue-500">{product.durationDays} days</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-400">Investment Range</p>
            <p className="font-medium text-white">
              ${product.minInvestment.toLocaleString()} - ${product.maxInvestment.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
              Key Features
            </h4>
            <ul className="space-y-1">
              <li className="flex items-center text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                Daily ROI of {product.dailyRoiRate}%
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                {product.durationDays} days investment period
              </li>
              <li className="flex items-center text-sm text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                Flexible investment range
              </li>
            </ul>
          </div>

          <Button
            onClick={() => onInvest(product)}
            disabled={!isActive}
            className={`w-full ${isActive ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 cursor-not-allowed text-gray-400'}`}
          >
            {isActive ? 'Invest Now' : 'Coming Soon'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
