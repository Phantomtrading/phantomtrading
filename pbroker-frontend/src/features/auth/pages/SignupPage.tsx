import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignup } from '../store/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '../validation/signupSchema';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react";

interface ApiError extends Error {
  response?: {
    status: number;
  };
}

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { mutate, isPending, error, data } = useSignup();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (data) {
      navigate(`/verify-email?email=${data.email}`);
    }
  }, [data, navigate]);

  const onSubmit = (data: SignupFormData) => {
    mutate(data);
  };

  // Check if the error is a 409 conflict (email already exists)
  const isEmailExists = error?.message?.includes('already exists') || (error as ApiError)?.response?.status === 409;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4 sm:p-6">
      <Card className="w-full max-w-md sm:max-w-lg shadow-xl border-2 border-primary/10 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-2 py-6 sm:py-8 px-6 sm:px-8">
          <CardTitle className="text-2xl sm:text-4xl font-extrabold text-center tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Join us and start your journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 px-6 sm:px-8">
            {isEmailExists ? (
              <Alert className="mt-4">
                <AlertDescription className="text-sm sm:text-base">
                  An account with this idenfitication already exists. Please try logging in instead.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="firstName" className="text-sm sm:text-base font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      {...register('firstName')}
                      className={`h-10 sm:h-12 text-sm sm:text-base focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${errors.firstName ? 'border-red-500' : ''}`}
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="lastName" className="text-sm sm:text-base font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      {...register('lastName')}
                      className={`h-10 sm:h-12 text-sm sm:text-base focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${errors.lastName ? 'border-red-500' : ''}`}
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    {...register('email')}
                    className={`h-10 sm:h-12 text-sm sm:text-base focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${errors.email ? 'border-red-500' : ''}`}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="phoneNumber" className="text-sm sm:text-base font-medium">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1234567890"
                    {...register('phoneNumber')}
                    className={`h-10 sm:h-12 text-sm sm:text-base focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    autoComplete="tel"
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="password" className="text-sm sm:text-base font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register('password')}
                      className={`h-10 sm:h-12 text-sm sm:text-base pr-10 sm:pr-12 focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                      autoComplete="new-password"
                    />
                    <div
                      className="absolute right-0 top-0 h-10 sm:h-12 w-10 sm:w-12 flex items-center justify-center cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      )}
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register('confirmPassword')}
                      className={`h-10 sm:h-12 text-sm sm:text-base pr-10 sm:pr-12 focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      autoComplete="new-password"
                    />
                    <div
                      className="absolute right-0 top-0 h-10 sm:h-12 w-10 sm:w-12 flex items-center justify-center cursor-pointer"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      )}
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}
            {error && !isEmailExists && (
              <Alert variant="destructive" className="mt-4 animate-in fade-in duration-200">
                <AlertDescription className="text-sm sm:text-base">
                  {error.message || 'Failed to create account. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-6 sm:px-8 pb-6 sm:pb-8">
            {isEmailExists ? (
              <Button 
                type="button" 
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold hover:scale-[1.02] transition-transform duration-200"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold hover:scale-[1.02] transition-transform duration-200" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage;
