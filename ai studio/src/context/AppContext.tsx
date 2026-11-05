import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserRole,
  Student,
  Course,
  AcademicResult,
  WarningNotice,
  StudentOverallAttendance,
  StudentCourseSummary,
  AttendanceStatus,
  WarningSeverity,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_COURSES,
  INITIAL_ATTENDANCE_MATRIX,
  INITIAL_RESULTS,
  INITIAL_WARNING_NOTICES,
} from '../data/mockData';
import {
  calculateAttendancePercentage,
  isAttendanceWarningNeeded,
  getWarningSeverity,
  calculateClassesNeededForTarget,
  calculateGradeAndGpa,
} from '../utils/attendanceLogic';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  loginAsStudent: (rollNoOrId: string) => boolean;
  loginAsFaculty: (pin?: string) => boolean;
  logout: () => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  currentStudent: Student | undefined;
  students: Student[];
  courses: Course[];
  results: AcademicResult[];
  warnings: WarningNotice[];
  attendanceMatrix: Record<string, Record<string, { attended: number; total: number }>>;
  
  // Data retrieval
  getStudentAttendance: (studentId: string) => StudentOverallAttendance;
  getStudentResults: (studentId: string) => AcademicResult[];
  getStudentWarnings: (studentId: string) => WarningNotice[];
  
  // Faculty Actions
  markAttendanceSession: (
    courseId: string,
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
  ) => { autoNoticesGenerated: number };
  saveResult: (resultData: {
    studentId: string;
    courseId: string;
    internalScore: number;
    midtermScore: number;
    assignmentScore: number;
    finalScore: number;
    remarks: string;
  }) => void;
  batchDispatchSub85Notices: () => { count: number; studentNames: string[] };
  dispatchNoticeForStudent: (studentId: string, courseId?: string, customRemarks?: string) => WarningNotice;
  reviewAppeal: (warningId: string, status: 'APPROVED' | 'REJECTED', reviewNote: string) => void;
  addStudent: (newStudent: Omit<Student, 'id'>) => Student;
  updateStudent: (studentId: string, data: Partial<Student>) => void;
  
  // Student Actions
  acknowledgeNotice: (warningId: string) => void;
  submitNoticeAppeal: (warningId: string, reason: string) => void;
  
  // Stats
  departmentStats: {
    totalStudents: number;
    averageAttendance: number;
    atRiskCount: number; // < 85%
    criticalCount: number; // < 75%
    activeWarningsCount: number;
    pendingAppealsCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'academiaguard_role_v2',
  AUTH: 'academiaguard_is_auth_v2',
  STUDENT_ID: 'academiaguard_selected_student_v2',
  STUDENTS: 'academiaguard_students_v2',
  MATRIX: 'academiaguard_attendance_matrix_v2',
  RESULTS: 'academiaguard_results_v2',
  WARNINGS: 'academiaguard_warnings_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or defaults
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return saved === 'FACULTY' || saved === 'STUDENT' ? saved : 'FACULTY';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved !== null ? saved === 'true' : true; // Logged in by default
  });

  const [selectedStudentId, setSelectedStudentIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_ID);
    return saved || 'stu-001'; // Default Alex Rivera (who is < 85%)
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [courses] = useState<Course[]>(INITIAL_COURSES);

  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, Record<string, { attended: number; total: number }>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATRIX);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_MATRIX;
    } catch {
      return INITIAL_ATTENDANCE_MATRIX;
    }
  });

  const [results, setResults] = useState<AcademicResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESULTS);
      return saved ? JSON.parse(saved) : INITIAL_RESULTS;
    } catch {
      return INITIAL_RESULTS;
    }
  });

  const [warnings, setWarnings] = useState<WarningNotice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WARNINGS);
      return saved ? JSON.parse(saved) : INITIAL_WARNING_NOTICES;
    } catch {
      return INITIAL_WARNING_NOTICES;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_ID, selectedStudentId);
  }, [selectedStudentId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATRIX, JSON.stringify(attendanceMatrix));
  }, [attendanceMatrix]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WARNINGS, JSON.stringify(warnings));
  }, [warnings]);

  const setRole = (newRole: UserRole) => setRoleState(newRole);
  const setSelectedStudentId = (id: string) => setSelectedStudentIdState(id);

  // Authentication & Role Separation Actions
  const loginAsStudent = useCallback((rollNoOrId: string): boolean => {
    const query = rollNoOrId.trim().toLowerCase();
    const found = students.find(
      (s) =>
        s.rollNo.toLowerCase() === query ||
        s.id.toLowerCase() === query ||
        s.name.toLowerCase().includes(query)
    );
    if (found) {
      setSelectedStudentIdState(found.id);
      setRoleState('STUDENT');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [students]);

  const loginAsFaculty = useCallback((pin?: string): boolean => {
    const clean = (pin || '').trim();
    // Default passcode is mitm2026, or 1234 / admin / blank for quick demo evaluation
    if (!clean || clean === 'mitm2026' || clean === 'admin' || clean === '1234') {
      setRoleState('FACULTY');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Compute student attendance summary
  const getStudentAttendance = useCallback(
    (studentId: string): StudentOverallAttendance => {
      const student = students.find((s) => s.id === studentId);
      const studentMatrix = attendanceMatrix[studentId] || {};

      let totalAttended = 0;
      let totalClasses = 0;

      const courseSummaries: StudentCourseSummary[] = courses.map((course) => {
        const stats = studentMatrix[course.id] || { attended: 0, total: course.totalClasses };
        totalAttended += stats.attended;
        totalClasses += stats.total;

        const percentage = calculateAttendancePercentage(stats.attended, stats.total);
        const classesNeededFor85 = calculateClassesNeededForTarget(stats.attended, stats.total, 85);

        let status: StudentCourseSummary['status'] = 'SAFE';
        if (percentage < 65.0) status = 'CRITICAL';
        else if (percentage < 75.0) status = 'WARNING_LVL2';
        else if (percentage < 85.0) status = 'WARNING_LVL1';

        return {
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          credits: course.credits,
          attended: stats.attended,
          total: stats.total,
          percentage,
          status,
          classesNeededFor85,
        };
      });

      const overallPercentage = calculateAttendancePercentage(totalAttended, totalClasses);
      const classesNeededFor85 = calculateClassesNeededForTarget(totalAttended, totalClasses, 85);

      let overallStatus: StudentOverallAttendance['status'] = 'SAFE';
      if (overallPercentage < 65.0) overallStatus = 'CRITICAL';
      else if (overallPercentage < 75.0) overallStatus = 'WARNING_LVL2';
      else if (overallPercentage < 85.0) overallStatus = 'WARNING_LVL1';

      const activeWarningCount = warnings.filter(
        (w) => w.studentId === studentId && w.status !== 'ACKNOWLEDGED'
      ).length;

      return {
        studentId,
        studentName: student ? student.name : 'Unknown Student',
        rollNo: student ? student.rollNo : 'N/A',
        totalAttended,
        totalClasses,
        percentage: overallPercentage,
        status: overallStatus,
        classesNeededFor85,
        activeWarningCount,
        courseSummaries,
      };
    },
    [students, courses, attendanceMatrix, warnings]
  );

  // Student specific results (strictly filtered by studentId)
  const getStudentResults = useCallback(
    (studentId: string): AcademicResult[] => {
      return results.filter((r) => r.studentId === studentId);
    },
    [results]
  );

  // Student specific warnings
  const getStudentWarnings = useCallback(
    (studentId: string): WarningNotice[] => {
      return warnings.filter((w) => w.studentId === studentId);
    },
    [warnings]
  );

  // Helper to create official warning notice
  const createNoticeObject = (
    student: Student,
    percentage: number,
    course?: Course,
    customRemarks?: string
  ): WarningNotice => {
    const severityTier: WarningSeverity =
      percentage < 65 ? 'LEVEL_3_CRITICAL' : percentage < 75 ? 'LEVEL_2_SERIOUS' : 'LEVEL_1_CAUTION';

    const randNum = Math.floor(100 + Math.random() * 900);
    const refNo = `MITM/ISE/WARN/${new Date().getFullYear()}/${randNum}`;
    const id = `warn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const classesNeeded = calculateClassesNeededForTarget(
      Math.round((percentage / 100) * 100),
      100,
      85
    );

    const defaultRemarks =
      severityTier === 'LEVEL_3_CRITICAL'
        ? `CRITICAL ALERT: Student attendance is at ${percentage}%, severely below the collegiate 85.0% requirement. Debarment from semester-end examinations is active. Immediate Dean hearing scheduled.`
        : severityTier === 'LEVEL_2_SERIOUS'
        ? `SERIOUS NOTICE: Student attendance is at ${percentage}%, below 75.0%. Parent-Mentor mandatory conference scheduled under Academic Article 14-B.`
        : `ATTENDANCE DEFICIENCY: Student attendance is at ${percentage}%, falling short of the required 85.0% threshold. Student is required to attend all subsequent lecture sessions.`;

    return {
      id,
      referenceNo: refNo,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      studentEmail: student.email,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      courseId: course?.id,
      courseName: course?.name,
      currentAttendance: percentage,
      thresholdAttendance: 85.0,
      classesNeeded,
      severity: severityTier,
      issuedAt: new Date().toISOString(),
      status: 'DISPATCHED',
      dispatchedVia: ['STUDENT_EMAIL', 'PORTAL_NOTICE', 'PARENT_SMS'],
      officialRemarks: customRemarks || defaultRemarks,
    };
  };

  // Dispatch individual warning notice
  const dispatchNoticeForStudent = useCallback(
    (studentId: string, courseId?: string, customRemarks?: string): WarningNotice => {
      const student = students.find((s) => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const attendance = getStudentAttendance(studentId);
      const course = courses.find((c) => c.id === courseId);
      const percentage = courseId
        ? attendance.courseSummaries.find((c) => c.courseId === courseId)?.percentage ?? attendance.percentage
        : attendance.percentage;

      const newNotice = createNoticeObject(student, percentage, course, customRemarks);

      setWarnings((prev) => [newNotice, ...prev]);
      return newNotice;
    },
    [students, getStudentAttendance, courses]
  );

  // Batch auto-dispatch warnings for all students whose attendance is < 85%
  const batchDispatchSub85Notices = useCallback(() => {
    const deficientStudents: { student: Student; percentage: number }[] = [];

    students.forEach((student) => {
      const att = getStudentAttendance(student.id);
      if (isAttendanceWarningNeeded(att.percentage, 85.0)) {
        deficientStudents.push({ student, percentage: att.percentage });
      }
    });

    const newNotices: WarningNotice[] = [];
    const studentNames: string[] = [];

    deficientStudents.forEach(({ student, percentage }) => {
      studentNames.push(student.name);
      const notice = createNoticeObject(
        student,
        percentage,
        undefined,
        `Automated Compliance Sweep: Attendance recorded at ${percentage}%, below statutory 85.0% threshold. Official collegiate warning logged and dispatched.`
      );
      newNotices.push(notice);
    });

    setWarnings((prev) => [...newNotices, ...prev]);

    return {
      count: newNotices.length,
      studentNames,
    };
  }, [students, getStudentAttendance]);

  // Mark attendance session and automatically trigger warning if percentage drops < 85%
  const markAttendanceSession = useCallback(
    (
      courseId: string,
      records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
    ) => {
      let autoNotices = 0;
      const updatedMatrix = { ...attendanceMatrix };

      records.forEach(({ studentId, status }) => {
        if (!updatedMatrix[studentId]) updatedMatrix[studentId] = {};
        const current = updatedMatrix[studentId][courseId] || { attended: 0, total: 0 };
        const newTotal = current.total + 1;
        const newAttended =
          status === 'PRESENT' || status === 'EXCUSED' ? current.attended + 1 : current.attended;

        updatedMatrix[studentId][courseId] = {
          attended: newAttended,
          total: newTotal,
        };
      });

      setAttendanceMatrix(updatedMatrix);

      // Check which students now dropped below 85% and auto-dispatch
      records.forEach(({ studentId }) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;

        // Calculate new overall attendance
        const studentMatrix = updatedMatrix[studentId];
        let totAttended = 0;
        let totClasses = 0;
        courses.forEach((c) => {
          const stats = studentMatrix[c.id] || { attended: 0, total: c.totalClasses };
          totAttended += stats.attended;
          totClasses += stats.total;
        });

        const newPercentage = calculateAttendancePercentage(totAttended, totClasses);

        if (newPercentage < 85.0) {
          // Check if notice already issued today
          const todayStr = new Date().toISOString().slice(0, 10);
          const alreadyIssuedToday = warnings.some(
            (w) => w.studentId === studentId && w.issuedAt.startsWith(todayStr)
          );

          if (!alreadyIssuedToday) {
            const courseObj = courses.find((c) => c.id === courseId);
            const notice = createNoticeObject(
              student,
              newPercentage,
              courseObj,
              `System Automated Notice: Attendance dipped to ${newPercentage}% (< 85.0%) following today's recorded session in ${courseObj?.code || 'Course'}. Immediate academic counseling mandatory.`
            );
            setWarnings((prev) => [notice, ...prev]);
            autoNotices++;
          }
        }
      });

      return { autoNoticesGenerated: autoNotices };
    },
    [attendanceMatrix, courses, students, warnings]
  );

  // Faculty saves or updates an academic result record
  const saveResult = useCallback(
    (resultData: {
      studentId: string;
      courseId: string;
      internalScore: number;
      midtermScore: number;
      assignmentScore: number;
      finalScore: number;
      remarks: string;
    }) => {
      const totalScore = Math.min(
        100,
        Math.max(
          0,
          resultData.internalScore +
            resultData.midtermScore +
            resultData.assignmentScore +
            resultData.finalScore
        )
      );

      const { grade, gpa, standing } = calculateGradeAndGpa(totalScore);

      setResults((prev) => {
        const index = prev.findIndex(
          (r) => r.studentId === resultData.studentId && r.courseId === resultData.courseId
        );

        const newRecord: AcademicResult = {
          id: index >= 0 ? prev[index].id : `res-${Date.now()}`,
          studentId: resultData.studentId,
          courseId: resultData.courseId,
          internalScore: resultData.internalScore,
          midtermScore: resultData.midtermScore,
          assignmentScore: resultData.assignmentScore,
          finalScore: resultData.finalScore,
          totalScore,
          grade,
          gpa,
          standing,
          remarks: resultData.remarks,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Dr. Elena Vance (Faculty Evaluator)',
          isPublished: true,
        };

        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newRecord;
          return updated;
        } else {
          return [...prev, newRecord];
        }
      });
    },
    []
  );

  // Student acknowledges receipt of notice
  const acknowledgeNotice = useCallback((warningId: string) => {
    setWarnings((prev) =>
      prev.map((w) =>
        w.id === warningId
          ? {
              ...w,
              status: 'ACKNOWLEDGED',
              acknowledgedAt: new Date().toISOString(),
            }
          : w
      )
    );
  }, []);

  // Student submits an appeal for a warning notice
  const submitNoticeAppeal = useCallback((warningId: string, reason: string) => {
    setWarnings((prev) =>
      prev.map((w) =>
        w.id === warningId
          ? {
              ...w,
              status: 'APPEALED',
              appealReason: reason,
              appealSubmittedAt: new Date().toISOString(),
              appealStatus: 'PENDING',
            }
          : w
      )
    );
  }, []);

  // Faculty reviews appeal
  const reviewAppeal = useCallback(
    (warningId: string, status: 'APPROVED' | 'REJECTED', reviewNote: string) => {
      setWarnings((prev) =>
        prev.map((w) =>
          w.id === warningId
            ? {
                ...w,
                appealStatus: status,
                appealReviewNote: reviewNote,
                status: status === 'APPROVED' ? 'ACKNOWLEDGED' : 'APPEALED',
              }
            : w
        )
      );
    },
    []
  );

  // Add new student
  const addStudent = useCallback(
    (newStudentData: Omit<Student, 'id'>): Student => {
      const newId = `stu-${Date.now()}`;
      const createdStudent: Student = {
        ...newStudentData,
        id: newId,
      };

      setStudents((prev) => [...prev, createdStudent]);

      // Initialize attendance matrix for student
      setAttendanceMatrix((prev) => {
        const matrixCopy = { ...prev };
        matrixCopy[newId] = {};
        courses.forEach((c) => {
          matrixCopy[newId][c.id] = { attended: c.totalClasses, total: c.totalClasses };
        });
        return matrixCopy;
      });

      return createdStudent;
    },
    [courses]
  );

  // Update student profile
  const updateStudent = useCallback((studentId: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...data } : s))
    );
  }, []);

  // Department-level statistics for Faculty Dashboard
  const departmentStats = useMemo(() => {
    const totalStudents = students.length;
    let sumPercentage = 0;
    let atRisk = 0;
    let critical = 0;

    students.forEach((s) => {
      const att = getStudentAttendance(s.id);
      sumPercentage += att.percentage;
      if (att.percentage < 85.0) atRisk++;
      if (att.percentage < 75.0) critical++;
    });

    const averageAttendance =
      totalStudents > 0 ? Math.round((sumPercentage / totalStudents) * 10) / 10 : 0;

    const activeWarningsCount = warnings.filter((w) => w.status !== 'ACKNOWLEDGED').length;
    const pendingAppealsCount = warnings.filter((w) => w.appealStatus === 'PENDING').length;

    return {
      totalStudents,
      averageAttendance,
      atRiskCount: atRisk,
      criticalCount: critical,
      activeWarningsCount,
      pendingAppealsCount,
    };
  }, [students, getStudentAttendance, warnings]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isAuthenticated,
        loginAsStudent,
        loginAsFaculty,
        logout,
        selectedStudentId,
        setSelectedStudentId,
        currentStudent,
        students,
        courses,
        results,
        warnings,
        attendanceMatrix,
        getStudentAttendance,
        getStudentResults,
        getStudentWarnings,
        markAttendanceSession,
        saveResult,
        batchDispatchSub85Notices,
        dispatchNoticeForStudent,
        reviewAppeal,
        addStudent,
        updateStudent,
        acknowledgeNotice,
        submitNoticeAppeal,
        departmentStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
