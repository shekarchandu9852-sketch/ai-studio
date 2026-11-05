export type UserRole = 'FACULTY' | 'STUDENT';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type WarningSeverity = 'LEVEL_1_CAUTION' | 'LEVEL_2_SERIOUS' | 'LEVEL_3_CRITICAL';

export type NoticeStatus = 'DISPATCHED' | 'DELIVERED' | 'ACKNOWLEDGED' | 'APPEALED';

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  semester: number;
  section: string;
  mentor: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  facultyId: string;
  facultyName: string;
  totalClasses: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
}

export interface StudentCourseSummary {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  attended: number;
  total: number;
  percentage: number;
  status: 'SAFE' | 'WARNING_LVL1' | 'WARNING_LVL2' | 'CRITICAL';
  classesNeededFor85: number;
}

export interface StudentOverallAttendance {
  studentId: string;
  studentName: string;
  rollNo: string;
  totalAttended: number;
  totalClasses: number;
  percentage: number;
  status: 'SAFE' | 'WARNING_LVL1' | 'WARNING_LVL2' | 'CRITICAL';
  classesNeededFor85: number;
  activeWarningCount: number;
  courseSummaries: StudentCourseSummary[];
}

export interface AcademicResult {
  id: string;
  studentId: string;
  courseId: string;
  internalScore: number;    // max 30
  midtermScore: number;     // max 20
  assignmentScore: number;  // max 10
  finalScore: number;       // max 40
  totalScore: number;       // max 100
  grade: string;
  gpa: number;
  standing: 'Honors' | 'Passed' | 'Probation' | 'Failed';
  remarks: string;
  lastUpdated: string;
  updatedBy: string;
  isPublished: boolean;
}

export interface WarningNotice {
  id: string;
  referenceNo: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  studentEmail: string;
  parentName: string;
  parentEmail: string;
  courseId?: string;
  courseName?: string;
  currentAttendance: number;
  thresholdAttendance: number;
  classesNeeded: number;
  severity: WarningSeverity;
  issuedAt: string;
  status: NoticeStatus;
  dispatchedVia: string[];
  officialRemarks: string;
  acknowledgedAt?: string;
  appealReason?: string;
  appealSubmittedAt?: string;
  appealStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  appealReviewNote?: string;
}

export interface AttendanceSessionUpdate {
  courseId: string;
  date: string;
  records: {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}
