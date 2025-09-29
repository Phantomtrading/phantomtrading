import React from 'react';
import { useAuthStore } from '../../auth/store/store';
import { Button } from "../../../components/ui/button";

const WelcomeSection: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-12">
      <div className="flex flex-col space-y-4 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight">Welcome, <span className="text-primary-500">{user?.firstName}</span></h1>
        <h2 className="text-2xl font-semibold text-teal-500">Unlock Exclusive Benefits: Deposit, Trade and Get Rewarded!</h2>
        <p className="text-muted-foreground max-w-lg">
          Unlock exclusive benefits as you deposit and trade with us. Enjoy seamless transactions,
          competitive rates, and earn rewards with every step. Start your journey towards financial
          success today!
        </p>
        <div className="mt-6">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Deposit
          </Button>
        </div>
      </div>
      {/* Placeholder for the crypto robot image */}
      <div className="mt-8 md:mt-0">
        {/* Add your image component here */}
        <div className="w-64 h-64 bg-gray-700 rounded-lg flex items-center justify-center text-white">Crypto Robot Image Placeholder</div>
      </div>
    </div>
  );
};

export default WelcomeSection; 