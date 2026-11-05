import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarningNotice, WarningSeverity } from '../../types';
import { NoticeLetterModal } from '../NoticeLetterModal';
import {
  ShieldAlert,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Filter,
  AlertTriangle,
  Mail,
  Printer,
  ChevronRight,
  MessageSquare,
  Check,
  X,
} from 'lucide-react';

export const WarningManagementView: React.FC = () => {
  const { warnings, batchDispatchSub85Notices, reviewAppeal, departmentStats } = useApp();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLetterNotice, setActiveLetterNotice] = useState<WarningNotice | null>(null);

  // Appeal modal state
  const [reviewingNotice, setReviewingNotice] = useState<WarningNotice | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Dispatch feedback banner
  const [dispatchFeedback, setDispatchFeedback] = useState<{
    show: boolean;
    count: number;
    names: string[];
  } | null>(null);

  const handleBatchDispatch = () => {
    const res = batchDispatchSub85Notices();
    setDispatchFeedback({
      show: true,
      count: res.count,
      names: res.studentNames,
    });
  };

  const handleApproveAppeal = (noticeId: string) => {
    reviewAppeal(noticeId, 'APPROVED', reviewNote || 'Medical documentation verified by Department Head. Attendance excused.');
    setReviewingNotice(null);
    setReviewNote('');
  };

  const handleRejectAppeal = (noticeId: string) => {
    reviewAppeal(noticeId, 'REJECTED', reviewNote || 'Insufficient documentation provided. Attendance shortage upheld.');
    setReviewingNotice(null);
    setReviewNote('');
  };

  const filteredNotices = warnings.filter((notice) => {
    const matchesSeverity =
      selectedSeverity === 'ALL' || notice.severity === selectedSeverity;
    const matchesSearch =
      notice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Batch Auto-Dispatch Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                Automated Compliance Dispatch Engine
              </span>
              <span className="text-xs text-slate-400">• Institutional Rule 14-B</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Attendance Deficiency &amp; Automated Warning Dispatch
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Whenever any student&apos;s cumulative attendance falls below the mandatory <strong>85.0% threshold</strong>, the system automatically generates an official legal notice with college seal and sends copies to the student portal, registered parent email, and SMS.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleBatchDispatch}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Auto-Scan &amp; Batch Dispatch &lt;85% Notices</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Dispatch Feedback Banner */}
      {dispatchFeedback?.show && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-bold">
                Batch Auto-Dispatch Completed: {dispatchFeedback.count} Official Warning Notice(s) Generated!
              </p>
              <p className="text-amber-800 mt-1">
                Recipients flagged for &lt;85% deficiency: <span className="font-semibold">{dispatchFeedback.names.join(', ')}</span>.
                Electronic notifications dispatched via Student Portal, Parent Email, and SMS.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDispatchFeedback(null)}
            className="text-xs text-amber-800 hover:text-amber-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSeverity === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Notices ({warnings.length})
          </button>
          <button
            onClick={() => setSelectedSeverity('LEVEL_1_CAUTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSeverity === 'LEVEL_1_CAUTION'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Level 1 (&lt; 85%)
          </button>
          <button
            onClick={() => setSelectedSeverity('LEVEL_2_SERIOUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSeverity === 'LEVEL_2_SERIOUS'
                ? 'bg-orange-500 text-white font-bold'
                : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
            }`}
          >
            Level 2 Debarment (&lt; 75%)
          </button>
          <button
            onClick={() => setSelectedSeverity('LEVEL_3_CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSeverity === 'LEVEL_3_CRITICAL'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Level 3 Barring (&lt; 65%)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, ref or roll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Warning Notices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref Number &amp; Date</th>
                <th className="py-3 px-4">Student &amp; Parent</th>
                <th className="py-3 px-3 text-center">Current %</th>
                <th className="py-3 px-3 text-center">Classes Needed</th>
                <th className="py-3 px-3 text-center">Severity Tier</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Document &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No warning notices found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice) => {
                  const isCritical = notice.severity === 'LEVEL_3_CRITICAL';
                  const isSerious = notice.severity === 'LEVEL_2_SERIOUS';

                  return (
                    <tr key={notice.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Ref & Date */}
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-slate-900">{notice.referenceNo}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(notice.issuedAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Student & Parent */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{notice.studentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {notice.rollNo} • Parent: {notice.parentName}
                        </p>
                      </td>

                      {/* Current % */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`font-black text-sm ${
                            isCritical
                              ? 'text-rose-600'
                              : isSerious
                              ? 'text-orange-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {notice.currentAttendance}%
                        </span>
                        <p className="text-[10px] text-slate-400">Target: 85%</p>
                      </td>

                      {/* Classes Needed */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {notice.classesNeeded} classes
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : isSerious
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCritical
                            ? 'Level 3: Barring'
                            : isSerious
                            ? 'Level 2: Debarment'
                            : 'Level 1: <85% Caution'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {notice.status === 'ACKNOWLEDGED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Acknowledged</span>
                          </span>
                        ) : notice.status === 'APPEALED' ? (
                          <button
                            onClick={() => setReviewingNotice(notice)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Appeal Pending ({notice.appealStatus || 'NEW'})</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>Dispatched</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveLetterNotice(notice)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Letter</span>
                          </button>

                          {notice.status === 'APPEALED' && (
                            <button
                              onClick={() => setReviewingNotice(notice)}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Review Appeal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Notice Document Modal */}
      <NoticeLetterModal
        notice={activeLetterNotice}
        onClose={() => setActiveLetterNotice(null)}
      />

      {/* Appeal Review Modal */}
      {reviewingNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Review Student Attendance Justification / Appeal</span>
              </h3>
              <button
                onClick={() => setReviewingNotice(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">{reviewingNotice.studentName} ({reviewingNotice.rollNo})</span>
                  <span className="font-mono text-slate-500">{reviewingNotice.referenceNo}</span>
                </div>
                <p className="text-slate-600">
                  Recorded Attendance: <strong className="text-rose-600">{reviewingNotice.currentAttendance}%</strong> (Threshold: 85%)
                </p>
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-slate-500 font-semibold uppercase text-[10px]">Student Appeal Statement:</p>
                  <p className="text-slate-800 italic mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                    &ldquo;{reviewingNotice.appealReason || 'No detailed reason entered'}&rdquo;
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="adjudication-notes-input" className="block font-semibold text-slate-700 mb-1">
                  Faculty Adjudication Notes &amp; Remediation Terms
                </label>
                <textarea
                  id="adjudication-notes-input"
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Medical certificate verified with hospital registrar. Granted 5 attendance credits upon completion of assignment 4."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingNotice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectAppeal(reviewingNotice.id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reject Appeal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveAppeal(reviewingNotice.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve &amp; Excuse</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
