import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLawyerRequests, updateRequestStatus } from '../../services/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_ORIGIN = /\/api$/i.test(API_BASE_URL) ? API_BASE_URL.replace(/\/api$/i, '') : API_BASE_URL;

const getDocumentUrl = (fileUrl) => {
  if (!fileUrl) {
    return '#';
  }
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }
  return `${API_ORIGIN}${fileUrl}`;
};

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

                  {request.case?.description && (
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {request.case.description}
                    </p>
                  )}

                  {request.message && (
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">Message:</span> {request.message}
                    </p>
                  )}

                  {Array.isArray(request.case?.documents) && request.case.documents.length > 0 && (
                    <div className="mt-3 rounded-lg border border-gray-200 p-3 bg-white">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Case Documents</p>
                      <div className="mt-2 space-y-1.5">
                        {request.case.documents.map((doc, index) => (
                          <a
                            key={`${doc.fileUrl}-${index}`}
                            href={getDocumentUrl(doc.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {doc.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {request.client?._id && (
                    <Link
                      to={`/lawyer/clients/${request.client._id}`}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      View Client Profile
                    </Link>
                  )}

                  {request.status === 'pending' && (
                    <>
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
                    </>
                  )}

                  {request.status === 'accepted' && (
                    <Link
                      to={`/lawyer/requests/${request._id}/messages`}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Open Chat
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Requests;
