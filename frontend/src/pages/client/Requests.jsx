import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        <div className="mt-6 grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <article key={request._id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Case</p>
                  <h3 className="text-base font-semibold text-gray-900">{request.case?.title || 'N/A'}</h3>
                </div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    statusStyles[request.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Lawyer:</span> {request.lawyer?.fullName || 'N/A'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Requested on {new Date(request.createdAt).toLocaleDateString()}
              </p>

              {request.status === 'accepted' && (
                <div className="mt-4">
                  <Link
                    to={`/client/requests/${request._id}/messages`}
                    className="inline-flex px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Open Chat
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Requests;
