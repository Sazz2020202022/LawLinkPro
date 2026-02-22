import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                className="relative h-10 w-10 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                aria-label="Notifications"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative h-10 w-10 rounded-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] ring-0 hover:ring-2 hover:ring-blue-100 transition-all"
                aria-label="Profile menu"
              >
                {initials}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              </button>

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
