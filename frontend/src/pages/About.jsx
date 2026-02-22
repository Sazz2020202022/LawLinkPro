import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-5 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About LawLinkPro
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            LawLinkPro helps clients find the right legal professional faster using AI-based matching and a
            secure case workflow—simple, private, and efficient.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-7 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
            <Link
              to="/lawyers"
              className="px-7 py-3 rounded-lg font-semibold border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm transition-all"
            >
              Browse Lawyers
            </Link>
          </div>
        </div>
      </section>

      {/* Mission + Highlights */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                Legal help should feel approachable. We built LawLinkPro to reduce confusion and connect
                people with relevant lawyers using intelligent recommendations and a clear case process.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚖️</span>
                  <p className="text-gray-700">
                    Match clients to lawyers based on expertise and case relevance.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔒</span>
                  <p className="text-gray-700">
                    Prioritize privacy and secure handling of sensitive case information.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📌</span>
                  <p className="text-gray-700">
                    Make the process clear with requests, status tracking, and feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">AI-based Recommendation</h3>
                <p className="text-sm text-gray-600">
                  The platform ranks lawyers by how closely their expertise matches the client's case.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Verified Profiles</h3>
                <p className="text-sm text-gray-600">
                  Lawyers can maintain structured profiles (specialization, experience, and bio).
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">Case Workflow</h3>
                <p className="text-sm text-gray-600">
                  Submit a case → get matches → send request → track progress → give feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-3">How Our AI Matching Works</h2>
            <p className="text-gray-600">
              A simple content-based approach that compares your case description with lawyer expertise.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Submit Your Case</h3>
              <p className="text-sm text-gray-600">
                You describe your problem in your own words, optionally choosing a category.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">TF-IDF Vectorization</h3>
              <p className="text-sm text-gray-600">
                Text is converted into weighted features using TF-IDF to capture important terms.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Cosine Similarity Ranking</h3>
              <p className="text-sm text-gray-600">
                We score similarity between your case and lawyer profiles, then rank the best matches.
              </p>
            </div>
          </div>

          <div className="mt-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-7 border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed text-center max-w-4xl mx-auto">
              This approach enables context-aware recommendations—not just simple keyword search—so clients
              can discover relevant lawyers even when wording differs.
            </p>
          </div>
        </div>
      </section>

      {/* Trust + Future */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-3">Trust & Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We treat legal information as sensitive by default. Authentication, role-based access, and
              secure storage practices are part of the platform design.
            </p>
            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex gap-3 items-start">
                <span className="text-xl">🔒</span>
                <p className="text-sm text-blue-900">
                  Privacy note: client case details should be shared only with intended lawyers during the
                  request workflow.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-3">What's Next</h2>
            <p className="text-gray-700 leading-relaxed">
              We're improving the platform step-by-step while keeping the experience simple and reliable.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Real-time messaging", "Secure document vault", "AI case summarization"].map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-blue-100 mb-7">
            Create an account and find the right lawyer faster with AI-based recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-blue-700 rounded-lg font-semibold shadow-lg hover:bg-gray-50 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/lawyers"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-colors"
            >
              Find Lawyers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
