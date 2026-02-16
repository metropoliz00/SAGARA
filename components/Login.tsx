
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { User, Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Hidden backdoor logic for testing
  const handleDemoBypass = () => {
      setLoading(true);
      setTimeout(() => {
          const demoUser: UserType = {
              id: 'demo',
              username: 'demo',
              fullName: 'Bpk. Guru Demo',
              position: 'Wali Kelas 4B',
              role: 'guru'
          };
          onLoginSuccess(demoUser);
          setLoading(false);
      }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (username.toLowerCase() === 'demo' && password === 'demo') {
        handleDemoBypass();
        return;
    }

    try {
      const user = await apiService.login(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Username atau Password tidak valid.');
      }
    } catch (err: any) {
      const msg = err.message || 'Gagal terhubung ke server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      
      {/* Subtle Background Elements - Updated to new palette */}
      <div className="absolute inset-0 z-0 bg-white">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CAF4FF]/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFF9D0]/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Watermark Logo */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img 
            src="https://image2url.com/r2/default/images/1771068223735-6f3b5a3d-5a11-4f2e-9639-10adf921bb50.png" 
            alt="Watermark" 
            className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] object-contain opacity-[0.03] grayscale animate-pulse-slow"
          />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center animate-fade-in">
             <div className="relative w-32 h-32 flex items-center justify-center mb-6 animate-bounce">
                <div className="absolute inset-0 bg-[#A0DEFF]/30 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <img 
                  src="https://image2url.com/r2/default/images/1770790148258-99f209ea-fd45-44cf-9576-9c5205ef8b20.png" 
                  alt="Logo SAGARA" 
                  className="w-full h-full object-contain drop-shadow-xl"
                />
             </div>
             <div className="flex items-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-[#5AB2FF] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-[#5AB2FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#5AB2FF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-[#CAF4FF] p-8 md:p-10 animate-fade-in-up relative overflow-hidden">
            {/* Glossy Effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5AB2FF] via-[#A0DEFF] to-[#CAF4FF]"></div>

            <div className="flex flex-col items-center mb-8">
               <div className="relative group">
                  <div className="absolute inset-0 bg-[#A0DEFF]/20 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                  <div className="relative w-24 h-24 flex items-center justify-center transform transition-transform duration-700 hover:scale-105">
                     <img 
                       src="https://image2url.com/r2/default/images/1770790148258-99f209ea-fd45-44cf-9576-9c5205ef8b20.png" 
                       alt="Logo SAGARA" 
                       className="w-full h-full object-contain drop-shadow-xl"
                     />
                  </div>
                  <div className="absolute top-0 right-0">
                      <Sparkles size={20} className="text-[#5AB2FF] animate-spin-slow" />
                  </div>
               </div>
               
               <div className="mt-6 text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight font-sans flex items-center justify-center gap-1">
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5AB2FF] to-[#A0DEFF]">
                       SAGARA
                     </span>
                  </h1>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#FFF9D0] to-[#CAF4FF] rounded-full mx-auto my-3"></div>
                  <p className="text-sm text-slate-500 font-medium tracking-wide">
                    Sistem Akademik & Administrasi Terintegrasi
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">
                    UPT SD NEGERI REMEN 2
                  </p>
               </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start animate-shake">
                <div className="mr-2 mt-0.5"><Lock size={16} /></div> 
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5AB2FF] transition-colors">
                        <User size={20} />
                     </div>
                     <input 
                       type="text" 
                       className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#5AB2FF] focus:border-transparent transition-all outline-none"
                       placeholder="Masukan username"
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       required
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#5AB2FF] transition-colors">
                        <Lock size={20} />
                     </div>
                     <input 
                       type={showPassword ? "text" : "password"} 
                       className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#5AB2FF] focus:border-transparent transition-all outline-none"
                       placeholder="Masukan password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#5AB2FF] transition-colors focus:outline-none"
                     >
                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                  </div>
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-[#5AB2FF] hover:bg-[#A0DEFF] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#CAF4FF] flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed mt-4 transform active:scale-[0.98]"
               >
                 {loading ? (
                   <Loader2 size={24} className="animate-spin" />
                 ) : (
                   <>
                     Masuk Aplikasi <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
               </button>
            </form>

            <div className="mt-8 text-center">
               <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                 <span>&copy; 2026 | SAGARA Dev. Meyga</span>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
