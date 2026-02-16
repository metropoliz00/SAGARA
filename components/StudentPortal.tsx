
import React, { useState, useMemo, useEffect } from 'react';
import { Student, GradeRecord, LiaisonLog, AgendaItem, BehaviorLog, PermissionRequest, KarakterAssessment, KARAKTER_INDICATORS, KarakterIndicatorKey } from '../types';
import { MOCK_SUBJECTS } from '../constants';
import { 
  User, Calendar, Send, FileText, CheckCircle, XCircle, 
  BookOpen, Award, LayoutDashboard, Clock, Activity,
  Star, AlertTriangle, HeartHandshake, ListTodo, TrendingUp,
  MapPin, CheckSquare, X, Medal, Heart, MessageCircle, Trophy,
  Sun, Moon, BookHeart, Dumbbell, Apple, UsersRound, BookOpenCheck, Sparkles, Quote, Edit, Save, Loader2
} from 'lucide-react';

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
  onUpdateStudent: (student: Student) => Promise<void>; // New prop
}

type PortalTab = 'dashboard' | 'profile';

const StudentPortal: React.FC<StudentPortalProps> = ({
  student, allAttendance, grades, liaisonLogs, agendas, behaviorLogs, permissionRequests, karakterAssessments,
  onSaveLiaison, onSavePermission, onSaveKarakter, onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard');
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Student>>(student);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setProfileData(student);
  }, [student]);

  const handleProfileChange = (field: keyof Student, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
        await onUpdateStudent(profileData as Student);
        alert('Profil berhasil diperbarui!');
        setIsEditingProfile(false);
    } catch (e) {
        alert('Gagal menyimpan profil.');
    } finally {
        setIsSavingProfile(false);
    }
  };

  const attendanceStats = useMemo(() => {
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

    return { percentage };
  }, [student, allAttendance]);

  const upcomingAgendas = useMemo(() => {
      return agendas
        .filter(a => !a.completed)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [agendas]);


  const TABS = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'profile', label: 'Data Diri', icon: User },
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

      {/* 2. STICKY NAVIGATION */}
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
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <Icon size={16} className="mr-2"/> {tab.label}
                    </button>
                )
            })}
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="min-h-[500px]">
          {activeTab === 'dashboard' && (
              <div className="space-y-6">
                  {student.teacherNotes && (
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white animate-fade-in">
                          <h4 className="font-bold text-lg mb-2 flex items-center">
                              <MessageCircle size={20} className="mr-2 opacity-80"/> Pesan dari Wali Kelas
                          </h4>
                          <p className="text-sm text-white/90 italic bg-white/10 p-4 rounded-xl border border-white/20">
                              "{student.teacherNotes}"
                          </p>
                      </div>
                  )}
                  {/* Other dashboard widgets can go here */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                          <ListTodo className="mr-2 text-purple-500" size={18}/> Agenda Kegiatan
                      </h3>
                      <div className="space-y-3 flex-1">
                          {upcomingAgendas.length === 0 ? (
                              <div className="text-center text-gray-400 text-sm py-8 italic">Tidak ada agenda mendatang.</div>
                          ) : (
                              upcomingAgendas.slice(0, 5).map(agenda => (
                                  <div key={agenda.id} className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full mr-3 shrink-0 ${agenda.type==='urgent'?'bg-red-500': agenda.type==='warning'?'bg-amber-500':'bg-blue-500'}`}></div>
                                      <div>
                                          <h4 className="text-sm font-bold text-gray-800">{agenda.title}</h4>
                                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                                              <Calendar size={10} className="mr-1"/> {new Date(agenda.date).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}
                                          </p>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-800 text-lg">Data Diri Siswa</h3>
                      {!isEditingProfile ? (
                          <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 bg-white text-indigo-600 font-bold px-4 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm">
                              <Edit size={16}/> Edit Data
                          </button>
                      ) : (
                          <div className="flex gap-2">
                              <button onClick={() => { setIsEditingProfile(false); setProfileData(student); }} className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100">Batal</button>
                              <button onClick={handleSaveProfile} disabled={isSavingProfile} className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50">
                                  {isSavingProfile ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Simpan
                              </button>
                          </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      {/* Non-Editable */}
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-xs text-gray-500">Nama Lengkap</strong> <span className="font-medium text-gray-800">{profileData.name}</span></div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-xs text-gray-500">NIS</strong> <span className="font-medium text-gray-800">{profileData.nis}</span></div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-xs text-gray-500">NISN</strong> <span className="font-medium text-gray-800">{profileData.nisn}</span></div>
                      <div className="bg-gray-50 p-3 rounded-lg"><strong className="block text-xs text-gray-500">Tempat, Tgl Lahir</strong> <span className="font-medium text-gray-800">{profileData.birthPlace}, {profileData.birthDate}</span></div>

                      {/* Editable Fields */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Alamat</label>
                          <input type="text" value={profileData.address || ''} onChange={e => handleProfileChange('address', e.target.value)} disabled={!isEditingProfile} className="w-full border p-2 rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"/>
                      </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">No. HP Wali</label>
                          <input type="text" value={profileData.parentPhone || ''} onChange={e => handleProfileChange('parentPhone', e.target.value)} disabled={!isEditingProfile} className="w-full border p-2 rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"/>
                      </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Hobi</label>
                          <input type="text" value={profileData.hobbies || ''} onChange={e => handleProfileChange('hobbies', e.target.value)} disabled={!isEditingProfile} className="w-full border p-2 rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"/>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Cita-cita</label>
                          <input type="text" value={profileData.ambition || ''} onChange={e => handleProfileChange('ambition', e.target.value)} disabled={!isEditingProfile} className="w-full border p-2 rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"/>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default StudentPortal;
