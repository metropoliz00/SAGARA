
import React, { useState, useMemo, useEffect } from 'react';
import { Student, GradeRecord, LiaisonLog, AgendaItem, BehaviorLog, PermissionRequest, KarakterAssessment, KARAKTER_INDICATORS, KarakterIndicatorKey } from '../types';
import { MOCK_SUBJECTS } from '../constants';
import { 
  User, Calendar, Send, FileText, CheckCircle, XCircle, 
  BookOpen, Award, LayoutDashboard, Clock, Activity,
  Star, AlertTriangle, HeartHandshake, ListTodo, TrendingUp,
  MapPin, CheckSquare, X, Medal, Heart, MessageCircle, Trophy,
  Sun, Moon, BookHeart, Dumbbell, Apple, UsersRound, BookOpenCheck, Sparkles, Quote, MessageSquare, Edit, Save, Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

interface StudentPortalProps {
  student: Student;
  allAttendance: any[];
  grades: GradeRecord[];
  liaisonLogs: LiaisonLog[];
  agendas: AgendaItem[];
  behaviorLogs: BehaviorLog[];
  permissionRequests: PermissionRequest[];
  karakterAssessments: KarakterAssessment[];
  onSaveLiaison: (log: Omit<LiaisonLog, 'id'>) => Promise<void>;
  onSavePermission: (date: string, records: any[]) => Promise<void>;
  onSaveKarakter: (studentId: string, assessment: Omit<KarakterAssessment, 'studentId' | 'classId'>) => Promise<void>;
  onUpdateStudent: (student: Student) => Promise<void>; // Prop added
}

type PortalTab = 'dashboard' | 'profile' | 'character' | 'permissions' | 'liaison';

const CATEGORIES = ['Kesiswaan', 'Pelayanan', 'Fasilitas', 'Lain-lain'];

// Configuration for 7 Habits Styling
const HABITS_CONFIG: Record<KarakterIndicatorKey, { icon: any, color: string, bg: string, border: string, shadow: string, label: string }> = {
    bangunPagi: { 
        label: 'Bangun Pagi', 
        icon: Sun, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        border: 'border-orange-200',
        shadow: 'shadow-orange-100'
    },
    beribadah: { 
        label: 'Beribadah', 
        icon: BookHeart, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        border: 'border-purple-200',
        shadow: 'shadow-purple-100'
    },
    berolahraga: { 
        label: 'Berolahraga', 
        icon: Dumbbell, 
        color: 'text-rose-600', 
        bg: 'bg-rose-50', 
        border: 'border-rose-200',
        shadow: 'shadow-rose-100'
    },
    makanSehat: { 
        label: 'Makan Sehat & Bergizi', 
        icon: Apple, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200',
        shadow: 'shadow-emerald-100'
    },
    gemarBelajar: { 
        label: 'Gemar Belajar', 
        icon: BookOpenCheck, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        border: 'border-blue-200',
        shadow: 'shadow-blue-100'
    },
    bermasyarakat: { 
        label: 'Bermasyarakat', 
        icon: UsersRound, 
        color: 'text-cyan-600', 
        bg: 'bg-cyan-50', 
        border: 'border-cyan-200',
        shadow: 'shadow-cyan-100'
    },
    tidurAwal: { 
        label: 'Tidur Lebih Awal', 
        icon: Moon, 
        color: 'text-indigo-600', 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-200',
        shadow: 'shadow-indigo-100'
    },
};

const StudentPortal: React.FC<StudentPortalProps> = ({
  student, allAttendance, grades, liaisonLogs, agendas, behaviorLogs, permissionRequests, karakterAssessments,
  onSaveLiaison, onSavePermission, onSaveKarakter, onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard');

  // --- STATE FOR FORMS ---
  const [permDate, setPermDate] = useState(new Date().toISOString().split('T')[0]);
  const [permType, setPermType] = useState<'sick' | 'permit' | 'dispensation'>('sick');
  const [permReason, setPermReason] = useState('');
  const [isSubmittingPerm, setIsSubmittingPerm] = useState(false);

  // Liaison States
  const [liaisonCategory, setLiaisonCategory] = useState(CATEGORIES[0]);
  const [liaisonCustomCategory, setLiaisonCustomCategory] = useState('');
  const [liaisonMessage, setLiaisonMessage] = useState('');
  const [isSendingLiaison, setIsSendingLiaison] = useState(false);

  // 7KAIH State
  const [karakterForm, setKarakterForm] = useState<Partial<KarakterAssessment>>({});
  const [isSavingKarakter, setIsSavingKarakter] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Student>(student);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
      const existing = karakterAssessments.find(k => k.studentId === student.id);
      if (existing) {
          setKarakterForm(existing);
      } else {
          setKarakterForm({
              bangunPagi: '', beribadah: '', berolahraga: '', makanSehat: '', 
              gemarBelajar: '', bermasyarakat: '', tidurAwal: '', catatan: '',
              afirmasi: ''
          });
      }
  }, [karakterAssessments, student.id]);

  useEffect(() => {
      setProfileForm(student);
  }, [student]);

  const handleKarakterChange = (key: KarakterIndicatorKey, value: string) => {
      setKarakterForm(prev => ({ ...prev, [key]: value }));
  };

  const submitKarakter = async () => {
      setIsSavingKarakter(true);
      try {
          const payload = {
              bangunPagi: karakterForm.bangunPagi || '',
              beribadah: karakterForm.beribadah || '',
              berolahraga: karakterForm.berolahraga || '',
              makanSehat: karakterForm.makanSehat || '',
              gemarBelajar: karakterForm.gemarBelajar || '',
              bermasyarakat: karakterForm.bermasyarakat || '',
              tidurAwal: karakterForm.tidurAwal || '',
              catatan: karakterForm.catatan || '',
              afirmasi: karakterForm.afirmasi || ''
          };
          
          await onSaveKarakter(student.id, payload);
          alert('Penilaian diri & afirmasi berhasil disimpan!');
      } catch (e) {
          alert('Gagal menyimpan penilaian.');
      } finally {
          setIsSavingKarakter(false);
      }
  };

  const handleProfileChange = (field: keyof Student, value: string | number) => {
      setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
      setIsSavingProfile(true);
      try {
          // We pass the full profileForm, but ensure critical fields (like behaviorScore, attendance) 
          // are not accidentally modified by using the original student object for those, 
          // although here we are using profileForm which was initialized with student.
          // The critical check is that we are only exposing inputs for non-critical fields.
          await onUpdateStudent(profileForm);
          alert('Data profil berhasil diperbarui.');
          setIsEditingProfile(false);
      } catch (error) {
          alert('Gagal menyimpan profil.');
      } finally {
          setIsSavingProfile(false);
      }
  };

  // --- DATA PROCESSING ---

  // 1. Attendance Stats (Current Month Bar Chart Data)
  const attendanceStats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    const records = allAttendance.filter((r: any) => {
        const d = new Date(r.date);
        return String(r.studentId) === String(student.id) &&
               d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear;
    });

    const counts = { present: 0, sick: 0, permit: 0, alpha: 0, dispensation: 0 };
    records.forEach((r: any) => {
        if (counts[r.status as keyof typeof counts] !== undefined) {
            counts[r.status as keyof typeof counts]++;
        }
    });
    
    const allRecords = allAttendance.filter((r: any) => String(r.studentId) === String(student.id));
    const allCounts = { present: 0, sick: 0, permit: 0, alpha: 0, dispensation: 0 };
    allRecords.forEach((r: any) => {
        if (allCounts[r.status as keyof typeof allCounts] !== undefined) {
            allCounts[r.status as keyof typeof allCounts]++;
        }
    });
    
    const totalAll = Object.values(allCounts).reduce((a, b) => a + b, 0) || 1;
    const positiveAttendance = allCounts.present + allCounts.dispensation;
    const percentage = Math.round((positiveAttendance / totalAll) * 100);

    const graphData = [
      { name: 'Hadir', value: counts.present, fill: '#10b981' },
      { name: 'Dispen', value: counts.dispensation, fill: '#14b8a6' },
      { name: 'Ijin', value: counts.permit, fill: '#3b82f6' },
      { name: 'Sakit', value: counts.sick, fill: '#f59e0b' },
      { name: 'Alpha', value: counts.alpha, fill: '#ef4444' },
    ];

    const monthName = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const periodText = `1 - ${lastDay} ${monthName}`;

    return { counts, percentage, graphData, periodText };
  }, [student, allAttendance]);

  // 2. Permission Requests History
  const myPermissionRequests = useMemo(() => {
      return [...permissionRequests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [permissionRequests]);

  // 3. Grades
  const myGrades = useMemo(() => {
    const record = grades.find(g => String(g.studentId) === String(student.id));
    if (!record) return [];
    return MOCK_SUBJECTS.map(subj => {
        const g = record.subjects[subj.id];
        if (!g) return null;
        const scores = [g.sum1, g.sum2, g.sum3, g.sum4, g.sas].filter(s => s > 0);
        const final = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
        return { name: subj.name, kkm: subj.kkm, sum1: g.sum1, sum2: g.sum2, sum3: g.sum3, sum4: g.sum4, sas: g.sas, final };
    }).filter(Boolean);
  }, [student, grades]);

  // 4. Liaison Logs (Ticket History)
  const myLiaisonLogs = useMemo(() => {
      return liaisonLogs
        .filter(l => String(l.studentId) === String(student.id))
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [student, liaisonLogs]);

  // 5. Active Agendas
  const upcomingAgendas = useMemo(() => {
      return agendas
        .filter(a => !a.completed)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [agendas]);

  // 6. Recent Behavior Logs
  const myBehaviorLogs = useMemo(() => {
      return behaviorLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [behaviorLogs]);

  // --- HANDLERS ---

  const handlePermissionSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmittingPerm(true);
      const label = permType === 'sick' ? 'Sakit' : permType === 'dispensation' ? 'Dispensasi' : 'Ijin';
      try {
          await onSavePermission(permDate, [{
              studentId: student.id,
              classId: student.classId,
              status: permType,
              notes: permReason
          }]);
          alert(`Pengajuan ${label} berhasil dikirim.`);
          setPermReason('');
      } catch (error) {
          alert('Gagal mengirim pengajuan.');
      } finally {
          setIsSubmittingPerm(false);
      }
  };

  const handleSendLiaison = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!liaisonMessage.trim()) return;
      const finalCategory = liaisonCategory === 'Lain-lain' && liaisonCustomCategory ? liaisonCustomCategory : liaisonCategory;
      setIsSendingLiaison(true);
      try {
          await onSaveLiaison({
              classId: student.classId,
              studentId: student.id,
              date: new Date().toISOString().split('T')[0],
              sender: 'Wali Murid', 
              category: finalCategory,
              message: liaisonMessage,
              status: 'Pending'
          });
          setLiaisonMessage('');
          setLiaisonCustomCategory('');
          setLiaisonCategory(CATEGORIES[0]);
      } catch (error) {
          alert('Gagal mengirim pesan.');
      } finally {
          setIsSendingLiaison(false);
      }
  };

  const getBehaviorIcon = (type: string) => {
      switch(type) {
          case 'positive': return <Star size={16} className="text-emerald-500" fill="currentColor"/>;
          case 'negative': return <AlertTriangle size={16} className="text-rose-500"/>;
          default: return <HeartHandshake size={16} className="text-indigo-500"/>;
      }
  };

  const getStatusBadge = (status?: string) => {
      switch(status) {
          case 'Diterima': return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><CheckCircle size={10} className="mr-1"/> Diterima</span>;
          case 'Ditolak': return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><XCircle size={10} className="mr-1"/> Ditolak</span>;
          case 'Selesai': return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><CheckSquare size={10} className="mr-1"/> Selesai</span>;
          default: return <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><Clock size={10} className="mr-1"/> Pending</span>;
      }
  };

  const TABS = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'profile', label: 'Data Diri', icon: User },
    { id: 'character', label: '7 KAIH', icon: Sparkles }, // Moved to 3rd Position
    { id: 'permissions', label: 'Ijin', icon: FileText },
    { id: 'liaison', label: 'Penghubung', icon: BookOpen },
  ];

  return (
    <div className="animate-fade-in pb-20 space-y-4">
      
      {/* 1. HEADER PROFILE */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-50 to-purple-50 z-0 border-b border-indigo-100"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end mt-12 gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 shrink-0">
                  {student.photo && !student.photo.startsWith('ERROR') ? (
                      <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300 bg-indigo-50"><User size={64}/></div>
                  )}
              </div>

              <div className="flex-1 text-center md:text-left mb-1">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-3 drop-shadow-sm">{student.name}</h1>
                  <div className="inline-flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                      <span className="bg-white px-3 py-1 rounded-full font-bold border border-gray-200 shadow-sm flex items-center text-indigo-700">
                          NIS: {student.nis}
                      </span>
                      <span className="flex items-center font-medium bg-white/50 px-2 py-1 rounded-lg">
                          <BookOpen size={16} className="mr-1.5 text-gray-400"/> Kelas {student.classId}
                      </span>
                  </div>
              </div>

              <div className="flex gap-3 mb-2 shrink-0 md:self-end">
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center min-w-[80px] shadow-sm">
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Hadir</span>
                      <span className="text-xl font-black text-emerald-700">{attendanceStats.percentage}%</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center min-w-[80px] shadow-sm">
                      <span className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Poin</span>
                      <span className="text-xl font-black text-amber-700">{student.behaviorScore}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. STICKY MOBILE-FRIENDLY NAVIGATION */}
      <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as PortalTab)} 
                        className={`flex items-center flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                            isActive 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <Icon size={16} className="mr-2"/> {tab.label}
                    </button>
                )
            })}
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="min-h-[500px]">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
              <div className="space-y-6">
                  {/* Catatan Wali Kelas Widget */}
                  {student.teacherNotes && (
                      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                              <MessageSquare size={100} />
                          </div>
                          <h3 className="font-bold text-lg mb-2 flex items-center relative z-10">
                              <MessageSquare className="mr-2" size={20}/> Pesan dari Wali Kelas
                          </h3>
                          <div className="relative z-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                              <p className="text-sm md:text-base leading-relaxed font-medium">"{student.teacherNotes}"</p>
                          </div>
                      </div>
                  )}

                  {/* Row 1: Attendance Graph & Agenda */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Attendance Graph */}
                      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <h3 className="font-bold text-gray-800 text-lg flex items-center">
                                      <TrendingUp className="mr-2 text-indigo-500" size={20}/> Statistik Kehadiran
                                  </h3>
                                  <p className="text-sm text-gray-500">Periode: {attendanceStats.periodText}</p>
                              </div>
                          </div>
                          
                          <div className="h-72 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={attendanceStats.graphData} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                      <XAxis 
                                        dataKey="name" 
                                        tick={{fontSize: 12, fontWeight: 600, fill: '#6b7280'}} 
                                        axisLine={false} 
                                        tickLine={false} 
                                      />
                                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                                      <Tooltip 
                                        cursor={{fill: '#f9fafb'}} 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        formatter={(value) => [value, 'Jumlah']} 
                                      />
                                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50} animationDuration={1500}>
                                        {attendanceStats.graphData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Agenda Card */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full max-h-[400px]">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                              <ListTodo className="mr-2 text-purple-500" size={18}/> Agenda Kegiatan
                          </h3>
                          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                              {upcomingAgendas.length === 0 ? (
                                  <div className="text-center text-gray-400 text-sm py-8 italic">Tidak ada agenda mendatang.</div>
                              ) : (
                                  upcomingAgendas.slice(0, 5).map(agenda => (
                                      <div key={agenda.id} className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100 transition-transform hover:scale-[1.02]">
                                          <div className={`mt-1.5 w-2.5 h-2.5 rounded-full mr-3 shrink-0 ${agenda.type==='urgent'?'bg-red-500 shadow-red-200 shadow': agenda.type==='warning'?'bg-amber-500 shadow-amber-200 shadow':'bg-blue-500 shadow-blue-200 shadow'}`}></div>
                                          <div>
                                              <h4 className="text-sm font-bold text-gray-800 leading-tight">{agenda.title}</h4>
                                              <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                  <Calendar size={10} className="mr-1"/> {new Date(agenda.date).toLocaleDateString('id-ID', {weekday: 'short', day: 'numeric', month: 'short'})}
                                              </p>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Row 2: Transcript & Behavior */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Transcript */}
                      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex items-center justify-between mb-6">
                              <h3 className="font-bold text-gray-800 text-lg flex items-center">
                                  <Award className="mr-2 text-amber-500" size={20} /> Transkrip Nilai
                              </h3>
                              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full border border-gray-200 font-medium">Semester Berjalan</span>
                          </div>
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-center border-collapse">
                                  <thead>
                                      <tr className="bg-indigo-50 text-indigo-900 text-xs uppercase font-bold">
                                          <th className="py-3 px-4 text-left rounded-l-lg min-w-[150px]">Mata Pelajaran</th>
                                          <th className="py-3 px-2 w-16 text-center border-r border-indigo-100">KKTP</th>
                                          <th className="py-3 px-2 w-12 text-center">S1</th>
                                          <th className="py-3 px-2 w-12 text-center">S2</th>
                                          <th className="py-3 px-2 w-12 text-center">S3</th>
                                          <th className="py-3 px-2 w-12 text-center">S4</th>
                                          <th className="py-3 px-2 w-12 text-center border-r border-indigo-100 bg-indigo-100/50">SAS</th>
                                          <th className="py-3 px-2 w-16 text-center font-black">Akhir</th>
                                          <th className="py-3 px-2 w-16 rounded-r-lg text-center">Ket</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                      {myGrades.map((g: any, idx) => (
                                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                              <td className="py-3 px-4 font-medium text-gray-700 text-left">{g.name}</td>
                                              <td className="py-3 px-2 text-center text-gray-400 font-medium border-r border-gray-100">{g.kkm}</td>
                                              <td className="py-3 px-2 text-center text-gray-500 text-xs">{g.sum1 || '-'}</td>
                                              <td className="py-3 px-2 text-center text-gray-500 text-xs">{g.sum2 || '-'}</td>
                                              <td className="py-3 px-2 text-center text-gray-500 text-xs">{g.sum3 || '-'}</td>
                                              <td className="py-3 px-2 text-center text-gray-500 text-xs">{g.sum4 || '-'}</td>
                                              <td className="py-3 px-2 text-center text-gray-600 font-semibold bg-gray-50 border-r border-gray-100">{g.sas || '-'}</td>
                                              <td className="py-3 px-2 text-center font-bold text-gray-800">{g.final || '-'}</td>
                                              <td className="py-3 px-2">
                                                  {g.final > 0 && (
                                                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${g.final >= g.kkm ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                          {g.final >= g.kkm ? 'Tuntas' : 'Belum'}
                                                      </span>
                                                  )}
                                              </td>
                                          </tr>
                                      ))}
                                      {myGrades.length === 0 && (
                                          <tr><td colSpan={9} className="py-8 text-center text-gray-400 italic">Belum ada data nilai.</td></tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      {/* Behavior Logs */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                              <Star className="mr-2 text-orange-500" size={18}/> Catatan Perilaku
                          </h3>
                          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                              {myBehaviorLogs.length === 0 ? (
                                  <div className="text-center text-gray-400 text-sm py-8 italic">Belum ada catatan perilaku.</div>
                              ) : (
                                  myBehaviorLogs.map(log => (
                                      <div key={log.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                          <div className={`p-2 rounded-full shrink-0 ${log.type==='positive'?'bg-emerald-100':log.type==='negative'?'bg-rose-100':'bg-indigo-100'}`}>
                                              {getBehaviorIcon(log.type)}
                                          </div>
                                          <div>
                                              <div className="flex items-center gap-2">
                                                  <span className="text-[10px] font-bold text-gray-500">{new Date(log.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</span>
                                                  <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-600">{log.category}</span>
                                              </div>
                                              <p className="text-xs text-gray-700 mt-0.5 leading-snug font-medium">{log.description}</p>
                                              {log.point !== 0 && (
                                                  <span className={`text-[10px] font-bold ${log.point > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                      {log.point > 0 ? '+' : ''}{log.point} Poin
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
                <div className="flex justify-end">
                    {isEditingProfile ? (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsEditingProfile(false)} 
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={saveProfile} 
                                disabled={isSavingProfile}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 flex items-center shadow-md"
                            >
                                {isSavingProfile ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save className="mr-2" size={16}/>}
                                Simpan Perubahan
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEditingProfile(true)} 
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center shadow-md"
                        >
                            <Edit className="mr-2" size={16}/> Edit Data
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card Kesehatan */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Activity className="mr-2 text-rose-500" size={20}/> Fisik & Kesehatan
                        </h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-rose-50 p-3 rounded-xl text-center">
                                <span className="block text-xs text-rose-600 font-bold uppercase">Tinggi</span>
                                {isEditingProfile ? (
                                    <input 
                                        type="number" 
                                        className="w-full bg-white border border-rose-200 rounded px-1 text-center font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                        value={profileForm.height}
                                        onChange={(e) => handleProfileChange('height', Number(e.target.value))}
                                    />
                                ) : (
                                    <span className="text-lg font-bold text-gray-800">{student.height || '-'} <span className="text-xs font-normal text-gray-500">cm</span></span>
                                )}
                            </div>
                            <div className="bg-rose-50 p-3 rounded-xl text-center">
                                <span className="block text-xs text-rose-600 font-bold uppercase">Berat</span>
                                {isEditingProfile ? (
                                    <input 
                                        type="number" 
                                        className="w-full bg-white border border-rose-200 rounded px-1 text-center font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                        value={profileForm.weight}
                                        onChange={(e) => handleProfileChange('weight', Number(e.target.value))}
                                    />
                                ) : (
                                    <span className="text-lg font-bold text-gray-800">{student.weight || '-'} <span className="text-xs font-normal text-gray-500">kg</span></span>
                                )}
                            </div>
                            <div className="bg-rose-50 p-3 rounded-xl text-center">
                                <span className="block text-xs text-rose-600 font-bold uppercase">Gol. Darah</span>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-rose-200 rounded px-1 text-center font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                        value={profileForm.bloodType}
                                        onChange={(e) => handleProfileChange('bloodType', e.target.value)}
                                    />
                                ) : (
                                    <span className="text-lg font-bold text-gray-800">{student.bloodType || '-'}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-700 block mb-1">Riwayat Penyakit / Catatan Medis</span>
                            {isEditingProfile ? (
                                <textarea 
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                    value={profileForm.healthNotes}
                                    onChange={(e) => handleProfileChange('healthNotes', e.target.value)}
                                    rows={2}
                                />
                            ) : (
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60px]">
                                    {student.healthNotes || 'Tidak ada catatan kesehatan khusus.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Card Minat & Bakat */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Star className="mr-2 text-amber-500" size={20}/> Minat & Bakat
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Hobi / Kegemaran</span>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        value={profileForm.hobbies}
                                        onChange={(e) => handleProfileChange('hobbies', e.target.value)}
                                    />
                                ) : (
                                    <div className="text-base font-medium text-gray-800 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                        {student.hobbies || '-'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Cita-cita</span>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        value={profileForm.ambition}
                                        onChange={(e) => handleProfileChange('ambition', e.target.value)}
                                    />
                                ) : (
                                    <div className="text-base font-medium text-gray-800 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                        {student.ambition || '-'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Bio Fields */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <User className="mr-2 text-blue-500" size={20}/> Biodata Tambahan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Alamat</label>
                                {isEditingProfile ? (
                                    <textarea 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={profileForm.address}
                                        onChange={(e) => handleProfileChange('address', e.target.value)}
                                        rows={2}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-800 p-2 bg-gray-50 rounded border border-gray-100">{student.address || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">No. HP Wali</label>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={profileForm.parentPhone}
                                        onChange={(e) => handleProfileChange('parentPhone', e.target.value)}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-800 p-2 bg-gray-50 rounded border border-gray-100">{student.parentPhone || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Pekerjaan Ayah</label>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={profileForm.fatherJob}
                                        onChange={(e) => handleProfileChange('fatherJob', e.target.value)}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-800 p-2 bg-gray-50 rounded border border-gray-100">{student.fatherJob || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Pekerjaan Ibu</label>
                                {isEditingProfile ? (
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={profileForm.motherJob}
                                        onChange={(e) => handleProfileChange('motherJob', e.target.value)}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-800 p-2 bg-gray-50 rounded border border-gray-100">{student.motherJob || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Prestasi */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Trophy className="mr-2 text-yellow-500" size={20}/> Catatan Prestasi
                        </h3>
                        {student.achievements && student.achievements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {student.achievements.map((ach, idx) => (
                                    <div key={idx} className="flex items-center p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                                        <div className="p-2 bg-white rounded-full text-yellow-500 shadow-sm mr-3">
                                            <Trophy size={16}/>
                                        </div>
                                        <span className="font-medium text-gray-700">{ach}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-dashed border border-gray-200">
                                Belum ada data prestasi tercatat.
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}

          {/* TAB: 7KAIH (7 KEBIASAAN ANAK INDONESIA HEBAT) */}
          {activeTab === 'character' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                      <div>
                          <h3 className="font-bold text-gray-800 text-lg flex items-center">
                              <Heart className="mr-2 text-pink-500" size={20} /> 7 Kebiasaan Anak Indonesia Hebat
                          </h3>
                          <p className="text-sm text-gray-500">Penilaian diri (Self-Assessment) kebiasaan baik sehari-hari.</p>
                      </div>
                      <button 
                          onClick={submitKarakter} 
                          disabled={isSavingKarakter}
                          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center text-sm transition-transform active:scale-95"
                      >
                          {isSavingKarakter ? 'Menyimpan...' : 'Simpan Penilaian'}
                      </button>
                  </div>

                  {/* Affirmation Box - New */}
                  <div className="mb-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 rounded-2xl shadow-lg text-white">
                      <h4 className="font-bold text-lg mb-2 flex items-center">
                          <Quote size={20} className="mr-2 opacity-80" /> Afirmasi Positif Hari Ini
                      </h4>
                      <p className="text-sm text-white/80 mb-3">Tuliskan kata-kata penyemangat atau janji pada diri sendiri.</p>
                      <textarea
                          value={karakterForm.afirmasi || ''}
                          onChange={(e) => setKarakterForm(prev => ({...prev, afirmasi: e.target.value}))}
                          className="w-full bg-white/20 border border-white/30 rounded-xl p-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none font-medium"
                          placeholder="Saya anak hebat, saya bisa meraih cita-cita..."
                          rows={2}
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(Object.keys(KARAKTER_INDICATORS) as KarakterIndicatorKey[]).map((key) => {
                          const config = HABITS_CONFIG[key];
                          const Icon = config.icon;
                          const isTerbiasa = karakterForm[key] === 'Terbiasa';
                          
                          return (
                              <div 
                                key={key} 
                                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 group ${
                                  isTerbiasa 
                                  ? `${config.bg} ${config.border} shadow-md` 
                                  : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                                }`}
                              >
                                  <div className="flex items-start justify-between mb-4">
                                      <div className={`p-3 rounded-full ${isTerbiasa ? 'bg-white' : config.bg} ${config.shadow} transition-colors`}>
                                          <Icon size={24} className={config.color} />
                                      </div>
                                      {isTerbiasa && <CheckCircle size={20} className="text-emerald-500 animate-in fade-in zoom-in duration-300"/>}
                                  </div>
                                  
                                  <h4 className={`font-bold text-lg mb-4 ${isTerbiasa ? 'text-gray-800' : 'text-gray-700'}`}>
                                      {config.label}
                                  </h4>
                                  
                                  <div className="flex gap-2">
                                      <button
                                          onClick={() => handleKarakterChange(key, 'Terbiasa')}
                                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                              isTerbiasa 
                                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-105' 
                                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                          }`}
                                      >
                                          Terbiasa
                                      </button>
                                      <button
                                          onClick={() => handleKarakterChange(key, 'Belum Terbiasa')}
                                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                              karakterForm[key] === 'Belum Terbiasa' 
                                              ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200' 
                                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                          }`}
                                      >
                                          Belum
                                      </button>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
                  
                  <div className="mt-6 bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm">
                      <h4 className="font-bold text-yellow-800 mb-2 flex items-center text-sm">
                          <MessageCircle size={18} className="mr-2"/> Catatan Guru
                      </h4>
                      <p className="text-sm text-gray-700 italic bg-white/60 p-4 rounded-xl border border-yellow-100 min-h-[80px]">
                          {karakterForm.catatan || 'Belum ada catatan khusus dari guru.'}
                      </p>
                  </div>
              </div>
          )}

          {/* TAB: PERMISSIONS */}
          {activeTab === 'permissions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                          <FileText className="mr-2 text-indigo-500" size={20} /> Buat Pengajuan Baru
                      </h3>
                      <form onSubmit={handlePermissionSubmit} className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tanggal</label>
                              <input 
                                  type="date" 
                                  value={permDate} 
                                  onChange={e => setPermDate(e.target.value)} 
                                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                  required
                              />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipe Ijin</label>
                              <div className="flex gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => setPermType('sick')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${permType === 'sick' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                  >
                                      Sakit
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setPermType('permit')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${permType === 'permit' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                  >
                                      Ijin
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setPermType('dispensation')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${permType === 'dispensation' ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                  >
                                      Dispensasi
                                  </button>
                              </div>
                              {permType === 'dispensation' && (
                                <p className="text-[10px] text-teal-600 mt-1 flex items-center">
                                    <Medal size={12} className="mr-1"/> Dispensasi dihitung hadir untuk kegiatan sekolah.
                                </p>
                              )}
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Keterangan</label>
                              <textarea 
                                  rows={4} 
                                  value={permReason}
                                  onChange={e => setPermReason(e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                  placeholder={permType === 'dispensation' ? "Tuliskan kegiatan yang diikuti" : "Jelaskan alasan ketidakhadiran..."}
                                  required
                              />
                          </div>
                          <button 
                              type="submit" 
                              disabled={isSubmittingPerm}
                              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex justify-center items-center"
                          >
                              {isSubmittingPerm ? 'Mengirim...' : 'Kirim Pengajuan'} <Send size={16} className="ml-2"/>
                          </button>
                      </form>
                  </div>

                  {/* History List */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                          <span className="flex items-center"><Clock className="mr-2 text-gray-400" size={20} /> Riwayat Pengajuan</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{myPermissionRequests.length} Data</span>
                      </h3>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                          {myPermissionRequests.length === 0 ? (
                              <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">Belum ada riwayat pengajuan.</div>
                          ) : (
                              myPermissionRequests.map((req: any, idx: number) => (
                                  <div key={idx} className="p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                      <div className="flex justify-between items-start mb-2">
                                          <span className="text-xs font-bold text-gray-500 flex items-center">
                                              <Calendar size={12} className="mr-1"/> {new Date(req.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                          </span>
                                          <div className="flex gap-2">
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                  req.type === 'sick' ? 'bg-amber-100 text-amber-700' : 
                                                  req.type === 'dispensation' ? 'bg-teal-100 text-teal-700' :
                                                  'bg-blue-100 text-blue-700'
                                              }`}>
                                                  {req.type === 'sick' ? 'Sakit' : req.type === 'dispensation' ? 'Dispensasi' : 'Ijin'}
                                              </span>
                                              {/* Status Badge */}
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center ${
                                                  req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                                                  req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                                  'bg-gray-200 text-gray-600'
                                              }`}>
                                                  {req.status === 'Approved' ? <CheckCircle size={10} className="mr-1"/> : 
                                                   req.status === 'Rejected' ? <XCircle size={10} className="mr-1"/> : 
                                                   <Clock size={10} className="mr-1"/>}
                                                  {req.status === 'Approved' ? 'Disetujui' : req.status === 'Rejected' ? 'Ditolak' : 'Menunggu'}
                                              </span>
                                          </div>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-snug">{req.reason || '-'}</p>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: LIAISON BOOK */}
          {activeTab === 'liaison' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form Input */}
                  <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                          <BookOpen className="mr-2 text-teal-500" size={20} /> Buku Penghubung
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">Sampaikan kendala atau informasi kepada Wali Kelas.</p>
                      
                      <form onSubmit={handleSendLiaison} className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kategori</label>
                              <select 
                                value={liaisonCategory} 
                                onChange={(e) => setLiaisonCategory(e.target.value)} 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                              >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                          </div>
                          
                          {liaisonCategory === 'Lain-lain' && (
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tulis Kategori</label>
                                  <input 
                                      type="text" 
                                      value={liaisonCustomCategory} 
                                      onChange={(e) => setLiaisonCustomCategory(e.target.value)}
                                      placeholder="Contoh: Keuangan..."
                                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                  />
                              </div>
                          )}

                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi Permasalahan</label>
                              <textarea 
                                  rows={4} 
                                  value={liaisonMessage}
                                  onChange={e => setLiaisonMessage(e.target.value)}
                                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                  placeholder="Jelaskan detail permasalahan atau pesan..."
                                  required
                              />
                          </div>
                          
                          <button 
                              type="submit" 
                              disabled={isSendingLiaison || !liaisonMessage.trim()}
                              className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all shadow-md disabled:opacity-50 flex justify-center items-center"
                          >
                              {isSendingLiaison ? 'Mengirim...' : 'Kirim Laporan'} <Send size={16} className="ml-2"/>
                          </button>
                      </form>
                  </div>

                  {/* Ticket List */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                          <span className="flex items-center"><ListTodo className="mr-2 text-gray-400" size={20} /> Riwayat Laporan</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{myLiaisonLogs.length} Data</span>
                      </h3>
                      
                      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                          {myLiaisonLogs.length === 0 ? (
                              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">Belum ada laporan yang dikirim.</div>
                          ) : (
                              myLiaisonLogs.map((log) => (
                                  <div key={log.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold text-gray-500">
                                                  {new Date(log.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                              </span>
                                              <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600 font-medium">
                                                  {log.category || 'Umum'}
                                              </span>
                                          </div>
                                          {getStatusBadge(log.status)}
                                      </div>
                                      <p className="text-sm text-gray-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-gray-100 mb-1">
                                          {log.message}
                                      </p>
                                      <div className="text-[10px] text-right text-gray-400 italic">
                                          Pengirim: {log.sender === 'Guru' ? 'Wali Kelas' : 'Wali Murid'}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

export default StudentPortal;
