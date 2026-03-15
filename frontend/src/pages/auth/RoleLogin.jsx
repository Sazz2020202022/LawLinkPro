import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, Eye, EyeOff, Briefcase, UserRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleMeta = {
  client: {
    title: 'Client Login',
    subtitle: 'Access your cases, requests, and lawyer conversations.',
    accent: 'from-blue-600 to-indigo-600',
    icon: UserRound,
  },
  lawyer: {
    title: 'Lawyer Login',
    subtitle: 'Manage incoming requests, clients, and active legal matters.',
    accent: 'from-indigo-600 to-purple-600',
    icon: Briefcase,
  },
};

function RoleLogin({ expectedRole }) {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [manualLoginFlow, setManualLoginFlow] = useState(false);

  const meta = roleMeta[expectedRole] || roleMeta.client;
  const RoleIcon = meta.icon;

  useEffect(() => {
    const savedEmail = localStorage.getItem(`rememberedEmail:${expectedRole}`);
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, [expectedRole]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated && !manualLoginFlow) {
      navigate(user?.role === 'client' ? '/client/dashboard' : '/lawyer/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, manualLoginFlow, navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setManualLoginFlow(true);

    try {
      const response = await login(formData);
      const role = response?.user?.role;

      if (role !== expectedRole) {
        logout();
        setManualLoginFlow(false);
        setError(
          expectedRole === 'lawyer'
            ? 'This page is only for lawyer accounts. Please use Client Login.'
            : 'This page is only for client accounts. Please use Lawyer Login.'
        );
        return;
      }

      if (rememberMe) {
        localStorage.setItem(`rememberedEmail:${expectedRole}`, formData.email.trim());
      } else {
        localStorage.removeItem(`rememberedEmail:${expectedRole}`);
      }

      setSuccessMessage('Login successful. Redirecting...');

      setTimeout(() => {
        setManualLoginFlow(false);
        navigate(expectedRole === 'client' ? '/client/dashboard' : '/lawyer/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      setManualLoginFlow(false);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7ff] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
        <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-sky-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-xl items-center justify-center">
      {successMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-sm rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-medium text-green-700">{successMessage}</p>
        </div>
      )}

      <div className="w-full rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-blue-100/60 ring-1 ring-blue-100/70 backdrop-blur-sm sm:p-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="font-['Poppins'] text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LawLinkPro
            </h1>
          </div>
          <Link to="/login" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <RoleIcon className="w-3.5 h-3.5" />
            {meta.title}
          </div>
          <h2 className="font-['Poppins'] mt-3 text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="mt-1 text-sm text-slate-600">{meta.subtitle}</p>
        </div>

        {error && (
          <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl bg-linear-to-r px-4 py-3 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${meta.accent}`}
          >
            {loading ? 'Signing In...' : `Sign In as ${expectedRole === 'client' ? 'Client' : 'Lawyer'}`}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
            Create Account
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}

export default RoleLogin;
