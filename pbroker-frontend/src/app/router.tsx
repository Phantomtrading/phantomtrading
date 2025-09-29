import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/store';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import UserDashboard from '../features/user/pages/UserDashboard';
import UserLayout from '../features/user/components/UserLayout';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import TradesPage from '../features/admin/pages/TradesPage';
import DepositRequestsPage from '../features/admin/pages/DepositRequestsPage';
import AdministratorsPage from '../features/admin/pages/AdministratorsPage';
import UsersPage from '../features/admin/pages/UsersPage';
import DepositToUserPage from '../features/admin/pages/DepositToUserPage';
import ManageAddressesPage from '../features/admin/pages/ManageAddressesPage';
import { SettingsPage as UserSettingsPage } from '@/features/user/components/SettingsPage';
import AdminSettingsPage from '../features/admin/pages/SettingsPage';
// import ChatPage from '../features/admin/pages/ChatPage';
// import MigrateUsersPage from '../features/admin/pages/MigrateUsersPage';
import AdminLayout from '../features/admin/components/layout/AdminLayout';
import AdminDepositHistory from '../features/admin/pages/AdminDepositHistory';
import AdminWithdrawalHistory from '../features/admin/pages/AdminWithdrawalHistory';
import AdminTransferHistory from '../features/admin/pages/AdminTransferHistory';
import DepositPage from '../features/user/pages/DepositPage';
import DepositHistoryPage from '@/features/user/pages/DepositHistoryPage';
import WithdrawalHistoryPage from '@/features/user/pages/WithdrawalHistoryPage';
import TransferHistoryPage from '@/features/user/pages/TransferHistoryPage';
import TradingDetails from '@/features/user/pages/TradingDetails';
import TradeTransactionPage from '@/features/user/pages/TradeTransactionPage';
import TradeHistoryPage from '@/features/user/pages/TradeHistoryPage';
import CreateTradePage from '@/features/user/pages/CreateTradePage';
// import TradingChartPage from '@/features/user/pages/TradingChartPage';
import TradingChartPage from '@/features/user/pages/trading-chart/TradingChartPage';
import UserChatPage from '@/features/user/pages/UserChatPage';
import LandingPage from '@/features/public/pages/LandingPage';
import TradingPairConfiguration from '../features/admin/pages/TradingPairConfiguration';
import CryptocurrencyConfiguration from '../features/admin/pages/CryptocurrencyConfiguration';
import AdminProductsPage from '../features/admin/pages/AdminProductsPage';
import AdminTransactionsPage from '../features/admin/pages/AdminTransactionsPage';
import DepositProofsPage from '../features/user/pages/proofs/DepositProofsPage';
import ProductsPage from '../features/user/pages/ProductsPage';
import ProductsOrdersPage from '../features/user/pages/ProductsOrdersPage';

const PrivateRoute: React.FC<{ allowedRoles: string[]; children: React.ReactElement }> = ({
  allowedRoles,
  children,
}) => {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return allowedRoles.includes(user.role) ? children : <Navigate to="/" replace />;
};

// const TawkRedirect: React.FC = () => {
//   React.useEffect(() => {
//     window.open('https://tawk.to/chat/68512c5953810b190ffa393c/1ituhagam', '_blank', 'noopener,noreferrer');
//   }, []);
//   return null;
// };

const TawkAdminRedirect: React.FC = () => {
  React.useEffect(() => {
    window.open('https://dashboard.tawk.to/', '_blank', 'noopener,noreferrer');
  }, []);
  return null;
};

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
    <  Route path="/" element={ <LandingPage/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/user"
        element={
          <PrivateRoute allowedRoles={['USER']}>
            <UserLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<TradingDetails />} />
        <Route path='trading-details' element={<TradingDetails />} />
        <Route path="trade-chart" element={<TradingChartPage />} />
        <Route path="trading" element={<UserDashboard />} />
        <Route path="deposit" element={<DepositPage />} />
        <Route path="trade" element={<TradeTransactionPage />} />
        <Route path="trade-history" element={<TradeHistoryPage />} />
        <Route path="deposit-history" element={<DepositHistoryPage/>} />
        <Route path="proofs/:depositId" element={<DepositProofsPage />} />
        <Route path="withdrawal-info" element={<WithdrawalHistoryPage/>} />
        <Route path="transfer-history" element={<TransferHistoryPage/>} />
        <Route path="create-trade" element={<CreateTradePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/orders" element={<ProductsOrdersPage />} />
        {/* <Route path="support" element={<TawkRedirect />} /> */}
        <Route path="support" element={<UserChatPage />} />
        <Route path="settings" element={<UserSettingsPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="trades" element={<TradesPage />} />
        <Route path="deposit-requests" element={<DepositRequestsPage />} />
        <Route path="deposit-history" element={<AdminDepositHistory />} />
        <Route path="withdrawal-history" element={<AdminWithdrawalHistory />} />
        <Route path="transfer-history" element={<AdminTransferHistory />} />
        <Route path="administrators" element={<AdministratorsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="deposit-to-user" element={<DepositToUserPage />} />
        <Route path="manage-addresses" element={<ManageAddressesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="trading-pair-configuration" element={<TradingPairConfiguration />} />
        <Route path="chat" element={<TawkAdminRedirect />} />
        {/* <Route path="migrate-users" element={<MigrateUsersPage />} /> */}
        <Route path="cryptocurrency-configuration" element={<CryptocurrencyConfiguration />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);
