import { parseText, parseExcel } from '../lib/file-parser';
import * as XLSX from 'xlsx';
import assert from 'assert';

async function runTests() {
    console.log('Testing parseText...');

    const text = `
    Q: What is 2 + 2?
    A) 3
    B) 4
    C) 5
    D) 6
    Answer: B

    Q: What is the capital of France?
    A) London
    B) Berlin
    C) Paris
    D) Madrid
    Answer: C
    `;

    const questions = parseText(text);
    console.log('Parsed text questions:', questions);

    assert.strictEqual(questions.length, 2, 'Should parse 2 questions');
    assert.strictEqual(questions[0].content, 'What is 2 + 2?');
    assert.strictEqual(questions[0].correctAnswer, 'B');
    assert.strictEqual(questions[1].content, 'What is the capital of France?');
    assert.strictEqual(questions[1].correctAnswer, 'C');

    console.log('parseText passed.');

    console.log('Testing parseExcel...');

    const ws = XLSX.utils.json_to_sheet([
        {
            'Question': 'What is 1 + 1?',
            'Option A': '1',
            'Option B': '2',
            'Option C': '3',
            'Option D': '4',
            'Correct Answer': 'B'
        }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const excelQuestions = parseExcel(buffer);
    console.log('Parsed excel questions:', excelQuestions);

    assert.strictEqual(excelQuestions.length, 1);
    assert.strictEqual(excelQuestions[0].content, 'What is 1 + 1?');
    assert.strictEqual(excelQuestions[0].correctAnswer, 'B');

    console.log('parseExcel passed.');
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
