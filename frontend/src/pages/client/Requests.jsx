import { useEffect, useState } from 'react';
import { getClientRequests } from '../../services/api';

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

function Requests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getClientRequests();
        setRequests(response.requests || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
        Loading requests...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
      <p className="text-gray-600 mt-2">Track the status of your lawyer connection requests.</p>

      {requests.length === 0 ? (
        <p className="mt-6 text-gray-600">No requests yet. Create a case and find lawyers to get started.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Case Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Lawyer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">{request.case?.title || 'N/A'}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{request.lawyer?.fullName || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[request.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Requests;
