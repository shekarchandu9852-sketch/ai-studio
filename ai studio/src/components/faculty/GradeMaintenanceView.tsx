import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicResult } from '../../types';
import { calculateGradeAndGpa } from '../../utils/attendanceLogic';
import {
  Award,
  BookOpen,
  Edit3,
  Plus,
  Save,
  CheckCircle,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

export const GradeMaintenanceView: React.FC = () => {
  const { courses, students, results, saveResult } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'course-cs501');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for edit/add modal
  const [editingResult, setEditingResult] = useState<{
    studentId: string;
    studentName: string;
    rollNo: string;
    courseId: string;
    internalScore: number;
    midtermScore: number;
    assignmentScore: number;
    finalScore: number;
    remarks: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleOpenEdit = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const existingResult = results.find(
      (r) => r.studentId === studentId && r.courseId === selectedCourseId
    );

    setEditingResult({
      studentId,
      studentName: student.name,
      rollNo: student.rollNo,
      courseId: selectedCourseId,
      internalScore: existingResult ? existingResult.internalScore : 20,
      midtermScore: existingResult ? existingResult.midtermScore : 15,
      assignmentScore: existingResult ? existingResult.assignmentScore : 8,
      finalScore: existingResult ? existingResult.finalScore : 30,
      remarks: existingResult ? existingResult.remarks : 'Evaluated by Faculty',
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    saveResult({
      studentId: editingResult.studentId,
      courseId: editingResult.courseId,
      internalScore: Number(editingResult.internalScore),
      midtermScore: Number(editingResult.midtermScore),
      assignmentScore: Number(editingResult.assignmentScore),
      finalScore: Number(editingResult.finalScore),
      remarks: editingResult.remarks,
    });

    setToastMessage(`Result maintained & saved for ${editingResult.studentName}!`);
    setEditingResult(null);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Academic Results &amp; Grade Maintenance Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Teachers maintain and publish academic grades. Students can only view their own respective score sheets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="grade-course-select" className="text-xs font-semibold text-slate-600">Course Ledger:</label>
              <select
                id="grade-course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Results Maintenance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {activeCourse.code}: {activeCourse.name} • Master Grade Sheet
            </span>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            ✓ Published &amp; Student Accessible
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3 text-center">Internal (30)</th>
                <th className="py-3 px-3 text-center">Midterm (20)</th>
                <th className="py-3 px-3 text-center">Assignments (10)</th>
                <th className="py-3 px-3 text-center">Final (40)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Grade / GPA</th>
                <th className="py-3 px-4">Faculty Remarks &amp; Standing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const result = results.find(
                  (r) => r.studentId === student.id && r.courseId === selectedCourseId
                );

                const total = result
                  ? result.totalScore
                  : 0;
                const { grade, gpa, standing } = result
                  ? { grade: result.grade, gpa: result.gpa, standing: result.standing }
                  : { grade: 'N/A', gpa: 0.0, standing: 'Probation' as const };

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{student.rollNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Internal (30) */}
                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {result ? `${result.internalScore}/30` : '—'}
                    </td>

                    {/* Midterm (20) */}
                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {result ? `${result.midtermScore}/20` : '—'}
                    </td>

                    {/* Assignments (10) */}
                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {result ? `${result.assignmentScore}/10` : '—'}
                    </td>

                    {/* Final (40) */}
                    <td className="py-3.5 px-3 text-center font-mono font-medium">
                      {result ? `${result.finalScore}/40` : '—'}
                    </td>

                    {/* Total (100) */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`font-extrabold text-sm ${total >= 85 ? 'text-emerald-700' : total >= 70 ? 'text-blue-700' : total >= 60 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {result ? `${total}/100` : 'Unassigned'}
                      </span>
                    </td>

                    {/* Grade / GPA */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
                          {grade}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          ({gpa.toFixed(1)})
                        </span>
                      </div>
                    </td>

                    {/* Remarks & Standing */}
                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-slate-700 truncate max-w-xs">
                        {result?.remarks || 'Pending grading evaluation'}
                      </p>
                      <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        standing === 'Honors'
                          ? 'bg-purple-100 text-purple-800'
                          : standing === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : standing === 'Probation'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {standing}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(student.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{result ? 'Update Result' : 'Add Result'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Edit Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Maintain Academic Result Record</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingResult.studentName} ({editingResult.rollNo}) • {activeCourse.code}
                </p>
              </div>
              <button
                onClick={() => setEditingResult(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="internal-score-input" className="block font-semibold text-slate-700 mb-1">
                    Internal Assessment (Max 30)
                  </label>
                  <input
                    id="internal-score-input"
                    type="number"
                    min={0}
                    max={30}
                    value={editingResult.internalScore}
                    onChange={(e) =>
                      setEditingResult({ ...editingResult, internalScore: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="midterm-score-input" className="block font-semibold text-slate-700 mb-1">
                    Midterm Exam (Max 20)
                  </label>
                  <input
                    id="midterm-score-input"
                    type="number"
                    min={0}
                    max={20}
                    value={editingResult.midtermScore}
                    onChange={(e) =>
                      setEditingResult({ ...editingResult, midtermScore: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="assignment-score-input" className="block font-semibold text-slate-700 mb-1">
                    Assignments &amp; Labs (Max 10)
                  </label>
                  <input
                    id="assignment-score-input"
                    type="number"
                    min={0}
                    max={10}
                    value={editingResult.assignmentScore}
                    onChange={(e) =>
                      setEditingResult({ ...editingResult, assignmentScore: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="final-score-input" className="block font-semibold text-slate-700 mb-1">
                    Final Examination (Max 40)
                  </label>
                  <input
                    id="final-score-input"
                    type="number"
                    min={0}
                    max={40}
                    value={editingResult.finalScore}
                    onChange={(e) =>
                      setEditingResult({ ...editingResult, finalScore: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    required
                  />
                </div>
              </div>

              {/* Live Computed Summary */}
              {(() => {
                const total =
                  Number(editingResult.internalScore) +
                  Number(editingResult.midtermScore) +
                  Number(editingResult.assignmentScore) +
                  Number(editingResult.finalScore);
                const { grade, gpa, standing } = calculateGradeAndGpa(total);

                return (
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-500 font-semibold uppercase">Projected Total Score</p>
                      <p className="text-xl font-black text-slate-900">{total} / 100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500 font-semibold uppercase">Grade &amp; GPA</p>
                      <p className="text-sm font-bold text-slate-900">
                        {grade} ({gpa.toFixed(1)}) • <span className="text-indigo-600">{standing}</span>
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label htmlFor="eval-remarks-input" className="block font-semibold text-slate-700 mb-1">
                  Faculty Evaluation Remarks
                </label>
                <textarea
                  id="eval-remarks-input"
                  rows={2}
                  value={editingResult.remarks}
                  onChange={(e) =>
                    setEditingResult({ ...editingResult, remarks: e.target.value })
                  }
                  placeholder="Provide constructive feedback or exam notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Publish Result</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
