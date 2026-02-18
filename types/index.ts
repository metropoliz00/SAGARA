
export interface User {
  id: string;
  username: string;
  password?: string; // Only for creating/updating
  role: 'admin' | 'guru' | 'siswa' | 'supervisor';
  fullName: string; // Nama Lengkap
  
  // New Fields matching the backend sheet columns
  nip?: string;
  nuptk?: string;
  birthInfo?: string; // Tempat Tgl Lahir
  education?: string; // Pendidikan Terakhir
  position: string;   // Jabatan Guru
  rank?: string;      // Pangkat / Gol
  classId?: string;   // Tugas Mengajar Kelas
  
  email?: string;
  phone?: string;     // No HP
  address?: string;   // Alamat

  // Media
  photo?: string;     // Base64
  signature?: string; // Base64

  studentId?: string; // Only for Siswa role
}

export interface Student {
  id: string;
  classId: string;
  nis: string;
  nisn?: string;
  name: string;
  gender: 'L' | 'P';
  birthDate: string;
  birthPlace?: string;
  religion?: string;
  address: string;
  photo?: string; // New: Base64 Image URL
  
  // Parent Info
  fatherName: string; 
  fatherJob?: string; 
  fatherEducation?: string;
  motherName: string; 
  motherJob?: string; 
  motherEducation?: string;
  parentName: string; // Acts as Guardian Name (Wali)
  parentJob?: string;
  parentPhone: string;
  
  bloodType?: string;
  height?: number;
  weight?: number;
  healthNotes?: string;
  hobbies?: string;
  ambition?: string;
  economyStatus?: 'Mampu' | 'Cukup' | 'Kurang Mampu' | 'KIP';
  joinDate?: string;
  originSchool?: string;
  achievements?: string[];
  violations?: string[];
  behaviorScore: number;
  attendance: {
    present: number;
    sick: number;
    permit: number;
    alpha: number;
  };
  
  teacherNotes?: string; // NEW: Catatan Wali Kelas
}

export interface Subject {
  id: string;
  name: string;
  kkm: number;
}

export interface GradeData {
  sum1: number;
  sum2: number;
  sum3: number;
  sum4: number;
  sas: number;
}

export interface GradeRecord {
  studentId: string;
  classId: string;
  subjects: Record<string, GradeData>;
}

export interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
}

export interface PiketGroup {
  day: string;
  studentIds: string[];
}

export interface SeatingLayouts {
  classical: (string | null)[];
  groups: (string | null)[];
  ushape: (string | null)[];
}

export interface InventoryItem {
  id: string;
  classId: string;
  name: string;
  condition: 'Baik' | 'Rusak';
  qty: number;
}

// NEW: School Infrastructure Asset
export interface SchoolAsset {
  id: string;
  name: string; // Jenis Sarana/Prasarana
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  qty: number;
  location?: string; // Optional location
}

export interface Guest {
  id: string;
  classId: string;
  date: string;
  time: string;
  name: string;
  purpose: string;
  agency: string;
}

export interface AgendaItem {
  id: string;
  classId: string;
  title: string;
  date: string;
  time?: string;
  type: 'urgent' | 'warning' | 'info';
  completed: boolean;
}

export interface BehaviorLog {
  id: number | string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string;
  type: 'positive' | 'negative' | 'counseling';
  category: string;
  description: string;
  point: number;
  emotion: 'happy' | 'proud' | 'neutral' | 'sad' | 'angry';
  status: 'Done' | 'Pending';
}

export interface Extracurricular {
  id: string;
  classId: string;
  name: string;
  category: string;
  schedule: string;
  coach: string;
  members: string[]; // List of Student IDs
  icon?: any; // Icon is purely frontend, might need mapping
  color: string;
}

export interface Holiday {
  id: string;
  classId: string;
  date: string;
  description: string;
  type: 'nasional' | 'haribesar' | 'cuti' | 'semester'; 
}

export interface EmploymentLink {
  id: string;
  title: string;
  url: string;
  icon?: string; // Base64
}

// FIX: Add missing SupportDocument interface
export interface SupportDocument {
  id: string;
  classId: string;
  name: string;
  url: string;
}

// NEW: Learning Report Interface (Laporan Pembelajaran - existing)
export interface LearningReport {
  id: string;
  classId: string;
  date: string;
  type: 'Jurnal Harian' | 'RPP/Modul Ajar' | 'Dokumentasi' | 'Lainnya';
  subject: string;
  topic: string;
  documentLink: string;
  teacherName?: string; // NEW: Added teacher name
}

// NEW: Jurnal Pembelajaran (Detailed Table)
export interface LearningJournalEntry {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  day: string; // Senin, Selasa, etc.
  subject: string;
  timeSlot?: string;
  topic: string; // Materi
  activities: string; // Kegiatan Pembelajaran
  evaluation: string; // Evaluasi
  reflection: string; // Refleksi
  followUp: string; // Tindak Lanjut
}

// UPDATED: Liaison Book (Buku Penghubung)
export interface LiaisonLog {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  sender: 'Guru' | 'Wali Murid';
  category?: string; // New: Kesiswaan, Pelayanan, Fasilitas, Lain-lain
  message: string; // Deskripsi Permasalahan
  status?: 'Pending' | 'Diterima' | 'Ditolak' | 'Selesai'; // Expanded status
  response?: string; // NEW: Balasan Guru
}

// NEW: Permission Request (Ijin Siswa)
export interface PermissionRequest {
  id: string;
  studentId: string;
  studentName?: string; // Hydrated on frontend
  classId: string;
  date: string;
  type: 'sick' | 'permit' | 'dispensation';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface TeacherProfileData {
  name: string;
  nip: string;
  nuptk?: string; 
  birthInfo?: string; 
  education?: string; 
  position?: string; 
  rank?: string; 
  teachingClass?: string; 
  
  phone: string;
  email: string;
  address: string;
  signature?: string; // Base64 Data URL
  photo?: string; // Base64 Data URL for Profile Picture
}

// FIX: Add missing properties developerInfo and headmasterSignature
export interface SchoolProfileData {
  name: string;
  npsn: string;
  address: string;
  headmaster: string;
  headmasterNip: string;
  year: string;
  semester: string;
  regencyLogo?: string; // Base64
  schoolLogo?: string; // Base64
  runningText?: string; // NEW: Teks Berjalan
  runningTextSpeed?: number; // NEW: Kecepatan Teks Berjalan (detik)
  headmasterSignature?: string;
  developerInfo?: {
    name: string;
    moto: string;
    photo: string;
  };
}

// Data Kalender Pendidikan
export interface AcademicCalendarData {
  [yearMonth: string]: (string | null)[]; // Key: YYYY-MM, Value: array of 31 day contents
}

// --- NEW: Struktur Organisasi ---
export interface OrganizationStructure {
  roles: Record<string, string | null>; // e.g., { president: 'student123', vicePresident: null, ... }
  sections: { id: string; name: string }[];
}

// NEW: BOS Interface
export interface BOSTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 
    | 'SiLPA Tahun Lalu' // Added to fix type error
    | 'BOS Reguler' 
    | 'Standar Isi' 
    | 'Standar Proses' 
    | 'Standar Kompetensi Lulusan' 
    | 'Standar Pendidik dan Tenaga Kependidikan' 
    | 'Standar Sarana dan Prasarana' 
    | 'Standar Pengelolaan' 
    | 'Standar Pembiayaan' 
    | 'Standar Penilaian Pendidikan';
  description: string;
  amount: number;
}


// --- Penilaian Sikap & Karakter ---

export const SIKAP_INDICATORS = {
  keimanan: 'Keimanan & Ketakwaan',
  kewargaan: 'Kewargaan',
  penalaranKritis: 'Penalaran Kritis',
  kreativitas: 'Kreativitas',
  kolaborasi: 'Kolaborasi',
  kemandirian: 'Kemandirian',
  kesehatan: 'Kesehatan',
  komunikasi: 'Komunikasi',
} as const;

export type SikapIndicatorKey = keyof typeof SIKAP_INDICATORS;

export interface SikapAssessment {
  studentId: string;
  classId: string;
  keimanan: number;
  kewargaan: number;
  penalaranKritis: number;
  kreativitas: number;
  kolaborasi: number;
  kemandirian: number;
  kesehatan: number;
  komunikasi: number;
}

export const KARAKTER_INDICATORS = {
  bangunPagi: 'Bangun Pagi',
  beribadah: 'Beribadah',
  berolahraga: 'Berolahraga',
  makanSehat: 'Makan Sehat & Bergizi',
  gemarBelajar: 'Gemar Belajar',
  bermasyarakat: 'Bermasyarakat',
  tidurAwal: 'Tidur Lebih Awal',
} as const;

export type KarakterIndicatorKey = keyof typeof KARAKTER_INDICATORS;

export interface KarakterAssessment {
  studentId: string;
  classId: string;
  // Changed from number to string to support "Terbiasa" | "Belum Terbiasa"
  bangunPagi: string;
  beribadah: string;
  berolahraga: string;
  makanSehat: string;
  gemarBelajar: string;
  bermasyarakat: string;
  tidurAwal: string;
  catatan?: string; // New field for notes
  afirmasi?: string; // New field for Positive Affirmation
}


// FIX: Add 'support-docs' to ViewState type for navigation
export type ViewState = 'dashboard' | 'students' | 'attendance' | 'grades' | 'admin' | 'counseling' | 'activities' | 'profile' | 'pendahuluan' | 'attitude' | 'accounts' | 'employment-links' | 'learning-reports' | 'learning-journal' | 'student-monitor' | 'liaison-book' | 'backup-restore' | 'support-docs' | 'supervisor-overview' | 'school-assets' | 'bos-admin';
