import 'dotenv/config'; // Загружаем переменные окружения

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { sanitizeFileName } from './utils.js';

// Получение пути к текущему файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookDir = path.join(__dirname, 'data', 'DataScienceCourse');
const contentFilePath = path.join(__dirname, 'data', 'content-data.md')
const getPrompt = (chapterTitle, sectionTitle) => `
  Представь себя автором курса по "Аналитик данных", цель которого — сделать сложные концепции доступными для широкой аудитории. 
  Избегай сложных технических терминов и объясняй всё так, чтобы даже человек, незнакомый с Аналитикой данных, смог понять суть. 
  Постарайся делать объяснения интересными и увлекательными.
  Основная цель курса — на практических примерах изучить работу с большими данными и машинное обучение, чтобы подготовиться к собеседованию.
  Делай акцент на практику и большое количество примеров кода.
  Добавляй понятное описание к примерам кода.
  Не прощайся в конце топиков.
  Постарайся при написании новых топиков не писать будто это начало курса, ты должен понимать что это продолжение курса.
  Напиши топик курса "${chapterTitle}" с заголовком "${sectionTitle}" максимально подробно, добавь больше примеров кода и расширенные объяснения.
`;
const gpt = 'gpt-4o';
const maxTokens = 6048; // Настраиваем количество токенов, чтобы не превысить лимиты
const timeOut = 60000; // задержки между запросами

// Инициализация OpenAI API
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // Используем ключ из переменных окружения
});

// Функция для генерации текста раздела с экспоненциальным бэкоффом
async function generateSection(chapterTitle, sectionTitle, retries = 5) {
  const prompt = getPrompt(chapterTitle, sectionTitle);

  try {
    const response = await openai.chat.completions.create({
      model: gpt,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const delayTime = Math.pow(2, 5 - retries) * 1000; // Увеличиваем задержку на каждую попытку
      console.log(`Ошибка 429: Превышен лимит запросов. Повторная попытка через ${delayTime / 1000} секунд...`);
      await delay(delayTime);
      return generateSection(chapterTitle, sectionTitle, retries - 1); // Повторяем запрос
    } else {
      console.error(`Ошибка при генерации раздела: ${error.message}`);
      return '';
    }
  }
}

// Функция для добавления задержки
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Функция для чтения и парсинга файла content.md
function parseContentFile() {
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

// Функция для создания структуры книги и генерации контента
async function createBookFromContent() {
  const structure = parseContentFile();

  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir);
  }

  let pageCounter = 1;
  let chapterCounter = 1;

  for (const [chapterTitle, sections] of Object.entries(structure)) {
    // Создаем директорию для каждой главы
    const chapterDirName = `${chapterCounter}_${sanitizeFileName(chapterTitle)}`;
    const chapterDir = path.join(bookDir, chapterDirName);

    if (!fs.existsSync(chapterDir)) {
      fs.mkdirSync(chapterDir);
    }

    console.log(`Создание главы: ${chapterTitle}`);

    for (const sectionTitle of sections) {
      console.log(`  Генерация раздела: ${sectionTitle}`);

      const sectionContent = await generateSection(chapterTitle, sectionTitle);

      if (sectionContent) {
        const sectionFileName = `${pageCounter}_${sanitizeFileName(sectionTitle)}.md`;
        const sectionFilePath = path.join(chapterDir, sectionFileName);
  

        const mdContent = `# ${sectionTitle}\n\n${sectionContent}`;

        fs.writeFileSync(sectionFilePath, mdContent, 'utf8');
        console.log(`  Раздел сохранен: ${sectionFileName}`);

        pageCounter++;
      } else {
        console.log(`  Не удалось сгенерировать раздел: ${sectionTitle}`);
      }

      // Добавляем задержку перед следующим запросом
      console.log('Ожидание 60 секунд перед следующим запросом...');
      await delay(timeOut); // 60 секунд задержки между запросами
    }

    chapterCounter++; // Увеличиваем номер главы
  }
}

// Запуск скрипта
createBookFromContent()
  .then(() => {
    console.log('Книга успешно сгенерирована.');
  })
  .catch((err) => {
    console.error(`Произошла ошибка при генерации книги: ${err.message}`);
  });
