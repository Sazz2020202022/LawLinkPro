import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientProfile, updateClientProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  preferredLanguage: '',
  bio: '',
  dateOfBirth: '',
  gender: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

const requiredFieldLabels = {
  phone: 'Phone',
  location: 'Location',
  preferredLanguage: 'Preferred Language',
  bio: 'Short Profile Note',
};

function CompleteProfile() {
  const navigate = useNavigate();
  const { user, updateCurrentUser } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completion, setCompletion] = useState({
    isProfileComplete: false,
    profileCompletion: 0,
    missingFields: ['phone', 'location', 'preferredLanguage', 'bio'],
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getClientProfile();
        const profile = response.profile || {};

        setFormData({
          fullName: profile.fullName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          preferredLanguage: profile.preferredLanguage || '',
          bio: profile.bio || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : '',
          gender: profile.gender || '',
          emergencyContactName: profile.emergencyContactName || '',
          emergencyContactPhone: profile.emergencyContactPhone || '',
        });

        setCompletion({
          isProfileComplete: Boolean(response.isProfileComplete),
          profileCompletion: Number(response.profileCompletion || 0),
          missingFields: response.missingFields || [],
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const missingLabels = useMemo(
    () => (completion.missingFields || []).map((field) => requiredFieldLabels[field] || field),
    [completion.missingFields]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.phone.trim() || !formData.location.trim() || !formData.preferredLanguage.trim() || !formData.bio.trim()) {
      setError('Please complete all required fields before continuing.');
      return;
    }

    try {
      setSaving(true);
      const response = await updateClientProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        preferredLanguage: formData.preferredLanguage,
        bio: formData.bio,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      });

      setCompletion({
        isProfileComplete: Boolean(response.isProfileComplete),
        profileCompletion: Number(response.profileCompletion || 0),
        missingFields: response.missingFields || [],
      });

      if (user) {
        updateCurrentUser({
          ...user,
          fullName: response.profile?.fullName || user.fullName,
          phone: response.profile?.phone || user.phone,
          clientProfile: {
            ...(user.clientProfile || {}),
            location: response.profile?.location || '',
            dateOfBirth: response.profile?.dateOfBirth || null,
            gender: response.profile?.gender || '',
            preferredLanguage: response.profile?.preferredLanguage || '',
            bio: response.profile?.bio || '',
            emergencyContactName: response.profile?.emergencyContactName || '',
            emergencyContactPhone: response.profile?.emergencyContactPhone || '',
          },
          profileCompletion: response.profileCompletion,
          isProfileComplete: response.isProfileComplete,
          missingFields: response.missingFields || [],
        });
      }

      setSuccess('Profile saved successfully.');

      if (response.isProfileComplete) {
        setTimeout(() => {
          navigate('/client/dashboard', { replace: true });
        }, 600);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
        Loading profile form...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              A complete profile improves your recommendations and enables smoother lawyer communication.
            </p>
          </div>
          <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
            {completion.profileCompletion}%
          </span>
        </div>

        <div className="mt-4 h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-600 to-purple-600"
            style={{ width: `${Math.max(0, Math.min(100, completion.profileCompletion || 0))}%` }}
          />
        </div>

        {!completion.isProfileComplete && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Missing required fields:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingLabels.map((item) => (
                <span key={item} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white text-blue-700 border border-blue-100">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-700">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language *</label>
              <input
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Profile Note *</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-800 mb-3">Optional Extras</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                <input
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                <input
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : completion.isProfileComplete ? 'Save Profile' : 'Save And Continue'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default CompleteProfile;
