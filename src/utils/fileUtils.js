/**
 * 📌 Модуль fileUtils.js — Вспомогательные функции для работы с файлами и каталогами.
 *
 * 🔹 Описание:
 * Этот модуль содержит утилиты для работы с файлами: чтение, запись, очистка имен файлов и сортировка.
 *
 * 🔹 Использование:
 * ```js
 * import { sanitizeFileName, readDirectory, readFileContent, writeToFile } from './fileUtils.js';
 * ```
 */

import fs from 'fs';
import path from 'path';

/**
 * 📌 Очистка имени файла от недопустимых символов.
 * @param {string} name - Исходное имя файла.
 * @returns {string} - Безопасное имя файла.
 */
export function sanitizeFileName(name) {
    return name.replace(/[\/:*?"<>|.]/g, '').trim();
}

/**
 * 📌 Чтение списка файлов и папок в указанной директории.
 * @param {string} directory - Путь к директории.
 * @returns {fs.Dirent[]} - Список файлов и папок, отсортированных по имени.
 */
export function readDirectory(directory) {
    try {
        let files = fs.readdirSync(directory, { withFileTypes: true });
        return files.sort((a, b) => a.name.localeCompare(b.name, 'ru', { numeric: true }));
    } catch (error) {
        console.error(`❌ Ошибка при чтении директории ${directory}:`, error);
        return [];
    }
}

/**
 * 📌 Чтение содержимого файла.
 * @param {string} filePath - Путь к файлу.
 * @returns {string} - Содержимое файла.
 */
export function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8').trim();
    } catch (error) {
        console.error(`❌ Ошибка при чтении файла ${filePath}:`, error);
        return '';
    }
}

/**
 * 📌 Запись содержимого в файл.
 * @param {string} filePath - Путь к файлу.
 * @param {string} title - Заголовок для файла.
 * @param {string} content - Текст для записи.
 */
export function writeToFile(filePath, title, content) {
    try {
        fs.writeFileSync(filePath, `# ${title}\n\n${content}`, 'utf8');
        console.log(`✅ Файл сохранен: ${filePath}`);
    } catch (error) {
        console.error(`❌ Ошибка при записи файла ${filePath}:`, error);
    }
}
