
// ... existing imports
import { Student, AgendaItem, GradeRecord, GradeData, BehaviorLog, Extracurricular, TeacherProfileData, SchoolProfileData, User, Holiday, InventoryItem, Guest, ScheduleItem, PiketGroup, SikapAssessment, KarakterAssessment, SeatingLayouts, AcademicCalendarData, EmploymentLink, LearningReport, LiaisonLog, PermissionRequest, LearningJournalEntry, SupportDocument, OrganizationStructure } from '../types';

// PENTING: Ganti URL di bawah ini dengan URL Deployment Web App Google Apps Script Anda yang baru.
const API_URL = 'https://script.google.com/macros/s/AKfycbyJVMuZj3ckziyeMBTJI8VK8PECbXTeBi-Hf6Mpjif9DehLUhKocqSB2yiajMo3oBqP/exec';

// ... (existing code for ApiResponse, isApiConfigured, getCategoryColor, fetchApi)

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  id?: string;
}

const isApiConfigured = () => {
  return API_URL.startsWith('https://script.google.com') && !API_URL.includes('MASUKKAN_DEPLOYMENT_ID_BARU_DISINI');
};

const getCategoryColor = (category: string = ''): string => {
  const cat = category.toLowerCase();
  if (cat.includes('wajib') || cat.includes('pramuka')) return 'bg-amber-600';
  if (cat.includes('seni') || cat.includes('tari') || cat.includes('hadrah')) return 'bg-emerald-600';
  if (cat.includes('olah') || cat.includes('tenis')) return 'bg-blue-600';
  if (cat.includes('bela') || cat.includes('karate') || cat.includes('silat')) return 'bg-rose-600';
  if (cat.includes('agama') || cat.includes('jus')) return 'bg-teal-600';
  if (cat.includes('tekno') || cat.includes('tik')) return 'bg-cyan-600';
  if (cat.includes('tongklek')) return 'bg-orange-600';
  return 'bg-indigo-600'; 
};

const fetchApi = async (method: 'GET' | 'POST', params?: any) => {
    if (!isApiConfigured()) {
        throw new Error("API URL belum dikonfigurasi.");
    }
    const options: RequestInit = {
        method: method,
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    };
    let url = API_URL;
    if (method === 'GET' && params) {
      const searchParams = new URLSearchParams();
      for (const key in params) {
        if (typeof params[key] === 'object' && params[key] !== null) {
          searchParams.append(key, JSON.stringify(params[key]));
        } else {
          searchParams.append(key, params[key]);
        }
      }
      url += `?${searchParams.toString()}`;
    }
    else if (method === 'POST' && params) options.body = JSON.stringify(params);

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        return JSON.parse(text);
    } catch (error: any) {
        if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
            throw new Error("Gagal menghubungi server.");
        }
        throw error;
    }
};

type AttendanceRecord = { studentId: string; classId: string; status: 'present' | 'sick' | 'permit' | 'alpha'; notes: string };

export const apiService = {
  isConfigured: isApiConfigured,

  // --- Auth ---
  login: async (username: string, password: string): Promise<User | null> => {
      if (!isApiConfigured()) {
          if (username === 'admin' && password === '123456') {
              return { id: 'admin', username: 'admin', fullName: 'Administrator', position: 'Admin Sekolah', role: 'admin' };
          }
          return null;
      }
      const result = await fetchApi('POST', { action: 'login', payload: { username, password } });
      
      if (result.status === 'success' && result.data) {
          return result.data;
      }
      if (result.status === 'error') {
          throw new Error(result.message || 'Login gagal.');
      }
      return null;
  },

  getUsers: async (user: User | null): Promise<User[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getUsers', user });
    return result.status === 'success' && result.data ? result.data : [];
  },

  saveUser: async (user: User) => {
    return await fetchApi('POST', { action: 'saveUser', payload: user });
  },

  saveUserBatch: async (users: Omit<User, 'id'>[]) => {
    return await fetchApi('POST', { action: 'saveUserBatch', payload: { users } });
  },

  deleteUser: async (id: string) => {
    return await fetchApi('POST', { action: 'deleteUser', id });
  },

  syncStudentAccounts: async () => {
    return await fetchApi('POST', { action: 'syncStudentAccounts' });
  },

  // --- Students ---
  getStudents: async (user: User | null): Promise<Student[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getStudents', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  createStudent: async (student: Omit<Student, 'id'>) => {
    return await fetchApi('POST', { action: 'createStudent', payload: student });
  },
  createStudentBatch: async (students: Omit<Student, 'id'>[]) => {
    return await fetchApi('POST', { action: 'createStudentBatch', payload: { students } });
  },
  updateStudent: async (student: Student) => {
    return await fetchApi('POST', { action: 'updateStudent', payload: student });
  },
  deleteStudent: async (id: string) => {
    return await fetchApi('POST', { action: 'deleteStudent', id: id });
  },

  // --- Sikap & Karakter ---
  // ... (Rest of existing methods remain unchanged)
  getSikapAssessments: async (user: User | null): Promise<SikapAssessment[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getSikapAssessments', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveSikapAssessment: async (studentId: string, classId: string, assessment: Omit<SikapAssessment, 'studentId' | 'classId'>) => {
    return await fetchApi('POST', { action: 'saveSikapAssessment', payload: { studentId, classId, assessment } });
  },
  getKarakterAssessments: async (user: User | null): Promise<KarakterAssessment[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getKarakterAssessments', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveKarakterAssessment: async (studentId: string, classId: string, assessment: Omit<KarakterAssessment, 'studentId' | 'classId'>) => {
    return await fetchApi('POST', { action: 'saveKarakterAssessment', payload: { studentId, classId, assessment } });
  },

  // --- Inventory ---
  getInventory: async (classId: string): Promise<InventoryItem[]> => {
    if (!isApiConfigured()) return [];
    const res = await fetchApi('GET', { action: 'getInventory', classId });
    return res.status === 'success' && res.data ? res.data : [];
  },
  saveInventory: async (item: InventoryItem) => {
    return await fetchApi('POST', { action: 'saveInventory', payload: item });
  },
  deleteInventory: async (id: string, classId: string) => {
    return await fetchApi('POST', { action: 'deleteInventory', id, classId });
  },

  // --- Guests ---
  getGuests: async (classId: string): Promise<Guest[]> => {
    if (!isApiConfigured()) return [];
    const res = await fetchApi('GET', { action: 'getGuests', classId });
    return res.status === 'success' && res.data ? res.data : [];
  },
  saveGuest: async (guest: Guest) => {
    return await fetchApi('POST', { action: 'saveGuest', payload: guest });
  },
  deleteGuest: async (id: string, classId: string) => {
    return await fetchApi('POST', { action: 'deleteGuest', id, classId });
  },

  // --- Class Config (Schedule, Piket, Seating, KKTP) ---
  getClassConfig: async (classId: string): Promise<{schedule: ScheduleItem[], piket: PiketGroup[], seats: SeatingLayouts, kktp?: Record<string, number>, academicCalendar?: AcademicCalendarData, timeSlots?: string[], organization?: OrganizationStructure}> => {
     const defaultConfig = {schedule: [], piket: [], seats: { classical: [], groups: [], ushape: [] }, academicCalendar: {}, timeSlots: [], organization: { roles: {}, sections: [] }};
     if (!isApiConfigured() || !classId) return defaultConfig;
     
     const res = await fetchApi('GET', { action: 'getClassConfig', classId });
     if (res.status === 'success' && res.data) {
        return { ...defaultConfig, ...res.data };
     }
     return defaultConfig;
  },
  saveClassConfig: async (key: 'SCHEDULE' | 'PIKET' | 'SEATING' | 'KKTP' | 'ACADEMIC_CALENDAR' | 'TIME_SLOTS' | 'ORGANIZATION', data: any, classId: string) => {
     return await fetchApi('POST', { action: 'saveClassConfig', payload: { key, data, classId } });
  },

  // --- Agendas ---
  getAgendas: async (user: User | null): Promise<AgendaItem[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getAgendas', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  createAgenda: async (agenda: AgendaItem) => {
    return await fetchApi('POST', { action: 'createAgenda', payload: agenda });
  },
  updateAgenda: async (agenda: AgendaItem) => {
    return await fetchApi('POST', { action: 'updateAgenda', payload: agenda });
  },
  deleteAgenda: async (id: string) => {
    return await fetchApi('POST', { action: 'deleteAgenda', id: id });
  },

  // --- Grades ---
  getGrades: async (user: User | null): Promise<GradeRecord[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getGrades', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveGrade: async (studentId: string, subjectId: string, gradeData: GradeData, classId: string) => {
    return await fetchApi('POST', { action: 'saveGrade', payload: { studentId, subjectId, gradeData, classId } });
  },

  // --- ATTENDANCE (New granular methods) ---
  getAttendance: async (user: User | null): Promise<{studentId: string, date: string, status: string, notes: string}[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getAttendance', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveAttendance: async (date: string, records: AttendanceRecord[]) => {
    return await fetchApi('POST', { action: 'saveAttendance', payload: { date, records } });
  },
  saveAttendanceBatch: async (batchData: {date: string, records: AttendanceRecord[]}[]) => {
    return await fetchApi('POST', { action: 'saveAttendanceBatch', payload: { batchData } });
  },

  // --- HOLIDAYS ---
  getHolidays: async (user: User | null): Promise<Holiday[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getHolidays', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveHolidayBatch: async (holidays: Omit<Holiday, 'id'>[]) => {
    return await fetchApi('POST', { action: 'saveHolidayBatch', payload: { holidays } });
  },
  updateHoliday: async (holiday: Holiday) => {
    return await fetchApi('POST', { action: 'updateHoliday', payload: holiday });
  },
  deleteHoliday: async (id: string) => {
    return await fetchApi('POST', { action: 'deleteHoliday', id });
  },

  // --- Counseling ---
  getCounselingLogs: async (user: User | null): Promise<BehaviorLog[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getCounselingLogs', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  createCounselingLog: async (log: BehaviorLog) => {
    return await fetchApi('POST', { action: 'createCounselingLog', payload: log });
  },

  // --- Extracurriculars ---
  getExtracurriculars: async (user: User | null): Promise<Extracurricular[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getExtracurriculars', user });
    if (result.status === 'success' && result.data) {
        return result.data.map((r:Extracurricular) => ({
            ...r,
            color: getCategoryColor(r.category)
        }));
    }
    return [];
  },
  createExtracurricular: async (item: Extracurricular) => {
    return await fetchApi('POST', { action: 'createExtracurricular', payload: item });
  },
  updateExtracurricular: async (item: Extracurricular) => {
    return await fetchApi('POST', { action: 'updateExtracurricular', payload: item });
  },
  deleteExtracurricular: async (id: string) => {
    return await fetchApi('POST', { action: 'deleteExtracurricular', id });
  },

  // --- Profiles ---
  getProfiles: async (): Promise<{ teacher?: TeacherProfileData, school?: SchoolProfileData }> => {
    if (!isApiConfigured()) return {};
    const result = await fetchApi('GET', { action: 'getProfiles' });
    return result.status === 'success' && result.data ? result.data : {};
  },
  saveProfile: async (key: 'teacher' | 'school', value: any) => {
    return await fetchApi('POST', { action: 'saveProfile', payload: { key, value } });
  },

  // --- Employment Links ---
  getEmploymentLinks: async (): Promise<EmploymentLink[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getEmploymentLinks' });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveEmploymentLink: async (link: Omit<EmploymentLink, 'id'> | EmploymentLink) => {
    return await fetchApi('POST', { action: 'saveEmploymentLink', payload: link });
  },
  deleteEmploymentLink: async (id: string) => {
    return await fetchApi('POST', { action: 'deleteEmploymentLink', id });
  },

  // --- Learning Reports ---
  getLearningReports: async (classId: string): Promise<LearningReport[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getLearningReports', classId });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveLearningReport: async (report: Omit<LearningReport, 'id'> | LearningReport) => {
    return await fetchApi('POST', { action: 'saveLearningReport', payload: report });
  },
  deleteLearningReport: async (id: string, classId: string) => {
    return await fetchApi('POST', { action: 'deleteLearningReport', id, classId });
  },

  // --- NEW: Learning Journal (Jurnal Pembelajaran) ---
  getLearningJournal: async (classId: string): Promise<LearningJournalEntry[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getLearningJournal', classId });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveLearningJournalBatch: async (entries: Partial<LearningJournalEntry>[]) => {
    return await fetchApi('POST', { action: 'saveLearningJournalBatch', payload: { entries } });
  },
  deleteLearningJournal: async (id: string, classId: string) => {
    return await fetchApi('POST', { action: 'deleteLearningJournal', id, classId });
  },

  // --- Liaison Logs ---
  getLiaisonLogs: async (user: User | null): Promise<LiaisonLog[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getLiaisonLogs', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveLiaisonLog: async (log: Omit<LiaisonLog, 'id'>) => {
    return await fetchApi('POST', { action: 'saveLiaisonLog', payload: log });
  },
  // NEW: Update Liaison Status
  updateLiaisonStatus: async (ids: string[], status: 'Pending' | 'Diterima' | 'Ditolak' | 'Selesai') => {
    return await fetchApi('POST', { action: 'updateLiaisonStatus', payload: { ids, status } });
  },

  // --- NEW: Permission Requests (Ijin) ---
  getPermissionRequests: async (user: User | null): Promise<PermissionRequest[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getPermissionRequests', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  savePermissionRequest: async (request: Omit<PermissionRequest, 'id' | 'status'>) => {
    return await fetchApi('POST', { action: 'savePermissionRequest', payload: request });
  },
  processPermissionRequest: async (id: string, action: 'approve' | 'reject') => {
    return await fetchApi('POST', { action: 'processPermissionRequest', payload: { id, action } });
  },

  // --- NEW: Support Documents ---
  getSupportDocuments: async (user: User | null): Promise<SupportDocument[]> => {
    if (!isApiConfigured()) return [];
    const result = await fetchApi('GET', { action: 'getSupportDocuments', user });
    return result.status === 'success' && result.data ? result.data : [];
  },
  saveSupportDocument: async (doc: Omit<SupportDocument, 'id'> | SupportDocument) => {
    return await fetchApi('POST', { action: 'saveSupportDocument', payload: doc });
  },
  deleteSupportDocument: async (id: string, classId: string) => {
    return await fetchApi('POST', { action: 'deleteSupportDocument', id, classId });
  },

  // --- NEW: Restore Data (Admin) ---
  restoreData: async (data: any) => {
    return await fetchApi('POST', { action: 'restoreData', payload: data });
  }
};