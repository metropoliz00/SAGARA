
import React, { useState, useEffect, useMemo } from 'react';
import { LearningJournalEntry, ScheduleItem } from '../types';
import { apiService } from '../services/apiService';
import { 
  Save, Calendar, Printer, Plus, Trash2, Loader2, 
  ChevronLeft, ChevronRight, NotebookPen, RefreshCw,
  LayoutList, CalendarRange, Coffee
} from 'lucide-react';

interface LearningJournalViewProps {
  classId: string;
  isReadOnly?: boolean;
  targetDate?: string | null;
  onSaveBatch?: (entries: Partial<LearningJournalEntry>[]) => Promise<void>;
}

const WEEKDAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const LearningJournalView: React.FC<LearningJournalViewProps> = ({ classId, isReadOnly, targetDate, onSaveBatch }) => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [entries, setEntries] = useState<LearningJournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // Handle Target Date Navigation
  useEffect(() => {
      if (targetDate) {
          setCurrentDate(targetDate);
          setViewMode('daily'); // Force switch to daily view to see the specific date
      }
  }, [targetDate]);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [journalData, configData] = await Promise.all([
        apiService.getLearningJournal(classId),
        apiService.getClassConfig(classId)
      ]);
      setEntries(journalData);
      setSchedule(configData.schedule || []);
    } catch (e) {
      console.error("Failed to load journal data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) loadData();
  }, [classId]);

  // --- Helper Functions ---

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return WEEKDAYS_ID[d.getDay()];
  };

  const getEntriesForDate = (dateStr: string) => {
    return entries.filter(e => e.date === dateStr);
  };

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  }

  const getSaturday = (monday: Date) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + 5);
      return date;
  }

  // --- Weekly Logic ---
  
  const currentMonday = useMemo(() => getMonday(new Date(currentDate)), [currentDate]);
  const currentSaturday = useMemo(() => getSaturday(currentMonday), [currentMonday]);
  
  const weekDates = useMemo(() => {
      const days = [];
      for(let i=0; i<6; i++) { // Mon-Sat
          const d = new Date(currentMonday);
          d.setDate(currentMonday.getDate() + i);
          days.push(d.toISOString().split('T')[0]);
      }
      return days;
  }, [currentMonday]);

  // Logic to merge Schedule with Entries for a SPECIFIC date
  const getRowsForDate = (targetDate: string) => {
    const dayName = getDayName(targetDate);
    const existingEntries = getEntriesForDate(targetDate);
    
    // Subjects scheduled for that day
    const scheduledToday = schedule.filter(s => s.day === dayName);
    
    const rows: Partial<LearningJournalEntry>[] = [...existingEntries];

    scheduledToday.forEach(sch => {
        const covered = existingEntries.some(e => e.subject === sch.subject && e.timeSlot === sch.time);
        if (!covered) {
            rows.push({
                id: `temp-${targetDate}-${sch.id}`, 
                classId,
                date: targetDate,
                day: dayName,
                timeSlot: sch.time,
                subject: sch.subject,
                topic: '',
                activities: '',
                evaluation: '',
                reflection: '',
                followUp: ''
            });
        }
    });

    return rows.sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
  };

  // --- Daily Logic (Draft State) ---
  const activeRows = useMemo(() => getRowsForDate(currentDate), [currentDate, entries, schedule, classId]);
  
  const [draftData, setDraftData] = useState<Partial<LearningJournalEntry>[]>([]);

  useEffect(() => {
      setDraftData(activeRows);
  }, [activeRows]);

  const updateDraft = (index: number, field: keyof LearningJournalEntry, value: string) => {
      if (isReadOnly) return;
      const newData = [...draftData];
      newData[index] = { ...newData[index], [field]: value };
      setDraftData(newData);
  };

  const addManualRow = () => {
      if (isReadOnly) return;
      const dayName = getDayName(currentDate);
      setDraftData([
          ...draftData,
          {
              id: `manual-${Date.now()}`,
              classId,
              date: currentDate,
              day: dayName,
              subject: '',
              timeSlot: '',
              topic: '',
              activities: '',
              evaluation: '',
              reflection: '',
              followUp: ''
          }
      ]);
  };

  const removeRow = async (index: number) => {
      if (isReadOnly) return;
      const row = draftData[index];
      if (row.id && !row.id.startsWith('temp-') && !row.id.startsWith('manual-')) {
          if (confirm("Hapus jurnal tersimpan ini?")) {
              await apiService.deleteLearningJournal(row.id, classId);
              setEntries(prev => prev.filter(e => e.id !== row.id));
          }
      } else {
          const newData = [...draftData];
          newData.splice(index, 1);
          setDraftData(newData);
      }
  };

  const handleSave = async () => {
      if (isReadOnly) return;
      setSaving(true);
      try {
          const validRows = draftData.filter(d => d.subject && d.subject.trim() !== '');
          
          if (onSaveBatch) {
              await onSaveBatch(validRows);
          } else {
              await apiService.saveLearningJournalBatch(validRows);
              alert('Jurnal berhasil disimpan.');
          }
          
          const newJournalData = await apiService.getLearningJournal(classId);
          setEntries(newJournalData);
      } catch (e) {
          console.error(e);
          if (!onSaveBatch) alert('Gagal menyimpan jurnal.');
      } finally {
          setSaving(false);
      }
  };

  const handlePrint = () => window.print();

  // Navigation Handlers
  const handlePrev = () => {
      const d = new Date(currentDate);
      if (viewMode === 'daily') d.setDate(d.getDate() - 1);
      else d.setDate(d.getDate() - 7);
      setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
      const d = new Date(currentDate);
      if (viewMode === 'daily') d.setDate(d.getDate() + 1);
      else d.setDate(d.getDate() + 7);
      setCurrentDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <NotebookPen className="mr-2 text-indigo-600" /> Jurnal Pembelajaran
                </h2>
                <p className="text-gray-500 text-sm">Catatan harian aktivitas belajar mengajar di kelas.</p>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <button 
                    onClick={() => setViewMode('daily')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'daily' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <LayoutList size={16} className="mr-2"/> Harian
                </button>
                <button 
                    onClick={() => setViewMode('weekly')}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'weekly' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <CalendarRange size={16} className="mr-2"/> Mingguan
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={loadData} 
                    className="p-2 text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    title="Refresh Data"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                    <Printer size={18}/> Cetak
                </button>
            </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 no-print">
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button onClick={handlePrev} className="p-1 hover:bg-white rounded shadow-sm transition-colors text-gray-600 hover:text-indigo-600"><ChevronLeft size={20}/></button>
                    
                    <div className="relative mx-2 group">
                        {/* Hidden Input for Date Selection Flexibility */}
                        <input 
                            type="date" 
                            value={currentDate} 
                            onChange={(e) => setCurrentDate(e.target.value)} 
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            title="Klik untuk memilih tanggal"
                        />
                        <div className="mx-2 text-sm font-bold text-gray-700 min-w-[200px] text-center px-4 py-1.5 rounded group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors flex items-center justify-center border border-transparent group-hover:border-indigo-100">
                            <Calendar size={14} className="mr-2 opacity-50 group-hover:opacity-100"/>
                            {viewMode === 'daily' ? (
                                <>
                                    <span className="text-indigo-600 mr-2">{getDayName(currentDate)},</span>
                                    {new Date(currentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </>
                            ) : (
                                <>
                                    {currentMonday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {currentSaturday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </>
                            )}
                        </div>
                    </div>
                    
                    <button onClick={handleNext} className="p-1 hover:bg-white rounded shadow-sm transition-colors text-gray-600 hover:text-indigo-600"><ChevronRight size={20}/></button>
                </div>
            </div>

            {viewMode === 'daily' && (
                <div className="flex gap-2">
                    {!isReadOnly && (
                        <button onClick={addManualRow} className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 font-bold text-sm transition-colors">
                            <Plus size={16}/> Tambah Baris
                        </button>
                    )}
                    {!isReadOnly && (
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-md disabled:opacity-50 transition-all hover:shadow-lg transform active:scale-95">
                            {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                            Simpan Jurnal
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* --- DAILY VIEW --- */}
        {viewMode === 'daily' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto print-container">
                <div className="hidden print-only p-4 text-center border-b">
                    <h2 className="text-xl font-bold uppercase">JURNAL PEMBELAJARAN KELAS</h2>
                    <p className="text-sm">Hari/Tanggal: {getDayName(currentDate)}, {new Date(currentDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </div>

                <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50 text-gray-700 font-bold uppercase text-xs print:bg-white print:border-b print:text-black">
                            <th className="p-3 border text-center w-10">No</th>
                            <th className="p-3 border w-32 min-w-[120px]">Jam</th>
                            <th className="p-3 border w-48">Mata Pelajaran</th>
                            <th className="p-3 border w-48">Materi / Topik</th>
                            <th className="p-3 border min-w-[200px]">Kegiatan Pembelajaran</th>
                            <th className="p-3 border w-32">Evaluasi</th>
                            <th className="p-3 border w-32">Refleksi</th>
                            <th className="p-3 border w-32">Tindak Lanjut</th>
                            {!isReadOnly && <th className="p-3 border w-10 text-center no-print"></th>}
                        </tr>
                    </thead>
                    <tbody className="align-top">
                        {draftData.length === 0 ? (
                            <tr><td colSpan={9} className="p-8 text-center text-gray-400 italic">Tidak ada jadwal atau jurnal untuk hari ini.</td></tr>
                        ) : (
                            draftData.map((row, idx) => {
                                const isBreak = row.subject?.toLowerCase().includes('istirahat');
                                return (
                                <tr key={row.id || idx} className={`transition-colors print:break-inside-avoid ${isBreak ? 'bg-orange-50/60' : 'hover:bg-indigo-50/20'}`}>
                                    <td className="p-3 border text-center text-gray-500">{idx + 1}</td>
                                    <td className="p-3 border">
                                        <input 
                                            value={row.timeSlot || ''}
                                            onChange={e => updateDraft(idx, 'timeSlot', e.target.value)}
                                            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 font-medium"
                                            placeholder="07.00 - ..."
                                            disabled={isReadOnly}
                                        />
                                    </td>
                                    <td className="p-3 border font-semibold">
                                        <div className="flex items-center">
                                            {isBreak && <Coffee size={14} className="mr-2 text-orange-600 no-print"/>}
                                            <input 
                                                value={row.subject || ''}
                                                onChange={e => updateDraft(idx, 'subject', e.target.value)}
                                                className={`w-full bg-transparent outline-none text-gray-800 placeholder-gray-300 font-bold ${isBreak ? 'text-orange-700' : ''}`}
                                                placeholder="Mapel..."
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3 border">
                                        <textarea 
                                            value={row.topic || ''}
                                            onChange={e => updateDraft(idx, 'topic', e.target.value)}
                                            className="w-full bg-transparent outline-none resize-none text-gray-700 placeholder-gray-300 h-full min-h-[40px]"
                                            placeholder="Tulis materi..."
                                            rows={2}
                                            disabled={isReadOnly}
                                        />
                                    </td>
                                    <td className="p-3 border">
                                        <textarea 
                                            value={row.activities || ''}
                                            onChange={e => updateDraft(idx, 'activities', e.target.value)}
                                            className="w-full bg-transparent outline-none resize-none text-gray-700 placeholder-gray-300 h-full min-h-[40px]"
                                            placeholder="Deskripsi kegiatan..."
                                            rows={3}
                                            disabled={isReadOnly}
                                        />
                                    </td>
                                    <td className="p-3 border">
                                        <textarea 
                                            value={row.evaluation || ''}
                                            onChange={e => updateDraft(idx, 'evaluation', e.target.value)}
                                            className="w-full bg-transparent outline-none resize-none text-gray-700 placeholder-gray-300 h-full min-h-[40px]"
                                            placeholder="Hasil..."
                                            rows={2}
                                            disabled={isReadOnly}
                                        />
                                    </td>
                                    <td className="p-3 border">
                                        <textarea 
                                            value={row.reflection || ''}
                                            onChange={e => updateDraft(idx, 'reflection', e.target.value)}
                                            className="w-full bg-transparent outline-none resize-none text-gray-700 placeholder-gray-300 h-full min-h-[40px]"
                                            placeholder="Catatan..."
                                            rows={2}
                                            disabled={isReadOnly}
                                        />
                                    </td>
                                    <td className="p-3 border">
                                        <textarea 
                                            value={row.followUp || ''}
                                            onChange={e => updateDraft(idx, 'followUp', e.target.value)}
                                            className="w-full bg-transparent outline-none resize-none text-gray-700 placeholder-gray-300 h-full min-h-[40px]"
                                            placeholder="Rencana..."
                                            rows={2}
                                            disabled={isReadOnly}
                                        />
                                    </td>
                                    {!isReadOnly && (
                                        <td className="p-3 border text-center no-print align-middle">
                                            <button onClick={() => removeRow(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- WEEKLY VIEW --- */}
        {viewMode === 'weekly' && (
            <div className="space-y-8 print-container">
                <div className="hidden print-only text-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold uppercase">JURNAL PEMBELAJARAN MINGGUAN</h2>
                    <p className="text-sm uppercase">PERIODE: {currentMonday.toLocaleDateString('id-ID', {day:'numeric', month:'long'})} - {currentSaturday.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                </div>

                {weekDates.map((dateStr) => {
                    const dayName = getDayName(dateStr);
                    const rows = getRowsForDate(dateStr);
                    
                    if (rows.length === 0) return null;

                    return (
                        <div key={dateStr} className="break-inside-avoid">
                            <div className="bg-indigo-50 px-4 py-2 border border-indigo-100 rounded-t-xl font-bold text-indigo-800 text-sm flex justify-between items-center print:bg-gray-100 print:text-black print:border-gray-400">
                                <span>{dayName}, {new Date(dateStr).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</span>
                            </div>
                            <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm overflow-hidden mb-6 print:border-gray-400 print:shadow-none">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-white border-b border-gray-100 text-gray-500 print:border-gray-400 print:text-black">
                                        <tr>
                                            <th className="p-2 w-32 min-w-[120px]">Jam</th>
                                            <th className="p-2 w-48">Mata Pelajaran</th>
                                            <th className="p-2 w-48">Materi</th>
                                            <th className="p-2">Kegiatan Pembelajaran</th>
                                            <th className="p-2 w-32">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 print:divide-gray-400">
                                        {rows.map((row, rIdx) => {
                                            const isBreak = row.subject?.toLowerCase().includes('istirahat');
                                            return (
                                            <tr key={rIdx} className={isBreak ? 'bg-orange-50/60' : ''}>
                                                <td className="p-2 align-top text-gray-500">{row.timeSlot || '-'}</td>
                                                <td className={`p-2 align-top font-semibold ${isBreak ? 'text-orange-700' : ''}`}>
                                                    {isBreak && <Coffee size={12} className="inline mr-1 text-orange-600 no-print"/>}
                                                    {row.subject}
                                                </td>
                                                <td className="p-2 align-top">{row.topic || '-'}</td>
                                                <td className="p-2 align-top">{row.activities || '-'}</td>
                                                <td className="p-2 align-top italic text-gray-500">
                                                    {row.followUp ? `TL: ${row.followUp}` : row.reflection ? `Ref: ${row.reflection}` : '-'}
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
                {weekDates.every(d => getRowsForDate(d).length === 0) && (
                    <div className="text-center py-12 text-gray-400 italic bg-gray-50 rounded-xl border-dashed border-2">
                        Tidak ada data jurnal atau jadwal untuk minggu ini.
                    </div>
                )}
            </div>
        )}
        
        {/* Footer info */}
        {viewMode === 'daily' && (
            <div className="mt-4 text-xs text-gray-400 italic no-print flex items-center gap-2">
                <span>* Mata pelajaran otomatis terisi sesuai jadwal hari ini ({getDayName(currentDate)}). Anda dapat menambah baris manual jika diperlukan.</span>
            </div>
        )}
    </div>
  );
};

export default LearningJournalView;
