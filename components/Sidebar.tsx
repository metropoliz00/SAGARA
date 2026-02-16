
import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, GraduationCap, School, LogOut, X, ChevronRight, UserCog, HeartHandshake, Tent, BookText, Smile, Link2, FileText, Contact, BookOpen, UserCheck, Database, NotebookPen } from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentUser: User | null;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, onChangeView, isOpen, onClose, onLogout }) => {
  
  // Logic Filter Menu berdasarkan Role
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'guru', 'siswa', 'supervisor'] },
    // Only Admin/Guru/Supervisor
    { id: 'pendahuluan', label: 'Pendahuluan', icon: BookText, roles: ['admin', 'guru', 'supervisor'] },
    { id: 'students', label: 'Data Siswa', icon: Users, roles: ['admin', 'guru', 'supervisor'] },
    { id: 'student-monitor', label: 'Monitoring Siswa', icon: UserCheck, roles: ['admin', 'guru', 'supervisor'] }, 
    { id: 'attendance', label: 'Absensi', icon: CalendarCheck, roles: ['admin', 'guru', 'supervisor'] },
    { id: 'grades', label: 'Nilai & Rapor', icon: GraduationCap, roles: ['admin', 'guru', 'supervisor'] },
    { id: 'attitude', label: 'DPL & 7KAIH', icon: Smile, roles: ['admin', 'guru', 'supervisor'] },
    { id: 'learning-journal', label: 'Jurnal Pembelajaran', icon: NotebookPen, roles: ['admin', 'guru', 'supervisor'] }, // NEW
    { id: 'learning-reports', label: 'Laporan Pembelajaran', icon: FileText, roles: ['admin', 'guru', 'supervisor'] }, 
    { id: 'counseling', label: 'Konseling & Perilaku', icon: HeartHandshake, roles: ['admin', 'guru', 'supervisor'] },
    { id: 'activities', label: 'Kegiatan & Ekskul', icon: Tent, roles: ['admin', 'guru', 'supervisor'] },
    { id: 'liaison-book', label: 'Buku Penghubung', icon: BookOpen, roles: ['admin', 'guru', 'supervisor'] }, 
    { id: 'admin', label: 'Administrasi', icon: School, roles: ['admin', 'guru', 'supervisor'] }, 
    { id: 'employment-links', label: 'Link Kepegawaian', icon: Link2, roles: ['admin'] },
    { id: 'accounts', label: 'Manajemen Akun', icon: UserCog, roles: ['admin'] },
    { id: 'backup-restore', label: 'Backup & Restore', icon: Database, roles: ['admin'] },
  ].filter(item => {
    // Tampilkan jika role user ada di daftar roles item tersebut
    return currentUser && item.roles.includes(currentUser.role);
  });

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-[#CAF4FF] text-slate-600 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col shadow-xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header Logo */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="https://png.pngtree.com/png-clipart/20230928/original/pngtree-education-school-logo-design-kids-student-learning-vector-png-image_12898111.png" 
                  alt="Logo SAGARA" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-800 flex items-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5AB2FF] to-[#A0DEFF]">SAGARA</span>
                </h1>
                <span className="text-xs font-medium text-slate-400 mt-0.5">
                    {currentUser?.role === 'admin' ? 'Admin Panel' : currentUser?.role === 'siswa' ? 'Area Siswa' : currentUser?.role === 'supervisor' ? 'Supervisor' : 'UPT SD Negeri Remen 2'}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="h-px bg-gradient-to-r from-[#CAF4FF] via-[#A0DEFF] to-[#CAF4FF]" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewState);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#5AB2FF] to-[#A0DEFF] text-white shadow-lg shadow-[#5AB2FF]/30 translate-x-1' 
                    : 'text-slate-500 hover:bg-[#FFF9D0] hover:text-[#5AB2FF] hover:translate-x-1'
                }`}
              >
                <div className="flex items-center space-x-3 relative z-10">
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#5AB2FF] transition-colors'} />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-[#5AB2FF]'}`}>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-[#CAF4FF] animate-pulse" />}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
