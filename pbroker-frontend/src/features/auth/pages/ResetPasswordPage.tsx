import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../store/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const key = searchParams.get('key');
  const { mutate, isPending, error, data } = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !key) return;
    if (password !== confirmPassword) return;
    mutate({ token: `${token}&key=${key}`, password }, {
      onSuccess: () => {
        setTimeout(() => navigate('/login'), 2000);
      }
    });
  };

  if (!token || !key) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                Invalid or missing reset token or key.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4">
      <Card className="w-full max-w-lg max-h-screen min-h-[520px] shadow-xl border-2 border-primary/10">
        <CardHeader className="space-y-2 py-8">
          <CardTitle className="text-3xl font-extrabold text-center tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-base">
            Enter and confirm your new password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 mb-8 px-8">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-base">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
                className="h-12 text-base"
              />
              {passwordsDontMatch && (
                <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            {data?.status === 'success' && (
              <Alert className="mt-2 bg-green-50 border-green-200">
                <AlertDescription className="text-base text-green-800">
                  {data.message || 'Password reset successful. Redirecting to login...'}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription className="text-base">
                  {error.message || 'Failed to reset password. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold" 
              // disabled={isPending || passwordsDontMatch}
            >
              {isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;


