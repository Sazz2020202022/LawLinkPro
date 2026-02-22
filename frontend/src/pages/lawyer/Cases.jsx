import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, User } from 'lucide-react';
import { getLawyerRequests } from '../../services/api';

function Cases() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getLawyerRequests();
        setRequests(response.requests || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load active cases');
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const activeCases = useMemo(() => {
    const accepted = requests.filter((request) => request.status === 'accepted');
    const seenCaseIds = new Set();

    return accepted.filter((request) => {
      const caseId = request.case?._id?.toString();
      if (!caseId || seenCaseIds.has(caseId)) {
        return false;
      }
      seenCaseIds.add(caseId);
      return true;
    });
  }, [requests]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
        Loading active cases...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Cases</h1>
        <p className="text-gray-600 mt-2">Cases you accepted from client requests are shown here.</p>
      </div>

      {activeCases.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
          No active cases yet. Accept a request to start working on a case.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeCases.map((request) => (
            <article
              key={request._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{request.case?.title || 'Untitled case'}</h2>
                  <p className="mt-2 text-sm text-gray-600">{request.case?.description || 'No description provided.'}</p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {request.case?.category || 'Uncategorized'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {request.client?.fullName || 'Unknown client'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Accepted on {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="self-start inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                  Active
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cases;
