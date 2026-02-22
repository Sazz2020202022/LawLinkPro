import { useEffect, useState } from 'react';
import { getLawyerRequests, updateRequestStatus } from '../../services/api';

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

function Requests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getLawyerRequests();
      setRequests(response.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setUpdating(requestId);
      await updateRequestStatus(requestId, status);
      setRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status } : req))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    } finally {
      setUpdating(null);
    }
  };

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
      <h2 className="text-2xl font-bold text-gray-900">Incoming Requests</h2>
      <p className="text-gray-600 mt-2">Review and respond to client requests.</p>

      {requests.length === 0 ? (
        <p className="mt-6 text-gray-600">No requests yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((request) => (
            <article
              key={request._id}
              className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.client?.fullName || 'N/A'}</h3>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[request.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Case:</span> {request.case?.title || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {request.case?.category || 'N/A'}
                  </p>

                  {request.message && (
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">Message:</span> {request.message}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(request._id, 'accepted')}
                      disabled={updating === request._id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {updating === request._id ? 'Updating...' : 'Accept'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(request._id, 'rejected')}
                      disabled={updating === request._id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {updating === request._id ? 'Updating...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Requests;
