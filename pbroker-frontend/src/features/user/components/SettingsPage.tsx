import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
import { useUpdateProfile, useChangePassword } from '../services/settingsService';
import { useAuthStore } from '../../auth/store/store';
import { Loader2, User, Mail, Phone, Save, Edit3, Shield, } from 'lucide-react';
import { useForm as usePasswordForm } from 'react-hook-form';
import { zodResolver as passwordZodResolver } from '@hookform/resolvers/zod';
import { useUserById } from '../services/userService';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password cannot exceed 50 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password cannot exceed 50 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [isEditing, setIsEditing] = useState(false);

  const { data: userData, isLoading: userLoading } = useUserById(user?.id || 0);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isDirty: isPasswordDirty },
    reset: resetPasswordForm,
  } = usePasswordForm<PasswordFormData>({
    resolver: passwordZodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    const updateData = {
      ...data,
      role: user.role,
      demoMode: 'NEUTRAL',
    };

    try {
      await updateProfile.mutateAsync(updateData);
      setIsEditing(false);
      reset(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      resetPasswordForm();
    } catch (error) {
      // error handled by hook
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
  };

  return (
    <div className="w-full p-3 md:p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4">
                <div className="h-24 w-24 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              <CardTitle className="text-xl">{user?.firstName} {user?.lastName}</CardTitle>
              <CardDescription className="text-sm">{user?.email}</CardDescription>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mt-2">
                {user?.role?.toLowerCase() || 'User'}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  ${userLoading ? '...' : parseFloat(userData?.balance || '0').toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      disabled={!isEditing}
                      className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      disabled={!isEditing}
                      className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    disabled={!isEditing}
                    className={errors.phoneNumber ? 'border-red-500 focus:border-red-500' : ''}
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending || !isDirty}
                      className="flex items-center gap-2"
                    >
                      {updateProfile.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateProfile.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Account Security Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-white">Email Verification</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your email is verified
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Verified
                </span>
              </div>
              {/* Change Password Section */}
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4 max-w-md mt-6">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    {...registerPassword('oldPassword')}
                    className={passwordErrors.oldPassword ? 'border-red-500 focus:border-red-500' : ''}
                    placeholder="Enter current password"
                  />
                  {passwordErrors.oldPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.oldPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerPassword('newPassword')}
                    className={passwordErrors.newPassword ? 'border-red-500 focus:border-red-500' : ''}
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    {...registerPassword('confirmNewPassword')}
                    className={passwordErrors.confirmNewPassword ? 'border-red-500 focus:border-red-500' : ''}
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="text-sm text-red-500">{passwordErrors.confirmNewPassword.message}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={changePassword.isPending || !isPasswordDirty}
                    className="flex items-center gap-2"
                  >
                    {changePassword.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {changePassword.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetPasswordForm()}
                    disabled={changePassword.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
