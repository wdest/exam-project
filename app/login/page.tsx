'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Giriş et
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Xəta: ' + error.message);
      setLoading(false);
      return;
    }

    if (user) {
      // 2. Rolu yoxla
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        alert('Siz Admin deyilsiniz! Tələbələr ana səhifədən girməlidir.');
        await supabase.auth.signOut();
        router.push('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Paneli</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-900 border border-slate-700 rounded-lg outline-none"
              placeholder="Email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 p-3 bg-slate-900 border border-slate-700 rounded-lg outline-none"
              placeholder="Şifrə"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold">
            {loading ? 'Yoxlanılır...' : 'Daxil Ol'}
          </button>
        </form>
      </div>
    </div>
  );
}
