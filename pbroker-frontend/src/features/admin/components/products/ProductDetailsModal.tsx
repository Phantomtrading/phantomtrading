import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign } from 'lucide-react';
import type { AdminProduct } from '../../api/adminProductsApi';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AdminProduct | null;
}

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

const formatDuration = (days: number) => {
  if (days === 1) return `${days} day`;
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
};

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-500" />
            <span>{product.name}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed information about this product
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Product Overview</span>
                <Badge className={getStatusColor(product.isActive)}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-900">{product.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium font-mono">{product.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product ID</p>
                    <p className="font-medium font-mono text-sm">{product.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Financial Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div>
                    <p className="text-sm text-gray-500">Investment Range</p>
                    <p className="font-medium">
                      ${product.minInvestment.toLocaleString()} - ${product.maxInvestment.toLocaleString()} USDT
                    </p>
                  </div>
                </div>
                <div>
                  <div>
                    <p className="text-sm text-gray-500">Daily ROI Rate</p>
                    <p className="font-medium text-green-600">{product.dailyRoiRate}%</p>
                  </div>
                </div>
                <div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{formatDuration(product.durationDays)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration (Days)</p>
                  <p className="font-medium">{product.durationDays.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Features */}
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Daily ROI of {product.dailyRoiRate}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Flexible investment range</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>{product.durationDays} days investment period</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded">{new Date(product.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded">{new Date(product.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-mono bg-gray-100 px-2 py-1 rounded">{product.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
