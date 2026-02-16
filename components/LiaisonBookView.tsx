
import React, { useState, useMemo } from 'react';
import { LiaisonLog, Student } from '../types';
import { Search, CheckCircle, XCircle, Clock, Filter, BookOpen, CheckSquare } from 'lucide-react';

interface LiaisonBookViewProps {
  logs: LiaisonLog[];
  students: Student[];
  onReply: (log: Omit<LiaisonLog, 'id'>) => Promise<void>;
  onUpdateStatus: (ids: string[], status: 'Diterima' | 'Ditolak' | 'Selesai') => Promise<void>;
  classId: string;
}

const LiaisonBookView: React.FC<LiaisonBookViewProps> = ({ logs, students, onUpdateStatus, classId }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Diterima' | 'Ditolak' | 'Selesai'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Enrich logs with student names
  const enrichedLogs = useMemo(() => {
    return logs.map(log => {
      const student = students.find(s => s.id === log.studentId);
      return {
        ...log,
        studentName: student ? student.name : 'Siswa Tidak Dikenal',
        studentNis: student ? student.nis : '',
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, students]);

  const filteredLogs = useMemo(() => {
    return enrichedLogs.filter(log => {
      const matchSearch = log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (log.category && log.category.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = filterStatus === 'all' || (log.status || 'Pending') === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [enrichedLogs, searchTerm, filterStatus]);

  const handleStatusChange = async (id: string, newStatus: 'Diterima' | 'Ditolak' | 'Selesai') => {
      if (confirm(`Ubah status laporan menjadi ${newStatus}?`)) {
          await onUpdateStatus([id], newStatus);
      }
  };

  const getStatusBadge = (status?: string) => {
      switch(status) {
          case 'Diterima': return <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full flex items-center border border-blue-200"><CheckCircle size={12} className="mr-1"/> Diterima</span>;
          case 'Ditolak': return <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full flex items-center border border-red-200"><XCircle size={12} className="mr-1"/> Ditolak</span>;
          case 'Selesai': return <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center border border-emerald-200"><CheckSquare size={12} className="mr-1"/> Selesai</span>;
          default: return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full flex items-center border border-amber-200"><Clock size={12} className="mr-1"/> Pending</span>;
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header & Filter */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 className="font-bold text-gray-800 flex items-center text-lg">
                    <BookOpen size={20} className="mr-2 text-indigo-600"/> Buku Penghubung
                </h3>
                <p className="text-sm text-gray-500">Kelola laporan dan masukan dari wali murid.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input 
                        type="text" 
                        placeholder="Cari siswa / kategori..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="relative">
                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full sm:w-auto pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Diterima">Diterima</option>
                        <option value="Ditolak">Ditolak</option>
                        <option value="Selesai">Selesai</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Ticket Grid */}
        <div className="grid grid-cols-1 gap-4">
            {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    Tidak ada laporan yang ditemukan.
                </div>
            ) : (
                filteredLogs.map(log => (
                    <div key={log.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 md:items-start">
                        {/* Left: Info */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-800">{log.studentName}</h4>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">{log.studentNis}</span>
                                </div>
                                <span className="text-xs text-gray-400 flex items-center shrink-0">
                                    {new Date(log.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                                </span>
                            </div>
                            
                            <div className="mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Permasalahan / Kategori</span>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-medium">
                                        {log.category || 'Umum'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                                    {log.message}
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500">Status:</span>
                                    {getStatusBadge(log.status)}
                                </div>
                                <span className="text-[10px] text-gray-400 italic">Dari: {log.sender}</span>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 md:w-32 shrink-0 justify-center">
                            {(log.status === 'Pending' || !log.status) && (
                                <>
                                    <button onClick={() => handleStatusChange(log.id, 'Diterima')} className="flex-1 py-1.5 px-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200">
                                        Terima
                                    </button>
                                    <button onClick={() => handleStatusChange(log.id, 'Ditolak')} className="flex-1 py-1.5 px-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-200">
                                        Tolak
                                    </button>
                                </>
                            )}
                            {log.status === 'Diterima' && (
                                <button onClick={() => handleStatusChange(log.id, 'Selesai')} className="w-full py-2 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                                    Tandai Selesai
                                </button>
                            )}
                            {log.status === 'Selesai' && (
                                <div className="text-center text-xs text-emerald-600 font-medium py-2 bg-emerald-50 rounded-lg">
                                    Kasus Ditutup
                                </div>
                            )}
                             {log.status === 'Ditolak' && (
                                <div className="text-center text-xs text-red-600 font-medium py-2 bg-red-50 rounded-lg">
                                    Kasus Ditolak
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default LiaisonBookView;
