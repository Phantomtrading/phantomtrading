import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPassword } from '../store/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const { mutate, isPending, error, data } = useForgotPassword();
  const navigate = useNavigate();

  // Handle UnverifiedEmailError and redirect to verification page
  React.useEffect(() => {
    const axiosStatus = (error as any)?.response?.status;
    const errorCode = (error as any)?.response?.data?.code;
    if (axiosStatus === 403 || errorCode === 'UnverifiedEmailError') {
      if (email) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    }
  }, [error, email, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    mutate({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4">
      <Card className="w-full max-w-lg max-h-screen min-h-[460px] shadow-xl border-2 border-primary/10">
        <CardHeader className="space-y-2 py-8">
          <CardTitle className="text-3xl font-extrabold text-center tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center text-base">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 mb-8 px-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            {data?.status === 'success' && (
              <Alert className="mt-2 bg-green-50 border-green-200">
                <AlertDescription className="text-base text-green-800">
                  {data.message || 'Reset instructions sent. Please check your email.'}
                </AlertDescription>
              </Alert>
            )}
            {error && (() => {
              const axiosStatus = (error as any)?.response?.status;
              const errorCode = (error as any)?.response?.data?.code;
              const isUnverifiedEmailError = axiosStatus === 403 || errorCode === 'UnverifiedEmailError';
              
              if (isUnverifiedEmailError) {
                return (
                  <Alert className="mt-2 bg-blue-50 border-blue-200">
                    <AlertDescription className="text-base text-blue-800">
                      Please verify your email first. Redirecting you to the verification page...
                    </AlertDescription>
                  </Alert>
                );
              }
              
              return (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription className="text-base">
                    {error.message || 'Failed to send reset instructions. Please try again.'}
                  </AlertDescription>
                </Alert>
              );
            })()}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold" 
              disabled={isPending}
            >
              {isPending ? 'Sending...' : 'Send reset instructions'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;


