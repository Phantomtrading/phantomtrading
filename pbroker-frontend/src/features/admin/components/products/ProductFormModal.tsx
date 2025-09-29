import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Package } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../../services/adminProductsService';
import type { AdminProduct, CreateProductRequest } from '../../api/adminProductsApi';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AdminProduct | null;
  mode: 'create' | 'edit';
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, product, mode }) => {
  // Predefined product codes with their common configurations
  const productCodeOptions = [
    { code: 'A1', name: 'A One Hosting', durationDays: 1, dailyRoiRate: 0.9, minInvestment: 100, maxInvestment: 10000 },
    { code: 'A7', name: 'A Seven Hosting', durationDays: 7, dailyRoiRate: 1.2, minInvestment: 500, maxInvestment: 50000 },
    { code: 'A30', name: 'A Thirty Hosting', durationDays: 30, dailyRoiRate: 1.5, minInvestment: 1000, maxInvestment: 100000 },
    { code: 'A90', name: 'A Ninety Hosting', durationDays: 90, dailyRoiRate: 2.0, minInvestment: 5000, maxInvestment: 500000 },
    { code: 'CUSTOM', name: 'Custom Product', durationDays: 1, dailyRoiRate: 0, minInvestment: 0, maxInvestment: 0 }
  ];

  const [formData, setFormData] = useState<CreateProductRequest>({
    code: '',
    name: '',
    description: '',
    durationDays: 1,
    isActive: true,
    dailyRoiRate: 0,
    minInvestment: 0,
    maxInvestment: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description,
        durationDays: product.durationDays,
        isActive: product.isActive,
        dailyRoiRate: product.dailyRoiRate,
        minInvestment: product.minInvestment,
        maxInvestment: product.maxInvestment
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        durationDays: 1,
        isActive: true,
        dailyRoiRate: 0,
        minInvestment: 0,
        maxInvestment: 0
      });
    }
  }, [product, mode]);

  const handleProductCodeChange = (selectedCode: string) => {
    const selectedOption = productCodeOptions.find(option => option.code === selectedCode);
    if (selectedOption && selectedCode !== 'CUSTOM') {
      setFormData({
        ...formData,
        code: selectedOption.code,
        name: selectedOption.name,
        durationDays: selectedOption.durationDays,
        dailyRoiRate: selectedOption.dailyRoiRate,
        minInvestment: selectedOption.minInvestment,
        maxInvestment: selectedOption.maxInvestment
      });
    } else {
      setFormData({
        ...formData,
        code: '',
        name: '',
        durationDays: 1,
        dailyRoiRate: 0,
        minInvestment: 0,
        maxInvestment: 0
      });
    }
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Product code is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim() || formData.description.length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    if (formData.durationDays < 1) {
      newErrors.durationDays = 'Duration must be at least 1 day';
    }
    if (Number(formData.dailyRoiRate) <= 0) {
      newErrors.dailyRoiRate = 'Daily ROI rate must be greater than 0';
    }
    if (Number(formData.minInvestment) <= 0) {
      newErrors.minInvestment = 'Minimum investment must be greater than 0';
    }
    if (Number(formData.maxInvestment) <= 0) {
      newErrors.maxInvestment = 'Maximum investment must be greater than 0';
    }
    if (formData.maxInvestment <= formData.minInvestment) {
      newErrors.maxInvestment = 'Maximum investment must be greater than minimum investment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (mode === 'create') {
      createProductMutation.mutate(formData, {
        onSuccess: () => {
          onClose();
          setErrors({});
        }
      });
    } else {
      updateProductMutation.mutate(
        { id: product!.id, data: formData },
        {
          onSuccess: () => {
            onClose();
            setErrors({});
          }
        }
      );
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };



  const formatDurationDisplay = (durationDays: number) => {
    if (durationDays === 1) return `${durationDays} day`;
    if (durationDays < 30) return `${durationDays} days`;
    if (durationDays < 365) return `${Math.floor(durationDays / 30)} months`;
    return `${Math.floor(durationDays / 365)} years`;
  };

  const isPending = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>{mode === 'create' ? 'Create New Product' : 'Edit Product'}</span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Fill in the details to create a new arbitrage hosting product'
              : 'Update the product details below'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Product Code *</Label>
              <Select value={formData.code || 'CUSTOM'} onValueChange={handleProductCodeChange}>
                <SelectTrigger className={errors.code ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select product code" />
                </SelectTrigger>
                <SelectContent>
                  {productCodeOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.code} - {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="durationDays">Duration (days) *</Label>
              <Input
                id="durationDays"
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 1 })}
                placeholder="1"
                min="1"
                className={errors.durationDays ? 'border-red-500' : ''}
                required
              />
              {formData.durationDays > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Duration: {formatDurationDisplay(formData.durationDays)}
                </p>
              )}
              {errors.durationDays && <p className="text-xs text-red-500 mt-1">{errors.durationDays}</p>}
            </div>
            <div>
              <Label htmlFor="isActive">Status</Label>
              <Select value={formData.isActive ? 'true' : 'false'} onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the product and its benefits"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
              required
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minInvestment">Minimum Investment (USDT) *</Label>
              <Input
                id="minInvestment"
                type="number"
                value={formData.minInvestment}
                onChange={(e) => setFormData({ ...formData, minInvestment: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.01"
                className={errors.minInvestment ? 'border-red-500' : ''}
                required
              />
              {errors.minInvestment && <p className="text-xs text-red-500 mt-1">{errors.minInvestment}</p>}
            </div>
            <div>
              <Label htmlFor="maxInvestment">Maximum Investment (USDT) *</Label>
              <Input
                id="maxInvestment"
                type="number"
                value={formData.maxInvestment}
                onChange={(e) => setFormData({ ...formData, maxInvestment: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.01"
                className={errors.maxInvestment ? 'border-red-500' : ''}
                required
              />
              {errors.maxInvestment && <p className="text-xs text-red-500 mt-1">{errors.maxInvestment}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dailyRoiRate">Daily ROI Rate (%) *</Label>
              <Input
                id="dailyRoiRate"
                type="number"
                value={formData.dailyRoiRate}
                onChange={(e) => setFormData({ ...formData, dailyRoiRate: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="0.01"
                className={errors.dailyRoiRate ? 'border-red-500' : ''}
                required
              />
              {errors.dailyRoiRate && <p className="text-xs text-red-500 mt-1">{errors.dailyRoiRate}</p>}
            </div>
          </div>



          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending}
            >
              {isPending 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Product' : 'Update Product')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
