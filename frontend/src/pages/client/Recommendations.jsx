import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  User,
  X,
} from 'lucide-react';
import { getClientRequests, getRecommendations, sendRequest } from '../../services/api';

function HistoryStat({ label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function truncateText(text = '', maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}...`;
}

function RecentCaseItem({ item, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const description = item?.description || 'No case description available.';
  const researchNotes = item?.researchNotes || '';
  const aiSummary = item?.aiSummary || '';
  const canExpand = description.length > 120;
  const visibleDescription = expanded ? description : truncateText(description, compact ? 100 : 140);

  return (
    <div
      className={`rounded-lg border border-blue-100 bg-blue-50/40 ${compact ? 'p-2.5' : 'p-3'} flex items-start justify-between gap-2`}
    >
      <div className="min-w-0">
        <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-900`}>{item.title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{item.category}</p>
        <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-600 mt-1.5 leading-relaxed`}>
          {visibleDescription}
        </p>
        {(expanded || !canExpand) && researchNotes && (
          <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1 leading-relaxed`}>
            <span className="font-semibold text-gray-600">Case Notes:</span> {researchNotes}
          </p>
        )}
        {(expanded || !canExpand) && aiSummary && (
          <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1 leading-relaxed`}>
            <span className="font-semibold text-gray-600">Strategy Summary:</span> {aiSummary}
          </p>
        )}
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-1.5 text-[11px] font-medium text-blue-700 hover:text-blue-800"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      <span className="shrink-0 text-[11px] font-medium rounded-full px-2 py-0.5 bg-indigo-50 text-indigo-700">
        {item.status}
      </span>
    </div>
  );
}

function RecentCaseList({ items, compact = false, title = 'Recent Cases' }) {
  const [showAll, setShowAll] = useState(false);

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const visibleItems = showAll ? items : items.slice(0, compact ? 2 : 4);

  return (
    <section className={`rounded-xl border border-blue-100 bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>{title}</h4>
      <div className={`mt-2 ${compact ? 'space-y-2' : 'space-y-2.5'}`}>
        {visibleItems.map((item) => (
          <RecentCaseItem key={`${item.title}-${item.acceptedAt || item.status}`} item={item} compact={compact} />
        ))}
      </div>

      {items.length > (compact ? 2 : 4) && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-700 hover:text-blue-800"
        >
          {showAll ? 'Show fewer cases' : `View all ${items.length} cases`}
        </button>
      )}
    </section>
  );
}

function Recommendations() {
  const { id: caseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [sendingTo, setSendingTo] = useState(null);
  const [pendingRequests, setPendingRequests] = useState({});
  const [acceptedRequests, setAcceptedRequests] = useState({});
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

        const acceptedByLawyer = (requestResponse.requests || []).reduce((acc, requestItem) => {
          const requestCaseId = requestItem?.case?._id || requestItem?.case;
          const requestLawyerId = requestItem?.lawyer?._id || requestItem?.lawyer;

          if (
            requestItem?.status === 'accepted' &&
            requestCaseId?.toString() === caseId &&
            requestLawyerId &&
            requestItem?._id
          ) {
            acc[requestLawyerId.toString()] = requestItem._id.toString();
          }

          return acc;
        }, {});

        setPendingRequests(pendingByLawyer);
        setAcceptedRequests(acceptedByLawyer);
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

  const availabilityLabel = {
    available: 'Available',
    busy: 'Limited Capacity',
    on_leave: 'On Leave',
  };

  const availabilityStyle = {
    available: 'bg-green-50 text-green-700 border-green-200',
    busy: 'bg-amber-50 text-amber-700 border-amber-200',
    on_leave: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-10 text-center text-gray-600">
        Loading recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
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

      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-white via-blue-50/40 to-indigo-50/30 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-linear-to-br from-blue-200/50 via-purple-200/40 to-transparent blur-2xl" />
        <h1 className="text-2xl font-bold text-gray-900">Top Lawyer Matches</h1>
        <p className="text-gray-600 mt-2 max-w-3xl">
          We found {recommendations.length} lawyers with strong alignment for your case. Review profiles,
          experience, case history, and availability before sending a request.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-10 text-center text-gray-600">
          No recommendations found. Try adjusting your case description.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {recommendations.map((lawyer) => (
            <article
              key={lawyer.lawyerId}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-blue-100 hover:border-blue-200 p-6 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lawyer.fullName}</h3>
                    {lawyer.rating >= 4.5 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                        <BadgeCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                      {lawyer.matchPercent}% Match
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${
                        availabilityStyle[lawyer.availability] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {availabilityLabel[lawyer.availability] || 'Available'}
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

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <HistoryStat label="Cases Taken" value={lawyer.history?.casesTaken ?? 0} />
                    <HistoryStat label="Cases Won" value={lawyer.history?.casesWon ?? 0} />
                    <HistoryStat label="Completion" value={`${lawyer.history?.completionRate ?? 0}%`} />
                    <HistoryStat label="Acceptance" value={`${lawyer.history?.acceptanceRate ?? 0}%`} />
                  </div>

                  {lawyer.availability === 'busy' && (
                    <p className="mt-3 text-sm text-amber-700">
                      Limited Capacity: this lawyer is handling active matters and can still take suitable cases.
                    </p>
                  )}

                  {lawyer.topKeywords && lawyer.topKeywords.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-800">Relevant Focus Terms</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {lawyer.topKeywords.slice(0, 5).map((keyword) => (
                          <span
                            key={keyword}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <RecentCaseList
                      items={(lawyer.history?.wonCaseHighlights || []).slice(0, 5)}
                      compact
                      title="Won Cases"
                    />
                  </div>

                </div>

                <div className="w-full shrink-0 md:w-72">
                  <div className="rounded-2xl border border-blue-100 bg-linear-to-b from-blue-50/60 to-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">Contact Options</p>
                    <p className="mt-1 text-sm text-gray-600">Choose how you want to connect with this lawyer.</p>

                    <div className="mt-3 rounded-xl border border-blue-100 bg-white px-3 py-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Current status</span>
                        <span className="font-semibold text-gray-700">
                          {acceptedRequests[lawyer.lawyerId]
                            ? 'Connected'
                            : pendingRequests[lawyer.lawyerId]
                              ? 'Request Pending'
                              : 'Ready to Connect'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {lawyer.email ? (
                        <a
                          href={`mailto:${lawyer.email}`}
                          className="inline-flex w-full items-center justify-between rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            Send Email
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-blue-500" />
                        </a>
                      ) : (
                        <div className="inline-flex w-full items-center justify-between rounded-xl border border-dashed border-blue-200 bg-white px-4 py-3 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            Email unavailable
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedLawyer(lawyer)}
                        className="inline-flex w-full items-center justify-between rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <span className="inline-flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          Review Profile
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                      </button>

                      {acceptedRequests[lawyer.lawyerId] ? (
                        <button
                          type="button"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent('open-quick-chat', {
                                detail: { requestId: acceptedRequests[lawyer.lawyerId] },
                              })
                            )
                          }
                          className="inline-flex w-full items-center justify-between rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-purple-700"
                        >
                          <span className="inline-flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Open Secure Chat
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-blue-100" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendRequest(lawyer.lawyerId)}
                          disabled={sendingTo === lawyer.lawyerId || pendingRequests[lawyer.lawyerId]}
                          className="inline-flex w-full items-center justify-between rounded-xl bg-linear-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {sendingTo === lawyer.lawyerId
                              ? 'Sending Request...'
                              : pendingRequests[lawyer.lawyerId]
                                ? 'Request Pending'
                                : 'Start Message Request'}
                          </span>
                          <ArrowUpRight className="h-4 w-4 text-blue-100" />
                        </button>
                      )}
                    </div>
                  </div>
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
        className="bg-white/95 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-blue-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-linear-to-r from-blue-50 to-purple-50 border-b border-blue-100 px-6 py-5 flex items-center justify-between backdrop-blur-sm">
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

        <div className="px-6 py-6 space-y-6 bg-linear-to-b from-white to-blue-50/30 bg-opacity-90">
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
            <div className="rounded-lg bg-blue-50/50 border border-blue-100 px-4 py-3">
              <p className="text-xs font-medium text-gray-600 uppercase">Location</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lawyer.officeLocation}</p>
            </div>
            <div className="rounded-lg bg-blue-50/50 border border-blue-100 px-4 py-3">
              <p className="text-xs font-medium text-gray-600 uppercase">Experience</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lawyer.yearsOfExperience} years</p>
            </div>
            <div className="rounded-lg bg-blue-50/50 border border-blue-100 px-4 py-3">
              <p className="text-xs font-medium text-gray-600 uppercase">Match Score</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{lawyer.matchPercent}%</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Case History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <HistoryStat label="Requests Received" value={lawyer.history?.requestsReceived ?? 0} />
              <HistoryStat label="Cases Taken" value={lawyer.history?.casesTaken ?? 0} />
              <HistoryStat label="Cases Won" value={lawyer.history?.casesWon ?? 0} />
              <HistoryStat label="Active Cases" value={lawyer.history?.activeCases ?? 0} />
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <HistoryStat label="Acceptance Rate" value={`${lawyer.history?.acceptanceRate ?? 0}%`} />
              <HistoryStat label="Completion Rate" value={`${lawyer.history?.completionRate ?? 0}%`} />
              <HistoryStat
                label="Avg Response"
                value={lawyer.history?.avgResponseHours ? `${lawyer.history.avgResponseHours}h` : 'N/A'}
              />
            </div>
          </div>

          {Array.isArray(lawyer.history?.topCategories) && lawyer.history.topCategories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Handled Categories</h3>
              <div className="flex flex-wrap gap-2">
                {lawyer.history.topCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          <RecentCaseList
            items={lawyer.history?.wonCaseHighlights || []}
            title="All Won Cases"
          />

          <RecentCaseList
            items={lawyer.history?.recentCaseHighlights || []}
            title="Recent Accepted Cases"
          />

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
