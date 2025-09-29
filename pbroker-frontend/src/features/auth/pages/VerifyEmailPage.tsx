import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useVerifyEmail, useResendEmailVerification } from '../store/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";

const verifyEmailSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

const VerifyEmailPage: React.FC = () => {
  const { mutate, isPending, error, data } = useVerifyEmail();
  const { mutate: resendMutate, isPending: isResending, error: resendError, data: resendData } = useResendEmailVerification();
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (data?.status === 'success') {
      // Show success message for 3 seconds before redirecting
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [data, navigate]);

  const onSubmit = (data: VerifyEmailFormData) => {
    if (!email) {
      return;
    }
    mutate({ email, code: data.code });
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4">
        <Card className="w-full max-w-lg shadow-xl border-2 border-primary/10">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                Invalid verification link. Please try signing up again.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link to="/signup" className="text-primary hover:underline">
                Go to Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if the error is a 409 conflict (already verified)
  const isAlreadyVerified = error?.message?.includes('already verified');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4">
      <Card className="w-full max-w-lg shadow-xl border-2 border-primary/10">
        <CardHeader className="space-y-2 py-8">
          <CardTitle className="text-4xl font-extrabold text-center tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center text-base">
            Enter the verification code sent to {email}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 mb-8 px-8">
            {isAlreadyVerified ? (
              <Alert className="mt-4">
                <AlertDescription className="text-base">
                  This email is already verified. You can now log in to your account.
                </AlertDescription>
              </Alert>
            ) : data?.status === 'success' ? (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <AlertDescription className="text-base text-green-800">
                  {data.message || 'Email verified successfully! Redirecting to login...'}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="code" className="text-base font-medium">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  {...register('code')}
                  className={`h-12 text-base focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${errors.code ? 'border-red-500' : ''}`}
                  maxLength={6}
                />
                {errors.code && (
                  <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    className="ml-2 p-0 h-auto text-primary"
                    disabled={isResending || !email}
                    onClick={() => email && resendMutate({ email })}
                  >
                    {isResending ? 'Resending...' : 'Resend verification code'}
                  </Button>
                </div>
                {resendData?.status === 'success' && (
                  <Alert className="mt-2 bg-green-50 border-green-200">
                    <AlertDescription className="text-sm text-green-800">
                      {resendData.message || 'Verification code sent. Please check your email.'}
                    </AlertDescription>
                  </Alert>
                )}
                {resendError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-sm">
                      {resendError.message || 'Failed to resend code. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            {error && !isAlreadyVerified && (
              <Alert variant="destructive" className="mt-4 animate-in fade-in duration-200">
                <AlertDescription className="text-base">
                  {error.message || 'Failed to verify email. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            {isAlreadyVerified || data?.status === 'success' ? (
              <Button 
                type="button" 
                className="w-full h-12 text-base font-semibold hover:scale-[1.02] transition-transform duration-200"
                onClick={handleGoToLogin}
              >
                Go to Login
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold hover:scale-[1.02] transition-transform duration-200" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VerifyEmailPage; 