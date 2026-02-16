
// ... existing imports
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ClassroomAdmin from './components/ClassroomAdmin';
import TeacherProfile from './components/TeacherProfile';
import AttendanceView from './components/AttendanceView';
import GradesView from './components/GradesView';
import CounselingView from './components/CounselingView';
import ActivitiesView from './components/ActivitiesView';
import IntroductionView from './components/IntroductionView';
import AttitudeView from './components/AttitudeView';
import Login from './components/Login';
import Notification from './components/Notification';
import AccountManagement from './components/AccountManagement';
import EmploymentLinksAdmin from './components/EmploymentLinksAdmin';
import LearningReportsView from './components/LearningReportsView'; 
import LearningJournalView from './components/LearningJournalView'; // NEW IMPORT
import StudentMonitor from './components/StudentMonitor'; 
import LiaisonBookView from './components/LiaisonBookView'; 
import StudentPortal from './components/StudentPortal'; 
import BackupRestore from './components/BackupRestore';
import SupportDocumentsView from './components/SupportDocumentsView';
import CustomModal from './components/CustomModal'; 
import { ViewState, Student, AgendaItem, Extracurricular, BehaviorLog, GradeRecord, TeacherProfileData, SchoolProfileData, User, Holiday, SikapAssessment, KarakterAssessment, EmploymentLink, LearningReport, LiaisonLog, PermissionRequest, LearningJournalEntry, SupportDocument } from './types';
import { MOCK_SUBJECTS, MOCK_STUDENTS, MOCK_EXTRACURRICULARS } from './constants';
import { apiService } from './services/apiService';
import { Menu, Loader2, RefreshCw, AlertCircle, CheckCircle, WifiOff, ChevronDown, UserCog, LogOut, Filter, Bell, X } from 'lucide-react';

const App: React.FC = () => {
  // ... (State and Effects remain unchanged)
  // -- STATE PERSISTENCE INIT --
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      try {
          const saved = localStorage.getItem('sagara_user');
          return saved ? JSON.parse(saved) : null;
      } catch (e) { return null; }
  });

  const [currentView, setCurrentView] = useState<ViewState>(() => {
      return (localStorage.getItem('sagara_view') as ViewState) || 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  // -- ADMIN CLASS FILTER STATE --
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
      return localStorage.getItem('sagara_classId') || '';
  });

  // State Global
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  const [counselingLogs, setCounselingLogs] = useState<BehaviorLog[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<any[]>([]);
  const [sikapAssessments, setSikapAssessments] = useState<SikapAssessment[]>([]);
  const [karakterAssessments, setKarakterAssessments] = useState<KarakterAssessment[]>([]);
  const [employmentLinks, setEmploymentLinks] = useState<EmploymentLink[]>([]);
  const [learningReports, setLearningReports] = useState<LearningReport[]>([]);
  const [liaisonLogs, setLiaisonLogs] = useState<LiaisonLog[]>([]);
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]); 
  const [supportDocuments, setSupportDocuments] = useState<SupportDocument[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  // -- NEW STATE: Navigation Target for Journal --
  const [journalTargetDate, setJournalTargetDate] = useState<string | null>(null);

  // -- CUSTOM MODAL STATE --
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'success' | 'error';
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    message: '',
    onConfirm: () => {},
  });

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [processingPermissionId, setProcessingPermissionId] = useState<string | null>(null);
  const [adminPercentage, setAdminPercentage] = useState<number>(0);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileData>({
    name: 'Guru', nip: '', nuptk: '', birthInfo: '', education: '', position: '', rank: '', teachingClass: '', phone: '', email: '', address: ''
  });
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfileData>({
    name: 'Sekolah', npsn: '', address: '', headmaster: '', headmasterNip: '', year: new Date().getFullYear().toString(), semester: '1'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // --- Modal Helper Functions ---
  const showAlert = (message: string, type: 'success' | 'error' | 'alert' = 'alert', title?: string) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  const showConfirm = (message: string, onConfirmAction: () => void, title: string = 'Konfirmasi') => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        onConfirmAction();
      }
    });
  };

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
      if (currentUser) {
          localStorage.setItem('sagara_user', JSON.stringify(currentUser));
      } else {
          localStorage.removeItem('sagara_user');
      }
  }, [currentUser]);

  useEffect(() => {
      if (currentUser) {
          localStorage.setItem('sagara_view', currentView);
      }
  }, [currentView, currentUser]);

  const canSelectClass = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || 
           currentUser.role === 'supervisor' || 
           (currentUser.role === 'guru' && String(currentUser.classId).toUpperCase() === 'ALL');
  }, [currentUser]);

  useEffect(() => {
      if (canSelectClass && selectedClassId) {
          localStorage.setItem('sagara_classId', selectedClassId);
      }
  }, [selectedClassId, canSelectClass]);

  const handleLogout = () => {
      setCurrentUser(null);
      setStudents([]); // Clear data from memory
      setExtracurriculars([]);
      setAgendas([]);
      
      // Clear Persisted Data
      localStorage.removeItem('sagara_user');
      localStorage.removeItem('sagara_view');
      localStorage.removeItem('sagara_classId');
      localStorage.removeItem('sagara_student_tab');
      
      setCurrentView('dashboard');
  };
  
  const handleShowNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // -- Dynamic Class List Generation --
  const availableClasses = useMemo(() => {
    const studentClasses = students.map(s => String(s.classId || '').trim().toUpperCase()).filter(Boolean);
    const userClasses = users.map(u => String(u.classId || '').trim().toUpperCase()).filter(Boolean);
    const combinedSet = new Set([...studentClasses, ...userClasses]);
    combinedSet.delete('ALL');
    combinedSet.delete('');
    return Array.from(combinedSet).sort((a, b) => {
        const strA = String(a || '');
        const strB = String(b || '');
        const numA = parseInt(strA.replace(/\D/g, '')) || 0;
        const numB = parseInt(strB.replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        return strA.localeCompare(strB);
    });
  }, [students, users]);

  // -- Initialize Selected Class ID based on User Role --
  useEffect(() => {
    if (currentUser) {
        if (canSelectClass) {
            const currentStr = String(selectedClassId || '');
            const isValid = selectedClassId && availableClasses.some(c => String(c).toUpperCase() === currentStr.toUpperCase());
            // Only auto-select if no valid selection exists and list is populated
            if (!isValid && availableClasses.length > 0 && !selectedClassId) {
                setSelectedClassId(String(availableClasses[0]));
            }
        } else if (currentUser.role === 'siswa') {
            setCurrentView('dashboard'); 
            if (currentUser.classId) setSelectedClassId(String(currentUser.classId));
        } else {
            // Homeroom teacher
            setSelectedClassId(String(currentUser.classId || ''));
        }
    }
  }, [currentUser, availableClasses, selectedClassId, canSelectClass]);

  // -- CALCULATE ADMINISTRATION COMPLETENESS --
  useEffect(() => {
    const fetchAdminStats = async () => {
        if (!selectedClassId || String(selectedClassId).toLowerCase() === 'all' || isDemoMode) {
            setAdminPercentage(0);
            return;
        }
        try {
            const [inv, config] = await Promise.all([
                apiService.getInventory(selectedClassId),
                apiService.getClassConfig(selectedClassId)
            ]);
            let score = 0;
            if (config.schedule && config.schedule.length > 0) score++;
            if (config.piket && config.piket.length > 0) score++;
            const hasSeats = config.seats && (
                (config.seats.classical && config.seats.classical.some(s => s !== null)) ||
                (config.seats.groups && config.seats.groups.some(s => s !== null)) ||
                (config.seats.ushape && config.seats.ushape.some(s => s !== null))
            );
            if (hasSeats) score++;
            if (config.academicCalendar && Object.keys(config.academicCalendar).length > 0) score++;
            if (inv && inv.length > 0) score++;
            setAdminPercentage(Math.round((score / 5) * 100));
        } catch (e) {
            setAdminPercentage(0);
        }
    };
    fetchAdminStats();
  }, [selectedClassId, isDemoMode]); 

  // -- ACCESS CONTROL LOGIC --
  const { isGlobalReadOnly, allowedSubjects } = useMemo(() => {
    if (!currentUser) return { isGlobalReadOnly: true, allowedSubjects: [] };
    if (currentUser.role === 'admin') return { isGlobalReadOnly: false, allowedSubjects: ['all'] };
    if (currentUser.role === 'supervisor') return { isGlobalReadOnly: true, allowedSubjects: ['all'] }; // Supervisor Read-Only Global
    if (currentUser.role === 'siswa') return { isGlobalReadOnly: true, allowedSubjects: [] };
    
    // For 'guru' role
    const pos = (currentUser.position || '').toLowerCase();
    if (pos.includes('pai') || pos.includes('agama')) return { isGlobalReadOnly: false, allowedSubjects: ['pai'] };
    if (pos.includes('pjok') || pos.includes('olahraga')) return { isGlobalReadOnly: false, allowedSubjects: ['pjok'] };
    if (pos.includes('inggris')) return { isGlobalReadOnly: false, allowedSubjects: ['inggris'] };
    
    // Default for homeroom teachers
    return { isGlobalReadOnly: false, allowedSubjects: ['all'] };
  }, [currentUser]);

  // -- FILTERED DATA COMPUTATION --
  const isClassMatch = (id1?: string, id2?: string) => {
      const s1 = String(id1 || '').trim().toLowerCase();
      const s2 = String(id2 || '').trim().toLowerCase();
      return s1 === s2;
  };

  const activeClassId = useMemo(() => {
    if (!currentUser) return '';
    return canSelectClass ? selectedClassId : String(currentUser.classId || '');
  }, [currentUser, selectedClassId, canSelectClass]);

  const filteredStudents = useMemo(() => students.filter(s => isClassMatch(s.classId, activeClassId)), [students, activeClassId]);
  const filteredAgendas = useMemo(() => agendas.filter(a => isClassMatch(a.classId, activeClassId)), [agendas, activeClassId]);
  const filteredExtracurriculars = useMemo(() => extracurriculars.filter(e => isClassMatch(e.classId, activeClassId)), [extracurriculars, activeClassId]);
  const filteredGrades = useMemo(() => grades.filter(g => isClassMatch(g.classId, activeClassId)), [grades, activeClassId]);
  
  const filteredAttendance = useMemo(() => {
      return allAttendanceRecords.filter(a => {
          if (isClassMatch(a.classId, activeClassId)) return true;
          if (!a.classId || a.classId === 'undefined' || a.classId === 'null') {
              const student = students.find(s => s.id === a.studentId);
              if (student && isClassMatch(student.classId, activeClassId)) return true;
          }
          return false;
      });
  }, [allAttendanceRecords, activeClassId, students]);

  const filteredCounseling = useMemo(() => counselingLogs.filter(c => isClassMatch(c.classId, activeClassId)), [counselingLogs, activeClassId]);
  const filteredSikap = useMemo(() => sikapAssessments.filter(s => isClassMatch(s.classId, activeClassId)), [sikapAssessments, activeClassId]);
  const filteredKarakter = useMemo(() => karakterAssessments.filter(k => isClassMatch(k.classId, activeClassId)), [karakterAssessments, activeClassId]);
  const filteredHolidays = useMemo(() => holidays.filter(h => isClassMatch(h.classId, activeClassId)), [holidays, activeClassId]);
  const filteredReports = useMemo(() => learningReports.filter(r => isClassMatch(r.classId, activeClassId)), [learningReports, activeClassId]);
  const filteredSupportDocuments = useMemo(() => supportDocuments.filter(d => isClassMatch(d.classId, activeClassId)), [supportDocuments, activeClassId]);
  
  const filteredLiaison = useMemo(() => {
      return liaisonLogs.filter(l => {
          if (isClassMatch(l.classId, activeClassId)) return true;
          if (!l.classId || l.classId === 'undefined' || l.classId === 'null') {
               const student = students.find(s => s.id === l.studentId);
               if (student && isClassMatch(student.classId, activeClassId)) return true;
          }
          return false;
      });
  }, [liaisonLogs, activeClassId, students]);

  const pendingPermissions = useMemo(() => {
      const raw = permissionRequests.filter(p => p.status === 'Pending');
      if (currentUser?.role === 'admin' || currentUser?.role === 'supervisor') return raw; 
      return raw.filter(p => isClassMatch(p.classId, activeClassId));
  }, [permissionRequests, activeClassId, currentUser]);

  // ... (Handlers with Custom Modal Logic)
  
  // -- AUTO REPORT GENERATION LOGIC --
  const handleSaveJournalAndAutoReport = async (entries: Partial<LearningJournalEntry>[]) => {
      if (isDemoMode) {
          handleShowNotification('Jurnal & Laporan otomatis disimpan (Demo)', 'success');
          return;
      }

      try {
          // 1. Save Journal Batch
          await apiService.saveLearningJournalBatch(entries);
          handleShowNotification('Jurnal pembelajaran berhasil disimpan.', 'success');

          // 2. Aggregate Data for Auto-Report
          if (entries.length > 0 && entries[0].date) {
              const reportDate = entries[0].date;
              
              // Get unique subjects
              const uniqueSubjects = [...new Set(entries.map(e => e.subject).filter(Boolean))].join(', ');
              // Combine topics
              const combinedTopics = entries.map(e => e.topic).filter(Boolean).join('; ');

              if (uniqueSubjects) {
                  const autoReport: LearningReport = {
                      id: `jurnal-${reportDate}-${activeClassId}`, // Deterministic ID
                      classId: activeClassId,
                      date: reportDate,
                      type: 'Jurnal Harian',
                      subject: uniqueSubjects,
                      topic: combinedTopics || 'Kegiatan Pembelajaran Harian',
                      documentLink: '', // Optional
                      teacherName: currentUser?.fullName || 'Guru Kelas'
                  };

                  // 3. Save/Update Report
                  await apiService.saveLearningReport(autoReport);
                  // Refresh reports data
                  const newReports = await apiService.getLearningReports(activeClassId);
                  setLearningReports(newReports);
              }
          }
      } catch (e) {
          console.error("Auto report error:", e);
          handleShowNotification('Jurnal disimpan, namun gagal membuat laporan otomatis.', 'warning');
      }
  };

  const handleNavigateToJournal = (date: string) => {
      setJournalTargetDate(date);
      setCurrentView('learning-journal');
  };

  const handleRestoreData = async (data: any) => {
      try {
          if(isDemoMode) {
              showAlert("Restore tidak tersedia di mode demo.", "error");
              return;
          }
          const res = await apiService.restoreData(data);
          if (res.status === 'success') {
              window.location.reload();
          } else {
              throw new Error(res.message);
          }
      } catch (e: any) {
          throw new Error(e.message || "Gagal restore data.");
      }
  };

  const handleProcessPermission = async (id: string, action: 'approve' | 'reject') => {
      setProcessingPermissionId(id);
      try {
          const req = permissionRequests.find(p => p.id === id);
          const typeStr = req?.type as string;
          const typeLabel = typeStr === 'sick' ? 'Sakit' : typeStr === 'dispensation' ? 'Dispensasi' : 'Ijin';

          if (isDemoMode) {
              setPermissionRequests(prev => prev.map(p => p.id === id ? { ...p, status: action === 'approve' ? 'Approved' : 'Rejected' } : p));
              if (action === 'approve' && req) {
                  setAllAttendanceRecords(prev => [...prev, {
                      studentId: req.studentId,
                      classId: req.classId,
                      date: req.date,
                      status: req.type,
                      notes: req.reason
                  }]);
              }
              handleShowNotification(`${typeLabel} berhasil di${action === 'approve' ? 'terima' : 'tolak'} (Demo).`, 'success');
          } else {
              await apiService.processPermissionRequest(id, action);
              handleShowNotification(`${typeLabel} berhasil di${action === 'approve' ? 'terima' : 'tolak'}.`, 'success');
              await fetchData();
          }
      } catch (e) {
          handleShowNotification('Gagal memproses ijin.', 'error');
      } finally {
          setProcessingPermissionId(null);
      }
  };

  const handleAddStudent = async (student: Omit<Student, 'id'>) => { 
    const targetClassId = String(activeClassId || student.classId || '1A'); 
    const studentWithClass = { ...student, classId: targetClassId };
    if (isDemoMode) {
      setStudents([...students, { ...studentWithClass, id: Date.now().toString() }]); return;
    }
    const res = await apiService.createStudent(studentWithClass);
    if (res.id) {
       setStudents([...students, { ...studentWithClass, id: res.id }]);
       handleShowNotification("Siswa berhasil ditambahkan!", "success");
       if (currentUser?.role === 'admin' && !availableClasses.includes(targetClassId.toUpperCase())) {
           setSelectedClassId(targetClassId.toUpperCase());
       }
    }
  };
  
  const handleBatchAddStudents = async (newStudents: Omit<Student, 'id'>[]) => { 
    const batchWithClass = newStudents.map(s => ({ ...s, classId: s.classId || activeClassId || '1A' }));
    if (isDemoMode) {
      const demoStudents = batchWithClass.map((s, i) => ({ ...s, id: Date.now().toString() + i }));
      setStudents([...students, ...demoStudents]); return;
    }
    try {
      const res = await apiService.createStudentBatch(batchWithClass);
      if (res.status === 'success') { fetchData(); handleShowNotification(`Berhasil menambahkan ${newStudents.length} siswa!`, 'success'); }
    } catch (e) { handleShowNotification('Gagal upload batch siswa', 'error'); }
  };
  
  const handleUpdateStudent = async (updatedStudent: Student) => { 
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (!isDemoMode) await apiService.updateStudent(updatedStudent);
  };
  
  // Replaced native confirm with showConfirm
  const handleDeleteStudent = async (id: string) => { 
    showConfirm('Apakah Anda yakin ingin menghapus data siswa ini?', async () => {
        setStudents(students.filter(s => s.id !== id));
        if (!isDemoMode) await apiService.deleteStudent(id);
    });
  };
  
  const handleAddAgenda = async (newItem: AgendaItem) => { 
    const agendaWithClass = { ...newItem, classId: activeClassId };
    setAgendas([agendaWithClass, ...agendas]);
    if (!isDemoMode) await apiService.createAgenda(agendaWithClass);
  };
  
  const handleToggleAgenda = async (id: string) => { 
    const updatedAgendas = agendas.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setAgendas(updatedAgendas);
    if (!isDemoMode) { const item = updatedAgendas.find(a => a.id === id); if(item) await apiService.updateAgenda(item); }
  };
  
  const handleDeleteAgenda = async (id: string) => { 
    showConfirm('Hapus agenda ini?', async () => {
        setAgendas(agendas.filter(item => item.id !== id));
        if (!isDemoMode) await apiService.deleteAgenda(id);
    });
  };
  
  const handleAddExtracurricular = async (item: Extracurricular) => { 
    const itemWithClass = { ...item, classId: activeClassId };
    setExtracurriculars(prev => [...prev, itemWithClass]);
    if (!isDemoMode) { await apiService.createExtracurricular(itemWithClass); handleShowNotification("Ekskul berhasil ditambahkan", 'success'); }
  };
  
  const handleUpdateExtracurricular = async (updatedItem: Extracurricular) => { 
    const itemWithClass = { ...updatedItem, classId: activeClassId };
    setExtracurriculars(prev => prev.map(ex => ex.id === itemWithClass.id ? itemWithClass : ex));
    if(!isDemoMode) await apiService.updateExtracurricular(itemWithClass);
  };
  
  const handleSaveGrade = async (studentId: string, subjectId: string, gradeData: any, classId: string) => { 
    if(!isDemoMode) await apiService.saveGrade(studentId, subjectId, gradeData, classId);
  };
  
  const handleCreateLog = async (log: BehaviorLog) => { 
     setCounselingLogs([log, ...counselingLogs]);
     if(log.point !== 0) {
       const student = students.find(s => s.id === log.studentId);
       if(student) {
         const newScore = Math.min(100, Math.max(0, student.behaviorScore + log.point));
         handleUpdateStudent({ ...student, behaviorScore: newScore });
       }
     }
     if(!isDemoMode) await apiService.createCounselingLog(log);
     handleShowNotification('Data konseling berhasil disimpan!', 'success');
  };
  
  const handleUpdateProfile = async (type: 'teacher' | 'school', data: any) => { 
    if (type === 'teacher') {
        setTeacherProfile(data);
        if (!currentUser) return;
        const updatedUser: User = { ...currentUser, fullName: data.name, nip: data.nip, nuptk: data.nuptk, birthInfo: data.birthInfo, education: data.education, position: data.position, rank: data.rank, classId: data.teachingClass, email: data.email, phone: data.phone, address: data.address, photo: data.photo, signature: data.signature };
        setCurrentUser(updatedUser);
        if (!isDemoMode) await apiService.saveUser(updatedUser);
    } else {
        setSchoolProfile(data);
        if (!isDemoMode) await apiService.saveProfile('school', data);
    }
  };
  
  const handleAddHoliday = async (holidaysToAdd: Omit<Holiday, 'id'>[]) => { 
    if (isDemoMode) {
        const newHolidays = holidaysToAdd.map(h => ({ ...h, id: Date.now().toString() + Math.random() }));
        setHolidays(prev => [...prev, ...newHolidays].sort((a,b) => a.date.localeCompare(b.date)));
        handleShowNotification("Hari libur berhasil ditambahkan (Demo).", "success"); return;
    }
    try { await apiService.saveHolidayBatch(holidaysToAdd); handleShowNotification("Hari libur berhasil disimpan!", "success"); await fetchData(); } catch (e) { handleShowNotification("Gagal menyimpan hari libur.", "error"); }
  };
  
  const handleUpdateHoliday = async (updatedHoliday: Holiday) => { 
    if (isDemoMode) {
        setHolidays(prev => prev.map(h => h.id === updatedHoliday.id ? updatedHoliday : h).sort((a,b) => a.date.localeCompare(b.date)));
        handleShowNotification("Hari libur diperbarui (Demo).", "success"); return;
    }
    try { await apiService.updateHoliday(updatedHoliday); handleShowNotification("Hari libur berhasil diperbarui.", "success"); await fetchData(); } catch(e) { handleShowNotification("Gagal memperbarui hari libur.", "error"); }
  };
  
  const handleDeleteHoliday = async (id: string) => { 
    showConfirm('Hapus hari libur ini?', async () => {
        if (isDemoMode) {
            setHolidays(prev => prev.filter(h => h.id !== id));
            handleShowNotification("Hari libur dihapus (Demo).", "success"); return;
        }
        try { await apiService.deleteHoliday(id); handleShowNotification("Hari libur berhasil dihapus.", "success"); await fetchData(); } catch (e) { handleShowNotification("Gagal menghapus hari libur.", "error"); }
    });
  };
  
  const handleSaveSikap = async (studentId: string, assessment: Omit<SikapAssessment, 'studentId' | 'classId'>) => { 
    setSikapAssessments(prev => {
        const existing = prev.find(a => a.studentId === studentId);
        if (existing) return prev.map(a => a.studentId === studentId ? { ...existing, ...assessment } : a);
        return [...prev, { studentId, classId: activeClassId, ...assessment }];
    });
    if (!isDemoMode) await apiService.saveSikapAssessment(studentId, activeClassId, assessment);
  };
  
  const handleSaveKarakter = async (studentId: string, assessment: Omit<KarakterAssessment, 'studentId' | 'classId'>) => { 
      setKarakterAssessments(prev => {
          const existing = prev.find(a => a.studentId === studentId);
          if (existing) return prev.map(a => a.studentId === studentId ? { ...existing, ...assessment } : a);
          return [...prev, { studentId, classId: activeClassId, ...assessment }];
      });
      if (!isDemoMode) await apiService.saveKarakterAssessment(studentId, activeClassId, assessment);
  };
  
  const handleAddUserAccount = async (user: Omit<User, 'id'>) => { 
    if (isDemoMode) {
      const newUser = { ...user, id: `user-${Date.now()}` };
      setUsers(prev => [...prev, newUser as User]);
      handleShowNotification('Akun ditambahkan (Mode Demo).', 'success'); return;
    }
    const res = await apiService.saveUser(user as User);
    if (res.id) { handleShowNotification('Akun baru berhasil dibuat!', 'success'); await fetchData(); }
  };
  
  const handleBatchAddUserAccount = async (users: Omit<User, 'id'>[]) => { 
    if (isDemoMode) {
        const newUsers = users.map((u, i) => ({ ...u, id: `user-${Date.now()}-${i}` }));
        setUsers(prev => [...prev, ...newUsers as User[]]);
        handleShowNotification('Akun ditambahkan (Mode Demo).', 'success'); return;
    }
    await apiService.saveUserBatch(users); handleShowNotification(`Berhasil menambahkan ${users.length} akun!`, 'success'); await fetchData();
  };
  
  const handleUpdateUserAccount = async (user: User) => { 
    if (isDemoMode) {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
      handleShowNotification('Akun diperbarui (Mode Demo).', 'success'); return;
    }
    await apiService.saveUser(user); handleShowNotification('Akun berhasil diperbarui!', 'success'); await fetchData();
  };
  
  const handleDeleteUserAccount = async (id: string) => { 
    if (isDemoMode) {
        setUsers(prev => prev.filter(u => u.id !== id));
        handleShowNotification('Akun dihapus (Mode Demo).', 'success'); return;
    }
    await apiService.deleteUser(id); handleShowNotification('Akun berhasil dihapus!', 'success'); await fetchData();
  };
  
  const handleSaveEmploymentLink = async (link: Omit<EmploymentLink, 'id'> | EmploymentLink) => {
    if (isDemoMode) {
      const newLink = { ...link, id: (link as any).id || Date.now().toString() } as EmploymentLink;
      setEmploymentLinks(prev => {
        const exists = prev.find(l => l.id === newLink.id);
        if (exists) return prev.map(l => l.id === newLink.id ? newLink : l);
        return [...prev, newLink];
      });
      handleShowNotification('Link disimpan (Demo).', 'success');
      return;
    }
    await apiService.saveEmploymentLink(link);
    handleShowNotification('Link berhasil disimpan!', 'success');
    await fetchData(); 
  };
  
  const handleDeleteEmploymentLink = async (id: string) => {
    showConfirm('Hapus link ini?', async () => {
        if (isDemoMode) {
            setEmploymentLinks(prev => prev.filter(l => l.id !== id));
            handleShowNotification('Link dihapus (Demo).', 'success');
            return;
        }
        await apiService.deleteEmploymentLink(id);
        handleShowNotification('Link berhasil dihapus!', 'success');
        await fetchData();
    });
  };
  
  const handleSaveReport = async (report: Omit<LearningReport, 'id'> | LearningReport) => {
    if (isDemoMode) {
      const newReport = { ...report, id: (report as any).id || Date.now().toString() } as LearningReport;
      setLearningReports(prev => {
        const exists = prev.find(r => r.id === newReport.id);
        if (exists) return prev.map(r => r.id === newReport.id ? newReport : r);
        return [...prev, newReport];
      });
      handleShowNotification('Laporan disimpan (Demo).', 'success');
      return;
    }
    await apiService.saveLearningReport(report);
    handleShowNotification('Laporan berhasil disimpan!', 'success');
    await fetchData();
  };
  
  const handleDeleteReport = async (id: string) => {
    showConfirm('Hapus laporan ini?', async () => {
        if (isDemoMode) {
            setLearningReports(prev => prev.filter(r => r.id !== id));
            handleShowNotification('Laporan dihapus (Demo).', 'success');
            return;
        }
        await apiService.deleteLearningReport(id, activeClassId);
        handleShowNotification('Laporan berhasil dihapus!', 'success');
        await fetchData();
    });
  };
  
  const handleSaveLiaison = async (log: Omit<LiaisonLog, 'id'>) => {
      if (isDemoMode) {
          const newLog = { ...log, id: Date.now().toString(), status: 'Pending' } as LiaisonLog;
          setLiaisonLogs(prev => [...prev, newLog]);
          handleShowNotification('Pesan terkirim (Demo).', 'success');
          return;
      }
      await apiService.saveLiaisonLog(log);
      handleShowNotification('Pesan berhasil dikirim!', 'success');
      const newLog = { ...log, id: 'temp-' + Date.now(), status: 'Pending' } as LiaisonLog;
      setLiaisonLogs(prev => [...prev, newLog]);
      const fetchedLogs = await apiService.getLiaisonLogs(currentUser);
      setLiaisonLogs(fetchedLogs);
  };
  
  const handleUpdateLiaisonStatus = async (ids: string[], status: 'Diterima' | 'Ditolak' | 'Selesai') => {
      if (isDemoMode) {
          setLiaisonLogs(prev => prev.map(l => ids.includes(l.id) ? { ...l, status: status } : l));
          handleShowNotification(`Status diperbarui menjadi ${status} (Demo).`, 'success');
          return;
      }
      await apiService.updateLiaisonStatus(ids, status);
      handleShowNotification(`Status laporan diperbarui: ${status}`, 'success');
      const fetchedLogs = await apiService.getLiaisonLogs(currentUser);
      setLiaisonLogs(fetchedLogs);
  };

  const handleSavePermissionRequest = async (date: string, records: any[]) => {
      const typeStr = records[0]?.status;
      const typeLabel = typeStr === 'sick' ? 'Sakit' : typeStr === 'dispensation' ? 'Dispensasi' : 'Ijin';

      if (isDemoMode) {
          handleShowNotification(`Pengajuan ${typeLabel} tersimpan (Demo).`, 'success');
          return;
      }
      for (const rec of records) {
          await apiService.savePermissionRequest({
              studentId: rec.studentId,
              classId: rec.classId,
              date: date,
              type: rec.status,
              reason: rec.notes
          });
      }
      handleShowNotification(`Pengajuan ${typeLabel} dikirim. Menunggu konfirmasi.`, 'success');
      const reqs = await apiService.getPermissionRequests(currentUser);
      setPermissionRequests(reqs);
  };

  const handleSaveSupportDocument = async (doc: Omit<SupportDocument, 'id'> | SupportDocument) => {
    if (isDemoMode) {
      const newDoc = { ...doc, id: (doc as any).id || `doc-${Date.now()}` } as SupportDocument;
      setSupportDocuments(prev => {
        const exists = prev.find(d => d.id === newDoc.id);
        if (exists) return prev.map(d => d.id === newDoc.id ? newDoc : d);
        return [newDoc, ...prev];
      });
      handleShowNotification('Dokumen disimpan (Demo).', 'success');
      return;
    }
    await apiService.saveSupportDocument(doc);
    handleShowNotification('Dokumen berhasil disimpan.', 'success');
    await fetchData();
  };

  const handleDeleteSupportDocument = async (id: string) => {
    showConfirm('Hapus dokumen ini?', async () => {
      if (isDemoMode) {
        setSupportDocuments(prev => prev.filter(d => d.id !== id));
        handleShowNotification('Dokumen dihapus (Demo).', 'success');
        return;
      }
      await apiService.deleteSupportDocument(id, activeClassId);
      handleShowNotification('Dokumen berhasil dihapus.', 'success');
      await fetchData();
    });
  };
  
  const fetchData = async () => {
    // ... (fetchData implementation unchanged)
    setLoading(true);
    setError(null);
    setIsDemoMode(false);

    if (!apiService.isConfigured()) {
      setStudents(MOCK_STUDENTS);
      setExtracurriculars(MOCK_EXTRACURRICULARS);
      setAgendas([]);
      setTeacherProfile({name: 'Budi Santoso (Demo)', nip:'123', email:'demo@guru.com', phone:'-', address:''});
      setIsDemoMode(true);
      setLoading(false);
      handleShowNotification("Mode Demo Aktif: Backend belum dikonfigurasi.", "warning");
      return;
    }

    try {
      const [fUsers, fStudents, fAgendas, fGrades, fCounseling, fExtracurriculars, fProfiles, fHolidays, fAttendance, fSikap, fKarakter, fLinks, fReports, fLiaison, fPermissions, fSupportDocs] = await Promise.all([
        currentUser?.role === 'admin' ? apiService.getUsers(currentUser) : Promise.resolve([]),
        apiService.getStudents(currentUser),
        apiService.getAgendas(currentUser),
        apiService.getGrades(currentUser),
        apiService.getCounselingLogs(currentUser),
        apiService.getExtracurriculars(currentUser),
        apiService.getProfiles(),
        apiService.getHolidays(currentUser),
        apiService.getAttendance(currentUser),
        apiService.getSikapAssessments(currentUser),
        apiService.getKarakterAssessments(currentUser),
        apiService.getEmploymentLinks(),
        apiService.getLearningReports(selectedClassId),
        apiService.getLiaisonLogs(currentUser), 
        apiService.getPermissionRequests(currentUser),
        apiService.getSupportDocuments(currentUser),
      ]);
      
      setUsers(fUsers);
      setStudents(fStudents);
      setAgendas(fAgendas.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setGrades(fGrades);
      setCounselingLogs(fCounseling.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setHolidays(fHolidays.sort((a,b) => a.date.localeCompare(b.date)));
      setAllAttendanceRecords(fAttendance);
      setSikapAssessments(fSikap);
      setKarakterAssessments(fKarakter);
      setEmploymentLinks(fLinks);
      setLearningReports(fReports);
      setLiaisonLogs(fLiaison);
      setSupportDocuments(fSupportDocs);
      
      const hydratedPermissions = fPermissions.map((p: any) => ({
          ...p,
          studentName: fStudents.find((s: Student) => s.id === p.studentId)?.name || 'Siswa Tidak Dikenal'
      }));
      setPermissionRequests(hydratedPermissions);
      
      if (fExtracurriculars) {
          setExtracurriculars(fExtracurriculars);
      } else {
          setExtracurriculars([]);
      }
      
      if (currentUser) {
          setTeacherProfile(prev => ({
              ...prev,
              name: currentUser.fullName,
              nip: currentUser.nip || prev.nip,
              nuptk: currentUser.nuptk || prev.nuptk,
              position: currentUser.position,
              teachingClass: currentUser.classId || prev.teachingClass,
              birthInfo: currentUser.birthInfo || prev.birthInfo,
              education: currentUser.education || prev.education,
              rank: currentUser.rank || prev.rank,
              email: currentUser.email || prev.email,
              phone: currentUser.phone || prev.phone,
              address: currentUser.address || prev.address,
              photo: currentUser.photo || prev.photo,
              signature: currentUser.signature || prev.signature
          }));
      }

      if(fProfiles.school) setSchoolProfile(fProfiles.school);

    } catch (err: any) {
      console.warn("Gagal memuat data:", err);
      handleShowNotification("Gagal terhubung ke server. Mode Offline (Data Kosong).", 'warning');
      setError(null);
      setStudents([]);
      setExtracurriculars([]);
      setTeacherProfile({name: 'Guru (Offline)', nip:'', email:'', phone:'', address:''});
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
       fetchData();
    }
  }, [currentUser]);

  if (!currentUser) {
      return <Login onLoginSuccess={setCurrentUser} />;
  }

  const isStudentRole = currentUser.role === 'siswa';
  const isAdminRole = currentUser.role === 'admin';
  const isSupervisor = currentUser.role === 'supervisor';

  const myStudentData = isStudentRole 
    ? students.find(s => String(s.id).trim() === String(currentUser.studentId).trim()) 
    : null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-gray-500 animate-fade-in">
           <div className="relative w-24 h-24 flex items-center justify-center mb-6 animate-bounce">
              <div className="absolute inset-0 bg-[#A0DEFF]/30 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <img 
                src="https://image2url.com/r2/default/images/1770790148258-99f209ea-fd45-44cf-9576-9c5205ef8b20.png" 
                alt="Logo SAGARA" 
                className="w-full h-full object-contain drop-shadow-xl"
              />
           </div>
           <h2 className="text-xl font-bold text-slate-700 mb-2">Menyiapkan Data Kelas...</h2>
           <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#5AB2FF] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-[#5AB2FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-[#5AB2FF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
           </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        if (isStudentRole) {
            if (!myStudentData) return (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <AlertCircle size={48} className="text-[#A0DEFF] mb-4"/>
                    <h3 className="text-lg font-bold text-gray-700">Data siswa tidak ditemukan.</h3>
                    <p className="max-w-md mt-2 text-sm">
                        Pastikan akun Anda terhubung dengan data siswa yang benar. 
                        Hubungi operator sekolah untuk memverifikasi "Student ID" pada akun Anda.
                    </p>
                </div>
            );
            return <StudentPortal 
                      student={myStudentData}
                      allAttendance={allAttendanceRecords}
                      grades={grades}
                      liaisonLogs={liaisonLogs}
                      agendas={filteredAgendas} // Passed agendas
                      behaviorLogs={filteredCounseling.filter(c => c.studentId === myStudentData.id)} // Passed personal behavior logs
                      permissionRequests={permissionRequests.filter(p => p.studentId === myStudentData.id)} // Passed personal requests
                      karakterAssessments={karakterAssessments.filter(k => k.studentId === myStudentData.id)} // Passed personal character assessment
                      onSavePermission={handleSavePermissionRequest}
                      onSaveLiaison={handleSaveLiaison}
                      onSaveKarakter={handleSaveKarakter}
                   />;
        }
        const teachers = users.filter(u => u.role === 'guru');
        return <Dashboard 
                  students={filteredStudents} 
                  agendas={filteredAgendas} 
                  holidays={filteredHolidays} 
                  allAttendanceRecords={filteredAttendance} 
                  teacherName={teacherProfile.name} 
                  teachingClass={activeClassId}
                  onChangeView={setCurrentView} 
                  grades={filteredGrades}
                  subjects={MOCK_SUBJECTS}
                  adminCompleteness={adminPercentage}
                  employmentLinks={employmentLinks}
                  pendingPermissions={pendingPermissions} // Passed Pending Permissions
                  onOpenPermissionModal={() => setIsPermissionModalOpen(true)} // Modal Trigger
               />;
      // ... (other cases using updated colors implicitly)
      case 'student-monitor':
        if (!isAdminRole && !isSupervisor && currentUser.role !== 'guru') { setCurrentView('dashboard'); return null; }
        return <StudentMonitor 
                  students={filteredStudents}
                  allAttendance={allAttendanceRecords}
                  grades={filteredGrades}
                  agendas={filteredAgendas}
                  liaisonLogs={filteredLiaison}
                  onSaveLiaison={handleSaveLiaison}
                  onSavePermission={handleSavePermissionRequest}
                  onUpdateLiaisonStatus={handleUpdateLiaisonStatus} // Passed updater
                  classId={activeClassId}
               />;
      case 'liaison-book': 
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <LiaisonBookView
                  logs={filteredLiaison}
                  students={students} 
                  onReply={handleSaveLiaison}
                  onUpdateStatus={handleUpdateLiaisonStatus} // Passed updater
                  classId={activeClassId}
               />;
      case 'pendahuluan':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <IntroductionView />;
      case 'profile':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <TeacherProfile 
                  initialTeacher={teacherProfile} 
                  initialSchool={schoolProfile} 
                  onSave={handleUpdateProfile}
                  onShowNotification={handleShowNotification}
                  userRole={currentUser?.role}
                />;
      case 'students':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <StudentList 
          students={filteredStudents} 
          teacherProfile={teacherProfile} 
          schoolProfile={schoolProfile}
          classId={activeClassId}
          onAdd={handleAddStudent}
          onBatchAdd={handleBatchAddStudents} 
          onUpdate={handleUpdateStudent} 
          onDelete={handleDeleteStudent} 
          onShowNotification={handleShowNotification}
          isReadOnly={isGlobalReadOnly} 
        />;
      case 'attendance':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <AttendanceView 
                  students={filteredStudents}
                  allStudents={students} // PASS ALL STUDENTS FOR GLOBAL SCANNING
                  allAttendanceRecords={filteredAttendance} // Passes robustly filtered attendance
                  holidays={filteredHolidays}
                  onRefreshData={fetchData}
                  onAddHoliday={handleAddHoliday}
                  onUpdateHoliday={handleUpdateHoliday}
                  onDeleteHoliday={handleDeleteHoliday}
                  isDemoMode={isDemoMode}
                  onShowNotification={handleShowNotification}
                  teacherProfile={teacherProfile}
                  schoolProfile={schoolProfile}
                  classId={activeClassId}
                  isReadOnly={isGlobalReadOnly}
                />;
      case 'grades':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <GradesView 
                  students={filteredStudents} 
                  initialGrades={filteredGrades} 
                  onSave={handleSaveGrade} 
                  onShowNotification={handleShowNotification} 
                  classId={activeClassId}
                  isReadOnly={isGlobalReadOnly} // Supervisor is ReadOnly
                  allowedSubjects={allowedSubjects}
                />;
      case 'attitude':
          if (isStudentRole) { setCurrentView('dashboard'); return null; }
          return <AttitudeView 
                    students={filteredStudents}
                    initialSikap={filteredSikap}
                    initialKarakter={filteredKarakter}
                    onSaveSikap={handleSaveSikap}
                    onSaveKarakter={handleSaveKarakter}
                    onShowNotification={handleShowNotification}
                    classId={activeClassId}
                  />;
      case 'learning-reports': 
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        const teachersList = users.filter(u => u.role === 'guru');
        return <LearningReportsView 
                  reports={filteredReports}
                  subjects={MOCK_SUBJECTS}
                  onSave={handleSaveReport}
                  onDelete={handleDeleteReport}
                  classId={activeClassId}
                  teachers={teachersList} // Pass teachers list
                  onNavigateToJournal={handleNavigateToJournal} // Pass navigation handler
               />;
      case 'learning-journal': // NEW CASE
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <LearningJournalView 
                  classId={activeClassId}
                  isReadOnly={isGlobalReadOnly}
                  targetDate={journalTargetDate} // Pass target date state
                  onSaveBatch={handleSaveJournalAndAutoReport} // Use Auto-Report Logic
               />;
      case 'counseling':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <CounselingView 
          students={filteredStudents} 
          logs={filteredCounseling} 
          onCreateLog={handleCreateLog} 
          onShowNotification={handleShowNotification} 
          classId={activeClassId}
        />;
      case 'activities':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return (
          <ActivitiesView 
            students={filteredStudents} 
            agendas={filteredAgendas}
            extracurriculars={filteredExtracurriculars}
            onAddAgenda={handleAddAgenda}
            onToggleAgenda={handleToggleAgenda}
            onDeleteAgenda={handleDeleteAgenda}
            onUpdateExtracurricular={handleUpdateExtracurricular}
            onAddExtracurricular={handleAddExtracurricular}
            onShowNotification={handleShowNotification}
            classId={activeClassId}
          />
        );
      case 'admin':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <ClassroomAdmin 
                  students={filteredStudents} 
                  teacherProfile={teacherProfile} 
                  onShowNotification={handleShowNotification}
                  holidays={filteredHolidays}
                  onAddHoliday={handleAddHoliday}
                  classId={activeClassId}
                  userRole={currentUser.role} // NEW: Pass user role
                />;
      case 'support-docs':
        if (isStudentRole) { setCurrentView('dashboard'); return null; }
        return <SupportDocumentsView
                  documents={filteredSupportDocuments}
                  onSave={handleSaveSupportDocument}
                  onDelete={handleDeleteSupportDocument}
                  onShowNotification={handleShowNotification}
                  classId={activeClassId}
                  isReadOnly={isGlobalReadOnly}
                />;
      case 'employment-links': 
        if (currentUser.role !== 'admin') {
           setCurrentView('dashboard');
           return null;
        }
        return <EmploymentLinksAdmin 
                  links={employmentLinks}
                  onSave={handleSaveEmploymentLink}
                  onDelete={handleDeleteEmploymentLink}
               />;
      case 'accounts':
        if (currentUser.role !== 'admin') {
           setCurrentView('dashboard');
           return null;
        }
        return <AccountManagement
                  users={users}
                  students={students} // PASSED PROP
                  onAdd={handleAddUserAccount}
                  onBatchAdd={handleBatchAddUserAccount}
                  onUpdate={handleUpdateUserAccount}
                  onDelete={handleDeleteUserAccount}
                />;
      case 'backup-restore':
        if (currentUser.role !== 'admin') {
           setCurrentView('dashboard');
           return null;
        }
        const fullBackupData = {
            users,
            students,
            agendas,
            extracurriculars,
            counselingLogs,
            grades,
            holidays,
            allAttendanceRecords,
            sikapAssessments,
            karakterAssessments,
            employmentLinks,
            learningReports,
            liaisonLogs,
            permissionRequests,
            schoolProfile,
        };
        return <BackupRestore 
                  data={fullBackupData} 
                  onRestore={handleRestoreData} 
               />;
      default:
        return <Dashboard 
                  students={filteredStudents} 
                  agendas={filteredAgendas} 
                  holidays={filteredHolidays} 
                  allAttendanceRecords={filteredAttendance} 
                  teacherName={teacherProfile.name} 
                  onChangeView={setCurrentView} 
                  grades={filteredGrades}
                  subjects={MOCK_SUBJECTS}
                  adminCompleteness={adminPercentage}
                  employmentLinks={employmentLinks}
                  pendingPermissions={pendingPermissions} 
                  onOpenPermissionModal={() => setIsPermissionModalOpen(true)} 
               />;
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-800">
      {!isStudentRole && (
        <Sidebar 
          currentUser={currentUser}
          currentView={currentView} 
          onChangeView={setCurrentView} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <img 
              src="https://image2url.com/r2/default/images/1771068223735-6f3b5a3d-5a11-4f2e-9639-10adf921bb50.png"
              alt="Watermark"
              className="w-[500px] h-[500px] object-contain opacity-5"
            />
        </div>

        <header className="bg-white/80 backdrop-blur-md border-b border-[#CAF4FF] h-16 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0 sticky top-0 no-print">
          <div className="flex items-center gap-4">
            {!isStudentRole && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-[#CAF4FF] text-gray-600 transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
            <div className="flex flex-col lg:hidden">
              <h1 className="text-xl font-extrabold tracking-tight flex items-center">
                 <span className="text-gradient-brand italic">SAGARA</span>
              </h1>
            </div>

            {canSelectClass && (
                <div className="hidden lg:flex items-center bg-[#CAF4FF]/30 border border-[#A0DEFF]/50 rounded-lg px-3 py-1.5 shadow-sm">
                    <Filter size={14} className="text-[#5AB2FF] mr-2" />
                    <span className="text-xs font-bold text-gray-500 uppercase mr-2">Pilih Kelas:</span>
                    <select 
                        value={selectedClassId} 
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="bg-transparent text-sm font-bold text-[#5AB2FF] outline-none cursor-pointer"
                    >
                        {availableClasses.map(cls => (
                            <option key={cls} value={cls}>Kelas {cls}</option>
                        ))}
                    </select>
                </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
             {!isStudentRole && (
                 <div className="relative">
                     <button 
                        onClick={() => setIsPermissionModalOpen(true)}
                        className="p-2 text-gray-500 hover:text-[#5AB2FF] hover:bg-[#CAF4FF]/50 rounded-full transition-colors relative"
                     >
                         <Bell size={20} />
                         {pendingPermissions.length > 0 && (
                             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                         )}
                     </button>
                 </div>
             )}

             {isDemoMode && (
               <div className="hidden lg:flex items-center text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full mr-2">
                 <WifiOff size={14} className="mr-1.5" /> Offline Mode
               </div>
             )}
             <button onClick={fetchData} className="p-2 text-gray-400 hover:text-[#5AB2FF] rounded-full hover:bg-[#CAF4FF]/50" title="Refresh Data">
               <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
             </button>

             <div className="relative" ref={profileDropdownRef}>
                <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 bg-[#CAF4FF]/30 hover:bg-[#CAF4FF] p-1.5 rounded-full transition-colors border border-[#A0DEFF]/30"
                >
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-white overflow-hidden">
                        <img 
                          src={teacherProfile.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.fullName}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                    </div>
                    <div className="hidden md:flex flex-col items-start mr-2">
                        <span className="text-xs font-bold text-gray-700">{currentUser?.fullName}</span>
                        <span className="text-[10px] text-gray-500 capitalize">{currentUser?.role}</span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 hidden md:block ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#CAF4FF] overflow-hidden animate-fade-in-up z-20">
                        <div className="p-2">
                            {!isStudentRole && (
                                <button 
                                    onClick={() => { setCurrentView('profile'); setIsProfileDropdownOpen(false); }}
                                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-[#CAF4FF]/50"
                                >
                                    <UserCog size={16} />
                                    <span>Profil {isAdminRole ? 'Sekolah' : 'Guru'}</span>
                                </button>
                            )}
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                            >
                                <LogOut size={16} />
                                <span>Keluar</span>
                            </button>
                        </div>
                    </div>
                )}
             </div>

          </div>
        </header>

        {/* Mobile Filter for Admin/Supervisor */}
        {canSelectClass && (
            <div className="lg:hidden bg-white border-b px-4 py-2 flex items-center justify-center shadow-sm relative z-20">
                <span className="text-xs font-bold text-gray-500 uppercase mr-2">Kelas Aktif:</span>
                <select 
                    value={selectedClassId} 
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="bg-[#CAF4FF]/50 border border-[#A0DEFF] rounded px-2 py-1 text-sm font-bold text-[#5AB2FF] outline-none"
                >
                    {availableClasses.map(cls => (
                        <option key={cls} value={cls}>Kelas {cls}</option>
                    ))}
                </select>
            </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth print:p-0 relative z-10">
           <div className="max-w-[1440px] mx-auto print:w-full">
             {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between no-print">
                   <span className="text-sm flex items-center"><AlertCircle size={16} className="mr-2" /> {error}</span>
                   <button onClick={() => setError(null)} className="text-red-500 font-bold">&times;</button>
                </div>
             )}
             
             {renderContent()}
           </div>
        </main>
      </div>

      {/* Permission Modal & Notification - unchanged */}
      {isPermissionModalOpen && !isStudentRole && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b bg-[#CAF4FF]/30 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 flex items-center">
                          <Bell size={18} className="mr-2 text-[#5AB2FF]" />
                          Permintaan Ijin Siswa
                      </h3>
                      <button onClick={() => setIsPermissionModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {pendingPermissions.length === 0 ? (
                          <div className="text-center text-gray-400 py-8">
                              Tidak ada permintaan ijin baru.
                          </div>
                      ) : (
                          pendingPermissions.map(req => (
                              <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="font-bold text-gray-800">
                                          {req.studentName || 'Siswa'} 
                                          <span className="text-xs font-normal text-gray-500 ml-1">({req.classId})</span>
                                      </span>
                                      <span className="text-xs text-gray-500">{new Date(req.date).toLocaleDateString('id-ID')}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                      <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded mr-2 ${
                                          req.type === 'sick' ? 'bg-amber-100 text-amber-700' : 
                                          req.type === 'dispensation' ? 'bg-teal-100 text-teal-700' : 
                                          'bg-blue-100 text-blue-700'
                                      }`}>
                                          {req.type === 'sick' ? 'Sakit' : req.type === 'dispensation' ? 'Dispensasi' : 'Ijin'}
                                      </span>
                                      {req.reason}
                                  </p>
                                  <div className="flex gap-2 justify-end mt-3 border-t pt-2">
                                      <button 
                                        onClick={() => handleProcessPermission(req.id, 'reject')} 
                                        disabled={!!processingPermissionId}
                                        className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                      >
                                          Tolak
                                      </button>
                                      <button 
                                        onClick={() => handleProcessPermission(req.id, 'approve')} 
                                        disabled={!!processingPermissionId}
                                        className="text-xs px-3 py-1.5 bg-[#5AB2FF] text-white rounded-lg hover:bg-[#A0DEFF] shadow-sm flex items-center disabled:opacity-50"
                                      >
                                          {processingPermissionId === req.id && <Loader2 size={12} className="animate-spin mr-1"/>}
                                          Terima & Catat
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* NEW CUSTOM ALERT/CONFIRM MODAL */}
      <CustomModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <Notification notification={notification} onClear={() => setNotification(null)} />
    </div>
  );
};

export default App;
