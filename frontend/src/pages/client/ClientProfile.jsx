import { useAuth } from '../../context/AuthContext';

function ClientProfile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.replace('/');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Client Profile
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
          <p className="text-gray-900 font-medium mt-1">{user?.fullName || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
          <p className="text-gray-900 font-medium mt-1">{user?.email || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
          <p className="text-gray-900 font-medium mt-1">{user?.phone || '-'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
          <p className="text-gray-900 font-medium mt-1 capitalize">{user?.role || '-'}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}

export default ClientProfile;
