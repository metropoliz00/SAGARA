
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend 
} from 'recharts';
import { Student, AgendaItem, Holiday, ViewState, GradeRecord, Subject, EmploymentLink, PermissionRequest } from '../types';
import { 
  Users, UserCheck, Calendar, FileText, TrendingUp, 
  Plus, Bell, ChevronRight, CheckCircle, AlertCircle, 
  GraduationCap, BookOpen, Clock, CalendarRange,
  Activity, XCircle, ExternalLink, Link as LinkIcon, Mail
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  agendas: AgendaItem[];
  holidays: Holiday[];
  allAttendanceRecords: any[];
  teacherName?: string;
  teachingClass?: string;
  onChangeView: (view: ViewState) => void;
  grades: GradeRecord[];
  subjects: Subject[];
  adminCompleteness?: number;
  employmentLinks?: EmploymentLink[];
  pendingPermissions?: PermissionRequest[];
  onOpenPermissionModal?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  students, agendas, holidays, allAttendanceRecords, 
  teacherName, teachingClass, onChangeView, grades, subjects, adminCompleteness = 0,
  employmentLinks = [], pendingPermissions = [], onOpenPermissionModal
}) => {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentDate);
  const getLocalISODate = (date: Date) => { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; };
  const formatLongDate = (dateStr: string) => { if (!dateStr) return "-"; try { const date = new Date(dateStr + 'T00:00:00'); if (isNaN(date.getTime())) return dateStr; return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date); } catch (e) { return dateStr; } };
  const getGreeting = () => { const hour = currentDate.getHours(); if (hour >= 5 && hour < 11) return "Pagi"; if (hour >= 11 && hour < 15) return "Siang"; if (hour >= 15 && hour < 19) return "Sore"; return "Malam"; };

  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.gender === 'L').length;
  const femaleStudents = students.filter(s => s.gender === 'P').length;

  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRecords = (allAttendanceRecords as any[]).filter(record => {
        const recordDate = new Date(record.date + 'T00:00:00');
        return recordDate.getFullYear() === currentYear && (recordDate.getMonth() + 1) === currentMonth;
    });
    return {
        present: monthlyRecords.filter(r => r.status === 'present').length,
        sick: monthlyRecords.filter(r => r.status === 'sick').length,
        permit: monthlyRecords.filter(r => r.status === 'permit').length,
        alpha: monthlyRecords.filter(r => r.status === 'alpha').length,
    };
  }, [allAttendanceRecords]);

  const totalPresent = monthlyStats.present;
  const totalSick = monthlyStats.sick;
  const totalPermit = monthlyStats.permit;
  const totalAlpha = monthlyStats.alpha;

  const attendanceTrendData = useMemo(() => {
    const daysShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const weekData = [];
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);
      const dateStr = getLocalISODate(targetDate);
      const dayRecords = (allAttendanceRecords as any[]).filter(r => r.date === dateStr);
      weekData.push({
        name: daysShort[targetDate.getDay()],
        H: dayRecords.filter(r => r.status === 'present').length,
        S: dayRecords.filter(r => r.status === 'sick').length,
        I: dayRecords.filter(r => r.status === 'permit').length,
        A: dayRecords.filter(r => r.status === 'alpha').length,
      });
    }
    return weekData;
  }, [allAttendanceRecords]);

  const absentToday = useMemo(() => {
    const todayStr = getLocalISODate(new Date());
    return allAttendanceRecords.filter(record => record.date === todayStr && record.status !== 'present').map(record => {
            const student = students.find(s => s.id === record.studentId);
            return { ...record, name: student?.name || 'Siswa tidak ditemukan' };
        });
  }, [allAttendanceRecords, students]);

  const priorityAgenda = agendas.find(a => a.type === 'urgent' && !a.completed) || agendas.find(a => !a.completed);
  const incompleteAgendas = agendas.filter(a => !a.completed);
  const upcomingHolidays = holidays.map(h => ({...h, dateObj: new Date(h.date + 'T00:00:00')})).filter(h => h.dateObj >= new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()).slice(0, 4);
  const getDaysRemaining = (dateObj: Date) => { const today = new Date(); today.setHours(0, 0, 0, 0); const diffTime = dateObj.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); if (diffDays === 0) return 'Hari ini'; if (diffDays === 1) return 'Besok'; return `dalam ${diffDays} hari`; };
  
  // Theme Helpers for List Rows
  const getRowVariant = (index: number) => {
      const variants = ['bg-white border-gray-100', 'bg-[#FFF9D0]/30 border-amber-100', 'bg-[#CAF4FF]/20 border-blue-100'];
      return variants[index % variants.length];
  };

  // Theme Helpers for Link Cards
  const getLinkCardStyle = (index: number) => {
      const styles = [
          'bg-white border-gray-200 hover:border-[#5AB2FF]', 
          'bg-[#FFF9D0] border-amber-200 hover:border-amber-400',
          'bg-[#CAF4FF] border-blue-200 hover:border-blue-400'
      ];
      return styles[index % styles.length];
  };

  const curriculumProgress = useMemo(() => {
    if (!subjects || !grades || students.length === 0) return [];
    return subjects.map((subject) => {
        const subjectId = subject.id;
        const kkm = subject.kkm;
        let totalAverageScore = 0;
        let gradedStudentsCount = 0;
        students.forEach(student => {
            const studentGradeRecord = grades.find(g => g.studentId === student.id);
            const subjectGrade = studentGradeRecord?.subjects[subjectId];
            if (subjectGrade) {
                const scores = [subjectGrade.sum1, subjectGrade.sum2, subjectGrade.sum3, subjectGrade.sum4, subjectGrade.sas];
                const validScores = scores.filter(score => score > 0);
                if (validScores.length > 0) {
                    const studentAverage = validScores.reduce((acc, score) => acc + score, 0) / validScores.length;
                    totalAverageScore += studentAverage;
                    gradedStudentsCount++;
                }
            }
        });
        const classAverage = gradedStudentsCount > 0 ? Math.round(totalAverageScore / gradedStudentsCount) : 0;
        const progress = kkm > 0 ? Math.min(100, Math.round((classAverage / kkm) * 100)) : 0;
        const nameParts = subject.name.split(' ');
        const shortName = nameParts.length > 1 ? `${nameParts[0].charAt(0)}. ${nameParts.slice(1).join(' ')}` : subject.name;
        return { id: subject.id, name: subject.name, shortName, progress, classAverage, kkm };
    });
  }, [subjects, grades, students]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800 text-sm">{data.name}</p>
          <p className={`text-lg font-bold ${data.classAverage >= data.kkm ? 'text-emerald-600' : 'text-amber-600'}`}>{data.progress}% Tercapai</p>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <p>Rata-rata Kelas: <span className="font-bold">{data.classAverage.toFixed(1)}</span></p>
            <p>Target KKTP: <span className="font-bold">{data.kkm}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  const hasPendingPermissions = pendingPermissions.length > 0;
  // Updated Priority Card Color to be more distinct for alerts
  const priorityCardStyle = hasPendingPermissions 
    ? 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-orange-200' 
    : 'bg-gradient-to-br from-[#CAF4FF] to-[#A0DEFF] shadow-sky-200';
  const priorityCardText = hasPendingPermissions ? 'text-white' : 'text-slate-800';

  const handlePriorityClick = () => {
      if (hasPendingPermissions && onOpenPermissionModal) {
          onOpenPermissionModal();
      } else {
          onChangeView('activities');
      }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative min-h-screen">
      <div className="relative z-10 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
            <h1 className="text-2xl font-bold text-gray-800">Selamat {getGreeting()}, {teacherName || 'Bapak/Ibu Guru'} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Berikut adalah ringkasan aktivitas {teachingClass ? `Kelas ${teachingClass}` : 'Sekolah'} hari ini.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-[#5AB2FF] text-white px-4 py-2 rounded-xl shadow-md">
                <BookOpen size={18} />
                <span className="text-sm font-bold">{teachingClass ? `Kelas ${teachingClass}` : 'ALL'}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <Calendar size={18} className="text-[#5AB2FF]" />
                <span className="text-sm font-medium text-gray-700 capitalize">{formattedDate}</span>
            </div>
            </div>
        </div>

        {/* Links Grid - UPDATED COLORS */}
        {employmentLinks.length > 0 && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#CAF4FF]">
             <div className="flex flex-wrap gap-4 justify-center">
                {employmentLinks.map((link, index) => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-3 w-24 h-24 rounded-xl transition-all border shadow-sm hover:-translate-y-1 hover:shadow-md group text-center ${
                        getLinkCardStyle(index)
                    }`}
                  >
                    <div className="w-10 h-10 mb-2 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                       {link.icon ? (
                         <img src={link.icon} alt={link.title} className="w-full h-full object-contain" />
                       ) : (
                         <LinkIcon className="text-gray-400" size={20} />
                       )}
                    </div>
                    <span className="text-xs font-semibold text-gray-600 leading-tight line-clamp-2 group-hover:text-[#5AB2FF] transition-colors">{link.title}</span>
                  </a>
                ))}
             </div>
          </div>
        )}

        {/* Summary Widgets - Themed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Siswa (Ocean Blue) */}
            <div onClick={() => onChangeView('students')} className="bg-[#5AB2FF] text-white p-5 rounded-2xl shadow-lg shadow-blue-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-sm font-medium text-blue-100 mb-1">Total Siswa</p>
                    <h3 className="text-3xl font-bold">{totalStudents}</h3>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg"><Users size={20} className="text-white" /></div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                    <span className="px-2.5 py-1 bg-blue-600 rounded-md border border-blue-400 shadow-sm">L: {maleStudents}</span>
                    <span className="px-2.5 py-1 bg-pink-500 rounded-md border border-pink-400 shadow-sm">P: {femaleStudents}</span>
                </div>
            </div>

            {/* 2. Attendance (Sky Blue) */}
            <div onClick={() => onChangeView('attendance')} className="bg-[#A0DEFF] text-white p-5 rounded-2xl shadow-lg shadow-sky-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                    <p className="text-sm font-medium text-blue-50 mb-1">Kehadiran</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold">
                        {totalStudents > 0 ? Math.round((totalPresent / (totalPresent + totalSick + totalPermit + totalAlpha || 1)) * 100) : 0}%
                        </h3>
                    </div>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg"><UserCheck size={20} className="text-white" /></div>
                </div>
                <div className="mt-4 flex space-x-1 text-[10px] font-bold">
                    <div className="flex-1 bg-emerald-500 rounded-l-md py-1 text-center truncate shadow-sm">H: {totalPresent}</div>
                    <div className="w-10 bg-amber-400 py-1 text-center shadow-sm">S: {totalSick}</div>
                    <div className="w-10 bg-indigo-500 py-1 text-center shadow-sm">I: {totalPermit}</div>
                    <div className="w-8 bg-rose-500 rounded-r-md py-1 text-center shadow-sm">A: {totalAlpha}</div>
                </div>
            </div>

            {/* 3. Admin Completeness (Cream - Dark Text) */}
            <div onClick={() => onChangeView('admin')} className="bg-[#FFF9D0] text-amber-900 p-5 rounded-2xl shadow-lg shadow-amber-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-amber-200">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-amber-700 mb-1">Administrasi</p>
                        <h3 className="text-3xl font-bold">{adminCompleteness}%</h3>
                    </div>
                    <div className="p-2 bg-white/60 rounded-lg"><FileText size={20} className="text-amber-600"/></div>
                </div>
                <div className="mt-4 w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 transition-all duration-1000" style={{ width: `${adminCompleteness}%` }}></div>
                </div>
                <div className="mt-2 text-xs text-amber-800 font-medium flex justify-between">
                    <span>Kelengkapan</span>
                    <span>{adminCompleteness === 100 ? 'Sempurna!' : 'Lengkapi'}</span>
                </div>
            </div>

            {/* 4. Priority / Notification (Dynamic Gradient) */}
            <div 
                onClick={handlePriorityClick} 
                className={`${priorityCardStyle} ${priorityCardText} p-5 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden`}
            >
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                        <p className={`text-sm font-medium ${hasPendingPermissions ? 'text-white/90' : 'text-slate-600'}`}>
                            {hasPendingPermissions ? 'Menunggu Konfirmasi' : 'Prioritas'}
                        </p>
                        <Bell size={18} className={`${hasPendingPermissions ? 'text-white animate-bounce' : 'text-slate-600 animate-pulse'}`} />
                    </div>
                    
                    {hasPendingPermissions ? (
                        <>
                            <h3 className="text-lg font-bold leading-tight mb-2">
                                {pendingPermissions.length} Permintaan Ijin
                            </h3>
                            <div className="flex items-center text-xs text-white mt-4 bg-white/30 w-fit px-3 py-1.5 rounded-lg border border-white/40 font-bold backdrop-blur-sm">
                                <Mail size={12} className="mr-1.5" />
                                Klik untuk memproses
                            </div>
                        </>
                    ) : priorityAgenda ? (
                        <>
                            <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-2 text-slate-800">{priorityAgenda.title}</h3>
                            <div className="flex items-center text-xs text-slate-600 mt-4 bg-white/40 w-fit px-2 py-1 rounded-lg">
                                <Clock size={12} className="mr-1.5" />
                                Deadline: {formatLongDate(priorityAgenda.date)}
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold mb-2 text-slate-800">Semua Aman!</h3>
                            <p className="text-xs text-slate-600">Tidak ada agenda mendesak.</p>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
            <div onClick={() => onChangeView('attendance')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Tren Kehadiran Minggu Ini</h3>
                    <p className="text-sm text-gray-400">Monitoring partisipasi siswa (Senin - Sabtu)</p>
                </div>
                </div>
                <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceTrendData}>
                    <defs>
                        <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5AB2FF" stopOpacity={0.1}/><stop offset="95%" stopColor="#5AB2FF" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="H" stroke="#5AB2FF" strokeWidth={3} fill="url(#colorHadir)" name="Hadir (H)" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1" onClick={() => onChangeView('grades')}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <h3 className="text-lg font-bold text-gray-800">Target Kurikulum</h3>
                    <p className="text-sm text-gray-400">Pencapaian rata-rata kelas terhadap target KKTP</p>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={curriculumProgress} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                                dataKey="shortName" 
                                tick={{ fill: '#6B7280', fontSize: 12 }} 
                                interval={0}
                                angle={-35}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                            <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                                {curriculumProgress.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.classAverage >= entry.kkm ? '#10B981' : '#F59E0B'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            </div>

            {/* Side Lists with Alternating Colors */}
            <div className="space-y-6">
            <div 
                onClick={() => onChangeView('attendance')}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Absensi Hari Ini</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {absentToday.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-8">
                            <UserCheck size={32} className="text-emerald-500 mb-2" />
                            <p className="font-semibold text-emerald-700">Semua siswa hadir!</p>
                        </div>
                    ) : (
                        absentToday.map((record: any, idx) => {
                            // Definisi konfigurasi status dengan tipe data yang jelas
                            const statusConfig: { [key: string]: { icon: any, color: string, label: string } } = {
                                sick: { icon: Activity, color: 'text-amber-600 bg-amber-100', label: 'Sakit' },
                                permit: { icon: FileText, color: 'text-blue-600 bg-blue-100', label: 'Izin' },
                                alpha: { icon: XCircle, color: 'text-rose-600 bg-rose-100', label: 'Alpha' }
                            };
                            
                            const defaultConfig = { icon: AlertCircle, color: 'text-gray-600 bg-gray-100', label: '?' };
                            const config = statusConfig[record.status as string] || defaultConfig;
                            const Icon = config.icon;

                            return (
                                <div key={record.studentId} className={`flex items-start space-x-3 p-3 rounded-xl border border-transparent ${getRowVariant(idx)}`}>
                                    <div className={`p-2 rounded-full ${config.color}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-semibold text-gray-800">{record.name}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        {record.notes && (
                                            <p className="text-xs text-gray-500 mt-1 italic">"{record.notes}"</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Kalender Libur</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {upcomingHolidays.map((holiday, idx) => (
                        <div key={holiday.id} className={`flex items-start space-x-4 p-3 rounded-xl ${getRowVariant(idx)}`}>
                            <div className="p-2 rounded-full bg-[#5AB2FF] text-white shrink-0 mt-1"><CalendarRange size={16} /></div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{holiday.description}</h4>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-500 font-medium">{formatLongDate(holiday.date)}</p>
                                    <p className="text-xs text-[#5AB2FF] font-bold bg-white px-2 py-0.5 rounded-full border border-[#5AB2FF]">{getDaysRemaining(holiday.dateObj)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Reminder</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {incompleteAgendas.map((rem, idx) => (
                    <div key={rem.id} className={`flex items-start space-x-3 p-3 rounded-xl ${getRowVariant(idx)}`}>
                        <div className={`mt-1 p-1.5 rounded-full ${rem.type === 'urgent' ? 'bg-red-100 text-red-600' : rem.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {rem.type === 'urgent' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{rem.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{formatLongDate(rem.date)}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            </div>
        </div>

        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end space-y-4">
            {isFabOpen && (
            <div className="flex flex-col space-y-3 animate-fade-in-up">
                <button onClick={() => onChangeView('grades')} className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform">
                <span className="text-sm font-medium">Input Nilai</span><div className="bg-purple-100 p-1 rounded-full"><GraduationCap size={16} className="text-purple-600"/></div>
                </button>
                <button onClick={() => onChangeView('attendance')} className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform">
                <span className="text-sm font-medium">Catat Absen</span><div className="bg-emerald-100 p-1 rounded-full"><UserCheck size={16} className="text-emerald-600"/></div>
                </button>
                <button onClick={() => onChangeView('students')} className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform">
                <span className="text-sm font-medium">Tambah Siswa</span><div className="bg-blue-100 p-1 rounded-full"><Users size={16} className="text-blue-600"/></div>
                </button>
            </div>
            )}
            <button onClick={() => setIsFabOpen(!isFabOpen)} className={`p-4 rounded-full shadow-xl text-white transition-all transform hover:scale-110 ${isFabOpen ? 'bg-red-500 rotate-45' : 'bg-[#5AB2FF]'}`}><Plus size={28} /></button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
