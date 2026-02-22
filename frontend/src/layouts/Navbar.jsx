import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-3xl transition-transform group-hover:scale-110">⚖️</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LawLinkPro
            </span>
          </Link>

          {/* Navigation Links */}
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
                to="/services"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/services')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Services
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
