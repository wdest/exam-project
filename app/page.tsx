'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  const handleStudentStart = () => {
    if (!nickname.trim()) return alert('Zəhmət olmasa adınızı yazın!');
    localStorage.setItem('student_nickname', nickname);
    router.push('/exam');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] overflow-hidden px-4 sm:px-6 lg:px-8 relative">
      
      {/* Arxa Fon Effektləri (Gözəllik üçün) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-600/20 rounded-full blur-[100px] opacity-50 animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Kart Dizaynı */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-6 sm:p-10 transition-all duration-300 hover:border-white/20">
          
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mb-4 shadow-lg shadow-blue-500/30 transform transition hover:scale-105">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              İmtahan Platforması
            </h1>
            <p className="text-slate-400 mt-3 text-sm sm:text-base font-medium">
              Uğura gedən yol buradan başlayır
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                İstifadəçi Adı
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="Ad və Soyad"
                />
              </div>
            </div>
            
            <button
              onClick={handleStudentStart}
              className="w-full group relative flex justify-center items-center py-4 px-4 border border-transparent text-sm sm:text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0f172a] transition-all duration-200 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              İmtahana Başla
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8 font-medium">
          © 2026 Bütün hüquqlar qorunur
        </p>
      </div>
    </div>
  );
}
