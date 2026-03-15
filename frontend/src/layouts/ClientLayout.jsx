import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { AlertTriangle, Clock3, FileSearch, LayoutDashboard, FilePlus, FolderOpen, Inbox, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import QuickChatBox from '../components/QuickChatBox';
import { getClientRequests, getMyCases } from '../services/api';

const navItems = [
  { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/client/new-case', label: 'New Case', icon: FilePlus },
  { to: '/client/cases', label: 'My Cases', icon: FolderOpen },
  { to: '/client/requests', label: 'Requests', icon: Inbox },
  { to: '/client/profile', label: 'Profile', icon: User },
];

function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelLoading, setPanelLoading] = useState(true);
  const [panelStats, setPanelStats] = useState({
    totalCases: 0,
    pendingRequests: 0,
    activeCases: 0,
    highPriorityCases: 0,
  });

  useEffect(() => {
    const loadPanelStats = async () => {
      try {
        setPanelLoading(true);
        const [casesResponse, requestsResponse] = await Promise.all([getMyCases(), getClientRequests()]);
        const cases = Array.isArray(casesResponse?.cases) ? casesResponse.cases : [];
        const requests = Array.isArray(requestsResponse?.requests) ? requestsResponse.requests : [];

        setPanelStats({
          totalCases: cases.length,
          pendingRequests: requests.filter((item) => item.status === 'pending').length,
          activeCases: cases.filter((item) => ['accepted', 'in_progress'].includes(item.status)).length,
          highPriorityCases: cases.filter((item) => ['high', 'urgent'].includes(item.urgency)).length,
        });
      } catch {
        setPanelStats({
          totalCases: 0,
          pendingRequests: 0,
          activeCases: 0,
          highPriorityCases: 0,
        });
      } finally {
        setPanelLoading(false);
      }
    };

    loadPanelStats();
  }, []);

  const pendingTasks = useMemo(() => {
    const tasks = [];

    if (panelStats.pendingRequests > 0) {
      tasks.push(`${panelStats.pendingRequests} pending request${panelStats.pendingRequests > 1 ? 's' : ''}`);
    }

    if (panelStats.highPriorityCases > 0) {
      tasks.push(`${panelStats.highPriorityCases} high priority case${panelStats.highPriorityCases > 1 ? 's' : ''}`);
    }

    if (tasks.length === 0 && !panelLoading) {
      tasks.push('No urgent tasks right now');
    }

    return tasks;
  }, [panelStats.pendingRequests, panelStats.highPriorityCases, panelLoading]);

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
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Client Panel</h2>
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
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Panel Snapshot</h3>

              {panelLoading ? (
                <p className="mt-2 text-xs text-gray-500">Loading stats...</p>
              ) : (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Cases</span>
                    <span className="font-semibold text-gray-900">{panelStats.totalCases}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Cases</span>
                    <span className="font-semibold text-gray-900">{panelStats.activeCases}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Requests</span>
                    <span className="font-semibold text-amber-700">{panelStats.pendingRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">High Priority</span>
                    <span className="font-semibold text-red-700">{panelStats.highPriorityCases}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-3">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Pending Tasks</h3>
              <div className="mt-2 space-y-2">
                {pendingTasks.map((task) => (
                  <p key={task} className="text-xs text-gray-600 inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {task}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Link
                to="/client/new-case"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <FilePlus className="w-3.5 h-3.5" />
                Create Case
              </Link>
              <Link
                to="/client/requests"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <Clock3 className="w-3.5 h-3.5" />
                Review Requests
              </Link>
              <Link
                to="/client/cases"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <FileSearch className="w-3.5 h-3.5" />
                Open Case List
              </Link>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-4 bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Client Workspace
                </h1>
                <Link to="/client/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
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

export default ClientLayout;
