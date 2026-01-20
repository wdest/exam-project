'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function ExamPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const nick = localStorage.getItem('student_nickname');
    if (!nick) router.push('/');

    const fetchData = async () => {
      const { data } = await supabase.from('questions').select('*');
      if (data) setQuestions(data.sort(() => Math.random() - 0.5)); // Qarışdırır
    };
    fetchData();
  }, [router, supabase]);

  const handleAnswer = async (option: string) => {
    const isCorrect = option === questions[index].correct_answer;
    if (isCorrect) setScore(score + 1);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      await saveResult(score + (isCorrect ? 1 : 0));
    }
  };

  const saveResult = async (finalScore: number) => {
    const nick = localStorage.getItem('student_nickname');
    
    // İstifadəçini tap və ya yarat
    const { data: user } = await supabase.from('users').upsert(
      { nickname: nick, role: 'student' }, { onConflict: 'nickname' }
    ).select().single();

    if (user) {
      await supabase.from('results').insert({
        user_id: user.id,
        score: finalScore,
        total_questions: questions.length
      });
    }
    setFinished(true);
  };

  if (!questions.length) return <div className="p-10 text-white">Suallar yüklənir...</div>;

  if (finished) return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
      <div className="text-center p-8 bg-slate-800 rounded-xl">
        <h1 className="text-4xl font-bold mb-4">İmtahan Bitdi!</h1>
        <p className="text-2xl text-blue-400">Nəticə: {score} / {questions.length}</p>
        <button onClick={() => router.push('/')} className="mt-6 px-6 py-2 bg-gray-600 rounded">Çıxış</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mt-10">
        <div className="flex justify-between mb-4 text-gray-400">
          <span>Sual {index + 1}/{questions.length}</span>
          <span>Bal: {score}</span>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
          <h2 className="text-xl font-medium mb-6">{questions[index].content}</h2>
          <div className="grid gap-3">
            {questions[index].options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="p-4 text-left bg-slate-700 hover:bg-blue-600 rounded-lg transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
