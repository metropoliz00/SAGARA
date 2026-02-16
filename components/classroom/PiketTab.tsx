
import React, { useState, useEffect, useMemo } from 'react';
import { User, PenTool, Check, X, Save, Search, UserCircle, GripVertical, Users, Loader2 } from 'lucide-react';
import { WEEKDAYS } from '../../constants';
import { Student, PiketGroup } from '../../types';

interface PiketTabProps {
  piketGroups: PiketGroup[];
  students: Student[];
  onSave: (groups: PiketGroup[]) => void;
}

const PiketTab: React.FC<PiketTabProps> = ({ piketGroups, students, onSave }) => {
  const [localPiketGroups, setLocalPiketGroups] = useState<PiketGroup[]>(piketGroups);
  const [isSaving, setIsSaving] = useState(false);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    // Sync with parent state, but only on initial load or if parent data changes externally.
    setLocalPiketGroups(piketGroups);
  }, [piketGroups]);

  const { unassignedStudents, studentMap } = useMemo(() => {
    const assignedIds = new Set(localPiketGroups.flatMap(g => g.studentIds));
    const unassigned = students.filter(s => !assignedIds.has(s.id));
    const map = new Map(students.map(s => [s.id, s]));
    return { unassignedStudents: unassigned, studentMap: map };
  }, [students, localPiketGroups]);

  const handleDragStart = (e: React.DragEvent, studentId: string, sourceDay: string | null) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ studentId, sourceDay }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, day: string | null) => {
    e.preventDefault();
    if (dragOverDay !== day) {
        setDragOverDay(day);
    }
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };
  
  const handleDrop = (e: React.DragEvent, targetDay: string | null) => {
    e.preventDefault();
    setDragOverDay(null);
    const { studentId, sourceDay } = JSON.parse(e.dataTransfer.getData('application/json'));

    if (!studentId || sourceDay === targetDay) return;

    let newGroups = [...localPiketGroups];

    // 1. Remove from source
    if (sourceDay) {
        const sourceGroupIdx = newGroups.findIndex(g => g.day === sourceDay);
        if (sourceGroupIdx > -1) {
            newGroups[sourceGroupIdx] = {
                ...newGroups[sourceGroupIdx],
                studentIds: newGroups[sourceGroupIdx].studentIds.filter(id => id !== studentId)
            };
        }
    }

    // 2. Add to target
    if (targetDay) {
        const targetGroupIdx = newGroups.findIndex(g => g.day === targetDay);
        if (targetGroupIdx > -1) {
            if (!newGroups[targetGroupIdx].studentIds.includes(studentId)) {
                newGroups[targetGroupIdx].studentIds.push(studentId);
            }
        } else {
            newGroups.push({ day: targetDay, studentIds: [studentId] });
        }
    }
    
    setLocalPiketGroups(newGroups);
  };

  const removeStudentFromDay = (day: string, studentId: string) => {
    let newGroups = [...localPiketGroups];
    const groupIndex = newGroups.findIndex(g => g.day === day);
    if (groupIndex > -1) {
        newGroups[groupIndex].studentIds = newGroups[groupIndex].studentIds.filter(id => id !== studentId);
        setLocalPiketGroups(newGroups);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await onSave(localPiketGroups);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 print:block">
        {/* Left: Student Palette */}
        {isPanelOpen && (
          <div className="lg:w-72 shrink-0 space-y-4 no-print">
              <div 
                  className={`bg-white p-4 rounded-xl border shadow-sm flex flex-col h-full max-h-[75vh] transition-all ${dragOverDay === 'unassigned' ? 'border-indigo-400 border-dashed ring-2 ring-indigo-200' : 'border-gray-200'}`}
                  onDragOver={(e) => handleDragOver(e, 'unassigned')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, null)}
              >
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center justify-between">
                      <span className="flex items-center"><Users size={18} className="mr-2 text-indigo-600"/> Siswa Belum Piket</span>
                      <button onClick={() => setIsPanelOpen(false)} title="Tutup panel" className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700">
                          <X size={18} />
                      </button>
                  </h3>
                  <p className="text-xs text-gray-400 mb-3 border-b pb-3">Seret siswa ke kolom hari atau seret kembali ke sini untuk menghapus.</p>

                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar p-1">
                      {unassignedStudents.map(student => (
                          <div 
                              key={student.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, student.id, null)}
                              className="bg-white border border-gray-200 p-2 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
                          >
                              <div className="flex items-center space-x-2 overflow-hidden">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 ${student.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                      {student.gender}
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 truncate">{student.name}</span>
                              </div>
                              <GripVertical size={14} className="text-gray-300" />
                          </div>
                      ))}
                      {unassignedStudents.length === 0 && <p className="text-xs text-gray-400 text-center italic py-10">Semua siswa sudah mendapat jadwal.</p>}
                  </div>
              </div>
          </div>
        )}
        
        {/* Right: Piket Board */}
        <div className="flex-1 print-container">
            <div className="flex justify-between items-center mb-4 no-print">
                {!isPanelOpen && (
                    <button onClick={() => setIsPanelOpen(true)} className="flex items-center gap-2 bg-white text-indigo-600 font-bold px-4 py-2 rounded-lg shadow-md border border-indigo-100 hover:bg-indigo-50">
                        <Users size={16} /> Tampilkan Daftar Siswa
                    </button>
                )}
                <button onClick={handleSaveAll} disabled={isSaving} className={`flex items-center bg-indigo-600 text-white py-2.5 px-5 rounded-lg font-bold hover:bg-indigo-700 shadow-md justify-center disabled:opacity-50 ${!isPanelOpen ? 'ml-auto' : ''}`}>
                    {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save size={16} className="mr-2"/>} 
                    {isSaving ? 'Menyimpan...' : 'Simpan Jadwal Piket'}
                </button>
            </div>
            
            <div className="hidden print-only text-center mb-6">
                <h2 className="text-xl font-bold uppercase">JADWAL PIKET KELAS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3">
                {WEEKDAYS.map((day, idx) => {
                    const group = localPiketGroups.find(g => g.day === day);
                    const members = group ? group.studentIds : [];
                    
                    // Theme Based Colors (Ocean, Sky, Cream, Baby Blue)
                    const colors = ['bg-[#5AB2FF]','bg-[#A0DEFF]','bg-[#FFF9D0]','bg-[#CAF4FF]'];
                    const textColors = ['text-white','text-white','text-amber-900','text-blue-900'];
                    const borderColors = ['border-blue-200', 'border-sky-200', 'border-amber-200', 'border-blue-100'];
                    
                    const i = idx % colors.length;
                    const colorClass = colors[i];
                    const textColorClass = textColors[i];
                    const borderColor = borderColors[i];
                    
                    return (
                        <div 
                            key={day} 
                            className={`bg-white rounded-xl border ${borderColor} shadow-sm overflow-hidden print:border-black flex flex-col h-full hover:shadow-md transition-shadow`}
                        >
                            <div className={`${colorClass} ${textColorClass} p-3 flex items-center justify-between print:bg-white print:text-black print:border-b print:border-black`}>
                                <h3 className="font-bold text-lg">{day}</h3>
                                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-mono print:border print:border-black">{members.length}</span>
                            </div>
                            <div 
                                className={`p-4 flex-1 bg-gradient-to-b from-white to-gray-50/50 space-y-3 transition-all ${dragOverDay === day ? 'bg-indigo-50 border-2 border-dashed border-indigo-400' : ''}`}
                                onDragOver={(e) => handleDragOver(e, day)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, day)}
                            >
                                {members.length > 0 ? members.map(studentId => {
                                    const student = studentMap.get(studentId);
                                    if (!student) return null;
                                    return (
                                        <div 
                                            key={studentId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, studentId, day)}
                                            className="relative group flex items-center text-sm text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing print:border-none print:shadow-none print:p-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden shrink-0 border border-gray-300 print:hidden">
                                                {student.photo && !student.photo.startsWith('ERROR') ? (
                                                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={14}/></div>
                                                )}
                                            </div>
                                            <span className="font-medium truncate">{student.name}</span>
                                            <button 
                                                onClick={() => removeStudentFromDay(day, student.id)}
                                                className="absolute top-1 right-1 w-4 h-4 bg-black/10 text-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity no-print"
                                            >
                                                <X size={10}/>
                                            </button>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-xs text-gray-400 italic text-center py-6 border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center">
                                        Area Lepas
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default PiketTab;
