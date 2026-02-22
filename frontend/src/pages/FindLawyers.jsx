import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = ['Match Score', 'Rating', 'Experience'];
const MAX_VISIBLE_LAWYERS = 8;
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const LAWYERS_ENDPOINT = /\/api$/i.test(API_BASE_URL)
  ? `${API_BASE_URL}/lawyers`
  : `${API_BASE_URL}/api/lawyers`;

const filterLawyers = ({ list, searchTerm, specialization, location, sortBy }) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  let filtered = list.filter((lawyer) => {
    const matchesSearch =
      !normalizedSearch ||
      lawyer.fullName.toLowerCase().includes(normalizedSearch) ||
      lawyer.location.toLowerCase().includes(normalizedSearch) ||
      lawyer.specialization.some((item) => item.toLowerCase().includes(normalizedSearch));

    const matchesSpecialization = !specialization || lawyer.specialization.includes(specialization);
    const matchesLocation = !location || lawyer.location === location;

    return matchesSearch && matchesSpecialization && matchesLocation;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === 'Rating') return b.rating - a.rating;
    if (sortBy === 'Experience') return b.yearsExperience - a.yearsExperience;
    return b.matchScore - a.matchScore;
  });

  return filtered;
};

function FindLawyers() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [lawyers, setLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('Match Score');

  useEffect(() => {
    const controller = new AbortController();

    const loadLawyers = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const response = await fetch(LAWYERS_ENDPOINT, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch lawyers');
        }

        const data = await response.json();
        setLawyers(Array.isArray(data?.lawyers) ? data.lawyers : []);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        setLoadError('Unable to load lawyers right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLawyers();

    return () => controller.abort();
  }, []);

  const specializationOptions = useMemo(() => {
    return Array.from(new Set(lawyers.flatMap((lawyer) => lawyer.specialization || []))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [lawyers]);

  const locationOptions = useMemo(() => {
    return Array.from(new Set(lawyers.map((lawyer) => lawyer.location).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [lawyers]);

  const filteredLawyers = useMemo(
    () => filterLawyers({ list: lawyers, searchTerm, specialization, location, sortBy }),
    [lawyers, searchTerm, specialization, location, sortBy]
  );

  const visibleLawyers = useMemo(
    () => filteredLawyers.slice(0, MAX_VISIBLE_LAWYERS),
    [filteredLawyers]
  );

  const handleConnect = (lawyerName) => {
    if (isAuthenticated && user?.role === 'client') {
      alert(`Request sent to ${lawyerName} (demo)`);
      return;
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Find Verified Lawyers
          </h1>
          <p className="text-gray-600 mt-2">
            Browse by specialization and connect with the right professional.
          </p>

          <div className="mt-6">
            <label htmlFor="search" className="sr-only">
              Search lawyers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search by name, specialization, or location"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specializations</option>
              {specializationOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {locationOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  Sort: {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-600">Loading lawyers...</div>
        ) : loadError ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-red-600">{loadError}</div>
        ) : filteredLawyers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-600">
            No results found
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleLawyers.map((lawyer) => (
              <article
                key={lawyer.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{lawyer.fullName}</h3>
                  {lawyer.verified && (
                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {lawyer.specialization.map((item) => (
                    <span key={item} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>📍 {lawyer.location}</p>
                  <p>🧭 {lawyer.yearsExperience} years experience</p>
                  <p>⭐ {Number(lawyer.rating || 0).toFixed(1)} / 5</p>
                </div>

                <div className="mt-5 flex gap-2">
                  <Link
                    to={`/lawyers/${lawyer.id}`}
                    className="flex-1 text-center px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleConnect(lawyer.fullName)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {isAuthenticated && user?.role === 'client' ? 'Send Request' : 'Sign in to Connect'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default FindLawyers;
