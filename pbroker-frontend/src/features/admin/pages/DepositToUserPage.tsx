import React from 'react';

const DepositToUserPage: React.FC = () => {
  // TODO: Replace with real API call to fetch deposit transfers
  // const { data: depositTransfers, isLoading, error } = useDepositTransfers();

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-2xl font-bold">Deposit to User</h5>
        <div className="text-sm text-gray-500">
          <span>Home</span> {' '} / {' '}
          <span>Deposit to User</span>
        </div>
      </div>

      {/* Empty State - No dummy data */}
      <div className="bg-white border rounded-md p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Deposit Transfers Found</h3>
        <p className="text-gray-500 mb-4">Deposit transfer data will be displayed here once the API integration is complete.</p>
        <p className="text-sm text-gray-400">This page currently shows no dummy data - only real data from the backend will be displayed.</p>
      </div>
    </div>
  );
};

export default DepositToUserPage; 