import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientRequests, getMyCases } from '../../services/api';
import { FolderOpen, X, Award } from 'lucide-react';

const statusStyles = {
  submitted: 'bg-blue-50 text-blue-700',
  matched: 'bg-purple-50 text-purple-700',
  in_progress: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-green-50 text-green-700',
};

const statusLabels = {
  submitted: 'Submitted',
  matched: 'Matched',
  in_progress: 'In Progress',
  completed: 'Completed',
};

function MyCases() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cases, setCases] = useState([]);
  const [acceptedLawyerByCase, setAcceptedLawyerByCase] = useState({});
  const [selectedLawyer, setSelectedLawyer] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      setError('');
      const [casesResponse, requestsResponse] = await Promise.all([getMyCases(), getClientRequests()]);

      setCases(casesResponse.cases || []);

      const acceptedMap = (requestsResponse.requests || []).reduce((acc, requestItem) => {
        if (requestItem.status !== 'accepted') {
          return acc;
        }

        const caseId = requestItem?.case?._id?.toString();
        const lawyerId = requestItem?.lawyer?._id?.toString();

        if (!caseId || !lawyerId || acc[caseId]) {
          return acc;
        }

        const lawyerProfile = requestItem?.lawyer?.lawyerProfile || {};

        acc[caseId] = {
          id: lawyerId,
          fullName: requestItem?.lawyer?.fullName || 'Assigned Lawyer',
          specialization: lawyerProfile.specialization || [],
          officeLocation: lawyerProfile.officeLocation || 'Not specified',
          yearsOfExperience: lawyerProfile.yearsOfExperience || 0,
          rating: 4.5,
          matchPercent: 0,
          topKeywords: [],
        };

        return acc;
      }, {});

      setAcceptedLawyerByCase(acceptedMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
        Loading cases...
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
      <h2 className="text-2xl font-bold text-gray-900">My Cases</h2>
      <p className="text-gray-600 mt-2">View and manage all your legal cases.</p>

      {cases.length === 0 ? (
        <div className="mt-8 text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">No cases yet.</p>
          <Link
            to="/client/new-case"
            className="mt-4 inline-block px-6 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create New Case
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((caseItem) => (
            <article
              key={caseItem._id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200"
            >
              {acceptedLawyerByCase[caseItem._id] && (
                <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                  <span className="font-medium">Assigned Lawyer:</span> {acceptedLawyerByCase[caseItem._id].fullName}
                </div>
              )}

              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    statusStyles[caseItem.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {statusLabels[caseItem.status] || caseItem.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Category:</span> {caseItem.category}
              </p>

              <p className="mt-2 text-sm text-gray-700 line-clamp-3">{caseItem.description}</p>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/client/cases/${caseItem._id}/recommendations`}
                  className="flex-1 px-4 py-2 text-center rounded-lg text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  View Recommendations
                </Link>

                {acceptedLawyerByCase[caseItem._id] && (
                  <button
                    type="button"
                    onClick={() => setSelectedLawyer(acceptedLawyerByCase[caseItem._id])}
                    className="flex-1 px-4 py-2 text-center rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                  >
                    View Lawyer Profile
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Created on {new Date(caseItem.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}

      {selectedLawyer && <LawyerProfileModal lawyer={selectedLawyer} onClose={() => setSelectedLawyer(null)} />}
    </div>
  );
}

function LawyerProfileModal({ lawyer, onClose }) {
  if (!lawyer) return null;

  return (
    <div
      className="fixed inset-0 z-40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white bg-opacity-95 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white border-opacity-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-linear-to-r from-blue-50 to-purple-50 border-b border-gray-100 px-6 py-5 flex items-center justify-between backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-900">Lawyer Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 bg-linear-to-b from-white to-gray-50 bg-opacity-90">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{lawyer.fullName}</h1>
                {lawyer.rating >= 4.5 && (
                  <span className="inline-block mt-2 text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{lawyer.rating}</p>
                <p className="text-sm text-gray-600">/ 5 Rating</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialization</h3>
            <div className="flex flex-wrap gap-2">
              {lawyer.specialization.length > 0 ? (
                lawyer.specialization.map((spec) => (
                  <span key={spec} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    {spec}
                  </span>
                ))
              ) : (
                <span className="text-gray-600">No specialization added</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-600 uppercase">Location</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lawyer.officeLocation}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-600 uppercase">Experience</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lawyer.yearsOfExperience} years</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-600 uppercase">Rating</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lawyer.rating} / 5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyCases;
