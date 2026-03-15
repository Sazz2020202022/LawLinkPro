import { Link } from 'react-router-dom';
import { Briefcase, Scale, UserRound } from 'lucide-react';

function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7ff] px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-indigo-200/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-sky-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 shadow-sm">
            <Scale className="h-3.5 w-3.5" />
            Choose Your Portal
          </div>
          <h1 className="mt-4 font-['Poppins'] text-3xl font-bold text-slate-900 sm:text-4xl">
            Sign In to <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LawLinkPro</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Select your workspace to continue with role-specific tools, notifications, and case management.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className="group relative min-h-90 overflow-hidden rounded-3xl border border-blue-100/90 bg-white/85 p-8 shadow-xl shadow-blue-100/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/50 flex flex-col">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-200/60 blur-2xl" />
            <div className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-sky-200/60 blur-xl" />

            <div className="relative mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <UserRound className="h-4 w-4" />
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Client Portal
                </h2>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                Secure
              </span>
            </div>

            <p className="relative mt-2 text-sm leading-6 text-slate-600">
              Track cases, send requests, and chat with your lawyer in one dashboard.
            </p>

            <div className="relative mt-5 rounded-2xl border border-blue-100 bg-white/80 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">What You Can Do</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <span className="rounded-lg border border-blue-100 bg-blue-50/60 px-2 py-2 text-[11px] font-medium text-slate-700">Create Cases</span>
                <span className="rounded-lg border border-blue-100 bg-blue-50/60 px-2 py-2 text-[11px] font-medium text-slate-700">Find Lawyers</span>
                <span className="rounded-lg border border-blue-100 bg-blue-50/60 px-2 py-2 text-[11px] font-medium text-slate-700">Open Chat</span>
              </div>
            </div>

            <Link
              to="/login/client"
              className="relative mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-200"
            >
              Continue as Client
            </Link>
          </section>

          <section className="group relative min-h-90 overflow-hidden rounded-3xl border border-indigo-100/90 bg-white/85 p-8 shadow-xl shadow-indigo-100/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200/50 flex flex-col">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-200/60 blur-2xl" />
            <div className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-violet-200/60 blur-xl" />

            <div className="relative mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Briefcase className="h-4 w-4" />
                </div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Lawyer Portal
                </h2>
              </div>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                Pro
              </span>
            </div>

            <p className="relative mt-2 text-sm leading-6 text-slate-600">
              Manage incoming requests, update cases, and communicate with clients.
            </p>

            <div className="relative mt-5 rounded-2xl border border-indigo-100 bg-white/80 p-3.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">What You Can Do</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <span className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-2 py-2 text-[11px] font-medium text-slate-700">Review Requests</span>
                <span className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-2 py-2 text-[11px] font-medium text-slate-700">Track Cases</span>
                <span className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-2 py-2 text-[11px] font-medium text-slate-700">Client Profiles</span>
              </div>
            </div>

            <Link
              to="/login/lawyer"
              className="relative mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-purple-600 transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-200"
            >
              Continue as Lawyer
            </Link>
          </section>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100/80 bg-white/80 px-6 py-4 text-center text-sm text-slate-600 shadow-sm backdrop-blur-sm">
          Need an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-700 hover:text-blue-800">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
