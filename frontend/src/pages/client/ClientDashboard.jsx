import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  MessageSquareText,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getClientProfileCompletion, getClientRequests, getMyCases } from '../../services/api';

const quickLinks = [
  {
    title: 'Create New Case',
    description: 'Start a new legal request and match with lawyers.',
    to: '/client/new-case',
    icon: FileText,
  },
  {
    title: 'My Cases',
    description: 'Track progress and timeline of your legal matters.',
    to: '/client/cases',
    icon: CheckCircle2,
  },
  {
    title: 'My Requests',
    description: 'See responses and open chats with accepted lawyers.',
    to: '/client/requests',
    icon: MessageSquareText,
  },
];

const today = new Date();

const STATUS_LABEL_MAP = {
  submitted: 'Submitted',
  matched: 'Matched',
  request_sent: 'Request Sent',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_STYLE_MAP = {
  submitted: 'bg-blue-50 text-blue-700',
  matched: 'bg-purple-50 text-purple-700',
  request_sent: 'bg-indigo-50 text-indigo-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
};

const URGENCY_LABEL_MAP = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const URGENCY_STYLE_MAP = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-red-50 text-red-700',
};

function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}

function HorizontalBarChart({ title, rows, emptyText }) {
  const maxValue = Math.max(1, ...rows.map((row) => Number(row.value || 0)));

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">{emptyText}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => {
            const safeValue = Number(row.value || 0);
            const width = `${Math.round((safeValue / maxValue) * 100)}%`;

            return (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>{row.label}</span>
                  <span className="font-semibold text-gray-900">{safeValue}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${row.colorClass}`} style={{ width }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function DashboardCalendar() {
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthLabel = new Date(year, month, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const dayCells = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activeDay = today.getDate();

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          Calendar
        </h3>
        <span className="text-xs text-gray-500">{monthLabel}</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {dayNames.map((name) => (
          <div key={name} className="text-[11px] font-semibold text-gray-500 py-1">
            {name}
          </div>
        ))}

        {dayCells.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className={`h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
              !day
                ? 'text-transparent'
                : day === activeDay
                  ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'text-gray-700 bg-gray-50'
            }`}
          >
            {day || '.'}
          </div>
        ))}
      </div>
    </article>
  );
}

function ClientDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim()?.split(' ')[0] || user?.fullName || 'Client';
  const [completion, setCompletion] = useState({
    isProfileComplete: true,
    profileCompletion: 100,
    missingFields: [],
  });
  const [stats, setStats] = useState({
    totalCases: 0,
    activeRequests: 0,
    acceptedRequests: 0,
    urgentCases: 0,
  });
  const [recentCases, setRecentCases] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [completionResponse, casesResponse, requestsResponse] = await Promise.all([
          getClientProfileCompletion(),
          getMyCases(),
          getClientRequests(),
        ]);

        setCompletion({
          isProfileComplete: Boolean(completionResponse.isProfileComplete),
          profileCompletion: Number(completionResponse.profileCompletion || 0),
          missingFields: completionResponse.missingFields || [],
        });

        const cases = casesResponse.cases || [];
        const requests = requestsResponse.requests || [];

        const sortedRecentCases = [...cases]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 4);

        setRecentCases(sortedRecentCases);
        setAllCases(cases);
        setAllRequests(requests);
        setStats({
          totalCases: cases.length,
          activeRequests: requests.filter((item) => item.status === 'pending').length,
          acceptedRequests: requests.filter((item) => item.status === 'accepted').length,
          urgentCases: cases.filter((item) => item.urgency === 'urgent' || item.urgency === 'high').length,
        });
      } catch {
        // Keep dashboard available even if profile-completion API is temporarily unavailable.
      }
    };

    loadDashboardData();
  }, []);

  const missingLabel = useMemo(() => {
    if (completion.missingFields.length === 0) {
      return 'All core profile fields are complete.';
    }

    return `Missing: ${completion.missingFields.join(', ')}`;
  }, [completion.missingFields]);

  const caseStatusRows = useMemo(() => {
    const counts = allCases.reduce((acc, item) => {
      const key = item.status || 'submitted';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const labels = {
      submitted: 'Submitted',
      matched: 'Matched',
      request_sent: 'Request Sent',
      accepted: 'Accepted',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      closed: 'Closed',
    };

    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-green-500',
      'bg-amber-500',
      'bg-emerald-500',
      'bg-gray-500',
    ];

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([status, value], index) => ({
        label: labels[status] || status,
        value,
        colorClass: colors[index % colors.length],
      }));
  }, [allCases]);

  const requestStatusRows = useMemo(() => {
    const pending = allRequests.filter((item) => item.status === 'pending').length;
    const accepted = allRequests.filter((item) => item.status === 'accepted').length;
    const rejected = allRequests.filter((item) => item.status === 'rejected').length;

    return [
      { label: 'Pending', value: pending, colorClass: 'bg-amber-500' },
      { label: 'Accepted', value: accepted, colorClass: 'bg-green-500' },
      { label: 'Rejected', value: rejected, colorClass: 'bg-red-500' },
    ];
  }, [allRequests]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
              <UserRound className="w-6 h-6 text-blue-600" />
              Welcome, {firstName}
            </h2>
            <p className="text-gray-600 mt-2">Manage your cases, requests, and lawyer communication from one workspace.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </Link>
              );
            })}
          </div>

          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-900">Profile Completion</h3>
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {completion.profileCompletion}%
              </span>
            </div>

            <div className="mt-3 h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-600 to-purple-600"
                style={{ width: `${Math.max(0, Math.min(100, completion.profileCompletion || 0))}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-gray-600">{missingLabel}</p>

            {!completion.isProfileComplete && (
              <Link
                to="/client/profile"
                className="mt-4 inline-flex px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Complete Profile
              </Link>
            )}
          </article>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Cases"
              value={String(stats.totalCases)}
              hint="All submitted legal cases"
              icon={BriefcaseBusiness}
            />
            <StatCard
              title="Pending Requests"
              value={String(stats.activeRequests)}
              hint="Lawyer responses awaited"
              icon={Clock3}
            />
            <StatCard
              title="Accepted Requests"
              value={String(stats.acceptedRequests)}
              hint="Chats available to continue"
              icon={CheckCircle2}
            />
            <StatCard
              title="High Priority Cases"
              value={String(stats.urgentCases)}
              hint="Urgent and high urgency matters"
              icon={Clock3}
            />
          </section>

          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-900">Recent Case Activity</h3>
              <Link to="/client/cases" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                View all
              </Link>
            </div>

            {recentCases.length === 0 ? (
              <p className="mt-4 text-sm text-gray-600">No case activity yet. Create your first case to get started.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {recentCases.map((item) => (
                  <Link
                    key={item._id}
                    to={`/client/cases/${item._id}`}
                    className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{item.title || 'Untitled case'}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            STATUS_STYLE_MAP[item.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {STATUS_LABEL_MAP[item.status] || 'Submitted'}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            URGENCY_STYLE_MAP[item.urgency] || 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {URGENCY_LABEL_MAP[item.urgency] || 'Medium'}
                        </span>
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-gray-600">{item.category || 'General'}</p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                      <div className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{item.location || 'Location not provided'}</span>
                      </div>
                      <div>
                        Budget: <span className="font-medium">{item.budgetRange || 'Not specified'}</span>
                      </div>
                      <div>
                        Incident:{' '}
                        <span className="font-medium">
                          {item.incidentDate ? new Date(item.incidentDate).toLocaleDateString() : 'Not specified'}
                        </span>
                      </div>
                      <div>
                        Documents: <span className="font-medium">{Array.isArray(item.documents) ? item.documents.length : 0}</span>
                      </div>
                    </div>

                    {item.description && (
                      <p className="mt-3 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                    )}

                    <p className="mt-3 text-[11px] text-gray-500">
                      Updated {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HorizontalBarChart
              title="Case Status Snapshot"
              rows={caseStatusRows}
              emptyText="No case status data available yet."
            />
            <HorizontalBarChart
              title="Request Outcome Split"
              rows={requestStatusRows}
              emptyText="No requests yet."
            />
          </section>
        </div>

        <div className="space-y-5">
          <DashboardCalendar />
        </div>
      </section>
    </div>
  );
}

export default ClientDashboard;
