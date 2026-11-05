import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Building2,
  Users,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const LoginGateway: React.FC = () => {
  const { students, loginAsStudent, loginAsFaculty } = useApp();

  const [activeTab, setActiveTab] = useState<'STUDENT' | 'FACULTY'>('STUDENT');

  // Student login state
  const [selectedRoll, setSelectedRoll] = useState<string>('2024-ISE-001'); // Alex Rivera by default (<85%)
  const [studentError, setStudentError] = useState<string | null>(null);

  // Faculty login state
  const [facultyPin, setFacultyPin] = useState<string>('');
  const [facultyError, setFacultyError] = useState<string | null>(null);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoll) {
      setStudentError('Please enter or select a valid Student Roll Number.');
      return;
    }
    const success = loginAsStudent(selectedRoll);
    if (!success) {
      setStudentError('Invalid Student Roll Number. Please verify your registration.');
    }
  };

  const handleFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsFaculty(facultyPin);
    if (!success) {
      setFacultyError('Invalid Faculty Security PIN. Access denied to students.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-2xl shadow-lg border border-white/20">
              MITM
            </div>

            <div className="mt-8 space-y-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Institutional Access Gateway
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                Maharaja Institute of Technology Mysuru
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Department of Information Science &amp; Engineering
              </p>
            </div>

            <div className="mt-8 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span><strong>Mandatory 85% Rule</strong>: Automated warning notice dispatch to students &amp; parents.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span><strong>Strict Role Isolation</strong>: Students only see their own attendance, grades, and notices.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span><strong>Faculty Authority</strong>: Secured attendance marking, grade maintenance, and appeal review.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400">
            Affiliated to VTU Belagavi • AICTE Approved
          </div>
        </div>

        {/* Right Authentication Panel */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {/* Role Toggle Selector */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 mb-8">
            <button
              type="button"
              onClick={() => {
                setActiveTab('STUDENT');
                setStudentError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'STUDENT'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Student Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('FACULTY');
                setFacultyError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'FACULTY'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Faculty Secure Access</span>
            </button>
          </div>

          {/* TAB 1: STUDENT LOGIN */}
          {activeTab === 'STUDENT' && (
            <form onSubmit={handleStudentSubmit} className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Student Portal Sign-In</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Access your personal attendance metrics, confidential exam marks, and official warning notices.
                </p>
              </div>

              {studentError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <div>
                <label htmlFor="student-roll-select" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Enrolled Student or Enter University Seat / Roll Number:
                </label>
                <select
                  id="student-roll-select"
                  value={selectedRoll}
                  onChange={(e) => setSelectedRoll(e.target.value)}
                  className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 cursor-pointer"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.rollNo}>
                      {student.name} ({student.rollNo}) — Sem {student.semester}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Demo tip: Choose <strong>Alex Rivera (2024-ISE-001)</strong> to test the sub-85% warning notice.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Privacy Guarantee:</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Students cannot see or modify faculty grading sheets, attendance ledgers, or other students&apos; confidential transcripts.
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: FACULTY LOGIN */}
          {activeTab === 'FACULTY' && (
            <form onSubmit={handleFacultySubmit} className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <span>Faculty &amp; Evaluator Secure Gate</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Restricted to Department Faculty, HOD, and Academic Evaluators.
                </p>
              </div>

              {facultyError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{facultyError}</span>
                </div>
              )}

              <div>
                <label htmlFor="faculty-pin-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Faculty Security PIN / Passcode:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    id="faculty-pin-input"
                    type="password"
                    value={facultyPin}
                    onChange={(e) => setFacultyPin(e.target.value)}
                    placeholder="Enter PIN (Default: mitm2026)"
                    className="w-full text-xs p-3 pl-9 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-400">
                    Faculty Passcode: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-700">mitm2026</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFacultyPin('mitm2026')}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Auto-Fill PIN
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Authenticate Faculty Session</span>
                </button>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Security Notice:</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Unauthorized student entry to the grading and attendance maintenance ledger is strictly forbidden under University Conduct Code.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
