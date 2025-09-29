// components/AdminHeader.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../auth/store/store'
import type { AuthState } from '../../../auth/store/store'
import { LogOut } from 'lucide-react'

export const AdminHeader: React.FC = () => {
  const logout = useAuthStore((s: AuthState) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center px-4 py-3">
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-1 text-left">
          Admin
        </span>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand transition"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-sm">Log out</span>
        </button>
      </div>
    </header>
  )
}
