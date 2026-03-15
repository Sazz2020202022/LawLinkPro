import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  Inbox,
  FolderOpen,
  MessageSquare,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import QuickChatBox from '../components/QuickChatBox';
import { getLawyerDashboardMetrics, getLawyerRequests } from '../services/api';

const navItems = [
  { to: '/lawyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lawyer/requests', label: 'Requests', icon: Inbox },
  { to: '/lawyer/cases', label: 'Active Cases', icon: FolderOpen },
  { to: '/lawyer/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/lawyer/profile', label: 'Profile', icon: User },
];

function LawyerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelLoading, setPanelLoading] = useState(true);
  const [panelError, setPanelError] = useState('');
  const [panelData, setPanelData] = useState({
    availability: 'available',
    visibilityScore: 0,
    avgResponseTime: 'N/A',
    pendingRequests: 0,
    acceptedRequests: 0,
    activeCases: 0,
  });

  useEffect(() => {
    const loadPanelData = async () => {
      try {
        setPanelLoading(true);
        setPanelError('');

        const [metricsResponse, requestsResponse] = await Promise.all([
          getLawyerDashboardMetrics(),
          getLawyerRequests(),
        ]);

        const metrics = metricsResponse?.metrics || {};
        const requests = Array.isArray(requestsResponse?.requests) ? requestsResponse.requests : [];

        setPanelData({
          availability: metrics.availability || 'available',
          visibilityScore: Number(metrics.visibilityScore || 0),
          avgResponseTime: metrics.avgResponseTime || 'N/A',
          pendingRequests: requests.filter((item) => item.status === 'pending').length,
          acceptedRequests: requests.filter((item) => item.status === 'accepted').length,
          activeCases: requests.filter((item) => item.status === 'accepted').length,
        });
      } catch {
        setPanelError('Unable to load panel stats');
      } finally {
        setPanelLoading(false);
      }
    };

    loadPanelData();
  }, []);

  const availabilityLabel = {
    available: 'Available',
    busy: 'Busy',
    on_leave: 'On Leave',
  };

  const availabilityStyle = {
    available: 'bg-green-50 text-green-700',
    busy: 'bg-amber-50 text-amber-700',
    on_leave: 'bg-gray-100 text-gray-700',
  };

  const actionQueue = useMemo(() => {
    const queue = [];

    if (panelData.pendingRequests > 0) {
      queue.push(`${panelData.pendingRequests} request${panelData.pendingRequests > 1 ? 's' : ''} awaiting response`);
    }

    if (panelData.visibilityScore < 70) {
      queue.push('Improve profile and response time to increase visibility score');
    }

    if (panelData.pendingRequests === 0 && panelData.visibilityScore >= 70 && !panelLoading) {
      queue.push('No urgent actions pending right now');
    }

    return queue;
  }, [panelData.pendingRequests, panelData.visibilityScore, panelLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="md:hidden px-4 pt-4">
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 font-medium"
        >
          {sidebarOpen ? 'Close Menu' : 'Open Menu'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside
            className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white rounded-xl shadow-sm p-4 h-fit`}
          >
            <div className="mb-4 px-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Lawyer Panel</h2>
            </div>

            <div className="mb-4 px-2">
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  availabilityStyle[panelData.availability] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {availabilityLabel[panelData.availability] || 'Available'}
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Practice Snapshot</h3>

              {panelLoading ? (
                <p className="mt-2 text-xs text-gray-500">Loading stats...</p>
              ) : panelError ? (
                <p className="mt-2 text-xs text-red-600">{panelError}</p>
              ) : (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Visibility Score</span>
                    <span className="font-semibold text-gray-900">{panelData.visibilityScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg Response</span>
                    <span className="font-semibold text-gray-900">{panelData.avgResponseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-amber-700">{panelData.pendingRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Accepted</span>
                    <span className="font-semibold text-green-700">{panelData.acceptedRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Cases</span>
                    <span className="font-semibold text-blue-700">{panelData.activeCases}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Action Queue</h3>
              <div className="mt-2 space-y-2">
                {actionQueue.map((item) => (
                  <p key={item} className="text-xs text-gray-600 inline-flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-amber-600" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <Link
                to="/lawyer/requests"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                Review Requests
              </Link>
              <Link
                to="/lawyer/cases"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Open Active Cases
              </Link>
              <Link
                to="/lawyer/profile"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <Activity className="w-3.5 h-3.5" />
                Update Profile
              </Link>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-4 bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Lawyer Workspace
                </h1>
                <Link to="/lawyer/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
                  Overview
                </Link>
              </div>
            </div>
            <Outlet />
          </main>
        </div>
      </div>

      <QuickChatBox />
    </div>
  );
}

export default LawyerLayout;
