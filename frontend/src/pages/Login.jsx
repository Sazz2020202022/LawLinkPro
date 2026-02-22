import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, Briefcase, UserRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [manualLoginFlow, setManualLoginFlow] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated && !manualLoginFlow) {
      navigate(user?.role === 'client' ? '/client/dashboard' : '/lawyer/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, manualLoginFlow, navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setManualLoginFlow(true);

    try {
      const response = await login(formData);
      const role = response?.user?.role;

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setSuccessMessage('Login successful.');

      setTimeout(() => {
        setManualLoginFlow(false);
        navigate(role === 'client' ? '/client/dashboard' : role === 'lawyer' ? '/lawyer/dashboard' : '/', {
          replace: true,
        });
      }, 2000);
    } catch (err) {
      setManualLoginFlow(false);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 max-w-sm rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-green-700">{successMessage}</p>
          </div>
        )}
        <div className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Form */}
            <div className="w-full lg:w-3/5 p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-2">
                  <Scale className="w-8 h-8 text-blue-600" />
                  <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    LawLinkPro
                  </h1>
                </div>
                <p className="text-gray-600">Legal Solutions at Your Fingertips</p>
              </div>

              {/* Form Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
                <p className="text-gray-600 mb-6">Welcome back! Please enter your credentials</p>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Signing In...' : 'Sign In Securely'}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Info Panel */}
            <div className="w-full lg:w-2/5 bg-linear-to-br from-blue-600 to-purple-700 p-8 md:p-12 text-white flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Welcome Back!</h3>
                  <p className="text-blue-100 leading-relaxed mb-6">
                    Access your personalized legal dashboard and continue managing your cases with ease.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">For Lawyers</p>
                      <p className="text-sm text-blue-100">
                        Access case management tools, client communications, and legal resources.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <UserRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">For Clients</p>
                      <p className="text-sm text-blue-100">
                        Connect with qualified lawyers, manage your cases, and track legal proceedings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <p className="text-sm text-blue-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    Your data is protected with enterprise-grade security and encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
