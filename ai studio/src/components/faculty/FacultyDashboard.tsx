import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceMarkingView } from './AttendanceMarkingView';
import { GradeMaintenanceView } from './GradeMaintenanceView';
import { WarningManagementView } from './WarningManagementView';
import { StudentRosterView } from './StudentRosterView';
import { NoticeLetterModal } from '../NoticeLetterModal';
import { WarningNotice } from '../../types';
import {
  LayoutDashboard,
  CalendarCheck2,
  Award,
  ShieldAlert,
  Users,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Send,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const {
    departmentStats,
    students,
    warnings,
    getStudentAttendance,
    batchDispatchSub85Notices,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ATTENDANCE' | 'RESULTS' | 'WARNINGS' | 'STUDENTS'>('DASHBOARD');
  const [selectedLetterNotice, setSelectedLetterNotice] = useState<WarningNotice | null>(null);
  const [batchNoticeAlert, setBatchNoticeAlert] = useState<string | null>(null);

  const handleQuickBatch = () => {
    const res = batchDispatchSub85Notices();
    setBatchNoticeAlert(`Automated Sweep Dispatched: ${res.count} warning notices sent to ${res.studentNames.join(', ')}.`);
    setTimeout(() => setBatchNoticeAlert(null), 5000);
  };

  // Find students whose attendance is currently < 85%
  const atRiskStudents = students
    .map((s) => ({
      student: s,
      stats: getStudentAttendance(s.id),
    }))
    .filter((item) => item.stats.percentage < 85.0)
    .sort((a, b) => a.stats.percentage - b.stats.percentage);

  return (
    <div className="space-y-6">
      {/* Faculty Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'DASHBOARD'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ATTENDANCE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Mark Attendance Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'RESULTS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Academic Results &amp; Grades</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-200 font-semibold hidden md:inline">
              Teacher Maintain
            </span>
          </button>

          <button
            onClick={() => setActiveTab('WARNINGS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'WARNINGS'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>&lt;85% Warning Notices</span>
            {departmentStats.atRiskCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-black">
                {departmentStats.atRiskCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'STUDENTS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Roster</span>
          </button>
        </div>
      </div>

      {batchNoticeAlert && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{batchNoticeAlert}</span>
          </div>
          <button
            onClick={() => setBatchNoticeAlert(null)}
            className="text-amber-800 hover:text-amber-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* View Switcher Content */}
      {activeTab === 'ATTENDANCE' && <AttendanceMarkingView />}
      {activeTab === 'RESULTS' && <GradeMaintenanceView />}
      {activeTab === 'WARNINGS' && <WarningManagementView />}
      {activeTab === 'STUDENTS' && <StudentRosterView />}

      {/* Main Executive Dashboard Overview */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Top KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dept Average Attendance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Dept. Average Attendance
                </span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {departmentStats.averageAttendance}%
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  / 85% Mandate
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, departmentStats.averageAttendance)}%` }}
                />
              </div>
            </div>

            {/* Students Under 85% Threshold */}
            <div className="bg-white rounded-2xl p-5 border border-amber-200 ring-1 ring-amber-300/40 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Deficient (&lt; 85% Threshold)
                </span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-600">
                  {departmentStats.atRiskCount}
                </span>
                <span className="text-xs text-slate-500">
                  of {departmentStats.totalStudents} Students
                </span>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-2">
                ⚠️ Automatic warning notices generated
              </p>
            </div>

            {/* Critical Debarment Risk (< 75%) */}
            <div className="bg-white rounded-2xl p-5 border border-rose-200 ring-1 ring-rose-300/40 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Severe Debarment (&lt; 75%)
                </span>
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600">
                  {departmentStats.criticalCount}
                </span>
                <span className="text-xs text-slate-500">
                  Exam Hall Ticket Barred
                </span>
              </div>
              <p className="text-[11px] text-rose-700 font-semibold mt-2">
                Parent summoned for Dean hearing
              </p>
            </div>

            {/* Active Notices & Appeals */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Notices Dispatched
                </span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Send className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {warnings.length}
                </span>
                <span className="text-xs text-slate-500">
                  Total Compliance Letters
                </span>
              </div>
              <p className="text-[11px] text-purple-700 font-medium mt-2">
                {departmentStats.pendingAppealsCount} student medical appeal(s) awaiting review
              </p>
            </div>
          </div>

          {/* Automated Compliance Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-amber-500/10">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  Automated Sub-85% Attendance Compliance Protocol Active
                </h3>
                <p className="text-xs text-amber-950 font-medium mt-0.5">
                  {atRiskStudents.length} students currently require immediate formal intervention.
                  System auto-dispatches official letters with Dean seal upon threshold breach.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleQuickBatch}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Run Batch Auto-Dispatch</span>
              </button>
            </div>
          </div>

          {/* At Risk Students Quick Roster */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Students Requiring Warning Compliance (&lt; 85%)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live calculation based on cumulative lecture sessions
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('WARNINGS')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All Notices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {atRiskStudents.map(({ student, stats }) => {
                  const isCritical = stats.percentage < 75.0;
                  const recentNotice = warnings.find((w) => w.studentId === student.id);

                  return (
                    <div
                      key={student.id}
                      className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {student.rollNo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Attended: <strong>{stats.totalAttended}</strong> / {stats.totalClasses} classes • Needs{' '}
                            <strong className="text-emerald-700 font-bold">{stats.classesNeededFor85}</strong> consecutive classes to reach 85%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <span
                            className={`font-black text-lg ${
                              isCritical ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {stats.percentage}%
                          </span>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isCritical ? 'CRITICAL BARRING' : 'ATTENDANCE SHORT'}
                          </p>
                        </div>

                        {recentNotice ? (
                          <button
                            onClick={() => setSelectedLetterNotice(recentNotice)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Letter</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const n = batchDispatchSub85Notices();
                              setBatchNoticeAlert(`Notice generated!`);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch Notice</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Policy Card */}
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>College Regulation Handbook</span>
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  According to Article 14-B of collegiate academic governance:
                </p>
                <ul className="text-xs text-slate-300 space-y-2 mt-3 list-disc pl-4">
                  <li>
                    <strong className="text-amber-400">85.0% - 100%</strong>: Eligible for Dean&apos;s Honor roll and full exam eligibility.
                  </li>
                  <li>
                    <strong className="text-amber-400">75.0% - 84.9%</strong>: First level warning notice to student and registered parent.
                  </li>
                  <li>
                    <strong className="text-rose-400">&lt; 75.0%</strong>: Debarment warning; examination hall ticket temporarily withheld pending appeal.
                  </li>
                  <li>
                    <strong className="text-rose-500">&lt; 65.0%</strong>: Final debarment order; compulsory semester repeat.
                  </li>
                </ul>

                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab('ATTENDANCE')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CalendarCheck2 className="w-4 h-4" />
                    <span>Open Attendance Ledger</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('RESULTS')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Award className="w-4 h-4" />
                    <span>Maintain Academic Grades</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Notice Modal */}
      <NoticeLetterModal
        notice={selectedLetterNotice}
        onClose={() => setSelectedLetterNotice(null)}
      />
    </div>
  );
};
