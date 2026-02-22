import Navbar from '../layouts/Navbar';

function ClientDashboard() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
          <p className="text-gray-600">Welcome to your LawLinkPro client dashboard.</p>
        </div>
      </div>
    </>
  );
}

export default ClientDashboard;
