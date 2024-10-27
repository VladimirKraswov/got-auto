// 1 - Программа запускается и создает директорию для главы.
// 2 - Программа копирует промт в буффер обмена.
// 3 - Программа ожидает нажатия пробела.
// 4 - Идем в GPT и вставляем туда промт. копируем в бевер из гпт
// 3 - Программа ожидает нажатия пробела.
// 4 - После нажатия на пробел:
//     - Содержимое буфера обмена записывается в файл.
//     - В буфер обмена записывается новый промт.
// Процесс повторяется до тех пор, пока не будут обработаны все главы и разделы.

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import clipboardy from 'clipboardy';
import { sanitizeFileName } from './utils';

// Загружаем переменные окружения
dotenv.config();

// Функция для чтения и парсинга файла content.md
function parseContentFile() {
  const contentFilePath = path.join(path.resolve(), 'data', 'content.md');
  const content = fs.readFileSync(contentFilePath, 'utf8');

  const lines = content.split('\n').filter((line) => line.trim() !== '');

  const structure = {};
  let currentChapter = '';

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith('# ')) {
      currentChapter = line.replace('# ', '').trim();
      structure[currentChapter] = [];
    } else if (line.startsWith('- ')) {
      const section = line.replace('- ', '').trim();
      if (currentChapter) {
        structure[currentChapter].push(section);
      }
    }
  });

  return structure;
}

// Функция для генерации промта для раздела
function generatePrompt(chapterTitle, sectionTitle) {
  return `
  Представь себя автором книги о нейросетях, цель которой — сделать сложные концепции доступными для широкой аудитории. 
  Избегай сложных технических терминов и объясняй всё так, чтобы даже человек, незнакомый с программированием, смог понять суть. 
  Используй реальные жизненные примеры, аналогии и метафоры, чтобы делать объяснения интересными и увлекательными. 
  Напиши раздел для главы "${chapterTitle}" с заголовком "${sectionTitle}", описывая тему доступным языком.
  `;
}

// Основная функция создания структуры книги и работы с файлами
async function createBookFromContent() {
  const structure = parseContentFile();
  const bookDir = path.join(path.resolve(), 'data', 'GeneratedBook');

  // Создаем папку для книги, если она не существует
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir);
  }

  let chapterCounter = 1;
  let sectionCounter = 1;

  for (const [chapterTitle, sections] of Object.entries(structure)) {
    // Создаем директорию для каждой главы
    const chapterDirName = `${chapterCounter}_${sanitizeFileName(chapterTitle)}`;
    const chapterDir = path.join(bookDir, chapterDirName);

    if (!fs.existsSync(chapterDir)) {
      fs.mkdirSync(chapterDir);
    }

    for (const sectionTitle of sections) {
      // Генерируем и копируем промт в буфер обмена
      const prompt = generatePrompt(chapterTitle, sectionTitle);
      clipboardy.writeSync(prompt);
      console.log(`Создан файл: ${sectionCounter}_${sanitizeFileName(sectionTitle)}.md`);
      console.log('Промт скопирован в буфер обмена. Нажмите пробел для вставки текста в файл...');

      // Создаем файл для текущего раздела
      const fileName = `${sectionCounter}_${sanitizeFileName(sectionTitle)}.md`;
      const filePath = path.join(chapterDir, fileName);

      // Ждем нажатия пробела
      await waitForSpace();

      // Вставляем содержимое из буфера обмена в файл
      const clipboardContent = clipboardy.readSync();
      fs.writeFileSync(filePath, clipboardContent, 'utf8');
      console.log(`Содержимое вставлено в файл: ${fileName}`);

      sectionCounter++;
    }

    chapterCounter++;
    sectionCounter = 1; // Сбрасываем счетчик разделов для новой главы
  }

  console.log('Все главы и разделы были обработаны.');
}

// Функция для ожидания нажатия пробела
function waitForSpace() {
  return new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
      if (key.toString() === ' ') {
        process.stdin.setRawMode(false);
        resolve();
      }
    });
  });
}

// Запуск скрипта
createBookFromContent()
  .then(() => {
    console.log('Создание структуры книги завершено.');
    process.exit(0); // Завершение программы
  })
  .catch((err) => {
    console.error(`Произошла ошибка при создании книги: ${err.message}`);
    process.exit(1);
  });
