import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Настройка Markdown с подсветкой синтаксиса
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  }
});

export async function getCourseContent(req, res) {
  try {
    const filePath = req.query.file;
    if (!filePath) {
      return res.status(400).send('❌ Ошибка: Не указан файл');
    }

    const decodedFilePath = decodeURIComponent(filePath).trim();
    const courseDir = path.join(process.cwd(), 'my-course', 'course'); // Путь к курсу
    const resolvedPath = path.join(courseDir, decodedFilePath);

    console.log(`📄 Запрашиваем файл: ${decodedFilePath}`);
    console.log(`🔍 Полный путь: ${resolvedPath}`);

    let stat;
    try {
      stat = await fs.stat(resolvedPath);
    } catch {
      console.error(`❌ Файл не найден: ${resolvedPath}`);
      return res.status(404).send('Файл не найден');
    }

    if (stat.isDirectory()) {
      console.error(`❌ Ошибка: Попытка открыть папку как файл: ${resolvedPath}`);
      return res.status(400).send('❌ Ошибка: Это папка, а не файл');
    }

    const content = await fs.readFile(resolvedPath, 'utf8');
    const htmlContent = marked(content);

    res.send(htmlContent);
  } catch (error) {
    console.error('❌ Ошибка при чтении файла:', error);
    res.status(500).send('Ошибка чтения файла');
  }
}
