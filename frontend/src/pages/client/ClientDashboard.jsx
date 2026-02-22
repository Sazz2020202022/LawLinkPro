import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Total Cases', value: 12 },
  { label: 'Pending Requests', value: 4 },
  { label: 'Accepted Cases', value: 6 },
];

const recentActivity = [
  'Case request sent to Advocate Sharma',
  'Property dispute consultation scheduled',
  'Document checklist shared for review',
];

function ClientDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim()?.split(' ')?.[0] || user?.fullName || 'Client';

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome, {firstName}
        </h2>
        <p className="text-gray-600 mt-1">Manage your cases and find the right lawyer.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/client/new-case"
          className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-blue-100"
        >
          <h3 className="font-semibold text-gray-900">Create New Case</h3>
          <p className="text-sm text-gray-600 mt-1">Start a legal request and connect with lawyers.</p>
        </Link>

        <Link
          to="/client/cases"
          className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-gray-900">My Cases</h3>
          <p className="text-sm text-gray-600 mt-1">Track all your ongoing and completed cases.</p>
        </Link>

        <Link
          to="/client/requests"
          className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-gray-900">Requests</h3>
          <p className="text-sm text-gray-600 mt-1">View lawyer responses and request updates.</p>
        </Link>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <ul className="space-y-3">
          {recentActivity.map((item) => (
            <li key={item} className="text-sm text-gray-700 border-b border-gray-100 pb-3 last:border-none last:pb-0">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ClientDashboard;
