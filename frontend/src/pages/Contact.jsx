import { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Send, MapPin, Clock, HelpCircle } from 'lucide-react';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  subject: 'Support',
  message: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Contact() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (data) => {
    const nextErrors = {};

    if (!data.fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    }

    if (!data.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailRegex.test(data.email.trim())) {
      nextErrors.email = 'Please enter a valid email';
    }

    if (!data.message.trim()) {
      nextErrors.message = 'Message is required';
    } else if (data.message.trim().length < 20) {
      nextErrors.message = 'Message must be at least 20 characters';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      alert('Message sent successfully!');
      setFormData(INITIAL_FORM);
      setSubmitting(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-8 rounded-2xl bg-white shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 mb-4">
            Let’s Connect
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl">
            We’re here to help with support, partnerships, and general inquiries.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Send us a message</h2>
            <p className="text-sm text-gray-500 mb-6">We usually respond within one business day.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone (optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Optional phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                >
                  <option>Support</option>
                  <option>Partnership</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </article>

          <div className="space-y-6">
            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="rounded-lg bg-gray-50 px-4 py-3 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900 block">Email</span>
                    <span className="text-gray-600">support@lawlinkpro.com</span>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900 block">Phone</span>
                    <span className="text-gray-600">+977-98XXXXXXXX</span>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900 block">Location</span>
                    <span className="text-gray-600">Kathmandu, Nepal</span>
                  </div>
                </div>
                <p className="rounded-lg bg-gray-50 px-4 py-3">
                  <span className="font-medium text-gray-900">Office Hours:</span> Sun - Fri, 9:00 AM - 6:00 PM
                </p>
              </div>
              <p className="mt-4 text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                We respect your privacy; your message is confidential.
              </p>
            </article>

            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">FAQs</h2>
              <div className="space-y-3">
                <div className="rounded-xl bg-gray-50 p-4 hover:shadow-sm transition-all">
                  <p className="font-medium text-gray-900">How does AI matching work?</p>
                  <p className="text-sm text-gray-600 mt-1">We use your case details to recommend relevant verified lawyers.</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 hover:shadow-sm transition-all">
                  <p className="font-medium text-gray-900">Are lawyers verified?</p>
                  <p className="text-sm text-gray-600 mt-1">Yes, profiles are screened before being marked verified.</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 hover:shadow-sm transition-all">
                  <p className="font-medium text-gray-900">How do I submit a case?</p>
                  <p className="text-sm text-gray-600 mt-1">Sign in as a client and use the New Case option in your dashboard.</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 hover:shadow-sm transition-all">
                  <p className="font-medium text-gray-900">Is my data secure?</p>
                  <p className="text-sm text-gray-600 mt-1">Yes, your information is handled securely and shared only as needed.</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Contact;
