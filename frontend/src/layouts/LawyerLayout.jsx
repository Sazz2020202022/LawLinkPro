import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Inbox, FolderOpen, MessageSquare, User } from 'lucide-react';
import Navbar from '../components/Navbar';

const navItems = [
  { to: '/lawyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lawyer/requests', label: 'Requests', icon: Inbox },
  { to: '/lawyer/cases', label: 'Active Cases', icon: FolderOpen },
  { to: '/lawyer/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/lawyer/profile', label: 'Profile', icon: User },
];

function LawyerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </div>
  );
}

export default LawyerLayout;
