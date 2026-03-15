import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock3, Star, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getLawyerDashboardMetrics, getLawyerRequests } from '../../services/api';

const availabilityStyle = {
  available: 'bg-green-50 text-green-700',
  busy: 'bg-amber-50 text-amber-700',
  on_leave: 'bg-gray-100 text-gray-700',
};

const availabilityLabel = {
  available: 'Available',
  busy: 'Busy',
  on_leave: 'On Leave',
};

function MetricCard({ title, value, hint, icon: Icon }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
          {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </article>
  );
}

function MiniColumnChart({ title, data, emptyText }) {
  const max = Math.max(1, ...data.map((item) => Number(item.value || 0)));

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">{emptyText}</p>
      ) : (
        <div className="mt-5 flex items-end gap-2 h-32">
          {data.map((item) => {
            const value = Number(item.value || 0);
            const height = `${Math.max(8, Math.round((value / max) * 100))}%`;

            return (
              <div key={item.label} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="text-[11px] font-semibold text-gray-700">{value}</div>
                <div className="w-full rounded-t-md bg-blue-500/85" style={{ height }} />
                <div className="text-[10px] text-gray-500">{item.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function DonutSplit({ title, accepted, rejected }) {
  const total = accepted + rejected;
  const acceptedPct = total > 0 ? Math.round((accepted / total) * 100) : 0;
  const rejectedPct = total > 0 ? 100 - acceptedPct : 0;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full bg-gray-100">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#16a34a 0% ${acceptedPct}%, #ef4444 ${acceptedPct}% 100%)`,
            }}
          />
          <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-gray-700">
            {total}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p className="inline-flex items-center gap-2 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
            Accepted: {accepted} ({acceptedPct}%)
          </p>
          <p className="inline-flex items-center gap-2 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Rejected: {rejected} ({rejectedPct}%)
          </p>
        </div>
      </div>
    </article>
  );
}

function LawyerDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim()?.split(' ')[0] || 'Counsel';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    visibilityScore: 0,
    profileCompleteness: 0,
    availability: 'available',
    rating: 0,
    avgResponseTime: 'N/A',
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const [metricsResponse, requestsResponse] = await Promise.all([
          getLawyerDashboardMetrics(),
          getLawyerRequests(),
        ]);

        setMetrics(metricsResponse.metrics || {});

        const allRequests = requestsResponse.requests || [];
        setRequests(allRequests);

        const pendingCount = allRequests.filter(
          (item) => item.status === 'pending'
        ).length;
        setPendingRequestsCount(pendingCount);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const acceptedCount = requests.filter((item) => item.status === 'accepted').length;
  const rejectedCount = requests.filter((item) => item.status === 'rejected').length;
  const recentPending = requests
    .filter((item) => item.status === 'pending')
    .slice(0, 4);
  const weeklyIncoming = (() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        day: date.getDay(),
        dateKey: date.toDateString(),
      };
    });

    return buckets.map((bucket) => {
      const value = requests.filter(
        (item) => new Date(item.createdAt).toDateString() === bucket.dateKey
      ).length;

      return {
        label: dayLabels[bucket.day],
        value,
      };
    });
  })();

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              <UserRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
              <p className="text-gray-600 mt-1">Monitor your visibility and response performance.</p>
            </div>
          </div>

          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              availabilityStyle[metrics.availability] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {availabilityLabel[metrics.availability] || 'Available'}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-600">AI Visibility Score</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">{metrics.visibilityScore || 0}%</h2>
              <p className="mt-2 text-sm text-gray-600">
                Complete your profile and respond faster to improve AI ranking.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-5 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-600 to-purple-600"
              style={{ width: `${Math.max(0, Math.min(100, metrics.visibilityScore || 0))}%` }}
            />
          </div>
        </article>

        <MetricCard
          title="Avg Response Time"
          value={metrics.avgResponseTime || 'N/A'}
          hint="Based on accepted/rejected request actions"
          icon={Clock3}
        />

        <MetricCard
          title="Average Rating"
          value={metrics.rating ? `${metrics.rating}/5` : 'N/A'}
          hint="Current profile quality indicator"
          icon={Star}
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Pending Requests"
          value={String(pendingRequestsCount)}
          hint="Respond quickly to improve visibility score"
          icon={Activity}
        />

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-600">Profile Completeness</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{metrics.profileCompleteness || 0}%</h3>
          <div className="mt-4 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-600 to-purple-600"
              style={{ width: `${Math.max(0, Math.min(100, metrics.profileCompleteness || 0))}%` }}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              to="/lawyer/profile"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Update Profile
            </Link>
            <Link
              to="/lawyer/requests"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              View Requests
            </Link>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900">Latest Pending Requests</h3>
            <Link to="/lawyer/requests" className="text-sm font-medium text-blue-700 hover:text-blue-800">
              Open all
            </Link>
          </div>

          {recentPending.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No pending requests right now.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentPending.map((item) => (
                <div key={item._id} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-900">{item.client?.fullName || 'Client'}</p>
                  <p className="mt-1 text-xs text-gray-600">{item.case?.title || 'Untitled case'}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Received {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-900">Request Breakdown</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 px-3 py-2 text-sm">
              <span className="text-yellow-800">Pending</span>
              <span className="font-semibold text-yellow-900">{pendingRequestsCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
              <span className="text-green-800">Accepted</span>
              <span className="font-semibold text-green-900">{acceptedCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
              <span className="text-red-800">Rejected</span>
              <span className="font-semibold text-red-900">{rejectedCount}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link
              to="/lawyer/cases"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 text-center"
            >
              Go to Active Cases
            </Link>
            <Link
              to="/lawyer/requests"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-center"
            >
              Review Incoming Requests
            </Link>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniColumnChart
          title="7-Day Incoming Requests"
          data={weeklyIncoming}
          emptyText="No requests in the last 7 days."
        />
        <DonutSplit title="Decision Ratio" accepted={acceptedCount} rejected={rejectedCount} />
      </section>
    </div>
  );
}

export default LawyerDashboard;
