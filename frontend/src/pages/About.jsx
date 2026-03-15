import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-5 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About LawLinkPro
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            LawLinkPro helps people find the right legal professional faster through structured matching,
            verified profiles, and a secure workflow designed for real legal matters.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-7 py-3 rounded-lg font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
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
                Legal services can be complex, especially when clients do not know where to start.
                LawLinkPro is built to simplify early decisions: define the issue clearly, discover relevant
                lawyers, and move through each case stage with transparent communication.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚖️</span>
                  <p className="text-gray-700">
                    Match clients to lawyers using specialization, availability, and case relevance.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔒</span>
                  <p className="text-gray-700">
                    Prioritize confidentiality when clients share sensitive legal details.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📌</span>
                  <p className="text-gray-700">
                    Keep work visible through requests, status tracking, milestones, and feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">AI-based Recommendation</h3>
                <p className="text-sm text-gray-600">
                  The platform ranks lawyers by how closely profile expertise aligns with case details.
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
                  Submit case, review matches, send requests, track progress, and complete with feedback.
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
              A content-based approach compares case text with lawyer expertise to produce relevance-ranked suggestions.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-linear-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Submit Your Case</h3>
              <p className="text-sm text-gray-600">
                Clients explain their issue in plain language, with optional category and priority details.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-linear-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">TF-IDF Vectorization</h3>
              <p className="text-sm text-gray-600">
                Case and profile text are transformed into weighted features so important legal terms carry more influence.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Cosine Similarity Ranking</h3>
              <p className="text-sm text-gray-600">
                Similarity scoring ranks lawyers from strongest to weakest match for faster and better first contact.
              </p>
            </div>
          </div>

          <div className="mt-10 bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-7 border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed text-center max-w-4xl mx-auto">
              This approach provides better recommendations than simple keyword search by recognizing related
              terms and context across case and profile text.
            </p>
          </div>
        </div>
      </section>

      {/* Access to Legal Help */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-3">Access to Legal Help</h2>
            <p className="text-gray-700 leading-relaxed">
              Public legal resources show that many people need affordable legal support. If paid representation is
              not possible, legal-aid and pro bono services can still provide important civil-law guidance.
            </p>
            <div className="mt-5 grid md:grid-cols-3 gap-4 text-sm">
              <a
                href="https://www.usa.gov/legal-aid"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
              >
                USA.gov Legal Aid: find free and low-cost legal help by issue type.
              </a>
              <a
                href="https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
              >
                Legal Services Corporation: locate local civil legal-aid organizations.
              </a>
              <a
                href="https://abafreelegalanswers.org/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
              >
                ABA Free Legal Answers: qualifying users can ask volunteer lawyers civil questions.
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust + Future */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-3">Trust & Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Legal information is sensitive by default. Authentication, role-based access, and protected
              communication channels are core parts of this platform.
            </p>
            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex gap-3 items-start">
                <span className="text-xl">🔒</span>
                <p className="text-sm text-blue-900">
                  Privacy note: confidential attorney-client communications are generally protected, but sharing
                  details with unnecessary third parties can weaken confidentiality protections in many jurisdictions.
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
      <section className="py-14 bg-linear-to-r from-blue-600 to-purple-600">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-blue-100 mb-7">
            Create an account and find relevant legal support faster through guided matching.
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
