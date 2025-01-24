/**
 * 📌 Модуль createCourseStructure.js — Создание структуры курса.
 *
 * 🔹 Описание:
 * Этот модуль парсит файл оглавления и создаёт структуру курса в указанной папке.
 *
 * 🔹 Использование:
 * ```js
 * import { createCourseStructure } from './createCourseStructure.js';
 * createCourseStructure('content.md', './output');
 * ```
 */

import fs from 'fs';
import path from 'path';

// Функция очистки имени файла от недопустимых символов
function sanitizeFilename(name) {
    return name.replace(/[\/:*?"<>|.]/g, '').trim();
}

// Функция для создания структуры курса (в папке `course/`)
export function createCourseStructure(inputFile, outputDir) {
    try {
        const content = fs.readFileSync(inputFile, 'utf8');
        const lines = content.split('\n');

        let moduleNumber = 0;
        let subNumber = 0;
        let currentModule = '';

        const createdFiles = new Set(); // Хранилище для проверки дубликатов

        for (let line of lines) {
            line = line.trim();
            if (!line) continue; // Пропускаем пустые строки

            if (line.startsWith('# ')) {
                // Основной модуль
                moduleNumber++;
                subNumber = 0;
                currentModule = `${moduleNumber} ${sanitizeFilename(line.replace('# ', '').trim())}`;
                const modulePath = path.join(outputDir, currentModule);

                if (!fs.existsSync(modulePath)) {
                    fs.mkdirSync(modulePath, { recursive: true });
                }
            } else if (line.startsWith('- ')) {
                // Подпункт модуля
                subNumber++;
                const filename = `${moduleNumber}.${subNumber} ${sanitizeFilename(line.replace('- ', '').trim())}.md`;
                const filePath = path.join(outputDir, currentModule, filename);

                if (!createdFiles.has(filePath)) {
                    createdFiles.add(filePath); // Запоминаем созданный файл
                    fs.writeFileSync(filePath, `${currentModule}\n${filename}`, 'utf8'); // Добавляем название модуля в файл
                }
            }
        }

        console.log('✅ Структура курса успешно создана!');
    } catch (error) {
        console.error('❌ Ошибка при создании структуры:', error);
    }
}
