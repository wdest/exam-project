'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({type: null, msg: ''});

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus({type: null, msg: ''});

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        setStatus({type: 'success', msg: 'Fayl uğurla yükləndi və suallar bazaya yazıldı!'});
        setFile(null);
      } else {
        setStatus({type: 'error', msg: data.error || 'Xəta baş verdi'});
      }
    } catch (err) {
      setStatus({type: 'error', msg: 'Server xətası'});
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
       {/* Fon effektləri */}
       <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
       <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl z-10">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            BabaPro Admin
          </h1>
          <p className="text-slate-400 mt-2">Sual bazasını idarə etmə paneli</p>
        </div>
        
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          
          {/* Status Mesajları */}
          {status.msg && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              status.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
              <span className="font-medium">{status.msg}</span>
            </div>
          )}

          <div 
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
              file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
          >
            <input 
              type="file" 
              accept=".xlsx,.xls,.docx,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden" 
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center group">
              <div className={`p-4 rounded-full mb-4 transition-colors ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                {file ? <FileText className="w-8 h-8"/> : <Upload className="w-8 h-8"/>}
              </div>
              <span className="text-lg font-semibold text-white mb-1">
                {file ? file.name : "Faylı seçin və ya bura atın"}
              </span>
              <span className="text-sm text-slate-500">
                Dəstəklənir: .xlsx, .docx, .pdf
              </span>
            </label>
          </div>

          <button
            onClick={handleFileUpload}
            disabled={uploading || !file}
            className="mt-6 w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Yüklənir...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Bazaya Göndər
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
