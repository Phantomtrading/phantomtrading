import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  History,
  Settings,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Send,
  MessageCircle,
  Package,
  User,
  Search,
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useAuthStore } from '../../auth/store/store';

const navigationItems = [
  { icon: TrendingUp, label: 'Trade', path: '/user/trade-chart' },
  { icon: FileText, label: 'Transactions', path: '/user/trading-details' },
  { icon: BarChart2, label: 'Market', path: '/user/trading' },
  { icon: Package, label: 'Products', path: '/user/products' },
  { icon: FileText, label: 'My Orders', path: '/user/products/orders' },
  { icon: History, label: 'Deposit History', path: '/user/deposit-history' },
  { icon: Wallet, label: 'Withdrawal Info', path: '/user/withdrawal-info' },
  { icon: Send, label: 'Transfer History', path: '/user/transfer-history' },
  { icon: MessageCircle, label: 'Support', path: '/user/support' },
  { icon: Settings, label: 'Settings', path: '/user/settings' },
];

export const UserSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, []);

  return (
    <div
      className={cn(
        'h-screen border-r bg-gray-900 text-gray-300 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand + collapse button */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && <span className="text-xl font-bold text-white">Hulum Trading</span>}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-300 hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed
            ? <ChevronRight className="h-5 w-5"/>
            : <ChevronLeft  className="h-5 w-5"/>}
        </Button>
      </div>

      {/* Profile (only when expanded) */}
      {!collapsed && (
        <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
            <span className="truncate text-xs text-muted-foreground">User</span>
          </div>
        </div>
      )}

      {/* Search (only when expanded) */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-md bg-gray-700 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex flex-col space-y-1 p-2">
        {navigationItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Button
              key={path}
              className={cn(
                'flex items-center w-full transition-colors',
                collapsed ? 'justify-center py-2' : 'justify-start px-4 py-2',
                isActive
                  ? 'bg-blue-600 text-white border-0 outline-none rounded-none'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
              onClick={() => navigate(path)}
              style={{ backgroundColor: isActive ? '#2563eb' : 'transparent' }}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400'
                )}
              />
              {!collapsed && <span className="ml-3">{label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};