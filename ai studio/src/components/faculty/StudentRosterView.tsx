import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  Users,
  Search,
  Plus,
  ShieldAlert,
  Mail,
  Phone,
  UserCheck,
  AlertTriangle,
  X,
  Send,
  Building,
} from 'lucide-react';

export const StudentRosterView: React.FC = () => {
  const { students, getStudentAttendance, dispatchNoticeForStudent, addStudent } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'SAFE' | 'DEFICIENT' | 'CRITICAL'>('ALL');
  
  // Add student modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    department: 'Department of Information Science & Engineering',
    semester: 6,
    section: 'A',
    mentor: 'Dr. Elena Vance',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.rollNo) return;

    addStudent({
      ...newStudentForm,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    setShowAddModal(false);
    setToastMsg(`Student ${newStudentForm.name} added successfully!`);
    setTimeout(() => setToastMsg(null), 3500);

    setNewStudentForm({
      name: '',
      rollNo: '',
      email: '',
      phone: '',
      department: 'Department of Information Science & Engineering',
      semester: 6,
      section: 'A',
      mentor: 'Dr. Elena Vance',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
    });
  };

  const handleTriggerNotice = (student: Student) => {
    const notice = dispatchNoticeForStudent(
      student.id,
      undefined,
      'Manual Academic Warning Notice issued by Dr. Elena Vance (Attendance Committee Chair).'
    );
    setToastMsg(`Warning notice dispatched for ${student.name} (Ref: ${notice.referenceNo})`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const filteredStudents = students.filter((student) => {
    const att = getStudentAttendance(student.id);
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTier = true;
    if (tierFilter === 'SAFE') matchesTier = att.percentage >= 85.0;
    else if (tierFilter === 'DEFICIENT') matchesTier = att.percentage < 85.0 && att.percentage >= 75.0;
    else if (tierFilter === 'CRITICAL') matchesTier = att.percentage < 75.0;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Collegiate Student Directory &amp; Compliance Profiles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor attendance standing, parent communications, and individual risk factors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTierFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                tierFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTierFilter('SAFE')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                tierFilter === 'SAFE' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              Safe (&gt;=85%)
            </button>
            <button
              onClick={() => setTierFilter('DEFICIENT')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                tierFilter === 'DEFICIENT' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-50 text-amber-800'
              }`}
            >
              Deficient (&lt;85%)
            </button>
            <button
              onClick={() => setTierFilter('CRITICAL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                tierFilter === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
              }`}
            >
              Critical (&lt;75%)
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => {
          const att = getStudentAttendance(student.id);
          const isDeficient = att.percentage < 85.0;
          const isCritical = att.percentage < 75.0;

          return (
            <div
              key={student.id}
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                isCritical
                  ? 'border-rose-200 ring-1 ring-rose-300/50'
                  : isDeficient
                  ? 'border-amber-200 ring-1 ring-amber-300/50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{student.rollNo}</p>
                    <p className="text-[11px] text-slate-400">Sec {student.section} • Sem {student.semester}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-lg ${
                      isCritical ? 'text-rose-600' : isDeficient ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {att.percentage}%
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {isDeficient ? 'DEFICIENT' : 'COMPLIANT'}
                  </p>
                </div>
              </div>

              {/* Attendance Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Attendance: {att.totalAttended} / {att.totalClasses} classes</span>
                  <span className="font-semibold">Threshold: 85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical ? 'bg-rose-500' : isDeficient ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, att.percentage)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                    style={{ left: '85%' }}
                    title="85% Requirement Line"
                  />
                </div>
              </div>

              {/* Student and Parent Contact Details */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{student.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{student.phone}</span>
                </p>
                <div className="pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Parent: <strong>{student.parentName}</strong></span>
                  <span className="text-slate-400 font-mono">{student.parentPhone}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {isDeficient ? (
                  <button
                    onClick={() => handleTriggerNotice(student)}
                    className="w-full py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dispatch Warning Notice</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>In Full Compliance</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Enrol New Student in Department of Information Science &amp; Engineering</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="student-full-name-input" className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    id="student-full-name-input"
                    type="text"
                    required
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    placeholder="e.g. Liam Zhang"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="student-roll-no-input" className="block font-semibold text-slate-700 mb-1">Roll / Register No</label>
                  <input
                    id="student-roll-no-input"
                    type="text"
                    required
                    value={newStudentForm.rollNo}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNo: e.target.value })}
                    placeholder="e.g. 2024-ISE-009"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="student-email-input" className="block font-semibold text-slate-700 mb-1">Student Email</label>
                  <input
                    id="student-email-input"
                    type="email"
                    required
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    placeholder="liam.zhang@mitmysuru.in"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="student-phone-input" className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    id="student-phone-input"
                    type="text"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-1122"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-600 uppercase mb-2">Parent / Emergency Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="parent-guardian-name-input" className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                    <input
                      id="parent-guardian-name-input"
                      type="text"
                      value={newStudentForm.parentName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                      placeholder="e.g. Howard Zhang"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent-email-input" className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                    <input
                      id="parent-email-input"
                      type="email"
                      value={newStudentForm.parentEmail}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentEmail: e.target.value })}
                      placeholder="howard.zhang@domain.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  Confirm &amp; Enrol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
