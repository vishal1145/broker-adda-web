'use client';
import { useAuth } from '../contexts/AuthContext';

export default function DebugPage() {
  const { user, isAuthenticated, isBroker, isCustomer } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User Object:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Authentication Status:</h2>
          <ul className="space-y-2">
            <li>Is Authenticated: {isAuthenticated() ? 'Yes' : 'No'}</li>
            <li>Is Broker: {isBroker() ? 'Yes' : 'No'}</li>
            <li>Is Customer: {isCustomer() ? 'Yes' : 'No'}</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Local Storage:</h2>
          <ul className="space-y-2">
            <li>Token: {typeof window !== 'undefined' ? localStorage.getItem('token')?.substring(0, 50) + '...' : 'N/A'}</li>
            <li>Phone: {typeof window !== 'undefined' ? localStorage.getItem('phone') : 'N/A'}</li>
            <li>Role: {typeof window !== 'undefined' ? localStorage.getItem('role') : 'N/A'}</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Token Payload:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {typeof window !== 'undefined' && localStorage.getItem('token') ? 
              JSON.stringify(JSON.parse(atob(localStorage.getItem('token').split('.')[1])), null, 2) : 
              'No token found'
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
