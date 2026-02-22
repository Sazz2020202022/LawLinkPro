import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../services/api';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const dashboardPath = user?.role === 'client' ? '/client/dashboard' : '/lawyer/dashboard';
  const showClientProfile = user?.role === 'client';

  const initials = useMemo(() => {
    const fullName = (user?.fullName || '').trim();
    if (!fullName) return 'U';
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [user?.fullName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const response = await getNotifications();
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [isAuthenticated]);

  const formatNotificationType = (type) => {
    if (type === 'request_sent') return 'Request Sent';
    if (type === 'request_accepted') return 'Request Accepted';
    return 'Notification';
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId && !item.read
            ? { ...item, read: true, readAt: new Date().toISOString() }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Keep UX silent for now to avoid interrupting primary actions
    }
  };

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    window.location.replace('/');
  };

  const handleDashboardClick = () => {
    closeMenu();
    navigate(dashboardPath);
  };

  const handleProfileClick = () => {
    closeMenu();
    if (showClientProfile) {
      navigate('/client/profile');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAuthenticated ? dashboardPath : '/'} className="flex items-center space-x-2 group">
            <span className="text-3xl transition-transform group-hover:scale-110">⚖️</span>
            <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LawLinkPro
            </span>
          </Link>

          {!isAuthenticated ? (
            <>
              <ul className="hidden md:flex items-center space-x-1">
                <li>
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/about')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/lawyers"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/lawyers')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    Find Lawyers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/contact')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>

              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2" ref={dropdownRef}>

              <button
                type="button"
                onClick={() => {
                  setIsNotificationOpen((prev) => !prev);
                  setIsOpen(false);
                }}
                className="relative h-10 w-10 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 mx-auto" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold leading-5 text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen((prev) => !prev);
                  setIsNotificationOpen(false);
                }}
                className="relative h-10 w-10 rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] ring-0 hover:ring-2 hover:ring-blue-100 transition-all"
                aria-label="Profile menu"
              >
                {initials}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              </button>

              <div
                className={`absolute right-16 sm:right-20 lg:right-24 top-14 w-80 max-w-[90vw] bg-white shadow-lg rounded-xl border border-gray-100 py-2 origin-top-right transition-all duration-150 ${
                  isNotificationOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  {unreadCount > 0 && <span className="text-xs text-blue-600 font-medium">{unreadCount} unread</span>}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <p className="px-4 py-3 text-sm text-gray-600">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-600">No notifications yet.</p>
                  ) : (
                    notifications.map((item) => (
                      <div key={item._id} className={`px-4 py-3 border-b border-gray-50 ${item.read ? 'bg-white' : 'bg-blue-50/40'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-blue-700">{formatNotificationType(item.type)}</p>
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{item.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                          </div>
                          {!item.read && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(item._id)}
                              className="shrink-0 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div
                className={`absolute right-4 sm:right-6 lg:right-8 top-14 w-52 bg-white shadow-lg rounded-xl border border-gray-100 py-2 origin-top-right transition-all duration-150 ${
                  isOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <button
                  type="button"
                  onClick={handleDashboardClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Dashboard
                </button>

                {showClientProfile && (
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
