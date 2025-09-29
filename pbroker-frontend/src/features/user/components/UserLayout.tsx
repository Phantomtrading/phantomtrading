import React from 'react';
import { Outlet } from 'react-router-dom';
import { UserSidebar } from './UserSidebar';
import UserHeader from './UserHeader';

const UserLayout: React.FC = () => {

  return (
    <div className="flex h-screen">
      <UserSidebar />
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <UserHeader />
        <main className="p-0 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout; 