
// ... (Previous imports and isApiConfigured remain the same)
import { Student, AgendaItem, GradeRecord, GradeData, BehaviorLog, Extracurricular, TeacherProfileData, SchoolProfileData, User, Holiday, InventoryItem, Guest, ScheduleItem, PiketGroup, SikapAssessment, KarakterAssessment, SeatingLayouts, AcademicCalendarData, EmploymentLink, LearningReport, LiaisonLog, PermissionRequest, LearningJournalEntry, SupportDocument, OrganizationStructure, SchoolAsset, BOSTransaction, LearningDocumentation } from '../types';

// PENTING: Menggunakan URL Deployment yang valid dan stabil.
const API_URL = 'https://script.google.com/macros/s/AKfycbzvbGQyyfT6LWxRg9wUYM7HQwzRk3JUh3UR2GYt4LoDxJAPNBPQlYBaNKdKNuNluTPZ/exec';

const isApiConfigured = () => {
  return API_URL && API_URL.startsWith('http');
};

const fetchApi = async (method: string, body: any = null) => {
  if (!isApiConfigured()) {
    throw new Error("API URL belum dikonfigurasi.");
  }

  const options: RequestInit = {
    method: 'POST',
    redirect: 'follow', // Essential for Google Apps Script Web Apps
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Avoids CORS preflight issues
    },
    body: JSON.stringify(body)
  };

  try {
    const response = await fetch(API_URL, options);
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Handle HTML error pages from Google Scripts (e.g. 404/500/Permissions)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
        const text = await response.text();
        console.error("API returned non-JSON response:", text.substring(0, 500));
        throw new Error("Server response is not valid JSON. Please check backend deployment.");
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.warn("Network error or CORS issue accessing API");
        throw new Error("Tidak dapat terhubung ke server (Network/CORS Error).");
    }
    console.error("API Error:", error);
    throw error;
  }
};

export const apiService = {
  isConfigured: isApiConfigured,

  // --- Auth & Users ---
  login: async (username: string, password?: string): Promise<User | null> => {
    const res = await fetchApi('POST', { action: 'login', payload: { username, password } });
    if (res.status === 'success') return res.data;
    return null;
  },
  loginWithGoogle: async (email: string): Promise<User | null> => {
    const res = await fetchApi('POST', { action: 'loginGoogle', payload: { email } });
    if (res.status === 'success') return res.data;
    if (res.status === 'error') throw new Error(res.message);
    return null;
  },
  getUsers: async (currentUser: User | null): Promise<User[]> => {
    const res = await fetchApi('POST', { action: 'getUsers', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  saveUser: async (user: User): Promise<User> => {
    const res = await fetchApi('POST', { action: 'saveUser', payload: user });
    return res.status === 'success' ? res.data : user;
  },
  saveUserBatch: async (users: Omit<User, 'id'>[]): Promise<void> => {
    await fetchApi('POST', { action: 'saveUserBatch', payload: { users } });
  },
  deleteUser: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteUser', id });
  },
  syncStudentAccounts: async (): Promise<{ status: string; message: string }> => {
    return await fetchApi('POST', { action: 'syncStudentAccounts' });
  },

  // --- Students ---
  getStudents: async (currentUser: User | null): Promise<Student[]> => {
    const res = await fetchApi('POST', { action: 'getStudents', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  createStudent: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const res = await fetchApi('POST', { action: 'createStudent', payload: student });
    return res.status === 'success' ? res.data : { ...student, id: 'temp' } as Student;
  },
  createStudentBatch: async (students: Omit<Student, 'id'>[]): Promise<any> => {
    return await fetchApi('POST', { action: 'createStudentBatch', payload: { students } });
  },
  updateStudent: async (student: Student): Promise<void> => {
    await fetchApi('POST', { action: 'updateStudent', payload: student });
  },
  deleteStudent: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteStudent', id });
  },

  // --- Agendas ---
  getAgendas: async (currentUser: User | null): Promise<AgendaItem[]> => {
    const res = await fetchApi('POST', { action: 'getAgendas', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  createAgenda: async (agenda: AgendaItem): Promise<void> => {
    await fetchApi('POST', { action: 'createAgenda', payload: agenda });
  },
  updateAgenda: async (agenda: AgendaItem): Promise<void> => {
    await fetchApi('POST', { action: 'updateAgenda', payload: agenda });
  },
  deleteAgenda: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteAgenda', id });
  },

  // --- Grades ---
  getGrades: async (currentUser: User | null): Promise<GradeRecord[]> => {
    const res = await fetchApi('POST', { action: 'getGrades', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  saveGrade: async (studentId: string, subjectId: string, gradeData: GradeData, classId: string): Promise<void> => {
    await fetchApi('POST', { action: 'saveGrade', payload: { studentId, subjectId, gradeData, classId } });
  },

  // --- Counseling ---
  getCounselingLogs: async (currentUser: User | null): Promise<BehaviorLog[]> => {
    const res = await fetchApi('POST', { action: 'getCounselingLogs', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  createCounselingLog: async (log: BehaviorLog): Promise<void> => {
    await fetchApi('POST', { action: 'createCounselingLog', payload: log });
  },

  // --- Extracurriculars ---
  getExtracurriculars: async (currentUser: User | null): Promise<Extracurricular[]> => {
    const res = await fetchApi('POST', { action: 'getExtracurriculars', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  createExtracurricular: async (extra: Extracurricular): Promise<void> => {
    await fetchApi('POST', { action: 'createExtracurricular', payload: extra });
  },
  updateExtracurricular: async (extra: Extracurricular): Promise<void> => {
    await fetchApi('POST', { action: 'updateExtracurricular', payload: extra });
  },
  deleteExtracurricular: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteExtracurricular', id });
  },

  // --- Profiles ---
  getProfiles: async (): Promise<{ teacher?: TeacherProfileData, school?: SchoolProfileData }> => {
    const res = await fetchApi('POST', { action: 'getProfiles' });
    return res.status === 'success' ? res.data : {};
  },
  saveProfile: async (type: 'teacher' | 'school', data: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveProfile', payload: { type, data } });
  },

  // --- Holidays ---
  getHolidays: async (currentUser: User | null): Promise<Holiday[]> => {
    const res = await fetchApi('POST', { action: 'getHolidays' });
    return res.status === 'success' ? res.data : [];
  },
  saveHolidayBatch: async (holidays: Omit<Holiday, 'id'>[]): Promise<void> => {
    await fetchApi('POST', { action: 'saveHolidayBatch', payload: { holidays } });
  },
  updateHoliday: async (holiday: Holiday): Promise<void> => {
    await fetchApi('POST', { action: 'updateHoliday', payload: holiday });
  },
  deleteHoliday: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteHoliday', id });
  },

  // --- Attendance ---
  getAttendance: async (currentUser: User | null): Promise<any[]> => {
    const res = await fetchApi('POST', { action: 'getAttendance', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  saveAttendance: async (date: string, records: any[]): Promise<void> => {
    await fetchApi('POST', { action: 'saveAttendance', payload: { date, records } });
  },
  saveAttendanceBatch: async (batchData: { date: string, records: any[] }[]): Promise<void> => {
    await fetchApi('POST', { action: 'saveAttendanceBatch', payload: { batchData } });
  },

  // --- Sikap & Karakter ---
  getSikapAssessments: async (currentUser: User | null): Promise<SikapAssessment[]> => {
    const res = await fetchApi('POST', { action: 'getSikapAssessments', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  saveSikapAssessment: async (studentId: string, classId: string, assessment: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveSikapAssessment', payload: { studentId, classId, assessment } });
  },
  getKarakterAssessments: async (currentUser: User | null): Promise<KarakterAssessment[]> => {
    const res = await fetchApi('POST', { action: 'getKarakterAssessments', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  saveKarakterAssessment: async (studentId: string, classId: string, assessment: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveKarakterAssessment', payload: { studentId, classId, assessment } });
  },

  // --- Employment Links ---
  getEmploymentLinks: async (): Promise<EmploymentLink[]> => {
    const res = await fetchApi('POST', { action: 'getEmploymentLinks' });
    return res.status === 'success' ? res.data : [];
  },
  saveEmploymentLink: async (link: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveEmploymentLink', payload: link });
  },
  deleteEmploymentLink: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteEmploymentLink', id });
  },

  // --- Inventory ---
  getInventory: async (classId: string): Promise<InventoryItem[]> => {
    const res = await fetchApi('POST', { action: 'getInventory', classId });
    return res.status === 'success' ? res.data : [];
  },
  saveInventory: async (item: InventoryItem): Promise<void> => {
    await fetchApi('POST', { action: 'saveInventory', payload: item });
  },
  deleteInventory: async (id: string, classId: string): Promise<any> => {
    return await fetchApi('POST', { action: 'deleteInventory', id, classId });
  },

  // --- Guests ---
  getGuests: async (classId: string): Promise<Guest[]> => {
    const res = await fetchApi('POST', { action: 'getGuests', classId });
    return res.status === 'success' ? res.data : [];
  },
  saveGuest: async (guest: Guest): Promise<void> => {
    await fetchApi('POST', { action: 'saveGuest', payload: guest });
  },
  deleteGuest: async (id: string, classId: string): Promise<any> => {
    return await fetchApi('POST', { action: 'deleteGuest', id, classId });
  },

  // --- Class Config (Schedule, Piket, Seating, KKTP) ---
  getClassConfig: async (classId: string): Promise<{
      schedule: ScheduleItem[], 
      piket: PiketGroup[], 
      seats: SeatingLayouts, 
      kktp?: Record<string, number>, 
      academicCalendar?: AcademicCalendarData, 
      timeSlots?: string[], 
      organization?: OrganizationStructure,
      settings?: { showStudentRecap?: boolean } 
  }> => {
     const defaultConfig = {schedule: [], piket: [], seats: { classical: [], groups: [], ushape: [] }, academicCalendar: {}, timeSlots: [], organization: { roles: {}, sections: [] }, settings: {} };
     if (!isApiConfigured() || !classId) return defaultConfig;
     
     const res = await fetchApi('POST', { action: 'getClassConfig', classId });
     if (res.status === 'success' && res.data) {
        return { ...defaultConfig, ...res.data };
     }
     return defaultConfig;
  },
  saveClassConfig: async (key: string, data: any, classId: string): Promise<void> => {
     await fetchApi('POST', { action: 'saveClassConfig', payload: { key, data, classId } });
  },

  // --- Learning Reports ---
  getLearningReports: async (classId: string): Promise<LearningReport[]> => {
    const res = await fetchApi('POST', { action: 'getLearningReports', classId });
    return res.status === 'success' ? res.data : [];
  },
  saveLearningReport: async (report: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveLearningReport', payload: report });
  },
  deleteLearningReport: async (id: string, classId: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteLearningReport', id, classId });
  },

  // --- Learning Journal ---
  getLearningJournal: async (classId: string): Promise<LearningJournalEntry[]> => {
    const res = await fetchApi('POST', { action: 'getLearningJournal', classId });
    return res.status === 'success' ? res.data : [];
  },
  saveLearningJournalBatch: async (entries: any[]): Promise<void> => {
    await fetchApi('POST', { action: 'saveLearningJournalBatch', payload: { entries } });
  },
  deleteLearningJournal: async (id: string, classId: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteLearningJournal', id, classId });
  },

  // --- Learning Documentation ---
  getLearningDocumentation: async (classId: string): Promise<LearningDocumentation[]> => {
    const res = await fetchApi('POST', { action: 'getLearningDocumentation', classId });
    return res.status === 'success' ? res.data : [];
  },
  saveLearningDocumentation: async (doc: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveLearningDocumentation', payload: doc });
  },
  deleteLearningDocumentation: async (id: string, classId: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteLearningDocumentation', id, classId });
  },

  // --- Liaison Logs ---
  getLiaisonLogs: async (currentUser: User | null): Promise<LiaisonLog[]> => {
    const res = await fetchApi('POST', { action: 'getLiaisonLogs', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  saveLiaisonLog: async (log: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveLiaisonLog', payload: log });
  },
  updateLiaisonStatus: async (ids: string[], status: string): Promise<void> => {
    await fetchApi('POST', { action: 'updateLiaisonStatus', payload: { ids, status } });
  },
  replyLiaisonLog: async (id: string, response: string): Promise<void> => {
    await fetchApi('POST', { action: 'replyLiaisonLog', payload: { id, response } });
  },

  // --- Permission Requests ---
  getPermissionRequests: async (currentUser: User | null): Promise<PermissionRequest[]> => {
    const res = await fetchApi('POST', { action: 'getPermissionRequests', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  savePermissionRequest: async (request: any): Promise<void> => {
    await fetchApi('POST', { action: 'savePermissionRequest', payload: request });
  },
  processPermissionRequest: async (id: string, actionStatus: string): Promise<void> => {
    await fetchApi('POST', { action: 'processPermissionRequest', payload: { id, action: actionStatus } });
  },

  // --- Support Documents ---
  getSupportDocuments: async (currentUser: User | null): Promise<SupportDocument[]> => {
    const res = await fetchApi('POST', { action: 'getSupportDocuments', user: currentUser });
    return res.status === 'success' ? res.data : [];
  },
  saveSupportDocument: async (doc: any): Promise<void> => {
    await fetchApi('POST', { action: 'saveSupportDocument', payload: doc });
  },
  deleteSupportDocument: async (id: string, classId: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteSupportDocument', id, classId });
  },

  // --- School Assets (Sarana Prasarana) ---
  getSchoolAssets: async (): Promise<SchoolAsset[]> => {
    const res = await fetchApi('POST', { action: 'getSchoolAssets' });
    return res.status === 'success' ? res.data : [];
  },
  saveSchoolAsset: async (asset: SchoolAsset): Promise<void> => {
    await fetchApi('POST', { action: 'saveSchoolAsset', payload: asset });
  },
  deleteSchoolAsset: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteSchoolAsset', id });
  },

  // --- BOS Management ---
  getBOS: async (): Promise<BOSTransaction[]> => {
    const res = await fetchApi('POST', { action: 'getBOS' });
    return res.status === 'success' ? res.data : [];
  },
  saveBOS: async (transaction: BOSTransaction): Promise<void> => {
    await fetchApi('POST', { action: 'saveBOS', payload: transaction });
  },
  deleteBOS: async (id: string): Promise<void> => {
    await fetchApi('POST', { action: 'deleteBOS', id });
  },

  // --- Backup/Restore ---
  backupData: async (classId: string): Promise<any> => {
    return await fetchApi('POST', { action: 'backupData', payload: { classId } });
  },
  restoreData: async (data: any): Promise<any> => {
    return await fetchApi('POST', { action: 'restoreData', payload: data });
  },
};