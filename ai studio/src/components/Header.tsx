import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Bell,
  Building2,
  ChevronDown,
  Sparkles,
  Users,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    isAuthenticated,
    setRole,
    logout,
    students,
    selectedStudentId,
    setSelectedStudentId,
    currentStudent,
    departmentStats,
    warnings,
  } = useApp();

  const activeWarningsCount = warnings.filter((w) => w.status !== 'ACKNOWLEDGED').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Collegiate Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 ring-2 ring-white/10">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  Academia<span className="text-blue-400">Guard</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  v3.8 Enterprise
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  85% Compliance Active
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Maharaja Institute of Technology Mysuru • Department of Information Science &amp; Engineering
              </p>
            </div>
          </div>

          {/* User Profile Controls & Role Badge */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                  Authentication Gateway
                </span>
              </div>
            ) : role === 'STUDENT' ? (
              /* STUDENT VIEW: Strict isolation, NO faculty toggle! */
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-200">Student Portal</span>
                  <span className="text-[10px] text-indigo-300 font-mono bg-indigo-900/80 px-1.5 py-0.5 rounded">
                    {currentStudent?.rollNo}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                  <img
                    src={currentStudent?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentStudent?.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-200">{currentStudent?.name}</p>
                    <p className="text-[10px] text-slate-400">Enrolled Student</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                  title="Sign out of student account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* FACULTY VIEW: Faculty Authenticated Session */
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-500/30 px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-200">Faculty &amp; Evaluator Session</span>
                  {departmentStats.atRiskCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                      {departmentStats.atRiskCount} &lt;85%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold text-xs">
                    EV
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-200">Dr. Elena Vance</p>
                    <p className="text-[10px] text-slate-400">HOD (Information Science &amp; Engg) &amp; Attendance Chair</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                  title="Sign out of faculty session"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
