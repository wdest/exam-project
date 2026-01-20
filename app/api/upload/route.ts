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

      // DÜZƏLİŞ: `jsonData` massivini 'any[]' kimi göstəririk
      for (const row of jsonData as any[]) {
        if (row.sual && row.cavab) {
          await supabase.from('questions').insert({
            content: row.sual,
            options: [row.A, row.B, row.C, row.D], // Variantlar
            correct_answer: row.cavab
          });
        }
      }
      return NextResponse.json({ success: true, message: 'Excel yükləndi' });
    }

    // 2. WORD Ssenarisi
    if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      const lines = text.split('\n').filter(l => l.length > 5);
      
      for (const line of lines) {
         await supabase.from('questions').insert({
            content: line,
            options: ["Bəli", "Xeyr", "Variant C", "Variant D"],
            correct_answer: "Bəli"
         });
      }
      return NextResponse.json({ success: true, message: 'Word yükləndi' });
    }

    // 3. PDF Ssenarisi
    if (fileType === 'pdf') {
        const data = await pdf(buffer);
        const text = data.text;
        const lines = text.split('\n').filter((l: string) => l.length > 5);
        
        for (const line of lines) {
           await supabase.from('questions').insert({
              content: line,
              options: ["Bəli", "Xeyr", "Variant C", "Variant D"],
              correct_answer: "Bəli"
           });
        }
        return NextResponse.json({ success: true, message: 'PDF yükləndi' });
    }

    return NextResponse.json({ success: false, error: 'Format dəstəklənmir' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
