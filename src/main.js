/**
 * 📌 Главный модуль main.js
 *
 * 🔹 Этот скрипт позволяет:
 *   1. `build` — создать структуру курса на основе файла с оглавлением.
 *   2. `generate` — сгенерировать контент с помощью OpenAI на основе файлов курса.
 *
 * 🔹 Использование:
 * ```sh
 * node src/main.js build <файл_оглавления> <выходная_папка>  # Создать структуру курса
 * node src/main.js generate <папка_курса>                    # Сгенерировать контент
 * ```
 */

import { createCourseProject } from './utils/initProject.js';
import { createCourseStructure } from './utils/courseBuilder.js';
import { processDirectory } from './gpt/generator.js';
import { startServer } from './reader/index.js';
import path from 'path';
import fs from 'fs';

// 📌 Получаем аргументы командной строки
const mode = process.argv[2]; // `init`, `build`, `generate`, `read`
const projectName = process.argv[3]; // Название курса

if (!mode || !projectName) {
  console.error('❌ Использование:');
  console.error('  node src/main.js init <название_курса>         # Инициализация курса');
  console.error('  node src/main.js build <название_курса>        # Создание структуры курса');
  console.error('  node src/main.js generate <название_курса>     # Генерация контента');
  console.error('  node src/main.js read <название_курса>         # Открыть курс для чтения');
  process.exit(1);
}

// 📌 Определяем путь к проекту и к `course/`
const projectPath = path.join(process.cwd(), projectName);
const coursePath = path.join(projectPath, 'course'); 

if (mode === 'init') {
  console.log(`📁 Создаем проект курса: ${projectName}`);
  createCourseProject(projectPath);
} else if (mode === 'build') {
  console.log(`📁 Создаем структуру курса в папке: ${coursePath}`);
  if (!fs.existsSync(coursePath)) fs.mkdirSync(coursePath, { recursive: true });
  createCourseStructure(path.join(projectPath, 'content.md'), coursePath);
} else if (mode === 'generate') {
  console.log(`🤖 Начинаем генерацию контента в папке: ${coursePath}`);
  processDirectory(projectPath) // Передаем путь к проекту, а не `course/`
    .then(() => console.log('🎉 Генерация завершена!'))
    .catch((err) => console.error(`❌ Ошибка: ${err.message}`));
} else if (mode === 'read') {
  const coursePath = path.join(projectPath, 'course');
  if (!fs.existsSync(coursePath)) {
    console.error(`❌ Курс не найден: ${coursePath}`);
    process.exit(1);
  }
  startServer(coursePath);
} else {
  console.error(`❌ Неизвестный режим: ${mode}`);
  process.exit(1);
}
