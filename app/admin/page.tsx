'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function AdminPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!file) return alert('Fayl seçin!');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) alert('Suallar uğurla yükləndi!');
      else alert('Xəta: ' + data.error);
    } catch (err) {
      alert('Gözlənilməz xəta oldu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin İdarəetmə Mərkəzi</h1>
        
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-blue-500" /> Toplu Sual Yükləmə (Excel/Word)
          </h2>
          
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition">
            <input 
              type="file" 
              accept=".xlsx,.xls,.docx,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden" 
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-lg font-medium">
                {file ? file.name : "Faylı bura atın və ya seçin"}
              </span>
              <span className="text-sm text-gray-500 mt-1">.xlsx, .docx, .pdf</span>
            </label>
          </div>

          <button
            onClick={handleFileUpload}
            disabled={uploading || !file}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold disabled:opacity-50"
          >
            {uploading ? 'Yüklənir...' : 'Bazaya Göndər'}
          </button>
        </div>
      </div>
    </div>
  );
}
