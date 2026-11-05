/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { StudentPortal } from './components/student/StudentPortal';
import { LoginGateway } from './components/auth/LoginGateway';
import {
  ShieldCheck,
  GraduationCap,
  Bell,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, isAuthenticated, departmentStats, currentStudent } = useApp();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Corporate Collegiate Header */}
      <Header />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isAuthenticated ? (
          <LoginGateway />
        ) : role === 'FACULTY' ? (
          <FacultyDashboard />
        ) : (
          <StudentPortal />
        )}
      </main>

      {/* Corporate Institutional Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">
              Maharaja Institute of Technology Mysuru • Department of Information Science &amp; Engineering
            </span>
            <span className="hidden md:inline">• Academic Session 2026-2027</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>85.0% Rule Enforcement Engine Active</span>
            </span>
            <span>•</span>
            <span>Node.js Backend Synchronized</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
