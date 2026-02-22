import { Link } from 'react-router-dom';
import { Bell, Briefcase, CheckCircle2, ClipboardList, Star, UserRound, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Check, Circle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const summaryStats = [
  {
    title: 'New Requests',
    value: '5',
    icon: ClipboardList,
    showIndicator: true,
  },
  {
    title: 'Active Cases',
    value: '8',
    icon: Briefcase,
  },
  {
    title: 'Completed Cases',
    value: '21',
    icon: CheckCircle2,
  },
  {
    title: 'Average Rating',
    value: '4.6',
    icon: Star,
    ratingStars: '★★★★☆',
  },
];

const recentRequests = [
  {
    id: 'req-1',
    clientName: 'Riya Sharma',
    caseTitle: 'Child Custody Petition',
    specialization: 'Family Law',
    date: 'Feb 20, 2026',
  },
  {
    id: 'req-2',
    clientName: 'Aman Karki',
    caseTitle: 'Bail Application Support',
    specialization: 'Criminal Law',
    date: 'Feb 19, 2026',
  },
  {
    id: 'req-3',
    clientName: 'Sita Lama',
    caseTitle: 'Land Ownership Transfer',
    specialization: 'Property Law',
    date: 'Feb 18, 2026',
  },
  {
    id: 'req-4',
    clientName: 'Bikram Adhikari',
    caseTitle: 'Company Contract Review',
    specialization: 'Corporate Law',
    date: 'Feb 17, 2026',
  },
  {
    id: 'req-5',
    clientName: 'Neha Gurung',
    caseTitle: 'Work Permit Documentation',
    specialization: 'Immigration Law',
    date: 'Feb 16, 2026',
  },
];

const activeCases = [
  {
    id: 'case-101',
    title: 'Tenancy Dispute Resolution',
    status: 'In Progress',
    updatedAt: 'Feb 20, 2026',
  },
  {
    id: 'case-102',
    title: 'Employment Termination Claim',
    status: 'Pending',
    updatedAt: 'Feb 19, 2026',
  },
  {
    id: 'case-103',
    title: 'VAT Audit Advisory',
    status: 'Completed',
    updatedAt: 'Feb 18, 2026',
  },
  {
    id: 'case-104',
    title: 'Cyber Fraud Complaint',
    status: 'In Progress',
    updatedAt: 'Feb 16, 2026',
  },
];

const statusPillStyles = {
  Pending: 'bg-yellow-50 text-yellow-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  Completed: 'bg-green-50 text-green-700',
};

// NEW: Dummy data for widgets
const nextMeeting = {
  clientName: 'Riya Sharma',
  caseTitle: 'Child Custody Petition',
  date: 'Feb 22, 2026',
  time: '3:30 PM',
  location: 'Zoom call',
  status: 'Upcoming',
};

const weeklyRequests = [
  { day: 'Mon', count: 3 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 2 },
  { day: 'Thu', count: 7 },
  { day: 'Fri', count: 4 },
  { day: 'Sat', count: 1 },
  { day: 'Sun', count: 0 },
];

const caseStatusData = {
  pending: 5,
  inProgress: 8,
  completed: 21,
};

const profileChecklistItems = [
  { label: 'Bio', completed: true },
  { label: 'Specialization', completed: true },
  { label: 'Bar License', completed: false },
  { label: 'Office Location', completed: true },
  { label: 'Consultation Fee', completed: false },
];

// Helper component: Next Meeting Card
function NextMeetingCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Next Meeting</h3>
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          Upcoming
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Client</p>
          <p className="font-medium text-gray-900 mt-1">{nextMeeting.clientName}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Case</p>
          <p className="font-medium text-gray-900 mt-1">{nextMeeting.caseTitle}</p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{nextMeeting.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span>{nextMeeting.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{nextMeeting.location}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex gap-2">
          <Link
            to="/lawyer/cases"
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all duration-200 text-center"
          >
            View Case
          </Link>
          <button
            type="button"
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component: Mini Calendar
function MiniCalendar() {
  const [currentDate] = useState(new Date(2026, 1, 21)); // Feb 21, 2026
  const today = 21;
  const meetingDay = 22;

  const monthDays = Array.from({ length: 28 }, (_, i) => i + 1);
  const firstDayOfMonth = new Date(2026, 1, 1).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);
  const daysDisplay = [...emptyDays, ...monthDays];

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        <div className="flex gap-1">
          <button type="button" className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button type="button" className="p-1 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center mb-4">February 2026</p>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-xs font-semibold text-gray-500 py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {daysDisplay.map((day, idx) => (
          <div
            key={idx}
            className={`aspect-square flex items-center justify-center text-xs font-medium rounded-lg relative transition-all duration-200 ${
              !day
                ? 'text-gray-300'
                : day === today
                  ? 'bg-blue-600 text-white rounded-full'
                  : day === meetingDay
                    ? 'bg-gray-100 text-gray-900 border border-blue-300'
                    : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {day}
            {day === meetingDay && (
              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper component: Performance Snapshot
function PerformanceSnapshot() {
  const maxRequests = Math.max(...weeklyRequests.map((d) => d.count));
  const totalRequests = weeklyRequests.reduce((sum, d) => sum + d.count, 0);
  const totalCases = caseStatusData.pending + caseStatusData.inProgress + caseStatusData.completed;
  const acceptanceRate = 82;
  const avgResponseTime = '2h 15m';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Snapshot</h3>

      <div className="space-y-6">
        {/* Weekly Requests Bar Chart */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Requests This Week</p>
          <div className="flex items-end gap-1.5 h-20 justify-between">
            {weeklyRequests.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-linear-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 transition-all duration-200"
                  style={{ height: item.count > 0 ? `${(item.count / maxRequests) * 100}%` : '4px' }}
                />
                <span className="text-xs text-gray-600">{item.day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">Total: {totalRequests} requests</p>
        </div>

        {/* Case Status Distribution */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Case Status Distribution</p>
          <div className="space-y-2">
            {/* Pending */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-gray-900">{caseStatusData.pending}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${(caseStatusData.pending / totalCases) * 100}%` }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold text-gray-900">{caseStatusData.inProgress}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(caseStatusData.inProgress / totalCases) * 100}%` }}
                />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-gray-900">{caseStatusData.completed}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(caseStatusData.completed / totalCases) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Acceptance Rate</span>
            <span className="font-semibold text-gray-900">{acceptanceRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Avg Response Time</span>
            <span className="font-semibold text-gray-900">{avgResponseTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component: Profile Completeness Checklist
function ProfileCompletenessCard({ profileProgress }) {
  const completedItems = profileChecklistItems.filter((item) => item.completed).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h2 className="text-lg font-semibold text-gray-900">Profile Completeness</h2>
      <p className="text-sm text-gray-600 mt-2">
        {completedItems} of {profileChecklistItems.length} fields completed
      </p>

      <div className="mt-4">
        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: `${profileProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{profileProgress}% completed</p>
      </div>

      <div className="mt-4 space-y-2">
        {profileChecklistItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.completed ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
            <span className={`text-sm ${item.completed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/lawyer/profile"
        className="mt-5 inline-flex items-center justify-center w-full px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
      >
        Complete Profile
      </Link>
    </div>
  );
}

function LawyerDashboard() {
  const { user } = useAuth();

  const firstName = user?.fullName?.trim()?.split(' ')[0] || 'Counsel';
  const profileProgress = 70;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
              <UserRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {firstName}</h1>
              <p className="text-gray-600 mt-1">Manage your cases and client requests efficiently.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 mx-auto" />
            </button>
            <Link
              to="/lawyer/requests"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              View Requests
            </Link>
          </div>
        </div>
      </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-5 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>
                      {item.showIndicator && Number(item.value) > 0 && (
                        <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                      )}
                    </div>
                    {item.ratingStars && <p className="text-sm text-yellow-500 mt-2">{item.ratingStars}</p>}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Recent Client Requests */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Client Requests</h2>
                <Link to="/lawyer/requests" className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-900">{request.clientName}</p>
                      <p className="text-sm text-gray-500">{request.caseTitle}</p>
                    </div>
                    <p className="text-sm text-gray-700">{request.specialization}</p>
                    <p className="text-sm text-gray-500">{request.date}</p>
                    <div className="md:col-span-2 flex items-center gap-2 md:justify-end">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-all duration-200"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Cases Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Active Cases Preview</h2>
                <Link to="/lawyer/cases" className="text-sm text-blue-600 hover:text-blue-700">
                  View all cases
                </Link>
              </div>

              <div className="space-y-3">
                {activeCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{caseItem.title}</p>
                      <p className="text-sm text-gray-500 mt-1">Last updated: {caseItem.updatedAt}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusPillStyles[caseItem.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {caseItem.status}
                      </span>
                      <Link to={`/lawyer/cases/${caseItem.id}`} className="text-sm text-blue-600 hover:text-blue-700">
                        View Case
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="space-y-6">
            <NextMeetingCard />
            <MiniCalendar />
            <ProfileCompletenessCard profileProgress={profileProgress} />
            <PerformanceSnapshot />
          </div>
        </section>
      </div>
    );
  }
  
  export default LawyerDashboard;
