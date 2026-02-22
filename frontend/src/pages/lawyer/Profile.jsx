import { Mail, Phone, MapPin, Briefcase, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Profile() {
  const { user } = useAuth();
  const profile = user?.lawyerProfile || {};
  const specializations = Array.isArray(profile.specialization) ? profile.specialization : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Lawyer Profile</h1>
        <p className="text-gray-600 mt-2">View your professional and account details.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <span className="font-medium">Full Name:</span> {user?.fullName || 'Not provided'}
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3 inline-flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            {user?.email || 'Not provided'}
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3 inline-flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            {user?.phone || 'Not provided'}
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <span className="font-medium">Role:</span> Lawyer
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Professional Details</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="rounded-lg bg-gray-50 px-4 py-3 inline-flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-gray-500" />
            License: {profile.barLicenseNumber || 'Not provided'}
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3 inline-flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            Experience: {profile.yearsOfExperience ?? 'Not provided'} years
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3 inline-flex items-center gap-2 md:col-span-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            Office: {profile.officeLocation || 'Not provided'}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Specialization</p>
          {specializations.length === 0 ? (
            <p className="text-sm text-gray-500">No specialization added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {specializations.map((item) => (
                <span key={item} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Bio</p>
          <p className="text-sm text-gray-600 leading-relaxed">{profile.bio || 'No bio provided yet.'}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
