import pdf from 'pdf-parse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export interface ParsedQuestion {
  content: string;
  options: string[];
  correctAnswer: string;
}

export async function parseFile(file: File): Promise<ParsedQuestion[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = file.type;
  const name = file.name;

  if (name.endsWith('.pdf') || type === 'application/pdf') {
    return parsePDF(buffer);
  } else if (name.endsWith('.docx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseWord(buffer);
  } else if (name.endsWith('.xlsx') || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return parseExcel(buffer);
  } else {
    throw new Error('Unsupported file type');
  }
}

export async function parsePDF(buffer: Buffer): Promise<ParsedQuestion[]> {
  const data = await pdf(buffer);
  return parseText(data.text);
}

export async function parseWord(buffer: Buffer): Promise<ParsedQuestion[]> {
  const result = await mammoth.extractRawText({ buffer });
  return parseText(result.value);
}

export function parseExcel(buffer: Buffer): ParsedQuestion[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  return rows.map((row: any) => ({
    content: row['Question'] || row['question'] || '',
    options: [
      row['Option A'] || row['A'] || '',
      row['Option B'] || row['B'] || '',
      row['Option C'] || row['C'] || '',
      row['Option D'] || row['D'] || ''
    ].filter(opt => opt !== ''),
    correctAnswer: row['Correct Answer'] || row['Answer'] || ''
  })).filter(q => q.content && q.options.length > 0 && q.correctAnswer);
}

export function parseText(text: string): ParsedQuestion[] {
  // A simple heuristic parser for formatted text
  // Expected format example:
  // Q: What is 2+2?
  // A) 3
  // B) 4
  // C) 5
  // D) 6
  // Answer: B

  const questions: ParsedQuestion[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentQuestion: Partial<ParsedQuestion> | null = null;
  let currentOptions: string[] = [];

  for (const line of lines) {
    if (line.match(/^(Q:|Question:|\d+\.)/i)) {
      if (currentQuestion && currentQuestion.content && currentOptions.length > 0) {
        questions.push({
            content: currentQuestion.content,
            options: currentOptions,
            correctAnswer: currentQuestion.correctAnswer || ''
        });
      }
      currentQuestion = { content: line.replace(/^(Q:|Question:|\d+\.)/i, '').trim() };
      currentOptions = [];
    } else if (line.match(/^[A-D]\)/i)) {
        currentOptions.push(line);
    } else if (line.match(/^Answer:/i) && currentQuestion) {
        currentQuestion.correctAnswer = line.replace(/^Answer:/i, '').trim();
    } else if (currentQuestion) {
        // If it doesn't match a new question or option, append to content (multi-line question) 
        // unless we are already collecting options? 
        // Simplification: assume single line questions for now or strictly formatted.
        if (currentOptions.length === 0) {
           currentQuestion.content += ' ' + line;
        }
    }
  }

  // Push last one
  if (currentQuestion && currentQuestion.content && currentOptions.length > 0) {
    questions.push({
        content: currentQuestion.content,
        options: currentOptions,
        correctAnswer: currentQuestion.correctAnswer || ''
    });
  }

  return questions;
}
