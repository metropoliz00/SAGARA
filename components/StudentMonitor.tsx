
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Student, GradeRecord, AgendaItem, 
  LiaisonLog, User, BehaviorLog, PermissionRequest
} from '../types';
import { MOCK_SUBJECTS } from '../constants';
import { 
  UserCheck, BookOpen, Calendar, Send, 
  PieChart as PieIcon, List, FileText, ChevronDown, CheckCircle, XCircle, CheckSquare, Clock,
  MapPin, TrendingUp, ListTodo, Award, Star, AlertTriangle, HeartHandshake, LayoutDashboard, Medal,
  Activity, Trophy, User as UserIcon, Save, Loader2, MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

interface StudentMonitorProps {
  students: Student[];
  allAttendance: any[]; // Raw attendance records
  grades: GradeRecord[];
  agendas: AgendaItem[];
  liaisonLogs: LiaisonLog[];
  onSaveLiaison: (log: Omit<LiaisonLog, 'id'>) => Promise<void>;
  onSavePermission: (date: string, records: any[]) => Promise<void>;
  onUpdateLiaisonStatus: (ids: string[], status: 'Diterima' | 'Ditolak' | 'Selesai') => Promise<void>;
  classId: string; // Current context classId from Admin selection
  onUpdateStudent: (student: Student) => Promise<void>; // Prop added
}

type MonitorTab = 'dashboard' | 'profile' | 'permissions' | 'liaison';

const StudentMonitor: React.FC<StudentMonitorProps> = ({
  students, allAttendance, grades, agendas, liaisonLogs,
  onSaveLiaison, onSavePermission, onUpdateLiaisonStatus, classId, onUpdateStudent
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<MonitorTab>('dashboard');
  
  // Forms State
  const [permDate, setPermDate] = useState(new Date().toISOString().split('T')[0]);
  const [permType, setPermType] = useState<'sick'|'permit'|'dispensation'>('sick');
  const [permReason, setPermReason] = useState('');
  const [isSubmittingPerm, setIsSubmittingPerm] = useState(false);

  // Teacher Note State
  const [teacherNote, setTeacherNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Initialize selection if students exist
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students]);

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  // Sync note state when student changes
  useEffect(() => {
      if (selectedStudent) {
          setTeacherNote(selectedStudent.teacherNotes || '');
      }
  }, [selectedStudent]);

  // --- Derived Data (Matching StudentPortal Logic) ---

  // 1. Attendance Stats (Current Month Bar Chart Data & Overall Percentage)
  const attendanceStats = useMemo(() => {
    if (!selectedStudent) return { counts: {}, percentage: 0, graphData: [], periodText: '' };
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Filter records for current month only (1st to End)
    const monthlyRecords = allAttendance.filter((r: any) => {
        const d = new Date(r.date);
        return String(r.studentId) === String(selectedStudent.id) &&
               d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear;
    });

    const counts = { present: 0, sick: 0, permit: 0, alpha: 0, dispensation: 0 };
    monthlyRecords.forEach((r: any) => {
        if (counts[r.status as keyof typeof counts] !== undefined) {
            counts[r.status as keyof typeof counts]++;
        }
    });

    // Overall Percentage (All Time) for Profile Badge
    const allRecords = allAttendance.filter((r: any) => String(r.studentId) === String(selectedStudent.id));
    const allCounts = { present: 0, sick: 0, permit: 0, alpha: 0, dispensation: 0 };
    allRecords.forEach((r: any) => {
        if (allCounts[r.status as keyof typeof allCounts] !== undefined) {
            allCounts[r.status as keyof typeof allCounts]++;
        }
    });
    
    const totalAll = Object.values(allCounts).reduce((a, b) => a + b, 0) || 1;
    const positiveAttendance = allCounts.present + allCounts.dispensation;
    const percentage = Math.round((positiveAttendance / totalAll) * 100);

    // Graph Data
    const graphData = [
      { name: 'Hadir', value: counts.present, fill: '#10b981' },        // Emerald
      { name: 'Dispen', value: counts.dispensation, fill: '#14b8a6' },  // Teal
      { name: 'Ijin', value: counts.permit, fill: '#3b82f6' },          // Blue
      { name: 'Sakit', value: counts.sick, fill: '#f59e0b' },           // Amber
      { name: 'Alpha', value: counts.alpha, fill: '#ef4444' },          // Red
    ];

    const monthName = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const periodText = `1 - ${lastDay} ${monthName}`;

    return { counts, percentage, graphData, periodText };
  }, [selectedStudent, allAttendance]);

  // 2. Grades (Summary)
  const studentGrades = useMemo(() => {
    if (!selectedStudent) return [];
    const record = grades.find(g => g.studentId === selectedStudent.id);
    if (!record) return [];

    return MOCK_SUBJECTS.map(subj => {
        const g = record.subjects[subj.id];
        if (!g) return null;
        
        // Calculate Final
        const scores = [g.sum1, g.sum2, g.sum3, g.sum4, g.sas].filter(s => s > 0);
        const final = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
        
        return { 
            name: subj.name, 
            kkm: subj.kkm, 
            sum1: g.sum1, sum2: g.sum2, sum3: g.sum3, sum4: g.sum4, sas: g.sas, final 
        };
    }).filter(Boolean);
  }, [selectedStudent, grades]);

  // 3. Active Agendas
  const upcomingAgendas = useMemo(() => {
      return agendas
        .filter(a => !a.completed)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [agendas]);

  // 4. Liaison Logs (List View)
  const studentLiaison = useMemo(() => {
      if (!selectedStudent) return [];
      return liaisonLogs
        .filter(l => l.studentId === selectedStudent.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [selectedStudent, liaisonLogs]);

  // --- Handlers ---

  const handlePermissionSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedStudent) return;
      setIsSubmittingPerm(true);
      const label = permType === 'sick' ? 'Sakit' : permType === 'dispensation' ? 'Dispensasi' : 'Ijin';
      try {
          await onSavePermission(permDate, [{
              studentId: selectedStudent.id,
              classId: selectedStudent.classId,
              status: permType,
              notes: permReason
          }]);
          alert(`Data ${label} berhasil dicatat.`);
          setPermReason('');
      } catch (error) {
          alert('Gagal menyimpan ijin.');
      } finally {
          setIsSubmittingPerm(false);
      }
  };

  const handleStatusChange = async (id: string, status: 'Diterima' | 'Ditolak' | 'Selesai') => {
      if(confirm('Update status laporan ini?')) {
          await onUpdateLiaisonStatus([id], status);
      }
  };

  const handleSaveNote = async () => {
      if (!selectedStudent) return;
      setIsSavingNote(true);
      try {
          await onUpdateStudent({ ...selectedStudent, teacherNotes: teacherNote });
          alert("Catatan Wali Kelas berhasil disimpan.");
      } catch (error) {
          alert("Gagal menyimpan catatan.");
      } finally {
          setIsSavingNote(false);
      }
  };

  const getStatusBadge = (status?: string) => {
      switch(status) {
          case 'Diterima': return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><CheckCircle size={10} className="mr-1"/> Diterima</span>;
          case 'Ditolak': return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><XCircle size={10} className="mr-1"/> Ditolak</span>;
          case 'Selesai': return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><CheckSquare size={10} className="mr-1"/> Selesai</span>;
          default: return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><Clock size={10} className="mr-1"/> Pending</span>;
      }
  };

  const getBehaviorIcon = (type: string) => {
      switch(type) {
          case 'positive': return <Star size={16} className="text-emerald-500" fill="currentColor"/>;
          case 'negative': return <AlertTriangle size={16} className="text-rose-500"/>;
          default: return <HeartHandshake size={16} className="text-indigo-500"/>;
      }
  };

  if (students.length === 0) {
      return <div className="p-8 text-center text-gray-500">Tidak ada data siswa di kelas ini.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
        
        {/* TOP: SELECTOR */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <UserCheck className="mr-2 text-indigo-600" /> Monitoring Siswa
                </h2>
                <p className="text-sm text-gray-500">Pilih siswa untuk melihat detail profil dan akademik.</p>
            </div>
            <div className="relative min-w-[250px]">
                <select 
                    value={selectedStudentId} 
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 pl-4 pr-10 bg-indigo-50 border-indigo-100 border rounded-lg font-bold text-indigo-700 outline-none appearance-none cursor-pointer hover:bg-indigo-100 transition-colors"
                >
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={18}/>
            </div>
        </div>

        {selectedStudent && (
            <>
            {/* 1. HEADER PROFILE (Full Width) - MATCHING PORTAL */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-50 to-purple-50 z-0 border-b border-indigo-100"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end mt-12 gap-6">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 shrink-0">
                        {selectedStudent.photo && !selectedStudent.photo.startsWith('ERROR') ? (
                            <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-300 bg-indigo-50"><UserCheck size={64}/></div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mb-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-3 drop-shadow-sm">{selectedStudent.name}</h1>
                        
                        {/* Badges */}
                        <div className="inline-flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                            <span className="bg-white px-3 py-1 rounded-full font-bold border border-gray-200 shadow-sm flex items-center text-indigo-700">
                                NIS: {selectedStudent.nis}
                            </span>
                            {selectedStudent.nisn && (
                                <span className="bg-white px-3 py-1 rounded-full font-bold border border-gray-200 shadow-sm flex items-center text-blue-600">
                                    NISN: {selectedStudent.nisn}
                                </span>
                            )}
                            <span className="flex items-center font-medium bg-white/50 px-2 py-1 rounded-lg">
                                <BookOpen size={16} className="mr-1.5 text-gray-400"/> Kelas {selectedStudent.classId}
                            </span>
                            <span className="flex items-center font-medium bg-white/50 px-2 py-1 rounded-lg">
                                <MapPin size={16} className="mr-1.5 text-gray-400"/> {selectedStudent.address || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex gap-3 mb-2 shrink-0 md:self-end">
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center min-w-[100px] shadow-sm">
                            <span className="block text-xs font-bold text-emerald-600 uppercase mb-1">Kehadiran</span>
                            <span className="text-2xl font-black text-emerald-700">{attendanceStats.percentage}%</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center min-w-[100px] shadow-sm">
                            <span className="block text-xs font-bold text-amber-600 uppercase mb-1">Poin Sikap</span>
                            <span className="text-2xl font-black text-amber-700">{selectedStudent.behaviorScore}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. NAVIGATION BAR */}
            <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm no-scrollbar">
                <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className={`flex items-center px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <LayoutDashboard size={18} className="mr-2"/> Ringkasan Data
                </button>
                <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`flex items-center px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <UserIcon size={18} className="mr-2"/> Data Diri
                </button>
                <button 
                    onClick={() => setActiveTab('permissions')} 
                    className={`flex items-center px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'permissions' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <FileText size={18} className="mr-2"/> Perizinan
                </button>
                <button 
                    onClick={() => setActiveTab('liaison')} 
                    className={`flex items-center px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'liaison' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <BookOpen size={18} className="mr-2"/> Buku Penghubung
                </button>
            </div>

            {/* 3. MAIN CONTENT */}
            <div className="min-h-[500px]">
                
                {/* TAB: DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Row 1: Attendance Graph & Agenda */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Attendance Graph (Bar Chart) */}
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
                                            {studentGrades.map((g: any, idx) => (
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
                                            {studentGrades.length === 0 && (
                                                <tr><td colSpan={9} className="py-8 text-center text-gray-400 italic">Belum ada data nilai.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Behavior Logs (Simplified from CounselingView logic) */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <Star className="mr-2 text-orange-500" size={18}/> Catatan Perilaku
                                </h3>
                                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="text-center text-gray-400 text-sm py-8 italic">
                                        Data perilaku belum tersedia di view ini.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: PROFILE (New) */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* New Section: Catatan Wali Kelas */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-3 flex items-center">
                                <MessageSquare className="mr-2" size={20}/> Catatan Wali Kelas
                            </h3>
                            <textarea 
                                className="w-full bg-white/20 border border-white/30 rounded-xl p-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none font-medium min-h-[100px]"
                                placeholder="Tulis catatan, motivasi, atau pesan khusus untuk siswa ini..."
                                value={teacherNote}
                                onChange={(e) => setTeacherNote(e.target.value)}
                            />
                            <div className="flex justify-end mt-3">
                                <button 
                                    onClick={handleSaveNote}
                                    disabled={isSavingNote}
                                    className="flex items-center bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-indigo-50 disabled:opacity-70 transition-colors"
                                >
                                    {isSavingNote ? <Loader2 size={16} className="animate-spin mr-2"/> : <Save size={16} className="mr-2"/>}
                                    Simpan Catatan
                                </button>
                            </div>
                        </div>

                        {/* Card Kesehatan */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <Activity className="mr-2 text-rose-500" size={20}/> Fisik & Kesehatan
                            </h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-rose-50 p-3 rounded-xl text-center">
                                    <span className="block text-xs text-rose-600 font-bold uppercase">Tinggi</span>
                                    <span className="text-lg font-bold text-gray-800">{selectedStudent.height || '-'} <span className="text-xs font-normal text-gray-500">cm</span></span>
                                </div>
                                <div className="bg-rose-50 p-3 rounded-xl text-center">
                                    <span className="block text-xs text-rose-600 font-bold uppercase">Berat</span>
                                    <span className="text-lg font-bold text-gray-800">{selectedStudent.weight || '-'} <span className="text-xs font-normal text-gray-500">kg</span></span>
                                </div>
                                <div className="bg-rose-50 p-3 rounded-xl text-center">
                                    <span className="block text-xs text-rose-600 font-bold uppercase">Gol. Darah</span>
                                    <span className="text-lg font-bold text-gray-800">{selectedStudent.bloodType || '-'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-700 block mb-1">Riwayat Penyakit / Catatan Medis</span>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60px]">
                                    {selectedStudent.healthNotes || 'Tidak ada catatan kesehatan khusus.'}
                                </p>
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
                                    <div className="text-base font-medium text-gray-800 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                        {selectedStudent.hobbies || '-'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Cita-cita</span>
                                    <div className="text-base font-medium text-gray-800 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                        {selectedStudent.ambition || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Prestasi */}
                        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <Trophy className="mr-2 text-yellow-500" size={20}/> Catatan Prestasi
                            </h3>
                            {selectedStudent.achievements && selectedStudent.achievements.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedStudent.achievements.map((ach, idx) => (
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
                )}

                {/* TAB: PERMISSIONS */}
                {activeTab === 'permissions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Form (Admin can submit on behalf) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <FileText className="mr-2 text-indigo-500" size={20} /> Input Ijin (Oleh Guru)
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
                                    {isSubmittingPerm ? 'Menyimpan...' : 'Simpan Ijin'} <Send size={16} className="ml-2"/>
                                </button>
                            </form>
                        </div>
                        
                        {/* History Placeholder (StudentPortal has history list here, Monitor doesn't pass it yet) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                             <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <Clock className="mr-2 text-gray-400" size={20} /> Riwayat Pengajuan
                            </h3>
                            <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                Riwayat pengajuan belum dimuat di view ini.
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: LIAISON BOOK */}
                {activeTab === 'liaison' && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                            <span className="flex items-center"><BookOpen className="mr-2 text-teal-500" size={20}/> Buku Penghubung</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{studentLiaison.length} Data</span>
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {studentLiaison.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">Belum ada laporan.</div>
                            ) : (
                                studentLiaison.map((log) => (
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
                                        <p className="text-sm text-gray-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-gray-100 mb-2">
                                            {log.message}
                                        </p>
                                        
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                            <div className="text-[10px] text-gray-400 italic">
                                                Pengirim: {log.sender}
                                            </div>
                                            
                                            {/* Admin Actions */}
                                            <div className="flex gap-2">
                                                {(log.status === 'Pending' || !log.status) && (
                                                    <>
                                                        <button onClick={() => handleStatusChange(log.id, 'Diterima')} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold border border-blue-200">Terima</button>
                                                        <button onClick={() => handleStatusChange(log.id, 'Ditolak')} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 font-bold border border-red-200">Tolak</button>
                                                    </>
                                                )}
                                                {log.status === 'Diterima' && (
                                                    <button onClick={() => handleStatusChange(log.id, 'Selesai')} className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded hover:bg-emerald-100 font-bold border border-emerald-200 flex items-center">
                                                        <CheckSquare size={10} className="mr-1"/> Tandai Selesai
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>
            </>
        )}
    </div>
  );
};

export default StudentMonitor;
