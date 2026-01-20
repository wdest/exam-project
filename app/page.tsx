'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield } from 'lucide-react';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const router = useRouter();

  const handleStudentStart = () => {
    if (!nickname.trim()) return alert('Zəhmət olmasa adınızı yazın!');
    localStorage.setItem('student_nickname', nickname);
    router.push('/exam');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-400">İmtahan Sistemi</h1>
        <p className="text-gray-400 text-center mb-8">Başlamaq üçün adınızı daxil edin</p>
        
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full pl-10 p-3 rounded-lg bg-slate-900 border border-slate-600 focus:border-blue-500 outline-none text-white"
              placeholder="Ad və Soyad"
            />
          </div>
          
          <button
            onClick={handleStudentStart}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all active:scale-95"
          >
            İmtahana Başla
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <button 
            onClick={() => router.push('/login')}
            className="text-sm text-gray-500 hover:text-gray-300 flex items-center justify-center gap-2 mx-auto"
          >
            <Shield className="w-4 h-4" /> Müəllim / Admin Girişi
          </button>
        </div>
      </div>
    </div>
  );
}
