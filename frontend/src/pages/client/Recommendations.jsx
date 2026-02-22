import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, MapPin, Briefcase, Award, X } from 'lucide-react';
import { getClientRequests, getRecommendations, sendRequest } from '../../services/api';

function Recommendations() {
  const { id: caseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [sendingTo, setSendingTo] = useState(null);
  const [expandedKeywords, setExpandedKeywords] = useState({});
  const [pendingRequests, setPendingRequests] = useState({});
  const [popup, setPopup] = useState({ visible: false, message: '', type: 'success' });
  const [selectedLawyer, setSelectedLawyer] = useState(null);

  const showPopup = (message, type = 'success') => {
    setPopup({ visible: true, message, type });
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError('');
        const [recommendationResponse, requestResponse] = await Promise.all([
          getRecommendations(caseId),
          getClientRequests(),
        ]);

        setRecommendations(recommendationResponse.recommendations || []);

        const pendingByLawyer = (requestResponse.requests || []).reduce((acc, requestItem) => {
          const requestCaseId = requestItem?.case?._id || requestItem?.case;
          const requestLawyerId = requestItem?.lawyer?._id || requestItem?.lawyer;

          if (
            requestItem?.status === 'pending' &&
            requestCaseId?.toString() === caseId &&
            requestLawyerId
          ) {
            acc[requestLawyerId.toString()] = true;
          }

          return acc;
        }, {});

        setPendingRequests(pendingByLawyer);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [caseId]);

  const handleSendRequest = async (lawyerId) => {
    try {
      setSendingTo(lawyerId);
      await sendRequest({ caseId, lawyerId });
      setPendingRequests((prev) => ({ ...prev, [lawyerId]: true }));
      showPopup('Request sent successfully', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send request';

      if (message.toLowerCase().includes('already have a pending request')) {
        setPendingRequests((prev) => ({ ...prev, [lawyerId]: true }));
        showPopup('This request is already pending', 'info');
      } else {
        showPopup(message, 'error');
      }
    } finally {
      setSendingTo(null);
    }
  };

  const toggleKeywords = (lawyerId) => {
    setExpandedKeywords((prev) => ({
      ...prev,
      [lawyerId]: !prev[lawyerId],
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
        Loading recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-red-600">{error}</p>
        <Link to="/client/cases" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          Back to My Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {popup.visible && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-200 ${
            popup.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : popup.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {popup.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Top Lawyer Matches</h1>
        <p className="text-gray-600 mt-2">
          We found {recommendations.length} lawyers based on your case details. Send a request to connect.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
          No recommendations found. Try adjusting your case description.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {recommendations.map((lawyer) => (
            <article
              key={lawyer.lawyerId}
              className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lawyer.fullName}</h3>
                    {lawyer.rating >= 4.5 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                        <BadgeCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                      {lawyer.matchPercent}% Match
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {lawyer.specialization.map((spec) => (
                      <span key={spec} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {lawyer.officeLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {lawyer.yearsOfExperience} years
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {lawyer.rating} / 5
                    </span>
                  </div>

                  {lawyer.topKeywords && lawyer.topKeywords.length > 0 && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleKeywords(lawyer.lawyerId)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {expandedKeywords[lawyer.lawyerId] ? '▼' : '▶'} Why matched
                      </button>
                      {expandedKeywords[lawyer.lawyerId] && (
                        <p className="mt-2 text-sm text-gray-600">
                          Key terms: <span className="font-medium">{lawyer.topKeywords.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLawyer(lawyer)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 text-center transition-all duration-200"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendRequest(lawyer.lawyerId)}
                    disabled={sendingTo === lawyer.lawyerId || pendingRequests[lawyer.lawyerId]}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {sendingTo === lawyer.lawyerId
                      ? 'Sending...'
                      : pendingRequests[lawyer.lawyerId]
                        ? 'Pending Request'
                        : 'Send Request'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Link
          to="/client/cases"
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200"
        >
          Back to My Cases
        </Link>
      </div>

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
              {lawyer.specialization.map((spec) => (
                <span key={spec} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  {spec}
                </span>
              ))}
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
              <p className="text-xs font-medium text-gray-600 uppercase">Match Score</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lawyer.matchPercent}%</p>
            </div>
          </div>

          {lawyer.topKeywords && lawyer.topKeywords.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Matched</h3>
              <p className="text-gray-600">
                Key terms: <span className="font-medium">{lawyer.topKeywords.join(', ')}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
