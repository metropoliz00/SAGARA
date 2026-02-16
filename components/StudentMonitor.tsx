
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Student, GradeRecord, AgendaItem, 
  LiaisonLog, User, BehaviorLog, PermissionRequest
} from '../types';
import { 
  UserCheck, BookOpen, Calendar, Send, 
  PieChart as PieIcon, List, FileText, ChevronDown, CheckCircle, XCircle, Clock,
  MapPin, TrendingUp, ListTodo, Award, Star, AlertTriangle, HeartHandshake, LayoutDashboard, Medal,
  Activity, Trophy, User as UserIcon, Save, Loader2
} from 'lucide-react';

interface StudentMonitorProps {
  students: Student[];
  allAttendance: any[];
  grades: GradeRecord[];
  agendas: AgendaItem[];
  liaisonLogs: LiaisonLog[];
  onSaveLiaison: (log: Omit<LiaisonLog, 'id'>) => Promise<void>;
  onSavePermission: (date: string, records: any[]) => Promise<void>;
  onUpdateLiaisonStatus: (ids: string[], status: 'Diterima' | 'Ditolak' | 'Selesai') => Promise<void>;
  classId: string;
  onUpdateStudent: (student: Student) => Promise<void>; // New prop
}

type MonitorTab = 'profile';

const StudentMonitor: React.FC<StudentMonitorProps> = ({
  students, allAttendance, grades, agendas, liaisonLogs,
  onSaveLiaison, onSavePermission, onUpdateLiaisonStatus, classId,
  onUpdateStudent
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<MonitorTab>('profile');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      const firstStudentId = students[0].id;
      setSelectedStudentId(firstStudentId);
      setTeacherNotes(students[0].teacherNotes || '');
    }
  }, [students]);

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  useEffect(() => {
    if (selectedStudent) {
        setTeacherNotes(selectedStudent.teacherNotes || '');
    }
  }, [selectedStudent]);

  const handleSaveNotes = async () => {
    if (!selectedStudent) return;
    setIsSavingNotes(true);
    try {
      await onUpdateStudent({ ...selectedStudent, teacherNotes: teacherNotes });
      alert('Catatan berhasil disimpan.');
    } catch (e) {
      alert('Gagal menyimpan catatan.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (students.length === 0) {
      return <div className="p-8 text-center text-gray-500">Tidak ada data siswa di kelas ini untuk dimonitor.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
        
        {/* TOP: SELECTOR */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <UserCheck className="mr-2 text-indigo-600" /> Monitoring Siswa
                </h2>
                <p className="text-sm text-gray-500">Pilih siswa untuk melihat detail profil dan meninggalkan catatan.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Profile Card */}
                <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 mb-4">
                            {selectedStudent.photo && !selectedStudent.photo.startsWith('ERROR') ? (
                                <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-indigo-300 bg-indigo-50"><UserIcon size={48}/></div>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{selectedStudent.name}</h3>
                        <span className="text-sm text-gray-500">NIS: {selectedStudent.nis}</span>
                        <div className="mt-4 text-xs space-y-2 text-left w-full border-t pt-4">
                            <p><strong className="w-20 inline-block">Gender:</strong> {selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                            <p><strong className="w-20 inline-block">Tgl Lahir:</strong> {selectedStudent.birthDate}</p>
                            <p><strong className="w-20 inline-block">Alamat:</strong> {selectedStudent.address}</p>
                            <p><strong className="w-20 inline-block">Wali:</strong> {selectedStudent.parentName}</p>
                            <p><strong className="w-20 inline-block">No. HP Wali:</strong> {selectedStudent.parentPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Notes */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center mb-4">
                        <FileText className="mr-2 text-indigo-500" size={20}/> Catatan Wali Kelas
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        Catatan ini akan muncul di halaman dashboard siswa. Gunakan untuk memberi motivasi, pengingat, atau apresiasi.
                    </p>
                    <textarea
                        value={teacherNotes}
                        onChange={(e) => setTeacherNotes(e.target.value)}
                        rows={8}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Tulis catatan untuk siswa..."
                    />
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes}
                            className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSavingNotes ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                            {isSavingNotes ? 'Menyimpan...' : 'Simpan Catatan'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default StudentMonitor;
