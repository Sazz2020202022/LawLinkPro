import { useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateLawyerAvailability } from '../../services/api';

const availabilityLabel = {
  available: 'Available',
  busy: 'Limited Capacity',
  on_leave: 'On Leave',
};

const availabilityStyle = {
  available: 'bg-green-50 text-green-700',
  busy: 'bg-amber-50 text-amber-700',
  on_leave: 'bg-gray-100 text-gray-700',
};

function Profile() {
  const { user, updateCurrentUser } = useAuth();
  const profile = user?.lawyerProfile || {};
  const specializations = Array.isArray(profile.specialization) ? profile.specialization : [];
  const [availability, setAvailability] = useState(profile.availability || 'available');
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState({ type: '', text: '' });

  const handleAvailabilityChange = async (nextAvailability) => {
    try {
      setSavingAvailability(true);
      setAvailabilityMessage({ type: '', text: '' });
      await updateLawyerAvailability(nextAvailability);
      setAvailability(nextAvailability);

      if (user) {
        updateCurrentUser({
          ...user,
          lawyerProfile: {
            ...(user.lawyerProfile || {}),
            availability: nextAvailability,
          },
        });
      }

      setAvailabilityMessage({ type: 'success', text: 'Availability updated.' });
    } catch (error) {
      setAvailabilityMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update availability.',
      });
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Lawyer Profile</h1>
        <p className="text-gray-600 mt-2">View your professional and account details.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              availabilityStyle[availability] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {availabilityLabel[availability] || 'Available'}
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            value={availability}
            onChange={(event) => handleAvailabilityChange(event.target.value)}
            disabled={savingAvailability}
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-60"
          >
            <option value="available">Available</option>
            <option value="busy">Limited Capacity</option>
            <option value="on_leave">On Leave</option>
          </select>
          {savingAvailability && <p className="text-sm text-gray-500">Saving...</p>}
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Limited Capacity means you can still take new requests and manage multiple active cases. Use On Leave to pause new work.
        </p>

        {availabilityMessage.text && (
          <p
            className={`mt-3 text-sm ${
              availabilityMessage.type === 'success' ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {availabilityMessage.text}
          </p>
        )}
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
