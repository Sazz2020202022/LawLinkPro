import { Link } from 'react-router-dom';
import { Scale, FolderKanban, MessageSquare, BookOpen, TrendingUp, Clock, Shield, Users, CheckCircle, Award } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[30px_30px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Professional Legal Solutions{' '}
              <span className="block text-yellow-300 mt-2">At Your Fingertips</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10">
              Connect with experienced lawyers, manage your cases efficiently, 
              and access comprehensive legal resources all in one platform.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                to="/lawyers"
                className="px-8 py-4 bg-blue-800 text-white font-bold rounded-lg shadow-lg hover:bg-blue-900 hover:scale-105 transition-all duration-200 w-full sm:w-auto border-2 border-white/20"
              >
                Find a Lawyer
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-yellow-300 mr-2" />
                  <div className="text-4xl font-extrabold text-yellow-300">500+</div>
                </div>
                <div className="text-blue-100 font-medium text-center">Verified Lawyers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <FolderKanban className="w-8 h-8 text-yellow-300 mr-2" />
                  <div className="text-4xl font-extrabold text-yellow-300">10,000+</div>
                </div>
                <div className="text-blue-100 font-medium text-center">Cases Handled</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-8 h-8 text-yellow-300 mr-2" />
                  <div className="text-4xl font-extrabold text-yellow-300">98%</div>
                </div>
                <div className="text-blue-100 font-medium text-center">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose LawLinkPro?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive legal platform designed for both lawyers and clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                All lawyers are thoroughly vetted and verified to ensure you receive quality legal representation.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Case Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your cases, documents, and communications in one secure, organized platform.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Communication</h3>
              <p className="text-gray-600 leading-relaxed">
                Encrypted messaging system ensures your conversations remain confidential and secure.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Legal Resources</h3>
              <p className="text-gray-600 leading-relaxed">
                Access extensive library of legal documents, templates, and educational materials.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">24/7 Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage your legal matters anytime, anywhere from any device with internet access.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparent Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                No hidden fees. See lawyer rates upfront and choose services that fit your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-linear-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-xl">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="pt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Account</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sign up as a client or lawyer. Complete your profile to get started.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-xl">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="pt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect & Communicate</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse lawyers by specialty or get matched. Start secure conversations.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-xl">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="pt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Manage Your Case</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track progress, share documents, and stay updated on your legal matters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of satisfied clients and lawyers using LawLinkPro
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-4 bg-white text-blue-700 font-bold rounded-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
