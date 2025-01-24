import fs from 'fs';
import path from 'path';
import { generateContent } from './generateContent.js';
import { ChatSession } from './chatSession.js';
import { delay } from '../utils/delay.js';

// Функция загрузки конфигурации
function loadConfig(projectPath) {
  const configPath = path.join(projectPath, 'config.json');
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Файл конфигурации не найден: ${configPath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// **Функция обработки каталога `course/`**
export async function processDirectory(projectPath, subPath = '') {
  const basePath = path.join(projectPath, 'course'); // Основная папка курса
  const currentPath = subPath ? path.join(basePath, subPath) : basePath; // Если обрабатываем вложенную папку, добавляем `subPath`

  if (!fs.existsSync(currentPath)) {
    console.error(`❌ Папка не найдена: ${currentPath}`);
    process.exit(1);
  }

  console.log(`📂 Обрабатываем каталог: ${currentPath}`);

  let files = fs.readdirSync(currentPath, { withFileTypes: true });

  // Сортируем файлы и папки
  files.sort((a, b) => a.name.localeCompare(b.name, 'ru', { numeric: true }));

  // Загружаем конфиг и промт
  const config = loadConfig(projectPath);
  const promptPath = path.join(projectPath, config.prompt_file);

  if (!fs.existsSync(promptPath)) {
    console.error(`❌ Файл с промтом не найден: ${promptPath}`);
    process.exit(1);
  }

  const initialPrompt = fs.readFileSync(promptPath, 'utf8').trim();
  const chatSession = new ChatSession(initialPrompt);

  for (const file of files) {
    const filePath = path.join(currentPath, file.name);

    if (file.isDirectory()) {
      console.log(`📁 Входим в папку: ${filePath}`);
      await processDirectory(projectPath, path.join(subPath, file.name)); // ✅ Теперь рекурсивно идём дальше, но без лишнего `course/`
    } else if (file.name.endsWith('.md')) {
      let fileContent = fs.readFileSync(filePath, 'utf8').trim();
      const title = path.basename(file.name, path.extname(file.name));

      if (!fileContent) {
        console.log(`📂 Файл ${file.name} пуст, используем только название.`);
        fileContent = '';
      }

      // Корректный путь для сохранения сгенерированного файла
      const newFileName = `(gen) ${title}${path.extname(file.name)}`;
      const newFilePath = path.join(currentPath, newFileName);

      if (fs.existsSync(newFilePath)) {
        console.log(`⚠️ Файл уже существует: ${newFileName}. Пропуск...`);
        continue;
      }

      console.log(`🔍 Обработка файла: ${filePath}`);

      const generatedContent = await generateContent(chatSession, title, fileContent);

      if (generatedContent) {
        fs.writeFileSync(newFilePath, `# ${title}\n\n${generatedContent}`, 'utf8');
        console.log(`✅ Сгенерирован файл: ${newFileName}`);
      } else {
        console.log(`❌ Ошибка генерации для: ${file.name}`);
      }

      console.log('⏳ Ожидание перед следующим запросом...');
      await delay(config.timeout_ms);
    }
  }
}
