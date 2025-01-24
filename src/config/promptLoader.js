/**
 * 📌 Функция загрузки начального промта для генерации контента.
 * 
 * 🔹 Описание:
 * Эта функция загружает текстовый файл с промтом, который используется как
 * базовый контекст при генерации контента. Промт указывается в `config.json`.
 * 
 * 🔹 Особенности:
 * - Если `prompt_file` отсутствует в `config.json`, выводится уведомление.
 * - Если файл не найден, процесс завершится с ошибкой.
 * - В консоли выводится информация о загруженном промте (первые строки).
 * 
 * 🔹 Пример `config.json`:
 * ```json
 * {
 *   "prompt_file": "prompt.txt"
 * }
 * ```
 */

import fs from 'fs';
import path from 'path';

export function loadInitialPrompt(targetDirectory, config) {
    if (!config.prompt_file) {
        console.log('ℹ️ Промт не указан в конфигурации. Будет использоваться стандартный контекст.');
        return '';
    }

    const promptFilePath = path.join(targetDirectory, config.prompt_file);
    if (!fs.existsSync(promptFilePath)) {
        console.error(`❌ Файл с промтом не найден: ${promptFilePath}`);
        process.exit(1);
    }

    const promptContent = fs.readFileSync(promptFilePath, 'utf8').trim();
    
    // Выводим информацию о загруженном промте (первые строки)
    console.log(`✅ Промт успешно загружен (${config.prompt_file}): ${promptContent.split('\n')[0]}...`);

    return promptContent;
}
