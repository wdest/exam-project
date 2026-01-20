'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Cloud } from 'lucide-react';

export default function AdminPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: null, msg: '' });
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus({ type: null, msg: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', msg: '✅ Suallar bazaya uğurla yazıldı!' });
        setFile(null);
      } else {
        setStatus({ type: 'error', msg: `❌ Xəta: ${data.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Server xətası baş verdi.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden p-4">
      
      {/* Arxa Fon (Neon İşıqlar) */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Əsas Kart */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="backdrop-blur-2xl bg-[#111]/80 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          
          {/* Başlıq */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              BabaPro Panel
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide">
              SUAL BAZASINI İDARƏ ETMƏ MƏRKƏZİ
            </p>
          </div>

          {/* Status Mesajı (Animasiyalı) */}
          {status.msg && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border transition-all duration-300 ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="font-medium text-sm">{status.msg}</span>
            </div>
          )}

          {/* Fayl Yükləmə Sahəsi (Custom Design) */}
          <div className="group relative">
            <input
              type="file"
              accept=".xlsx,.xls,.docx,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
              file 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-gray-700 bg-gray-900/50 group-hover:border-gray-500 group-hover:bg-gray-800'
            }`}>
              
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-white'
              }`}>
                {file ? <FileText className="w-8 h-8" /> : <Cloud className="w-8 h-8" />}
              </div>

              <h3 className={`text-lg font-semibold transition-colors ${file ? 'text-emerald-400' : 'text-gray-300 group-hover:text-white'}`}>
                {file ? file.name : "Faylı bura sürükləyin"}
              </h3>
              
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-wider font-bold">
                {file ? "Fayl Seçildi" : "və ya klikləyib seçin"}
              </p>
              
              {!file && (
                <p className="text-gray-600 text-[10px] mt-4">
                  Dəstəklənir: .xlsx, .docx, .pdf
                </p>
              )}
            </div>
          </div>

          {/* Düymə */}
          <button
            onClick={handleFileUpload}
            disabled={uploading || !file}
            className="mt-6 w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-white/10"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Emal edilir...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Bazaya Göndər
              </>
            )}
          </button>

        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-xs font-mono">
          SECURE CONNECTION • ENCRYPTED
        </div>
      </div>
    </div>
  );
}
