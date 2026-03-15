import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, ShieldPlus, UserRound } from 'lucide-react';
import { getClientProfileForLawyer } from '../../services/api';

const formatDate = (value) => {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not provided';
  }

  return date.toLocaleDateString();
};

function ClientProfile() {
  const { clientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [client, setClient] = useState(null);
  const [linkedRequest, setLinkedRequest] = useState(null);

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getClientProfileForLawyer(clientId);
        setClient(response.client || null);
        setLinkedRequest(response.linkedRequest || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load client profile');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const completionLabel = useMemo(() => {
    if (!client) {
      return 'Profile completion unavailable';
    }

    return `${Math.max(0, Math.min(100, Number(client.profileCompletion || 0)))}% complete`;
  }, [client]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-600">
        Loading client profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-red-600">{error}</p>
        <Link
          to="/lawyer/requests"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Link
          to="/lawyer/requests"
          className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        <div className="mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
              <UserRound className="w-6 h-6 text-blue-600" />
              {client?.fullName || 'Client'}
            </h1>
            <p className="mt-2 text-gray-600">Client profile and contact details linked to your request.</p>
          </div>

          <span className="self-start inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700">
            {completionLabel}
          </span>
        </div>

        <div className="mt-4 h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-600 to-purple-600"
            style={{ width: `${Math.max(0, Math.min(100, Number(client?.profileCompletion || 0)))}%` }}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p className="inline-flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              {client?.email || 'Not provided'}
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              {client?.phone || 'Not provided'}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              {client?.location || 'Not provided'}
            </p>
          </div>
        </article>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Personal Details</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-900">Date of Birth:</span> {formatDate(client?.dateOfBirth)}
            </p>
            <p>
              <span className="font-medium text-gray-900">Gender:</span> {client?.gender || 'Not provided'}
            </p>
            <p>
              <span className="font-medium text-gray-900">Preferred Language:</span>{' '}
              {client?.preferredLanguage || 'Not provided'}
            </p>
          </div>
        </article>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Profile Note</h2>
          <p className="mt-3 text-sm text-gray-700 leading-6">{client?.bio || 'No profile note provided.'}</p>
        </article>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 inline-flex items-center gap-2">
            <ShieldPlus className="w-5 h-5 text-blue-600" />
            Emergency Contact
          </h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-900">Name:</span>{' '}
              {client?.emergencyContactName || 'Not provided'}
            </p>
            <p>
              <span className="font-medium text-gray-900">Phone:</span>{' '}
              {client?.emergencyContactPhone || 'Not provided'}
            </p>
          </div>

          {linkedRequest && (
            <p className="mt-4 text-xs text-gray-500">
              Linked request status: {linkedRequest.status} | Connected on{' '}
              {formatDate(linkedRequest.createdAt)}
            </p>
          )}
        </article>
      </section>
    </div>
  );
}

export default ClientProfile;