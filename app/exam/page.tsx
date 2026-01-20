'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { CheckCircle, XCircle, Home, Trophy, Loader2, Zap, RotateCcw } from 'lucide-react';

type Question = {
  id: string;
  content: string;
  options: string[];
  correct_answer: string;
};

type Leader = {
  nickname: string;
  score: number;
  date: string;
};

type FrequentUser = {
  nickname: string;
  count: number;
};

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Liderlər lövhəsi üçün state-lər
  const [topScorers, setTopScorers] = useState<Leader[]>([]);
  const [mostActive, setMostActive] = useState<FrequentUser[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const nick = localStorage.getItem('student_nickname');
    if (!nick) {
      router.push('/');
      return;
    }

    const fetchQuestions = async () => {
      const { data, error } = await supabase.from('questions').select('*');
      
      if (error) {
        alert('Xəta: ' + error.message);
      } else if (data && data.length > 0) {
        const shuffled = data.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [router, supabase]);

  // Statistikaları gətirən funksiya
  const fetchStats = async () => {
    setStatsLoading(true);
    
    // 1. TOP BAL YIĞANLAR (Ən yüksək bal, ən tez tarix)
    const { data: scoreData } = await supabase
      .from('results')
      .select('score, created_at, users(nickname)')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true }) // Eyni balı yığanlardan birinci yığan düşsün
      .limit(5);

    if (scoreData) {
      const formattedScores = scoreData.map((item: any) => ({
        nickname: item.users?.nickname || 'Anonim',
        score: item.score,
        date: new Date(item.created_at).toLocaleDateString()
      }));
      setTopScorers(formattedScores);
    }

    // 2. ƏN ÇOX İŞLƏYƏNLƏR (Bunu JS ilə hesablayırıq sadəlik üçün)
    const { data: allResults } = await supabase
      .from('results')
      .select('users(nickname)')
      .limit(500); // Son 500 imtahanı analiz edirik

    if (allResults) {
      const counts: Record<string, number> = {};
      allResults.forEach((r: any) => {
        const name = r.users?.nickname || 'Anonim';
        counts[name] = (counts[name] || 0) + 1;
      });

      const sortedActive = Object.entries(counts)
        .map(([nickname, count]) => ({ nickname, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // İlk 5 nəfər

      setMostActive(sortedActive);
    }

    setStatsLoading(false);
  };

  const handleAnswer = async (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correct_answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        await finishExam(score + (isCorrect ? 1 : 0));
      }
    }, 1000);
  };

  const finishExam = async (finalScore: number) => {
    setLoading(true);
    const nick = localStorage.getItem('student_nickname');

    const { data: user } = await supabase.from('users').upsert(
      { nickname: nick, role: 'student' }, 
      { onConflict: 'nickname' }
    ).select().single();

    if (user) {
      await supabase.from('results').insert({
        user_id: user.id,
        score: finalScore,
        total_questions: questions.length
      });
    }
    
    await fetchStats(); // İmtahan bitən kimi statistikaları yükləyirik
    setFinished(true);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
      <p className="text-slate-400 animate-pulse">Nəticələr emal olunur...</p>
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10">
        <p className="text-xl text-slate-300">Sual tapılmadı.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-blue-400 hover:text-blue-300">Ana səhifə</button>
      </div>
    </div>
  );

  // --- NƏTİCƏ EKRANI (LİDERLƏR İLƏ) ---
  if (finished) return (
    <div className="min-h-screen w-full bg-[#0f172a] overflow-y-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 1. SƏNİN NƏTİCƏN KARTI */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <h1 className="text-3xl font-bold text-white mb-2">İmtahan Bitdi!</h1>
          <p className="text-slate-400 mb-6">Sənin Nəticən</p>

          <div className="inline-block px-8 py-4 bg-slate-900/50 rounded-2xl border border-slate-700 mb-6">
            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {score} / {questions.length}
            </span>
          </div>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Yenidən İşlə
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> Ana Səhifə
            </button>
          </div>
        </div>

        {/* 2. STATİSTİKA KARTLARI (YAN-YANA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Liderlər (Top Bal) */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-white">Top 5 (Ən Yüksək)</h3>
            </div>
            
            <div className="space-y-3">
              {topScorers.map((user, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                      idx === 1 ? 'bg-gray-400/20 text-gray-400' : 
                      idx === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-200">{user.nickname}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{user.score} bal</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ən Çox İşləyənlər */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
              <Zap className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-bold text-white">Ən Çox Cəhd Edən</h3>
            </div>
            
            <div className="space-y-3">
              {mostActive.map((user, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm font-mono">#{idx + 1}</span>
                    <span className="font-medium text-slate-200">{user.nickname}</span>
                  </div>
                  <span className="text-sm text-blue-400 font-medium">{user.count} dəfə</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  // --- İMTAHAN SUALLARI EKRANI ---
  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-4 relative">
      {/* Proqress Bar */}
      <div className="w-full max-w-3xl mt-4 mb-8">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Sual {currentIndex + 1}/{questions.length}</span>
          <span>Cari Bal: {score}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Sual Kartı */}
      <div className="w-full max-w-3xl flex-1 flex flex-col justify-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[300px]">
          <h2 className="text-xl sm:text-2xl font-semibold mb-8">{currentQ.content}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              let style = "border-slate-700 bg-slate-800/50 hover:bg-slate-700";
              if (isAnswered) {
                if (opt === currentQ.correct_answer) style = "border-emerald-500 bg-emerald-500/20 text-emerald-300";
                else if (opt === selectedOption) style = "border-red-500 bg-red-500/20 text-red-300";
                else style = "opacity-50 border-slate-800";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${style}`}
                >
                  {opt}
                  {isAnswered && opt === currentQ.correct_answer && <CheckCircle className="w-5 h-5 text-emerald-400"/>}
                  {isAnswered && opt === selectedOption && opt !== currentQ.correct_answer && <XCircle className="w-5 h-5 text-red-400"/>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
