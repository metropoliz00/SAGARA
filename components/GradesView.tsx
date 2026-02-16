
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student, GradeRecord, GradeData, Subject } from '../types';
import { MOCK_SUBJECTS } from '../constants';
import { apiService } from '../services/apiService';
import * as XLSX from 'xlsx';
import { Save, FileSpreadsheet, Printer, Upload, Download, Calculator, CheckCircle, AlertCircle, Settings2, Lock, ChevronDown } from 'lucide-react';

interface GradesViewProps {
  students: Student[];
  initialGrades: GradeRecord[];
  onSave: (studentId: string, subjectId: string, data: GradeData, classId: string) => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
  classId: string;
  isReadOnly?: boolean;
  allowedSubjects?: string[];
}

const GradesView: React.FC<GradesViewProps> = ({ 
  students, initialGrades, onSave, onShowNotification, classId, 
  isReadOnly = false, allowedSubjects = ['all'] 
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(MOCK_SUBJECTS[0].id);
  const [grades, setGrades] = useState<GradeRecord[]>(initialGrades);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [kktpMap, setKktpMap] = useState<Record<string, number>>({});
  const [isSavingKktp, setIsSavingKktp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setGrades(initialGrades); }, [initialGrades]);

  useEffect(() => {
    const loadKktp = async () => {
      try {
        const config = await apiService.getClassConfig(classId);
        if (config && config.kktp) {
           setKktpMap(config.kktp);
        } else {
           const defaults: Record<string, number> = {};
           MOCK_SUBJECTS.forEach((s: Subject) => { defaults[s.id] = s.kkm; });
           setKktpMap(defaults);
        }
      } catch (e) {
        console.error("Gagal memuat KKTP", e);
      }
    };
    if (classId) loadKktp();
  }, [classId]);

  // --- ACCESS CHECK HELPER ---
  const isSubjectEditable = useMemo(() => {
      if (isReadOnly) return false; 
      if (!allowedSubjects || allowedSubjects.includes('all')) return true; 
      return allowedSubjects.includes(selectedSubject);
  }, [isReadOnly, allowedSubjects, selectedSubject]);


  const activeSubject = useMemo(() => MOCK_SUBJECTS.find((s: Subject) => s.id === selectedSubject), [selectedSubject]);
  const currentKktp = kktpMap[selectedSubject] || activeSubject?.kkm || 75;

  const handleKktpChange = (newVal: number) => {
    if (!isSubjectEditable) return;
    setKktpMap(prev => ({...prev, [selectedSubject]: newVal}));
  };

  const saveKktp = async () => {
    if (!isSubjectEditable) return;
    setIsSavingKktp(true);
    try {
      await apiService.saveClassConfig('KKTP', kktpMap, classId);
      onShowNotification(`KKTP untuk ${activeSubject?.name} berhasil diperbarui menjadi ${currentKktp}`, 'success');
    } catch (e) {
      onShowNotification("Gagal menyimpan KKTP", 'error');
    } finally {
      setIsSavingKktp(false);
    }
  };

  const getStudentGrade = (studentId: string): GradeData => {
    const record = grades.find(g => g.studentId === studentId);
    return record?.subjects[selectedSubject] || { sum1: 0, sum2: 0, sum3: 0, sum4: 0, sas: 0 };
  };

  const updateLocalGrade = (studentId: string, field: keyof GradeData, value: number) => {
    if (!isSubjectEditable) return;
    const val = Math.min(100, Math.max(0, value));
    setGrades(prevGrades => {
        const newGrades = [...prevGrades];
        let record = newGrades.find(g => g.studentId === studentId);
        if (!record) {
          record = { studentId, classId, subjects: {} };
          newGrades.push(record);
        }
        if (!record.subjects[selectedSubject]) {
          record.subjects[selectedSubject] = { sum1: 0, sum2: 0, sum3: 0, sum4: 0, sas: 0 };
        }
        record.subjects[selectedSubject] = { ...record.subjects[selectedSubject], [field]: val };
        return newGrades;
    });
  };
  
  const calculateFinalAverage = (g: GradeData) => {
    const scores = [g.sum1, g.sum2, g.sum3, g.sum4, g.sas];
    const filledScores = scores.filter(s => s > 0);
    if (filledScores.length === 0) return 0;
    const sum = filledScores.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / filledScores.length);
  };

  const handleSaveRow = (studentId: string) => {
    if (!isSubjectEditable) return;
    const gradeData = getStudentGrade(studentId);
    onSave(studentId, selectedSubject, gradeData, classId);
    onShowNotification('Nilai individu berhasil disimpan!', 'success');
  };

  const handleSaveAll = async () => {
    if (!isSubjectEditable) return;
    if (!confirm(`Simpan seluruh nilai untuk mata pelajaran ${activeSubject?.name}?`)) return;
    setIsSavingAll(true);
    try {
        for (const student of students) {
            const gradeData = getStudentGrade(student.id);
            await onSave(student.id, selectedSubject, gradeData, classId);
        }
        onShowNotification('Seluruh data nilai kelas berhasil disinkronkan!', 'success');
    } catch (e) {
        onShowNotification('Gagal menyimpan beberapa data. Cek koneksi Anda.', 'error');
    } finally {
        setIsSavingAll(false);
    }
  };

  const handlePrint = () => window.print();
  const handleDownloadTemplate = () => { 
      const headers = ["NIS", "Nama Siswa", "Mata Pelajaran(ID)", "SUM 1", "SUM 2", "SUM 3", "SUM 4", "SAS"];
      const example = ["2024001", "Contoh Siswa", selectedSubject, "80", "85", "90", "88", "85"];
      const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template Nilai");
      XLSX.writeFile(workbook, `template_nilai_${selectedSubject}.xlsx`);
  };
  
  const handleExport = () => { 
      const subjectName = activeSubject?.name || selectedSubject;
      const headers = ["NIS", "Nama Siswa", "Mata Pelajaran", "SUM 1", "SUM 2", "SUM 3", "SUM 4", "SAS", "Nilai Akhir", "Status"];
      const rows = students.map(s => {
         const g = getStudentGrade(s.id);
         const avg = calculateFinalAverage(g);
         const status = avg >= currentKktp ? 'Tuntas' : 'Belum Tuntas';
         return [s.nis, s.name, subjectName, g.sum1, g.sum2, g.sum3, g.sum4, g.sas, avg, status];
      });
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Nilai ${selectedSubject}`);
      XLSX.writeFile(workbook, `nilai_${selectedSubject}.xlsx`);
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
        let updateCount = 0;
        rows.forEach((row) => {
          if (!row || row.length === 0) return;
          const nis = row[0] ? String(row[0]) : '';
          const student = students.find(s => s.nis === nis);
          if (student) {
              const newData = {
                  sum1: Number(row[3]) || 0,
                  sum2: Number(row[4]) || 0,
                  sum3: Number(row[5]) || 0,
                  sum4: Number(row[6]) || 0,
                  sas: Number(row[7]) || 0,
              };
              onSave(student.id, selectedSubject, newData, classId);
              updateCount++;
          }
        });
        onShowNotification(`Berhasil memproses impor untuk ${updateCount} siswa. Data sedang disimpan...`, 'success');
        if(fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-fade-in page-landscape">
       <div className="flex flex-col xl:flex-row justify-between gap-4 no-print">
          <div>
             <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                {isReadOnly ? 'Lihat Nilai Saya' : `Input Nilai ${activeSubject?.name}`}
                {!isSubjectEditable && !isReadOnly && <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200 flex items-center"><Lock size={12} className="mr-1"/> Read Only</span>}
             </h2>
             <p className="text-gray-500 text-sm">
                {isReadOnly ? 'Pantau perkembangan nilai akademik Anda.' : `Kelola nilai sumatif & formatif. Ambang batas (KKTP): ${currentKktp}.`}
             </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
              {/* KKTP Section */}
              <div className="flex items-center bg-white border border-indigo-100 p-1 rounded-xl shadow-sm">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mr-2"> <Settings2 size={16} /> </div>
                  <div className="flex flex-col mr-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">KKTP</span>
                      {!isSubjectEditable ? (
                          <span className="font-bold text-indigo-700">{currentKktp}</span>
                      ) : (
                          <input type="number" min="0" max="100" value={currentKktp} onChange={(e) => handleKktpChange(Number(e.target.value))} className="w-16 font-bold text-indigo-700 outline-none bg-transparent"/>
                      )}
                  </div>
                  {isSubjectEditable && (
                    <button onClick={saveKktp} disabled={isSavingKktp} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {isSavingKktp ? '...' : 'Simpan'}
                    </button>
                  )}
              </div>

              {isSubjectEditable && <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />}
              
              {/* Subject Selection - Dropdown */}
              <div className="relative">
                  <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm cursor-pointer min-w-[200px]"
                  >
                      {MOCK_SUBJECTS.map((s: Subject) => (
                          <option key={s.id} value={s.id}>
                              {s.name}
                          </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <ChevronDown size={16} />
                  </div>
              </div>

              <div className="flex gap-1">
                {isSubjectEditable && (
                    <button onClick={handleSaveAll} disabled={isSavingAll} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-md font-bold disabled:opacity-50">
                        <Save size={18}/> <span className="hidden sm:inline">{isSavingAll ? 'Proses...' : 'Simpan Semua'}</span>
                    </button>
                )}
                {isSubjectEditable && <button onClick={handleImportClick} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50" title="Import Excel"><Upload size={18}/></button>}
                <button onClick={handleExport} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50" title="Export Excel"><FileSpreadsheet size={18}/></button>
                <button onClick={handlePrint} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50" title="Cetak"><Printer size={18}/></button>
              </div>
          </div>
       </div>

       <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto print-container">
          <table className="w-full text-sm text-left border-collapse">
             <thead className="bg-slate-50 text-slate-700 font-bold print:bg-white print:border-b print:text-black">
                <tr className="border-b">
                   <th className="p-4 sticky left-0 bg-slate-50 print:bg-white min-w-[220px] border-r">Nama Siswa</th>
                   <th className="p-2 w-20 text-center border-r">SUM 1</th>
                   <th className="p-2 w-20 text-center border-r">SUM 2</th>
                   <th className="p-2 w-20 text-center border-r">SUM 3</th>
                   <th className="p-2 w-20 text-center border-r">SUM 4</th>
                   <th className="p-2 w-24 text-center border-r bg-blue-50/50 print:bg-white">SAS</th>
                   <th className="p-2 w-28 text-center bg-indigo-600 text-white print:bg-white print:text-black border-l">Nilai Akhir</th>
                   {isSubjectEditable && <th className="p-2 w-16 text-center no-print">Aksi</th>}
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                {students.map(s => {
                   const g = getStudentGrade(s.id);
                   const finalAvg = calculateFinalAverage(g);
                   const isBelowKkpt = finalAvg > 0 && finalAvg < currentKktp;
                   
                   return (
                      <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors print:hover:bg-transparent border-b">
                         <td className="p-4 sticky left-0 bg-white font-medium print:text-black border-r whitespace-nowrap">
                            <div className="flex flex-col">
                                <span>{s.name}</span>
                                <div className="flex gap-2 text-[10px] text-gray-400 no-print">
                                    <span>NIS: {s.nis}</span>
                                    {s.nisn && <span>• NISN: {s.nisn}</span>}
                                </div>
                            </div>
                         </td>
                         {(['sum1','sum2','sum3','sum4','sas'] as (keyof GradeData)[]).map(f => (
                            <td key={String(f)} className={`p-2 border-r ${f === 'sas' ? 'bg-blue-50/30 print:bg-white' : ''}`}>
                                {!isSubjectEditable ? (
                                    <div className="w-full text-center py-1.5 font-bold text-gray-700">{g[f] || '-'}</div>
                                ) : (
                                    <input type="number" min="0" max="100" value={g[f]||0} onChange={e=>updateLocalGrade(s.id, f, Number(e.target.value))} className={`w-full text-center py-1.5 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none rounded bg-transparent print:border-none print:p-0 ${f === 'sas' ? 'font-bold' : ''}`}/>
                                )}
                            </td>
                         ))}
                         <td className={`p-2 text-center border-l font-black text-lg ${isBelowKkpt ? 'bg-rose-50 text-rose-600' : finalAvg >= currentKktp ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'} print:bg-white print:text-black`}>
                            <div className="flex flex-col items-center">
                                <span>{finalAvg > 0 ? finalAvg : '-'}</span>
                                {isBelowKkpt && <span className="text-[9px] font-bold uppercase no-print">Remedial</span>}
                            </div>
                         </td>
                         {isSubjectEditable && (
                            <td className="p-2 text-center no-print">
                                <button onClick={()=>handleSaveRow(s.id)} className="text-gray-400 hover:text-emerald-600 transition-colors" title="Simpan Baris"><Save size={18}/></button>
                            </td>
                         )}
                      </tr>
                   );
                })}
             </tbody>
          </table>
       </div>
       <div className="flex flex-wrap items-center gap-4 text-xs no-print">
          <div className="flex items-center text-gray-400 italic"> <Calculator size={12} className="mr-1" /> Nilai Akhir = Rata-rata dari kolom yang terisi. </div>
          <div className="flex items-center text-rose-500 font-bold"> <AlertCircle size={12} className="mr-1" /> Merah = Di bawah KKTP ({currentKktp}). </div>
          <div className="flex items-center text-emerald-500 font-bold"> <CheckCircle size={12} className="mr-1" /> Hijau = Tuntas. </div>
          {!isSubjectEditable && !isReadOnly && (
              <div className="flex items-center text-indigo-600 font-bold ml-auto bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  <Lock size={12} className="mr-1" /> Akses Terbatas (Hanya Guru Mapel Terkait)
              </div>
          )}
       </div>
    </div>
  );
};
export default GradesView;
