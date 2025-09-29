// src/components/dashboard/Sidebar.tsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../../../components/ui/button'
import {
  LayoutDashboard,
  // LayoutGrid,
  // FileText,
  // PieChart,
  // TreePine,
  Users,
  // ListFilter,
  // CalendarDays,
  // Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  // UserCog,
  User,
  BarChart3,
  CreditCard,
  ArrowLeftRight,
  History,
  Shield,
  Package,
  Receipt,
  // Bell,
} from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useAuthStore } from '../../../auth/store/store'

const navItems = [
  { icon: LayoutDashboard,   label: 'Dashboard',          path: '/admin' },
  { icon: BarChart3,         label: 'Trades',             path: '/admin/trades' },
  { icon: Package,           label: 'Products',           path: '/admin/products' },
  { icon: Receipt,           label: 'Transactions',       path: '/admin/transactions' },
  { icon: CreditCard,        label: 'Deposit History',   path: '/admin/deposit-history' },
  { icon: ArrowLeftRight,    label: 'Withdrawal History',path: '/admin/withdrawal-history' },
  { icon: History,           label: 'Transfer History',   path: '/admin/transfer-history' },
  { icon: Users,             label: 'Users',              path: '/admin/users' },
  { icon: Shield,            label: 'Settings',           path: '/admin/settings' },
  { icon: MessageSquare,     label: 'Chat',               path: '/admin/chat' },
]

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setCollapsed(true)
    }
  }, [])

  // Settings active logic
  const settingsPaths = [
    '/admin/settings',
    '/admin/cryptocurrency-configuration',
    '/admin/trading-pair-configuration',
  ];

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
            <span className="truncate font-semibold">{user ? `${user.firstName} ${user.lastName}` : 'Admin User'}</span>
            <span className="truncate text-xs text-muted-foreground">Admin</span>
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
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex flex-col space-y-1 p-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          let isActive = location.pathname === path;
          if (label === 'Settings') {
            isActive = settingsPaths.some(p => location.pathname.startsWith(p));
          }
          return (
            <Button
              key={path}
              // variant="ghost"
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
              {/* Extract Icon into a variable so React can re-render it */}
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400'
                )}
              />
              {!collapsed && <span className="ml-3">{label}</span>}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
