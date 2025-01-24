/**
 * 📌 Функция загрузки конфигурации курса.
 * 
 * 🔹 Описание:
 * Эта функция загружает конфигурационный файл `config.json` из указанного каталога курса.
 * Конфигурация содержит настройки модели, лимиты токенов, задержку запросов и путь к файлу с промтом.
 * 
 * 🔹 Функции:
 * - Проверяет, существует ли `config.json`.
 * - Загружает конфигурацию и парсит JSON.
 * - В случае ошибки выводит сообщение и завершает процесс.
 * 
 * 🔹 Пример `config.json`:
 * ```json
 * {
 *   "model": "gpt-4o",
 *   "max_tokens": 6048,
 *   "timeout_ms": 60000,
 *   "prompt_file": "prompt.txt"
 * }
 * ```
 * 
 * 🔹 Использование:
 * ```js
 * import { loadConfig } from './configLoader.js';
 * const config = loadConfig('./data/my_course');
 * console.log(config.model); // Выведет "gpt-4o"
 * ```
 */

import fs from 'fs';
import path from 'path';

export function loadConfig(targetDirectory) {
    const configPath = path.join(targetDirectory, 'config.json');

    if (!fs.existsSync(configPath)) {
        console.error(`❌ Файл конфигурации не найден: ${configPath}`);
        process.exit(1);
    }

    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);

        console.log(`✅ Конфигурация загружена из ${configPath}`);
        return config;
    } catch (error) {
        console.error(`❌ Ошибка при загрузке конфигурации: ${error.message}`);
        process.exit(1);
    }
}
