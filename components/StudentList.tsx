
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Student, TeacherProfileData, SchoolProfileData } from '../types';
import * as XLSX from 'xlsx';
import { compressImage } from '../utils/imageHelper';
import QRCode from 'react-qr-code';
import { 
  Search, Plus, ArrowLeft, Save, User, Heart, Activity, DollarSign, 
  AlertTriangle, UserCircle, Trash2, X, FileSpreadsheet, Printer, Upload, Download,
  LayoutGrid, List as ListIcon, MapPin, Users as UsersIcon,
  Image as ImageIcon, Table as TableIcon, AlertCircle, PieChart as PieChartIcon,
  IdCard as IdCardIcon, ChevronLeft, ChevronRight, ZoomIn, ZoomOut
} from 'lucide-react';

import BiodataTab from './student/BiodataTab';
import HealthTab from './student/HealthTab';
import TalentsTab from './student/TalentsTab';
import EconomyTab from './student/EconomyTab';
import RecordsTab from './student/RecordsTab';
import StudentDashboard from './student/StudentDashboard';
import CustomModal from './CustomModal'; // Use reusable modal

interface StudentListProps {
  students: Student[];
  teacherProfile?: TeacherProfileData;
  schoolProfile?: SchoolProfileData;
  classId: string;
  onAdd: (student: Omit<Student, 'id'>) => void;
  onBatchAdd?: (students: Omit<Student, 'id'>[]) => void;
  onUpdate: (student: Student) => void;
  onDelete: (id: string) => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
  isReadOnly?: boolean;
}

type TabType = 'biodata' | 'health' | 'talents' | 'economy' | 'records';
type ViewType = 'grid' | 'list' | 'dashboard' | 'id-cards';

const StudentList: React.FC<StudentListProps> = ({ 
  students, teacherProfile, schoolProfile, classId,
  onAdd, onBatchAdd, onUpdate, onDelete, onShowNotification, isReadOnly = false
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('biodata');
  const [viewType, setViewType] = useState<ViewType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<TabType>('biodata');
  
  // ID Card Pagination & Zoom State
  const [idCardPage, setIdCardPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(0.8);
  const CARDS_PER_PAGE = 10; // 2 cols x 5 rows
  
  // Custom Modal for Delete Confirmation
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, studentId: string | null}>({isOpen: false, studentId: null});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper completeness functions
  const calculateCompleteness = (s: Student) => {
    const fields: (keyof Student)[] = [
      'nis', 'name', 'gender', 'birthPlace', 'birthDate', 'address', 'photo', 'religion',
      'fatherName', 'fatherJob', 'fatherEducation', 'motherName', 'motherJob', 'motherEducation',
      'parentName', 'parentPhone', 'parentJob',
      'height', 'weight', 'bloodType', 'healthNotes',
      'hobbies', 'ambition', 'economyStatus'
    ];
    let filledCount = 0;
    fields.forEach(field => {
      const val = s[field];
      if (typeof val === 'number' && val > 0) filledCount++;
      else if (typeof val === 'string' && val.trim().length > 0 && !val.startsWith('ERROR')) filledCount++;
    });
    return Math.round((filledCount / fields.length) * 100);
  };

  const getCompletenessColor = (pct: number) => {
    if (pct === 100) return 'text-emerald-600 bg-emerald-100';
    if (pct >= 80) return 'text-[#5AB2FF] bg-[#CAF4FF]';
    if (pct >= 50) return 'text-amber-600 bg-amber-100';
    return 'text-rose-600 bg-rose-100';
  };
  
  const getCompletenessBarColor = (pct: number) => {
    if (pct === 100) return 'bg-emerald-500';
    if (pct >= 80) return 'bg-[#5AB2FF]'; 
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const isPhotoError = (url?: string) => url && (url.startsWith('ERROR') || url.startsWith('error'));

  const handlePrint = () => { window.print(); };

  const confirmDelete = () => {
      if (deleteModal.studentId) {
          onDelete(deleteModal.studentId);
          setSelectedStudent(null);
          setDeleteModal({isOpen: false, studentId: null});
      }
  };

  // ... (Handlers unchanged for brevity) ...
  const handleDownloadTemplate = () => {
    const headers = ["Class ID", "NIS", "NISN", "Nama Lengkap", "Gender (L/P)", "Tempat Lahir", "Tanggal Lahir (YYYY-MM-DD)", "Agama", "Alamat", "Nama Ayah", "Pekerjaan Ayah", "Pendidikan Ayah", "Nama Ibu", "Pekerjaan Ibu", "Pendidikan Ibu", "Nama Wali", "No HP Wali", "Pekerjaan Wali", "Status Ekonomi", "Tinggi (cm)", "Berat (kg)", "Gol Darah", "Riwayat Penyakit", "Hobi", "Cita-cita", "Prestasi", "Pelanggaran"];
    const example = ["1A", "2024001", "0012345678", "Ahmad Santoso", "L", "Surabaya", "2015-05-20", "Islam", "Jl. Merpati No. 10", "Budi Santoso", "Wiraswasta", "SMA", "Siti Aminah", "Ibu Rumah Tangga", "SMP", "Budi Santoso", "081234567890", "Wiraswasta", "Mampu", "145", "38", "O", "Tidak ada", "Sepak Bola", "Polisi", "Juara 1 Lari", "-"];
    const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Input Siswa");
    XLSX.writeFile(workbook, "template_input_siswa.xlsx");
  };

  const handleExport = () => {
    const headers = ["Class ID", "NIS", "NISN", "Nama Lengkap", "Gender (L/P)", "Tempat Lahir", "Tanggal Lahir (YYYY-MM-DD)", "Agama", "Alamat", "Nama Ayah", "Pekerjaan Ayah", "Pendidikan Ayah", "Nama Ibu", "Pekerjaan Ibu", "Pendidikan Ibu", "Nama Wali", "No HP Wali", "Pekerjaan Wali", "Status Ekonomi", "Tinggi (cm)", "Berat (kg)", "Gol Darah", "Riwayat Penyakit", "Hobi", "Cita-cita", "Prestasi", "Pelanggaran", "Kelengkapan Data (%)"];
    const rows = students.map(s => [s.classId, s.nis, s.nisn || '-', s.name, s.gender, s.birthPlace || '-', s.birthDate, s.religion || '-', s.address, s.fatherName, s.fatherJob || '-', s.fatherEducation || '-', s.motherName, s.motherJob || '-', s.motherEducation || '-', s.parentName, s.parentPhone, s.parentJob || '-', s.economyStatus || 'Mampu', s.height || 0, s.weight || 0, s.bloodType || '-', s.healthNotes || '-', s.hobbies || '-', s.ambition || '-', s.achievements?.join(', ') || '-', s.violations?.join(', ') || '-', calculateCompleteness(s) + '%']);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa Lengkap");
    XLSX.writeFile(workbook, "data_siswa_lengkap.xlsx");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const rows = data.slice(1) as any[];
      let importedCount = 0;
      const newStudentsBatch: Omit<Student, 'id'>[] = [];
      rows.forEach((row) => {
        if (row.length === 0) return;
        const classIdInput = row[0] ? String(row[0]) : classId;
        const nis = row[1] ? String(row[1]) : '';
        const name = row[3] ? String(row[3]) : '';
        if (nis && name) {
          const newStudent: Omit<Student, 'id'> = {
            classId: classIdInput, nis: nis, nisn: row[2] ? String(row[2]) : '', name: name, gender: (row[4] && String(row[4]).toUpperCase().includes('P')) ? 'P' : 'L', birthPlace: row[5] ? String(row[5]) : '', birthDate: row[6] ? String(row[6]) : '', religion: row[7] ? String(row[7]) : 'Islam', address: row[8] ? String(row[8]) : '',
            fatherName: row[9] ? String(row[9]) : '', fatherJob: row[10] ? String(row[10]) : '', fatherEducation: row[11] ? String(row[11]) : '', motherName: row[12] ? String(row[12]) : '', motherJob: row[13] ? String(row[13]) : '', motherEducation: row[14] ? String(row[14]) : '',
            parentName: row[15] ? String(row[15]) : (row[9] ? String(row[9]) : (row[12] ? String(row[12]) : '')), parentPhone: row[16] ? String(row[16]) : '', parentJob: row[17] ? String(row[17]) : '',
            economyStatus: (row[18] as any) || 'Mampu', height: Number(row[19]) || 0, weight: Number(row[20]) || 0, bloodType: row[21] ? String(row[21]) : '', healthNotes: row[22] ? String(row[22]) : '', hobbies: row[23] ? String(row[23]) : '', ambition: row[24] ? String(row[24]) : '',
            achievements: row[25] ? String(row[25]).split(',').map(s=>s.trim()) : [], violations: row[26] ? String(row[26]).split(',').map(s=>s.trim()) : [], behaviorScore: 100, attendance: { present: 0, sick: 0, permit: 0, alpha: 0 }
          };
          if (onBatchAdd) newStudentsBatch.push(newStudent); else onAdd(newStudent);
          importedCount++;
        }
      });
      if (onBatchAdd && newStudentsBatch.length > 0) { onBatchAdd(newStudentsBatch); onShowNotification(`Memproses impor ${importedCount} data siswa...`, 'warning'); } else if (!onBatchAdd) { onShowNotification(`Berhasil mengirim ${importedCount} request data siswa.`, 'success'); }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedBase64 = await compressImage(file, 300, 0.6);
        if (isNew) { setNewStudent(prev => ({ ...prev, photo: resizedBase64 })); } else if (selectedStudent) { handleChange('photo', resizedBase64); }
      } catch (error) { onShowNotification("Gagal memproses gambar.", 'error'); }
    }
  };

  const [detailTempAchievements, setDetailTempAchievements] = useState('');
  const [detailTempViolations, setDetailTempViolations] = useState('');

  useEffect(() => {
    if (selectedStudent) {
      setDetailTempAchievements(selectedStudent.achievements?.join(', ') || '');
      setDetailTempViolations(selectedStudent.violations?.join(', ') || '');
    }
  }, [selectedStudent]);

  const handleSaveDetail = () => {
    if (isReadOnly) return;
    if (selectedStudent) {
      const achievementsArray = detailTempAchievements ? detailTempAchievements.split(',').map(s => s.trim()) : [];
      const violationsArray = detailTempViolations ? detailTempViolations.split(',').map(s => s.trim()) : [];
      onUpdate({ ...selectedStudent, achievements: achievementsArray, violations: violationsArray });
      onShowNotification("Data siswa berhasil disimpan!", 'success');
      setSelectedStudent(null);
    }
  };

  const handleChange = (field: keyof Student, value: any) => {
    if (isReadOnly) return;
    if(selectedStudent) {
      let updated = { ...selectedStudent, [field]: value };
      if (field === 'fatherName' || field === 'motherName') { const f = field === 'fatherName' ? value : updated.fatherName; const m = field === 'motherName' ? value : updated.motherName; updated.parentName = f ? f : m; }
      setSelectedStudent(updated);
    }
  };

  const [tempAchievements, setTempAchievements] = useState('');
  const [tempViolations, setTempViolations] = useState('');
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
     name: '', nis: '', nisn: '', classId: classId, gender: 'L', religion: 'Islam', birthPlace: '', birthDate: '', address: '', photo: '',
     fatherName: '', fatherJob: '', fatherEducation: '', motherName: '', motherJob: '', motherEducation: '', parentName: '', parentPhone: '', parentJob: '',
     height: 0, weight: 0, bloodType: '', healthNotes: '', hobbies: '', ambition: '', economyStatus: 'Mampu', behaviorScore: 100, attendance: {present:0, sick:0, permit:0, alpha:0}, achievements: [], violations: []
  });

  const handleSubmitNew = (e: React.FormEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    if(newStudent.name && newStudent.nis) {
       const achievementsArray = tempAchievements ? tempAchievements.split(',').map(s => s.trim()) : [];
       const violationsArray = tempViolations ? tempViolations.split(',').map(s => s.trim()) : [];
       onAdd({ ...newStudent, achievements: achievementsArray, violations: violationsArray } as Omit<Student, 'id'>);
       setIsAddModalOpen(false);
       setNewStudent({ 
         name: '', nis: '', nisn: '', classId: classId, gender: 'L', religion: 'Islam', birthPlace: '', birthDate: '', address: '', photo: '',
         fatherName: '', fatherJob: '', fatherEducation: '', motherName: '', motherJob: '', motherEducation: '', parentName: '', parentPhone: '', parentJob: '',
         height: 0, weight: 0, bloodType: '', healthNotes: '', hobbies: '', ambition: '', economyStatus: 'Mampu', behaviorScore: 100, attendance: {present:0,sick:0,permit:0,alpha:0},
         achievements: [], violations: []
       });
       setTempAchievements(''); setTempViolations(''); setAddModalTab('biodata');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.includes(searchTerm) ||
      (student.nisn && student.nisn.includes(searchTerm)) ||
      student.classId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // --- ID Card Pagination Logic ---
  const totalIdCardPages = Math.ceil(filteredStudents.length / CARDS_PER_PAGE);
  const currentIdCardStudents = useMemo(() => {
      const startIndex = (idCardPage - 1) * CARDS_PER_PAGE;
      return filteredStudents.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [filteredStudents, idCardPage]);

  // Chunk all students for printing (to ensure all pages are printed)
  const allIdCardChunks = useMemo(() => {
      const chunks = [];
      for (let i = 0; i < filteredStudents.length; i += CARDS_PER_PAGE) {
          chunks.push(filteredStudents.slice(i, i + CARDS_PER_PAGE));
      }
      return chunks;
  }, [filteredStudents]);

  const goToNextPage = () => {
      if (idCardPage < totalIdCardPages) setIdCardPage(p => p + 1);
  };

  const goToPrevPage = () => {
      if (idCardPage > 1) setIdCardPage(p => p - 1);
  };

  // Reset page when filter changes
  useEffect(() => {
      setIdCardPage(1);
  }, [searchTerm, viewType]);


  // -- RENDER --
  if (viewType === 'dashboard') {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print no-print-report">
                <div><h2 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h2><p className="text-gray-500">Statistik dan database lengkap profil siswa.</p></div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm mr-2">
                        <button onClick={() => setViewType('dashboard')} className="p-2 rounded-md transition-all bg-[#5AB2FF] text-white shadow-sm" title="Dashboard"><PieChartIcon size={18} /></button>
                        <button onClick={() => setViewType('grid')} className="p-2 rounded-md transition-all text-gray-400 hover:text-gray-600" title="Tampilan Grid"><LayoutGrid size={18} /></button>
                        <button onClick={() => setViewType('list')} className="p-2 rounded-md transition-all text-gray-400 hover:text-gray-600" title="Tampilan Tabel"><ListIcon size={18} /></button>
                        <button onClick={() => setViewType('id-cards')} className="p-2 rounded-md transition-all text-gray-400 hover:text-gray-600" title="Kartu Absensi"><IdCardIcon size={18} /></button>
                    </div>
                </div>
            </div>
            <StudentDashboard students={students} schoolProfile={schoolProfile} teacherProfile={teacherProfile} />
        </div>
    );
  }

  if (selectedStudent) {
    const completeness = calculateCompleteness(selectedStudent);
    return (
      <div className="space-y-6 animate-fade-in print-container">
        
        <CustomModal 
            isOpen={deleteModal.isOpen} 
            type="confirm" 
            message="Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan." 
            onConfirm={confirmDelete} 
            onCancel={() => setDeleteModal({isOpen: false, studentId: null})}
        />

        <div className="flex items-center justify-between no-print">
          <button onClick={() => setSelectedStudent(null)} className="flex items-center text-gray-500 hover:text-[#5AB2FF] transition-colors">
            <ArrowLeft size={20} className="mr-2" /> <span className="font-medium">Kembali ke Daftar</span>
          </button>
          <div className="flex space-x-2">
            <button onClick={handlePrint} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-[#FFF9D0] font-medium flex items-center shadow-sm">
               <Printer size={18} className="mr-2"/> Cetak Biodata
            </button>
            {!isReadOnly && (
              <>
                <button 
                    onClick={() => setDeleteModal({isOpen: true, studentId: selectedStudent.id})} 
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={handleSaveDetail} className="flex items-center bg-[#5AB2FF] text-white px-4 py-2 rounded-lg hover:bg-[#A0DEFF] font-medium shadow-sm">
                  <Save size={16} className="mr-2" /> Simpan Data
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#CAF4FF] flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 print:shadow-none print:border-none">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-[#CAF4FF]/50 flex items-center justify-center border-4 border-white shadow-md overflow-hidden print:border-gray-300">
               {selectedStudent.photo && !isPhotoError(selectedStudent.photo) ? (
                 <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="flex flex-col items-center text-center">
                    <UserCircle size={80} className="text-[#A0DEFF]" />
                 </div>
               )}
            </div>
            {!isReadOnly && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer no-print">
                <label className="cursor-pointer text-white text-xs font-bold flex flex-col items-center">
                    <Upload size={20} className="mb-1" />
                    <span>Ubah Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} />
                </label>
                </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm no-print pointer-events-none">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${getCompletenessColor(completeness)}`}>
                    {completeness}%
                </div>
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
                <input className="text-2xl font-bold text-gray-800 border-b border-dashed border-transparent hover:border-gray-300 focus:border-[#5AB2FF] outline-none w-full md:w-auto bg-transparent print:border-none" value={selectedStudent.name} onChange={(e) => handleChange('name', e.target.value)} />
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2 text-sm text-gray-500">
               <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">NIS: {selectedStudent.nis}</span>
               {selectedStudent.nisn && <span className="bg-[#CAF4FF] text-[#5AB2FF] px-3 py-1 rounded-full font-medium">NISN: {selectedStudent.nisn}</span>}
               <span className="bg-[#FFF9D0] text-amber-700 px-3 py-1 rounded-full font-medium">Kelas: {selectedStudent.classId}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 no-print">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-6">
               {[{ id: 'biodata', label: 'Biodata & Ortu', icon: User }, { id: 'health', label: 'Fisik & Kesehatan', icon: Heart }, { id: 'talents', label: 'Minat & Bakat', icon: Activity }, { id: 'economy', label: 'Sosial Ekonomi', icon: DollarSign }, { id: 'records', label: 'Prestasi & Pelanggaran', icon: AlertTriangle }].map((tab) => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#CAF4FF] text-[#5AB2FF] shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                   <tab.icon size={18} /> <span>{tab.label}</span>
                 </button>
               ))}
            </div>
          </div>
          <div className="lg:col-span-3 print:col-span-4">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px] print:shadow-none print:border-none print:p-0">
                <div className={activeTab === 'biodata' ? '' : 'hidden print:block'}><BiodataTab student={selectedStudent} onChange={handleChange} /></div>
                <div className={activeTab === 'health' ? '' : 'hidden print:block'}><HealthTab student={selectedStudent} onChange={handleChange} /></div>
                <div className={activeTab === 'talents' ? '' : 'hidden print:block'}><TalentsTab student={selectedStudent} onChange={handleChange} /></div>
                <div className={activeTab === 'economy' ? '' : 'hidden print:block'}><EconomyTab student={selectedStudent} onChange={handleChange} /></div>
                <div className={activeTab === 'records' ? '' : 'hidden print:block'}><RecordsTab student={selectedStudent} tempAchievements={detailTempAchievements} setTempAchievements={setDetailTempAchievements} tempViolations={detailTempViolations} setTempViolations={setDetailTempViolations}/></div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main List View (Grid) ---
  return (
    <div className={`space-y-6 animate-fade-in relative page-portrait`}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 no-print">
        <div><h2 className="text-2xl font-bold text-gray-800">Manajemen Siswa</h2><p className="text-gray-500">Database lengkap profil siswa.</p></div>
        <div className="flex flex-wrap gap-2 justify-end">
           <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm mr-2">
              <button onClick={() => setViewType('dashboard')} className="p-2 rounded-md transition-all text-gray-400 hover:text-gray-600" title="Dashboard"><PieChartIcon size={18} /></button>
              <button onClick={() => setViewType('grid')} className={`p-2 rounded-md transition-all ${viewType === 'grid' ? 'bg-[#5AB2FF] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="Tampilan Grid"><LayoutGrid size={18} /></button>
              <button onClick={() => setViewType('list')} className={`p-2 rounded-md transition-all ${viewType === 'list' ? 'bg-[#5AB2FF] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="Tampilan Tabel"><ListIcon size={18} /></button>
              <button onClick={() => setViewType('id-cards')} className={`p-2 rounded-md transition-all ${viewType === 'id-cards' ? 'bg-[#5AB2FF] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="Kartu Absensi"><IdCardIcon size={18} /></button>
           </div>
           
           {!isReadOnly && <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />}
           {!isReadOnly && <button onClick={handleDownloadTemplate} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><Download size={16} /> <span className="hidden sm:inline">Template</span></button>}
           {!isReadOnly && <button onClick={handleImportClick} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><Upload size={16} /> <span className="hidden sm:inline">Import</span></button>}
           <button onClick={handleExport} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><FileSpreadsheet size={16} /> <span className="hidden sm:inline">Export</span></button>
           <button onClick={handlePrint} className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"><Printer size={16} /> <span>Cetak</span></button>
           {!isReadOnly && <button onClick={() => { setIsAddModalOpen(true); setAddModalTab('biodata'); }} className="flex items-center space-x-2 bg-[#5AB2FF] hover:bg-[#A0DEFF] text-white px-4 py-2 rounded-lg transition-colors shadow-md"><Plus size={18} /><span>Tambah</span></button>}
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-sm border border-[#CAF4FF] overflow-hidden ${viewType === 'id-cards' ? 'print-container border-none shadow-none' : 'print-container'}`}>
        {viewType !== 'id-cards' && (
            <div className="p-4 border-b border-gray-100 flex items-center bg-[#CAF4FF]/20 no-print">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Cari nama, NIS, NISN, atau Kelas..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5AB2FF]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
        )}

        {viewType === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50/30">
             {filteredStudents.map((student, index) => {
                const completeness = calculateCompleteness(student);
                // Rotate colors: White, Cream, Baby Blue
                const cardVariants = [
                    'bg-white border-gray-100',
                    'bg-[#FFF9D0]/40 border-amber-100',
                    'bg-[#CAF4FF]/30 border-blue-100',
                ];
                const variant = cardVariants[index % cardVariants.length];

                return (
                <div key={student.id} onClick={() => setSelectedStudent(student)} className={`${variant} rounded-xl border shadow-sm hover:shadow-lg hover:border-[#A0DEFF] hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden`}>
                   <div className="p-5 flex items-start space-x-4">
                      <div className="relative shrink-0">
                         <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center text-2xl font-bold text-[#5AB2FF] border-2 border-white shadow-sm overflow-hidden">
                            {student.photo && !isPhotoError(student.photo) ? (
                                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                            ) : ( student.gender === 'L' ? '👦' : '👧' )}
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-gray-800 truncate text-lg group-hover:text-[#5AB2FF] transition-colors">{student.name}</h3>
                         <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="bg-white/80 text-gray-600 text-[10px] px-2 py-0.5 rounded font-mono border border-gray-200 shadow-sm flex items-center" title="NIS">
                                NIS: {student.nis}
                            </span>
                            {student.nisn && (
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-mono border border-indigo-100 shadow-sm flex items-center" title="NISN">
                                    NISN: {student.nisn}
                                </span>
                            )}
                            <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-100 shadow-sm flex items-center" title="Kelas">
                                Kls {student.classId}
                            </span>
                         </div>
                      </div>
                   </div>
                   <div className="bg-white/50 px-5 py-3 border-t border-gray-100 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-1"><span className="text-xs font-semibold text-gray-500">Kelengkapan Data</span><span className={`text-xs font-bold ${getCompletenessColor(completeness)} px-2 py-0.5 rounded`}>{completeness}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${getCompletenessBarColor(completeness)}`} style={{width: `${completeness}%`}}></div></div>
                   </div>
                </div>
             )})}
          </div>
        ) : viewType === 'id-cards' ? (
            /* ID CARD LAYOUT WRAPPER (A4 SIMULATION + PAGINATION) */
            <div className="p-0 bg-gray-200 min-h-screen flex flex-col items-center pt-8 print:p-0 print:bg-white print:block">
                <div className="no-print mb-4 text-center text-gray-500 text-sm">
                    <p className="font-bold text-gray-700">Tampilan Kartu Presensi</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                        <button onClick={() => setZoomScale(s => Math.max(0.3, s - 0.1))} className="p-1 rounded bg-white shadow border hover:bg-gray-50"><ZoomOut size={16}/></button>
                        <span className="text-xs font-mono w-12">{Math.round(zoomScale * 100)}%</span>
                        <button onClick={() => setZoomScale(s => Math.min(1.5, s + 0.1))} className="p-1 rounded bg-white shadow border hover:bg-gray-50"><ZoomIn size={16}/></button>
                    </div>
                    <p className="text-xs mt-2">Gunakan tombol di bawah untuk melihat halaman lain. Klik Cetak untuk mencetak semua halaman.</p>
                </div>
                
                <div className="scale-container w-full flex flex-col items-center print:block print:transform-none">
                    {/* SCREEN PREVIEW: Single Page (10 Cards) */}
                    <div className="sheet-wrapper print:hidden mb-4">
                        <div className="sheet-a4" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center', marginBottom: `-${(1 - zoomScale) * 40}%` }}>
                            {currentIdCardStudents.map((student) => (
                                <div key={student.id} className="id-card-container w-[90mm] h-[53mm] relative overflow-hidden bg-white border border-gray-200 shadow-sm flex flex-col rounded-xl">
                                    {/* HEADER */}
                                    <div className="h-[12mm] w-full bg-gradient-to-r from-[#5AB2FF] to-[#A0DEFF] flex flex-row items-center px-3 justify-between text-white shadow-sm">
                                        <div className="flex flex-col">
                                            <h3 className="text-[10px] font-extrabold uppercase tracking-wide leading-tight">KARTU ABSENSI</h3>
                                            <p className="text-[7px] font-medium uppercase opacity-90">{schoolProfile?.name || 'SEKOLAH DASAR'}</p>
                                        </div>
                                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    
                                    {/* BODY */}
                                    <div className="flex-1 flex items-center p-2 gap-3 bg-white relative z-10">
                                        {/* Photo Frame */}
                                        <div className="w-[20mm] h-[26mm] bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                            {student.photo && !isPhotoError(student.photo) ? (
                                                <img src={student.photo} alt="Foto" className="w-full h-full object-cover"/>
                                            ) : (
                                                <User size={24} className="text-gray-300"/>
                                            )}
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex-1 text-[9px] text-gray-800 leading-tight space-y-1.5">
                                            <div>
                                                <span className="block text-[6px] text-gray-400 font-bold uppercase tracking-wider">Nama Lengkap</span>
                                                <span className="font-bold text-[#1e3a8a] text-[10px] line-clamp-2">{student.name}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <div>
                                                    <span className="block text-[6px] text-gray-400 font-bold uppercase tracking-wider">NIS</span>
                                                    <span className="font-mono font-bold text-gray-600">{student.nis}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[6px] text-gray-400 font-bold uppercase tracking-wider">NPSN</span>
                                                    <span className="font-mono font-bold text-gray-600">{schoolProfile?.npsn || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* QR Code */}
                                        <div className="shrink-0 flex flex-col items-center justify-center">
                                            <div className="p-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                <QRCode value={student.id} size={64} style={{ height: "auto", maxWidth: "100%", width: "16mm" }} viewBox={`0 0 256 256`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* FOOTER DECORATION */}
                                    <div className="h-[3mm] w-full bg-[#FFF9D0] absolute bottom-0 left-0 z-0"></div>
                                    <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#CAF4FF] rounded-full opacity-40 z-0 pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="no-print flex items-center justify-center gap-4 py-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 fixed bottom-8 z-30 px-6">
                        <button 
                            onClick={goToPrevPage} 
                            disabled={idCardPage === 1}
                            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={24} className="text-gray-700"/>
                        </button>
                        <span className="font-bold text-gray-700 text-sm">
                            Halaman {idCardPage} / {totalIdCardPages || 1}
                        </span>
                        <button 
                            onClick={goToNextPage} 
                            disabled={idCardPage === totalIdCardPages}
                            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={24} className="text-gray-700"/>
                        </button>
                    </div>
                    
                    {/* PRINT VERSION: Loop ALL Pages (Hidden on Screen) */}
                    <div className="hidden print:block">
                        {allIdCardChunks.map((chunk, pageIndex) => (
                            <div key={pageIndex} className="sheet-a4 id-card-grid">
                                {chunk.map((student) => (
                                        <div key={student.id} className="id-card-container w-[90mm] h-[53mm] relative overflow-hidden bg-white border border-gray-200 shadow-sm flex flex-col rounded-xl break-inside-avoid page-break-inside-avoid">
                                            {/* HEADER */}
                                            <div className="h-[12mm] w-full bg-[#5AB2FF] flex flex-row items-center px-3 justify-between text-white" style={{background: '#5AB2FF', WebkitPrintColorAdjust: 'exact'}}>
                                                <div className="flex flex-col">
                                                    <h3 className="text-[10px] font-extrabold uppercase tracking-wide leading-tight">KARTU ABSENSI</h3>
                                                    <p className="text-[7px] font-medium uppercase opacity-90">{schoolProfile?.name || 'SEKOLAH DASAR'}</p>
                                                </div>
                                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                            
                                            {/* BODY */}
                                            <div className="flex-1 flex items-center p-2 gap-3 bg-white relative z-10">
                                                {/* Photo Frame */}
                                                <div className="w-[20mm] h-[26mm] bg-gray-50 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                                                    {student.photo && !isPhotoError(student.photo) ? (
                                                        <img src={student.photo} alt="Foto" className="w-full h-full object-cover"/>
                                                    ) : (
                                                        <div className="text-gray-300 text-[8px]">FOTO</div>
                                                    )}
                                                </div>
                                                
                                                {/* Info */}
                                                <div className="flex-1 text-[9px] text-gray-800 leading-tight space-y-1.5">
                                                    <div>
                                                        <span className="block text-[6px] text-gray-500 font-bold uppercase tracking-wider">Nama Lengkap</span>
                                                        <span className="font-bold text-[#1e3a8a] text-[10px] line-clamp-2">{student.name}</span>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div>
                                                            <span className="block text-[6px] text-gray-500 font-bold uppercase tracking-wider">NIS</span>
                                                            <span className="font-mono font-bold text-gray-700">{student.nis}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-[6px] text-gray-500 font-bold uppercase tracking-wider">NPSN</span>
                                                            <span className="font-mono font-bold text-gray-700">{schoolProfile?.npsn || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* QR Code */}
                                                <div className="shrink-0 flex flex-col items-center justify-center">
                                                    <div className="p-1 bg-white border border-gray-300 rounded-lg">
                                                        <QRCode value={student.id} size={64} style={{ height: "auto", maxWidth: "100%", width: "16mm" }} viewBox={`0 0 256 256`} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FOOTER DECORATION */}
                                            <div className="h-[3mm] w-full bg-[#FFF9D0] absolute bottom-0 left-0 z-0 border-t border-gray-100" style={{background: '#FFF9D0', WebkitPrintColorAdjust: 'exact'}}></div>
                                        </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
           <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#CAF4FF]/50 text-gray-700 font-medium border-b border-[#A0DEFF]">
                <tr><th className="px-4 py-3">NIS</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">L/P</th><th className="px-4 py-3">Alamat</th><th className="px-4 py-3 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className={`hover:bg-[#CAF4FF]/20 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-[#CAF4FF]/10'}`} onClick={() => setSelectedStudent(student)}>
                    <td className="px-4 py-3 font-mono text-gray-500">{student.nis}</td>
                    <td className="px-4 py-3 font-medium flex items-center">{student.photo && !isPhotoError(student.photo) && <img src={student.photo} className="w-8 h-8 rounded-full mr-3 object-cover"/>}{student.name}</td>
                    <td className="px-4 py-3">{student.gender}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]">{student.address}</td>
                    <td className="px-4 py-3 text-right"><button className="text-[#5AB2FF] hover:bg-[#CAF4FF] px-3 py-1 rounded text-xs border border-[#A0DEFF]">Detail</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
        )}
      </div>

      {isAddModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#CAF4FF]/30">
               <div><h3 className="font-bold text-xl text-gray-800">Tambah Data Siswa</h3></div>
               <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitNew} className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                       <div className="relative group w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-200">
                          {newStudent.photo ? <img src={newStudent.photo} className="w-full h-full object-cover"/> : <ImageIcon size={24} className="text-gray-400"/>}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input required className="border p-2 rounded" placeholder="Nama" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name:e.target.value})}/>
                        <input required className="border p-2 rounded" placeholder="NIS" value={newStudent.nis} onChange={e=>setNewStudent({...newStudent, nis:e.target.value})}/>
                        <input className="border p-2 rounded" placeholder="Kelas" value={newStudent.classId} onChange={e=>setNewStudent({...newStudent, classId:e.target.value})}/>
                        <select className="border p-2 rounded" value={newStudent.gender} onChange={e=>setNewStudent({...newStudent, gender:e.target.value as any})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select>
                    </div>
                </div>
            </form>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
               <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Batal</button>
               <button onClick={handleSubmitNew} className="px-5 py-2.5 rounded-lg bg-[#5AB2FF] text-white font-bold hover:bg-[#A0DEFF] shadow-md">Simpan Data Siswa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentList;
