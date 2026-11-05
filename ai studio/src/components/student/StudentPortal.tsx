import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NoticeLetterModal } from '../NoticeLetterModal';
import { WarningNotice } from '../../types';
import {
  calculateAttendancePercentage,
  calculateClassesNeededForTarget,
  calculateMissableClasses,
} from '../../utils/attendanceLogic';
import {
  ShieldAlert,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Printer,
  Calculator,
  ArrowUpRight,
  Clock,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    currentStudent,
    getStudentAttendance,
    getStudentResults,
    getStudentWarnings,
    courses,
    acknowledgeNotice,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RESULTS' | 'WARNINGS'>('OVERVIEW');
  const [selectedNoticeForLetter, setSelectedNoticeForLetter] = useState<WarningNotice | null>(null);

  // Attendance simulator state
  const [extraClassesToAttend, setExtraClassesToAttend] = useState<number>(5);

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Student record not found.</div>;
  }

  // Student specific data (strict access control: only current student's records!)
  const attendance = getStudentAttendance(currentStudent.id);
  const myResults = getStudentResults(currentStudent.id);
  const myWarnings = getStudentWarnings(currentStudent.id);

  const isUnder85 = attendance.percentage < 85.0;
  const isUnder75 = attendance.percentage < 75.0;
  const activeUnacknowledgedNotice = myWarnings.find((w) => w.status !== 'ACKNOWLEDGED');

  // Simulator calculation
  const simulatedAttended = attendance.totalAttended + extraClassesToAttend;
  const simulatedTotal = attendance.totalClasses + extraClassesToAttend;
  const simulatedPercentage = calculateAttendancePercentage(simulatedAttended, simulatedTotal);

  // Calculate Cumulative GPA
  let totalCredits = 0;
  let weightedGpaSum = 0;
  myResults.forEach((res) => {
    const course = courses.find((c) => c.id === res.courseId);
    const credits = course?.credits || 3;
    totalCredits += credits;
    weightedGpaSum += res.gpa * credits;
  });
  const cumulativeGpa = totalCredits > 0 ? (weightedGpaSum / totalCredits).toFixed(2) : '0.00';

  const handlePrintGradeReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Automated 85% Warning Notice Alert Banner */}
      {isUnder85 && (
        <div className={`p-5 rounded-2xl border shadow-md animate-in fade-in duration-300 ${
          isUnder75
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl text-white shrink-0 mt-0.5 ${
                isUnder75 ? 'bg-rose-600' : 'bg-amber-600'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white ${
                    isUnder75 ? 'bg-rose-600' : 'bg-amber-600'
                  }`}>
                    {isUnder75 ? 'CRITICAL DEBARMENT NOTICE (<75%)' : 'ATTENDANCE DEFICIENCY NOTICE (<85%)'}
                  </span>
                  <span className="text-xs font-semibold opacity-75">Statute 14-B</span>
                </div>
                <h3 className="font-extrabold text-base tracking-tight">
                  Action Required: Your attendance is currently {attendance.percentage}% (Below mandatory 85.0%)
                </h3>
                <p className="text-xs opacity-90 leading-relaxed max-w-2xl">
                  The collegiate automated compliance engine has dispatched an official warning notice to your student portal and your registered parent ({currentStudent.parentName} - {currentStudent.parentEmail}).
                  You must attend the next <strong>{attendance.classesNeededFor85} consecutive sessions</strong> to restore 85.0% compliance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeUnacknowledgedNotice ? (
                <button
                  onClick={() => setSelectedNoticeForLetter(activeUnacknowledgedNotice)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Open &amp; Sign Warning Notice</span>
                </button>
              ) : myWarnings[0] ? (
                <button
                  onClick={() => setSelectedNoticeForLetter(myWarnings[0])}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-slate-300" />
                  <span>View Dispatched Notice</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Student Welcome Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentStudent.avatar}
            alt={currentStudent.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{currentStudent.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                {currentStudent.rollNo}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentStudent.department} • Semester {currentStudent.semester} (Section {currentStudent.section})
            </p>
            <p className="text-xs text-slate-500">
              Faculty Academic Mentor: <strong className="text-slate-700">{currentStudent.mentor}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Attendance Health &amp; Simulator
          </button>
          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'RESULTS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Academic Results (Personal)
          </button>
          <button
            onClick={() => setActiveTab('WARNINGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'WARNINGS'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>My Notices</span>
            {myWarnings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                {myWarnings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: ATTENDANCE OVERVIEW & SIMULATOR */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metric Gauges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Attendance */}
            <div className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden bg-white ${
              isUnder75
                ? 'border-rose-200 ring-1 ring-rose-300'
                : isUnder85
                ? 'border-amber-200 ring-1 ring-amber-300'
                : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overall Attendance
                </span>
                <span className={`p-2 rounded-xl text-xs font-black ${
                  isUnder75
                    ? 'bg-rose-50 text-rose-600'
                    : isUnder85
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isUnder85 ? 'NON-COMPLIANT' : 'COMPLIANT'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-4xl font-black ${
                  isUnder75 ? 'text-rose-600' : isUnder85 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {attendance.percentage}%
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  / 85.0% Required
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden relative">
                <div
                  className={`h-full rounded-full ${
                    isUnder75 ? 'bg-rose-500' : isUnder85 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, attendance.percentage)}%` }}
                />
              </div>
            </div>

            {/* Sessions Attended */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Attended vs Total
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {attendance.totalAttended}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  of {attendance.totalClasses} Lectures
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Missed: <strong className="text-rose-600 font-bold">{attendance.totalClasses - attendance.totalAttended}</strong> sessions
              </p>
            </div>

            {/* Classes Needed for 85% */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Consecutive Classes to 85%
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-3xl font-black ${attendance.classesNeededFor85 > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {attendance.classesNeededFor85}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {attendance.classesNeededFor85 > 0 ? 'Sessions Needed' : 'Threshold Maintained'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {attendance.classesNeededFor85 > 0
                  ? 'Must attend without unexcused leave'
                  : 'You are currently in good academic standing!'}
              </p>
            </div>

            {/* Cumulative GPA */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Semester Cumulative GPA
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600">
                  {cumulativeGpa}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  / 4.0 Scale
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Total Credits: <strong className="text-slate-800">{totalCredits} Credits</strong>
              </p>
            </div>
          </div>

          {/* Interactive Attendance Target Calculator */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  <h3 className="font-extrabold text-base">Smart Attendance Target Simulator</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Use this collegiate simulation tool to forecast your future attendance percentage. See how attending upcoming classes will bring you back into the safe &gt;85% zone.
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <label htmlFor="extra-classes-slider" className="text-xs font-semibold text-slate-300">
                    If I attend the next:
                  </label>
                  <input
                    id="extra-classes-slider"
                    type="range"
                    min={1}
                    max={30}
                    value={extraClassesToAttend}
                    onChange={(e) => setExtraClassesToAttend(Number(e.target.value))}
                    className="w-48 accent-blue-400 cursor-pointer"
                  />
                  <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-sm font-mono font-bold text-blue-300">
                    +{extraClassesToAttend} classes
                  </span>
                </div>
              </div>

              {/* Simulation Result Callout */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[220px]">
                <p className="text-[11px] uppercase font-semibold tracking-wider text-slate-300">
                  Projected Attendance
                </p>
                <p className={`text-4xl font-black mt-1 ${
                  simulatedPercentage >= 85 ? 'text-emerald-400' : 'text-amber-300'
                }`}>
                  {simulatedPercentage}%
                </p>
                <div className="mt-2 text-xs">
                  {simulatedPercentage >= 85 ? (
                    <span className="text-emerald-300 font-bold flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Compliant with 85% Rule!</span>
                    </span>
                  ) : (
                    <span className="text-amber-200 font-medium">
                      Still needs {(85.0 - simulatedPercentage).toFixed(1)}% more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subject-Wise Attendance Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Course-Wise Attendance Breakdown (Mandatory 85% Minimum)
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {attendance.courseSummaries.length} Enrolled Courses
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Course Code &amp; Title</th>
                    <th className="py-3 px-3 text-center">Faculty Instructor</th>
                    <th className="py-3 px-3 text-center">Attended / Total</th>
                    <th className="py-3 px-3 text-center">Attendance %</th>
                    <th className="py-3 px-3 text-center">Compliance Status</th>
                    <th className="py-3 px-4 text-center">Classes to 85%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.courseSummaries.map((summary) => {
                    const courseObj = courses.find((c) => c.id === summary.courseId);
                    const isDeficient = summary.percentage < 85.0;
                    const isSevere = summary.percentage < 75.0;

                    return (
                      <tr key={summary.courseId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{summary.courseName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {summary.courseCode} • {summary.credits} Credits
                          </p>
                        </td>

                        <td className="py-3.5 px-3 text-center text-slate-600">
                          {courseObj?.facultyName || 'Department Faculty'}
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-semibold">
                          {summary.attended} / {summary.total}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`font-black text-sm ${
                              isSevere ? 'text-rose-600' : isDeficient ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {summary.percentage}%
                          </span>
                          <div className="w-20 mx-auto bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isSevere ? 'bg-rose-500' : isDeficient ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, summary.percentage)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSevere
                                ? 'bg-rose-100 text-rose-800'
                                : isDeficient
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isSevere ? 'Barred (<75%)' : isDeficient ? 'Warning (<85%)' : 'Compliant'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {summary.classesNeededFor85 > 0 ? (
                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              +{summary.classesNeededFor85} sessions
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>On Track</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ACADEMIC RESULTS (PERSONAL & CONFIDENTIAL) */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Official Academic Grade Report &amp; Transcript Summary
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Confidential Semester Result for {currentStudent.name} ({currentStudent.rollNo}). Maintained &amp; certified by Course Evaluators.
              </p>
            </div>

            <button
              onClick={handlePrintGradeReport}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Grade Sheet</span>
            </button>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="student-personal-results">
            <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Maharaja Institute of Technology Mysuru • Department of Information Science &amp; Engineering
                </p>
                <h3 className="font-extrabold text-sm text-slate-100">
                  Semester 6 End-Term Evaluation Card
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Semester SGPA</p>
                <p className="text-xl font-black text-indigo-300">{cumulativeGpa} / 4.0</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-3 text-center">Internal (30)</th>
                    <th className="py-3 px-3 text-center">Midterm (20)</th>
                    <th className="py-3 px-3 text-center">Assignments (10)</th>
                    <th className="py-3 px-3 text-center">Final (40)</th>
                    <th className="py-3 px-3 text-center">Total (100)</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Grade Point</th>
                    <th className="py-3 px-4">Faculty Evaluator Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Results are currently being compiled by the faculty evaluation board.
                      </td>
                    </tr>
                  ) : (
                    myResults.map((result) => {
                      const course = courses.find((c) => c.id === result.courseId);

                      return (
                        <tr key={result.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{course?.name || 'Academic Course'}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {course?.code} • {course?.credits} Credits
                            </p>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-medium">
                            {result.internalScore}/30
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-medium">
                            {result.midtermScore}/20
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-medium">
                            {result.assignmentScore}/10
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-medium">
                            {result.finalScore}/40
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className="font-black text-sm text-slate-900">
                              {result.totalScore}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
                              {result.grade}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                            {result.gpa.toFixed(1)}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <p className="text-[11px]">{result.remarks}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              By: {result.updatedBy}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Result Footer Notice */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Note: Eligibility to receive official semester transcript is contingent upon maintaining statutory 85% attendance.
              </span>
              <span className="font-mono text-[11px]">Certified by Registrar Examination Cell</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY WARNING NOTICES */}
      {activeTab === 'WARNINGS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>Official Academic Warning Notices Issued to You</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, acknowledge, or file attendance justification appeals for notices generated due to sub-85% attendance.
            </p>
          </div>

          {myWarnings.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center text-emerald-900">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-base">No Warning Notices Active</h3>
              <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                Congratulations! You are maintaining collegiate attendance compliance with no active shortage notices on record.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myWarnings.map((notice) => {
                const isCritical = notice.severity === 'LEVEL_3_CRITICAL';
                const isSerious = notice.severity === 'LEVEL_2_SERIOUS';

                return (
                  <div
                    key={notice.id}
                    className={`bg-white rounded-2xl p-6 border shadow-xs transition-all ${
                      isCritical
                        ? 'border-rose-200 ring-1 ring-rose-300'
                        : isSerious
                        ? 'border-orange-200 ring-1 ring-orange-300'
                        : 'border-amber-200 ring-1 ring-amber-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isSerious
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isCritical
                              ? 'Level 3: Barring Order'
                              : isSerious
                              ? 'Level 2: Debarment Summons'
                              : 'Level 1: Shortage Warning'}
                          </span>
                          <span className="font-mono text-xs font-semibold text-slate-500">
                            {notice.referenceNo}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">
                          Attendance Deficiency: {notice.currentAttendance}% (Target: 85.0%)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Issued on {new Date(notice.issuedAt).toLocaleDateString()} • Sent to Student Portal &amp; Parent Email
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {notice.status === 'ACKNOWLEDGED' ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Acknowledged</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => acknowledgeNotice(notice.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Acknowledge Notice</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedNoticeForLetter(notice)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Official Letter</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <p>
                        <strong className="text-slate-800">Directives:</strong> {notice.officialRemarks}
                      </p>
                      {notice.appealReason && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-blue-900">
                          <p className="font-bold text-[11px]">Your Submitted Appeal:</p>
                          <p className="italic mt-0.5">&ldquo;{notice.appealReason}&rdquo;</p>
                          <p className="text-[10px] text-blue-700 mt-1 font-semibold">
                            Status: {notice.appealStatus || 'Under Review by Department Head'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Official Notice Modal */}
      <NoticeLetterModal
        notice={selectedNoticeForLetter}
        onClose={() => setSelectedNoticeForLetter(null)}
      />
    </div>
  );
};
