import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../dashboard/Sidebar';
import { AdminHeader } from './AdminHeader';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-100 ">
        <AdminHeader />
        <main className="p-0 md:p-6">
        <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 