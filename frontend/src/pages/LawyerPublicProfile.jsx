import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const LAWYERS_ENDPOINT = /\/api$/i.test(API_BASE_URL)
  ? `${API_BASE_URL}/lawyers`
  : `${API_BASE_URL}/api/lawyers`;

function LawyerPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [lawyer, setLawyer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadLawyer = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${LAWYERS_ENDPOINT}/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setLawyer(null);
          return;
        }

        const data = await response.json();
        setLawyer(data?.lawyer || null);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLawyer(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLawyer();

    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600">Loading lawyer...</div>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Lawyer not found</h1>
            <Link to="/lawyers" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              Back to Find Lawyers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleRequest = () => {
    if (isAuthenticated && user?.role === 'client') {
      alert('Request sent (demo)');
      return;
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lawyer.fullName}</h1>
              <p className="text-gray-600 mt-2">{lawyer.bio}</p>
            </div>
            {lawyer.verified && (
              <span className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {lawyer.specialization.map((item) => (
              <span key={item} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm text-gray-700">
            <div className="rounded-lg bg-gray-50 px-4 py-3">📍 {lawyer.location}</div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">🧭 {lawyer.yearsExperience} years experience</div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">⭐ {Number(lawyer.rating || 0).toFixed(1)} / 5</div>
          </div>

          <button
            type="button"
            onClick={handleRequest}
            className="mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isAuthenticated && user?.role === 'client' ? 'Send Request' : 'Sign in to Request'}
          </button>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Reviews</h2>
          <ul className="space-y-3">
            {(lawyer.reviews || []).slice(0, 3).map((review) => (
              <li key={review} className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                “{review}”
              </li>
            ))}
            {(lawyer.reviews || []).length === 0 && (
              <li className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">No public reviews yet.</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default LawyerPublicProfile;
