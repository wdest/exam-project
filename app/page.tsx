'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; // Senin client faylin
import { Trophy, ArrowRight, User, BookOpen } from 'lucide-react';

// Liderlər lövhəsi üçün tip
type LeaderboardEntry = {
  score: number;
  users: {
    nickname: string;
  } | null; // users null ola bilər deyə ehtiyatlı oluruq
};

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Liderlər lövhəsini yükləmək
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from('results')
          .select('score, users(nickname)')
          .order('score', { ascending: false })
          .limit(5);

        if (error) console.error('Error fetching leaderboard:', error);
        
        // TypeScript-ə 'users' obyekt olduğunu başa salırıq
        if (data) {
          // @ts-ignore - Supabase join tipləri bəzən qarışır, ona görə ignore edirik sadəlik üçün
          setLeaders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const handleStart = async () => {
    if (!nickname.trim()) return alert('Zəhmət olmasa ləqəbinizi daxil edin!');

    // Brauzerdə yadda saxlayaq
    localStorage.setItem('student_nickname', nickname);
    
    // Animasiyalı keçid üçün azca gözləyib atırıq
    router.push('/exam');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col md:flex-row">
      
      {/* SOL TƏRƏF - Giriş Paneli */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 border-r border-gray-800 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-xl mb-4">
              <BookOpen className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              İmtahan Platforması
            </h1>
            <p className="mt-3 text-gray-400">
              Universitet imtahanlarına hazırlaşmaq üçün ən sürətli yol.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ləqəbiniz (Nickname)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="Məs: DestTex"
                  />
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/30"
              >
                İmtahana Başla
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SAĞ TƏRƏF - Liderlər Lövhəsi */}
      <div className="w-full md:w-1/2 bg-[#0b1120] p-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-100">Liderlər Lövhəsi</h2>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Yüklənir...</div>
            ) : leaders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Hələ ki nəticə yoxdur. İlk sən ol!</div>
            ) : (
              <div className="divide-y divide-slate-700">
                {leaders.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                        index === 2 ? 'bg-orange-500/20 text-orange-500' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-200">
                        {entry.users?.nickname || 'Anonim'}
                      </span>
                    </div>
                    <span className="font-mono text-blue-400 font-bold">
                      {entry.score} bal
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            Top 5 ən yüksək nəticə göstərən tələbə
          </div>
        </div>
      </div>
    </div>
  );
}
