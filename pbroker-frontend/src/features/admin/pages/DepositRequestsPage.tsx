import React from 'react';

const DepositRequestsPage: React.FC = () => {
  // TODO: Replace with real API call to fetch deposit requests
  // const { data: depositRequests, isLoading, error } = useDepositRequests();

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-2xl font-bold">Deposit Request</h5>
        <div className="text-sm text-gray-500">
          <span>Home</span> {' '} / {' '}
          <span>Deposit Request</span>
        </div>
      </div>

      {/* Empty State - No dummy data */}
      <div className="bg-white border rounded-md p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Deposit Requests Found</h3>
        <p className="text-gray-500 mb-4">Deposit request data will be displayed here once the API integration is complete.</p>
        <p className="text-sm text-gray-400">This page currently shows no dummy data - only real data from the backend will be displayed.</p>
      </div>
    </div>
  );
};

export default DepositRequestsPage; 