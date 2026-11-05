import React from 'react';
import { WarningNotice } from '../types';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  X,
  Printer,
  CheckCircle,
  FileText,
  Building,
  Mail,
  ShieldAlert,
  Send,
  MessageSquare,
} from 'lucide-react';

interface NoticeLetterModalProps {
  notice: WarningNotice | null;
  onClose: () => void;
}

export const NoticeLetterModal: React.FC<NoticeLetterModalProps> = ({ notice, onClose }) => {
  const { role, acknowledgeNotice, submitNoticeAppeal } = useApp();
  const [appealText, setAppealText] = React.useState('');
  const [showAppealForm, setShowAppealForm] = React.useState(false);
  const [appealSubmitted, setAppealSubmitted] = React.useState(false);

  if (!notice) return null;

  const isCritical = notice.severity === 'LEVEL_3_CRITICAL';
  const isSerious = notice.severity === 'LEVEL_2_SERIOUS';

  const severityTitle = isCritical
    ? 'FINAL ORDER: EXAMINATION DEBARMENT & DISCIPLINARY NOTICE'
    : isSerious
    ? 'OFFICIAL SUMMONS: CRITICAL ATTENDANCE DEFICIENCY (LEVEL 2)'
    : 'OFFICIAL NOTICE: ATTENDANCE COMPLIANCE DEFICIENCY (< 85%)';

  const handlePrint = () => {
    window.print();
  };

  const handleAcknowledge = () => {
    acknowledgeNotice(notice.id);
  };

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim()) return;
    submitNoticeAppeal(notice.id, appealText);
    setAppealSubmitted(true);
    setShowAppealForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Modal Action Header (Excluded from print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-500/20 text-rose-400' : isSerious ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/20 text-amber-300'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Official Academic Warning Notice Document</h3>
              <p className="text-xs text-slate-400">Ref: {notice.referenceNo} • Issued: {new Date(notice.issuedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
              title="Print official letter"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official College Letter */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white" id="official-warning-letter">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl tracking-tighter shadow-md border-2 border-amber-500/40">
                  MITM
                </div>
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 font-serif">
                    Maharaja Institute of Technology Mysuru
                  </h1>
                  <p className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                    Department of Information Science &amp; Engineering • Affiliated to VTU Belagavi &amp; Approved by AICTE
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Academic Attendance &amp; Regulatory Cell • Office of the Head of Department (ISE)
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-600">
                <p className="font-semibold text-slate-800">NBA &amp; NAAC Accredited</p>
                <p>Belawadi, Srirangapatna Taluk, Mysuru</p>
                <p>attendance-ise@mitmysuru.in</p>
              </div>
            </div>
          </div>

          {/* Reference and Date Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs border-b border-slate-200 pb-4 mb-6 gap-2">
            <div>
              <span className="font-bold text-slate-700">DISPATCH REF NO: </span>
              <span className="font-mono font-bold text-slate-900">{notice.referenceNo}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">DATE OF ISSUANCE: </span>
              <span className="font-semibold text-slate-900">
                {new Date(notice.issuedAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700">REGULATION STATUTE: </span>
              <span className="font-semibold text-rose-700">Section 14-B (Attendance Minimum 85.0%)</span>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-slate-500 uppercase font-semibold text-[10px]">Student Information</p>
              <p className="font-bold text-sm text-slate-900">{notice.studentName}</p>
              <p className="text-slate-700"><span className="font-medium">Roll No:</span> {notice.rollNo}</p>
              <p className="text-slate-700"><span className="font-medium">Student Email:</span> {notice.studentEmail}</p>
              <p className="text-slate-700"><span className="font-medium">Dept:</span> Department of Information Science &amp; Engineering</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase font-semibold text-[10px]">Parent / Guardian Notification</p>
              <p className="font-bold text-sm text-slate-900">{notice.parentName}</p>
              <p className="text-slate-700"><span className="font-medium">Parent Email:</span> {notice.parentEmail}</p>
              <p className="text-slate-700"><span className="font-medium">Course Focus:</span> {notice.courseName || 'All Registered Information Science Modules'}</p>
              <p className="text-slate-700 font-mono text-[11px] text-emerald-700 mt-1">
                ✓ Dispatched via SMS, Registered Parent Email, &amp; Student Portal
              </p>
            </div>
          </div>

          {/* Letter Title Banner */}
          <div className={`p-4 rounded-xl text-center mb-6 border ${
            isCritical
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : isSerious
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <h2 className="font-bold text-sm sm:text-base tracking-wide uppercase">
              {severityTitle}
            </h2>
            <p className="text-xs mt-1 opacity-90">
              Mandatory Notification Regarding Non-Compliance With Statutory 85% Minimum Attendance
            </p>
          </div>

          {/* Body Content */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
            <p>
              Dear <strong className="text-slate-950">{notice.studentName}</strong> (and Parent/Guardian <strong className="text-slate-950">{notice.parentName}</strong>),
            </p>

            <p>
              This is an official communication from the <strong>Academic Attendance &amp; Regulatory Board</strong> of <strong>Maharaja Institute of Technology Mysuru (Department of Information Science &amp; Engineering)</strong>. As per VTU collegiate bylaws and institutional regulations, every student is mandated to maintain a <strong>minimum cumulative attendance of 85.0%</strong> in each registered course to remain eligible for internal credit allocations and semester examinations.
            </p>

            {/* Attendance Metric Callout Box */}
            <div className="my-4 p-4 rounded-xl bg-slate-900 text-white grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-medium">Recorded Attendance</p>
                <p className="text-xl sm:text-2xl font-black text-rose-400">{notice.currentAttendance}%</p>
                <p className="text-[10px] text-rose-300">Deficient by {(85.0 - notice.currentAttendance).toFixed(1)}%</p>
              </div>
              <div className="border-x border-slate-700">
                <p className="text-[11px] text-slate-400 uppercase font-medium">Mandatory Threshold</p>
                <p className="text-xl sm:text-2xl font-black text-amber-300">{notice.thresholdAttendance}%</p>
                <p className="text-[10px] text-slate-400">Institutional Rule</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-medium">Classes Needed</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400">{notice.classesNeeded}</p>
                <p className="text-[10px] text-emerald-300">Consecutive Full Sessions</p>
              </div>
            </div>

            <p>
              <strong className="text-slate-900">Official Directive &amp; Remarks:</strong> {notice.officialRemarks}
            </p>

            <p>
              Please note that continued shortfall below 85% carries severe administrative ramifications, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
              <li>Immediate withholding of semester final examination admit cards (Hall Tickets).</li>
              <li>Forfeiture of internal assessment practical marks and lab participation credits.</li>
              <li>Permanent recording of Attendance Probation on the collegiate academic transcript.</li>
              <li>Compulsory attendance restitution modules during term vacation breaks.</li>
            </ul>

            <p>
              You are hereby instructed to submit a signed acknowledgment of this letter immediately. If this shortage was caused by documented medical emergency or authorized collegiate event representation, an official appeal with supporting documents must be filed through the portal within <strong>three (3) working days</strong>.
            </p>
          </div>

          {/* Institutional Signatures & Official Stamp */}
          <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end">
            <div>
              <div className="h-10 flex items-center">
                <span className="font-serif italic font-bold text-slate-700 text-base">Elena Vance, Ph.D.</span>
              </div>
              <div className="border-t border-slate-400 pt-1 text-[11px]">
                <p className="font-bold text-slate-900">Dr. Elena Vance</p>
                <p className="text-slate-600">Head of Department / Attendance Officer</p>
              </div>
            </div>

            <div>
              <div className="h-10 flex items-center">
                <span className="font-serif italic font-bold text-slate-700 text-base">Robert Sterling</span>
              </div>
              <div className="border-t border-slate-400 pt-1 text-[11px]">
                <p className="font-bold text-slate-900">Prof. Robert Sterling</p>
                <p className="text-slate-600">Dean of Academic Affairs</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-rose-600/70 text-rose-700 flex flex-col items-center justify-center text-center p-1 transform rotate-6">
                <span className="text-[8px] font-black uppercase">MIT MYSURU</span>
                <span className="text-[7px] font-bold uppercase">DEPT OF ISE</span>
                <span className="text-[7px]">REGISTRAR</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Digitally Certified &amp; Logged</p>
            </div>
          </div>

          {/* Acknowledgement and Appeal Section (Excluded from Print) */}
          <div className="no-print mt-8 pt-6 border-t border-slate-200">
            {notice.status === 'ACKNOWLEDGED' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-900">Warning Notice Formally Acknowledged</p>
                  <p className="text-emerald-700">
                    Digitally signed by student on {new Date(notice.acknowledgedAt || notice.issuedAt).toLocaleString()}.
                  </p>
                </div>
              </div>
            ) : role === 'STUDENT' ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-amber-900">
                    <p className="font-semibold">Student Action Required</p>
                    <p className="text-amber-700">Confirm you have read and understood this attendance deficit warning.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAcknowledge}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>I Acknowledge &amp; Accept Notice</span>
                    </button>
                    {!showAppealForm && notice.status !== 'APPEALED' && (
                      <button
                        onClick={() => setShowAppealForm(true)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg transition-colors"
                      >
                        Submit Medical/Leave Appeal
                      </button>
                    )}
                  </div>
                </div>

                {showAppealForm && (
                  <form onSubmit={handleSubmitAppeal} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span>File Attendance Justification / Medical Leave Appeal</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAppealForm(false)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={appealText}
                      onChange={(e) => setAppealText(e.target.value)}
                      placeholder="Detail dates of absence, illness/medical rationale, or university representation details..."
                      rows={3}
                      className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Appeal to Academic Board</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : null}

            {notice.status === 'APPEALED' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs mt-3">
                <p className="font-semibold text-blue-900">Student Appeal Submitted:</p>
                <p className="text-blue-800 mt-1 italic">&ldquo;{notice.appealReason}&rdquo;</p>
                <p className="text-[11px] text-blue-600 mt-2">
                  Status: <strong>{notice.appealStatus || 'PENDING'}</strong> • Reviewing Officer: Dr. Elena Vance
                </p>
                {notice.appealReviewNote && (
                  <p className="text-slate-700 mt-1 font-medium bg-white/70 p-2 rounded">
                    Review Note: {notice.appealReviewNote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Official Academic Record • Maharaja Institute of Technology Mysuru (Department of Information Science &amp; Engineering)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
