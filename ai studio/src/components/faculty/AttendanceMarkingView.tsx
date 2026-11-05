import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { calculateAttendancePercentage } from '../../utils/attendanceLogic';
import {
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Send,
  AlertCircle,
  Users,
  Search,
} from 'lucide-react';

export const AttendanceMarkingView: React.FC = () => {
  const { courses, students, attendanceMatrix, markAttendanceSession, getStudentAttendance } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'course-cs501');
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state for the session roll call
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      initial[s.id] = 'PRESENT';
    });
    return initial;
  });

  const [remarksSheet, setRemarksSheet] = useState<Record<string, string>>({});
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    show: boolean;
    autoNotices: number;
    date: string;
    courseName: string;
  } | null>(null);

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceSheet(updated);
  };

  const handleSubmitSession = (e: React.FormEvent) => {
    e.preventDefault();
    const records = students.map((s) => ({
      studentId: s.id,
      status: attendanceSheet[s.id] || 'PRESENT',
      remarks: remarksSheet[s.id] || undefined,
    }));

    const result = markAttendanceSession(selectedCourseId, records);

    setSubmissionFeedback({
      show: true,
      autoNotices: result.autoNoticesGenerated,
      date: sessionDate,
      courseName: activeCourse.name,
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Session Config Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Record Daily Attendance Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance records instantly update compliance scores. Shortfalls below 85% automatically trigger warning notice dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Course Picker */}
            <div className="flex items-center gap-2">
              <label htmlFor="course-select" className="text-xs font-semibold text-slate-600">Course:</label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <label htmlFor="session-date-input" className="text-xs font-semibold text-slate-600">Date:</label>
              <input
                id="session-date-input"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Batch Actions & Search */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Quick Set:</span>
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            >
              Mark All Absent
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submission Success Banner */}
      {submissionFeedback?.show && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start justify-between animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold">
                Attendance Ledger Saved for {submissionFeedback.courseName} ({submissionFeedback.date})
              </p>
              <p className="text-emerald-700 mt-0.5">
                All records successfully audited and stored to collegiate database.
                {submissionFeedback.autoNotices > 0 ? (
                  <span className="font-semibold text-rose-700 ml-1">
                    ⚠️ {submissionFeedback.autoNotices} new automated warning notice(s) generated for students whose attendance dropped below 85%!
                  </span>
                ) : (
                  <span className="text-emerald-700 ml-1">
                    No new sub-85% threshold breaches occurred in this session.
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionFeedback(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Roster Roll Call Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Enrolled Student Roster ({filteredStudents.length} Students)
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Mandatory Requirement: <strong className="text-rose-600">85.0% Minimum</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Student Name &amp; Roll</th>
                <th className="py-3 px-4">Current Course %</th>
                <th className="py-3 px-4">Overall %</th>
                <th className="py-3 px-4 text-center">Session Attendance Status</th>
                <th className="py-3 px-4">Session Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const overallAtt = getStudentAttendance(student.id);
                const courseStats =
                  attendanceMatrix[student.id]?.[selectedCourseId] || { attended: 0, total: 40 };
                const coursePct = calculateAttendancePercentage(courseStats.attended, courseStats.total);
                const currentStatus = attendanceSheet[student.id] || 'PRESENT';

                // Projected % if marked absent
                const projectedAtt =
                  currentStatus === 'PRESENT' || currentStatus === 'EXCUSED'
                    ? courseStats.attended + 1
                    : courseStats.attended;
                const projectedPct = calculateAttendancePercentage(projectedAtt, courseStats.total + 1);
                const willBeBelow85 = projectedPct < 85.0;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{student.rollNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Course % */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            coursePct < 75
                              ? 'text-rose-600'
                              : coursePct < 85
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {coursePct}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({courseStats.attended}/{courseStats.total})
                        </span>
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            coursePct < 75 ? 'bg-rose-500' : coursePct < 85 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, coursePct)}%` }}
                        />
                      </div>
                    </td>

                    {/* Overall % */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
                            overallAtt.percentage < 85 ? 'text-rose-700 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {overallAtt.percentage}%
                        </span>
                        {overallAtt.percentage < 85 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                            &lt; 85% Warning
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Attendance Status Selector Buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'LATE')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            currentStatus === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Excused
                        </button>
                      </div>

                      {/* Warning trigger indicator if this absent causes drop below 85% */}
                      {currentStatus === 'ABSENT' && willBeBelow85 && (
                        <p className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center justify-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Will trigger auto-notice (&lt;85%)</span>
                        </p>
                      )}
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={remarksSheet[student.id] || ''}
                        onChange={(e) =>
                          setRemarksSheet({ ...remarksSheet, [student.id]: e.target.value })
                        }
                        className="w-full text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer with Submit Button */}
        <div className="p-4 bg-slate-50/75 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Clicking &quot;Submit &amp; Audit Session&quot; recalculates every student&apos;s cumulative percentage and automatically dispatches warning notices for any student whose attendance drops below 85.0%.
          </p>
          <button
            type="button"
            onClick={handleSubmitSession}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit &amp; Audit Attendance Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
