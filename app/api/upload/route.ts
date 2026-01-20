import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
const pdf = require('pdf-parse');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'Fayl yoxdur' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = file.name.split('.').pop()?.toLowerCase();

    // 1. EXCEL Ssenarisi
    if (fileType === 'xlsx' || fileType === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Excel faylında başlıqlar belə olmalıdır: sual, A, B, C, D, cavab
      for (const row: any of jsonData) {
        if (row.sual && row.cavab) {
          await supabase.from('questions').insert({
            content: row.sual,
            options: [row.A, row.B, row.C, row.D], // Variantlar array kimi
            correct_answer: row.cavab
          });
        }
      }
      return NextResponse.json({ success: true, message: 'Excel yükləndi' });
    }

    // 2. WORD Ssenarisi (Sadə mətn kimi)
    if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      // Word-də hər yeni sətiri bir sual kimi qəbul edirik (Demo)
      const lines = text.split('\n').filter(l => l.length > 5);
      
      for (const line of lines) {
         // Avtomatik demo sual yaradır (Təkmilləşdirmək olar)
         await supabase.from('questions').insert({
            content: line,
            options: ["Bəli", "Xeyr", "Variant C", "Variant D"],
            correct_answer: "Bəli"
         });
      }
      return NextResponse.json({ success: true, message: 'Word yükləndi' });
    }

    return NextResponse.json({ success: false, error: 'Format dəstəklənmir' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
